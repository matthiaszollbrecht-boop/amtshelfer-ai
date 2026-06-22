import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LANGUAGE_NAMES: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  ar: "العربية (Arabic)",
  ku: "Kurdî (Kurdish)",
  tr: "Türkçe (Turkish)",
  uk: "Українська (Ukrainian)",
  ru: "Русский (Russian)",
};

const SYSTEM_PROMPT = `You are an assistant that helps people understand official letters and documents in simple language.
You do NOT provide legal advice, tax advice, or binding official information.
Always recommend that the user contact an official advice center, authority, lawyer, or tax advisor if in doubt.
Be empathetic and clear. The people you are helping may not speak the language of the document fluently.`;

function buildAnalysisPrompt(language: string): string {
  const langName = LANGUAGE_NAMES[language] || "Deutsch";
  return `Analyze the official document shown in this image carefully.

IMPORTANT: Respond ENTIRELY in ${langName}. Every field must be in ${langName}.

Return a valid JSON object with exactly this structure (no markdown, no code block, just raw JSON):
{
  "summary": "Brief summary of what the document is about (2-3 sentences)",
  "sender": "Name of the sender / organization",
  "type": "Document type (e.g. Payment demand, Registration confirmation, Reminder, etc.)",
  "deadlines": ["Array of deadline strings, empty array if none"],
  "payments": ["Array of payment amounts/descriptions, empty array if none"],
  "documents": ["Array of required documents mentioned, empty array if none"],
  "simpleExplanation": "Explanation in very simple, easy-to-understand language. What does this mean for the recipient? What do they need to do?",
  "nextSteps": ["Concrete recommended next steps as array of strings"],
  "riskLevel": "green|yellow|red (green=informational/no action needed, yellow=action recommended, red=urgent action required or financial risk)",
  "ocrText": "The full extracted text from the document"
}

Risk level guide:
- green: informational, confirmations, no deadlines
- yellow: action recommended, soft deadlines, requests for documents
- red: payment demands, urgent deadlines, legal consequences mentioned, overdue notices

DISCLAIMER: Always include in nextSteps that the user should verify with an official advisor if uncertain. Do NOT give legal or financial advice.

If the image is unreadable, blurry, or not a document, return:
{
  "error": "unreadable",
  "message": "The document could not be read. Please take a clearer photo with good lighting."
}`;
}

function buildReplyPrompt(replyType: string, analysis: Record<string, unknown>, language: string): string {
  const langName = LANGUAGE_NAMES[language] || "Deutsch";
  const typeLabels: Record<string, string> = {
    submitDocs: "submitting requested documents",
    extendDeadline: "requesting a deadline extension",
    inquiry: "asking clarifying questions",
    reschedule: "requesting to reschedule an appointment",
    general: "general response/acknowledgement",
  };
  const purpose = typeLabels[replyType] || "general response";

  return `Write a formal reply letter in ${langName} for the purpose of: ${purpose}.

Context from the analyzed document:
- Sender: ${analysis.sender || "Unknown"}
- Document type: ${analysis.type || "Unknown"}
- Deadlines: ${JSON.stringify(analysis.deadlines || [])}
- Summary: ${analysis.summary || ""}

Requirements:
- Use formal German letter format (or appropriate format for ${langName})
- Use placeholders like [Ihr Name], [Datum], [Adresse] where personal details are needed
- Be professional and polite
- Keep it concise
- Add a note at the end that this is a draft and should be reviewed before sending
- Respond ONLY with the letter text, no explanations`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "config", message: "OpenAI API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle reply generation (JSON body)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { action, replyType, analysis, language = "de" } = body;

      if (action === "generate-reply") {
        const prompt = buildReplyPrompt(replyType, analysis, language);
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`OpenAI API error: ${err}`);
        }

        const data = await response.json();
        const replyText = data.choices?.[0]?.message?.content?.trim() || "";
        return new Response(
          JSON.stringify({ replyText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "unknown action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle document analysis (multipart/form-data)
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "invalid_content_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return new Response(
        JSON.stringify({ error: "no_file", message: "Kein gültiges Formular übermittelt." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const file = formData.get("file") as File | null;
    const language = (formData.get("language") as string) || "de";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "no_file", message: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // Determine MIME type
    let mimeType = file.type;
    if (!mimeType || mimeType === "application/octet-stream") {
      const name = file.name.toLowerCase();
      if (name.endsWith(".pdf")) mimeType = "application/pdf";
      else if (name.endsWith(".png")) mimeType = "image/png";
      else if (name.endsWith(".webp")) mimeType = "image/webp";
      else mimeType = "image/jpeg";
    }

    // PDFs need special handling — convert to text via GPT's file understanding
    // For images, use vision directly
    const isImage = mimeType.startsWith("image/");

    let messages;
    if (isImage) {
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
            },
            { type: "text", text: buildAnalysisPrompt(language) },
          ],
        },
      ];
    } else {
      // PDF: use GPT-4o with file upload approach via text extraction hint
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `This is a PDF document encoded as base64. Please analyze it as if you can read its content.\n\nBase64 PDF (first 50000 chars): ${base64.substring(0, 50000)}\n\n${buildAnalysisPrompt(language)}`,
            },
          ],
        },
      ];
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 2000,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Failed to parse GPT response as JSON");
    }

    if (parsed.error === "unreadable") {
      return new Response(
        JSON.stringify(parsed),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    const result = {
      summary: parsed.summary || "",
      sender: parsed.sender || "",
      type: parsed.type || "",
      deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
      simpleExplanation: parsed.simpleExplanation || "",
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      riskLevel: ["green", "yellow", "red"].includes(parsed.riskLevel) ? parsed.riskLevel : "yellow",
      ocrText: parsed.ocrText || "",
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: err instanceof Error ? err.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
