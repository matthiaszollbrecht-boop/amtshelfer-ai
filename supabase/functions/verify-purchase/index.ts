import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PACKAGE_NAME = "de.amtshelfer.ai";

// ─── Google OAuth2 via Service Account ────────────────────────────────────

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const signingInput = `${encode(header)}.${encode(claim)}`;

  // Import the RSA private key
  const pemBody = sa.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const keyDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sig64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signingInput}.${sig64}`;

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResp.ok) {
    const err = await tokenResp.text();
    throw new Error(`Google OAuth2 error: ${err}`);
  }

  const tokenData = await tokenResp.json();
  return tokenData.access_token as string;
}

// ─── Google Play Subscriptions v2 API ─────────────────────────────────────

interface SubscriptionPurchase {
  startTime?: string;
  lineItems?: Array<{
    expiryTime?: string;
    autoRenewingPlan?: { autoRenewEnabled: boolean };
  }>;
  subscriptionState?: string;  // SUBSCRIPTION_STATE_ACTIVE | EXPIRED | CANCELED | ...
  acknowledgementState?: string; // ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED | PENDING
  linkedPurchaseToken?: string;
}

async function getSubscriptionDetails(
  accessToken: string,
  subscriptionId: string,
  purchaseToken: string
): Promise<SubscriptionPurchase> {
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${purchaseToken}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Play API error (${resp.status}): ${err}`);
  }

  return resp.json();
}

async function acknowledgePurchase(
  accessToken: string,
  subscriptionId: string,
  purchaseToken: string
): Promise<void> {
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${PACKAGE_NAME}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}:acknowledge`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  // 204 = already acknowledged or success, both are fine
  if (!resp.ok && resp.status !== 204) {
    console.warn("Acknowledge returned:", resp.status);
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!serviceAccountJson || !supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "config", message: "Server not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Authenticate the calling user via their JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { action, purchaseToken, productId } = await req.json() as {
      action: string;
      purchaseToken?: string;
      productId?: string;
    };

    const accessToken = await getGoogleAccessToken(serviceAccountJson);

    // ── Restore purchases ─────────────────────────────────────────────────
    if (action === "restore") {
      // Check current token stored in DB for this user
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("subscription_purchase_token, subscription_type, subscription_expires_at")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.subscription_purchase_token) {
        return new Response(
          JSON.stringify({ premium: false, message: "no_subscription" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const subId = profile.subscription_type === "monthly"
        ? "premium_monthly"
        : "premium_yearly";

      try {
        const sub = await getSubscriptionDetails(accessToken, subId, profile.subscription_purchase_token);
        const isActive = sub.subscriptionState === "SUBSCRIPTION_STATE_ACTIVE" ||
          sub.subscriptionState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD";

        const expiryMs = sub.lineItems?.[0]?.expiryTime
          ? parseInt(sub.lineItems[0].expiryTime)
          : null;
        const expiresAt = expiryMs ? new Date(expiryMs).toISOString() : null;

        await supabaseAdmin.from("profiles").update({
          is_premium: isActive,
          subscription_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        }).eq("id", user.id);

        return new Response(
          JSON.stringify({ premium: isActive, expiresAt }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({ premium: false, message: "verification_failed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Verify new purchase ───────────────────────────────────────────────
    if (action === "verify" && purchaseToken && productId) {
      if (productId !== "premium_monthly" && productId !== "premium_yearly") {
        return new Response(
          JSON.stringify({ error: "invalid_product" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const sub = await getSubscriptionDetails(accessToken, productId, purchaseToken);

      const isActive = sub.subscriptionState === "SUBSCRIPTION_STATE_ACTIVE" ||
        sub.subscriptionState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD";

      if (!isActive) {
        return new Response(
          JSON.stringify({ error: "not_active", state: sub.subscriptionState }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Acknowledge if pending
      const needsAck = sub.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING" ||
        !sub.acknowledgementState?.includes("ACKNOWLEDGED");
      if (needsAck) {
        await acknowledgePurchase(accessToken, productId, purchaseToken);
      }

      const expiryMs = sub.lineItems?.[0]?.expiryTime
        ? parseInt(sub.lineItems[0].expiryTime)
        : null;
      const expiresAt = expiryMs ? new Date(expiryMs).toISOString() : null;
      const subscriptionType = productId === "premium_monthly" ? "monthly" : "yearly";

      await supabaseAdmin.from("profiles").update({
        is_premium: true,
        subscription_type: subscriptionType,
        subscription_expires_at: expiresAt,
        subscription_purchase_token: purchaseToken,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

      return new Response(
        JSON.stringify({ premium: true, subscriptionType, expiresAt }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "unknown_action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-purchase error:", err);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
