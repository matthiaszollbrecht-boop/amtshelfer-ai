#!/usr/bin/env bash
# =============================================================================
# AmtsHelfer AI — Android App Bundle Build Script
# Requires: Node.js 18+, JDK 17, Android SDK (via Bubblewrap)
# Usage: ./build-aab.sh <your-deployed-url> <keystore-password>
# Example: ./build-aab.sh https://amtshelfer.ai mySecurePassword123
# =============================================================================
set -euo pipefail

APP_URL="${1:-}"
KS_PASSWORD="${2:-}"
PACKAGE="de.amtshelfer.ai"
VERSION_CODE="${VERSION_CODE:-1}"
VERSION_NAME="${VERSION_NAME:-1.0.0}"
KEYSTORE="./android-keystore.jks"
KEY_ALIAS="amtshelfer"
OUTPUT_DIR="./android-build"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Validation ────────────────────────────────────────────────────────────────
[[ -z "$APP_URL" ]]     && error "Missing argument: <deployed-url>  (e.g. https://amtshelfer.ai)"
[[ -z "$KS_PASSWORD" ]] && error "Missing argument: <keystore-password>"

command -v java  >/dev/null 2>&1 || error "JDK not found. Install JDK 17: https://adoptium.net/"
command -v node  >/dev/null 2>&1 || error "Node.js not found."
command -v npx   >/dev/null 2>&1 || error "npx not found."

JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
[[ "$JAVA_VER" -lt 11 ]] && error "JDK 17+ required (found $JAVA_VER)."

info "=== AmtsHelfer AI AAB Build ==="
info "App URL:     $APP_URL"
info "Package:     $PACKAGE"
info "Version:     $VERSION_NAME ($VERSION_CODE)"

# ── 1. Production web build ──────────────────────────────────────────────────
info "[1/6] Building production web bundle..."
npm run build
info "Web bundle built: ./dist"

# ── 2. Patch twa-manifest.json with actual URL ───────────────────────────────
info "[2/6] Patching twa-manifest.json with $APP_URL..."
node - <<EOF
const fs = require('fs');
const m  = JSON.parse(fs.readFileSync('twa-manifest.json', 'utf8'));
m.host              = "$APP_URL".replace(/^https?:\/\//, '');
m.fullScopeUrl      = "$APP_URL";
m.iconUrl           = "$APP_URL/pwa-512x512.png";
m.maskableIconUrl   = "$APP_URL/pwa-512x512.png";
m.monochromeIconUrl = "$APP_URL/pwa-192x192.png";
m.webManifestUrl    = "$APP_URL/manifest.webmanifest";
m.appVersion        = "$VERSION_CODE";
m.appVersionName    = "$VERSION_NAME";
m.signingKey        = { path: "$KEYSTORE", alias: "$KEY_ALIAS" };
m.fingerprints      = [];
fs.writeFileSync('twa-manifest.json', JSON.stringify(m, null, 2));
console.log('twa-manifest.json patched.');
EOF

# ── 3. Keystore: create if missing ───────────────────────────────────────────
info "[3/6] Checking signing keystore..."
if [[ ! -f "$KEYSTORE" ]]; then
  warn "No keystore found — generating a new one at $KEYSTORE"
  warn "IMPORTANT: Back up this keystore! Losing it = you can never update the app."
  keytool -genkey -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 4096 \
    -validity 10000 \
    -storepass "$KS_PASSWORD" \
    -keypass "$KS_PASSWORD" \
    -dname "CN=AmtsHelfer AI, OU=Mobile, O=Matthias Zollbrecht, L=Tüßling, ST=Bavaria, C=DE"
  info "Keystore created: $KEYSTORE"
else
  info "Using existing keystore: $KEYSTORE"
fi

# ── 4. Extract SHA-256 fingerprint for assetlinks.json ───────────────────────
info "[4/6] Extracting SHA-256 fingerprint..."
FINGERPRINT=$(keytool -list -v \
  -keystore "$KEYSTORE" \
  -alias "$KEY_ALIAS" \
  -storepass "$KS_PASSWORD" 2>/dev/null \
  | grep "SHA256:" | head -1 | awk '{print $2}')

if [[ -n "$FINGERPRINT" ]]; then
  info "SHA-256: $FINGERPRINT"

  # Update assetlinks.json
  node - <<ASSETEOF
const fs = require('fs');
const al = JSON.parse(fs.readFileSync('public/.well-known/assetlinks.json', 'utf8'));
al[0].target.sha256_cert_fingerprints = ["$FINGERPRINT"];
fs.writeFileSync('public/.well-known/assetlinks.json', JSON.stringify(al, null, 2));

// Also update dist copy
fs.mkdirSync('dist/.well-known', { recursive: true });
fs.writeFileSync('dist/.well-known/assetlinks.json', JSON.stringify(al, null, 2));
console.log('assetlinks.json updated with fingerprint.');
ASSETEOF
  warn ">>> Deploy the updated assetlinks.json BEFORE submitting to Play Store! <<<"
  warn ">>> The file must be live at: $APP_URL/.well-known/assetlinks.json        <<<"
else
  warn "Could not extract fingerprint — check keystore manually."
fi

# ── 5. Generate TWA Android project with Bubblewrap ──────────────────────────
info "[5/6] Generating Android project with Bubblewrap..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
cp twa-manifest.json "$OUTPUT_DIR/twa-manifest.json"

(
  cd "$OUTPUT_DIR"
  npx @bubblewrap/cli@latest init --manifest "$APP_URL/manifest.webmanifest" \
    --directory . \
    --skipPwaValidation 2>&1 | grep -v "^npm warn"
)

# ── 6. Build AAB ──────────────────────────────────────────────────────────────
info "[6/6] Building Android App Bundle (.aab)..."
(
  cd "$OUTPUT_DIR"
  npx @bubblewrap/cli@latest build \
    --skipPwaValidation \
    --signingKeyPath "../$KEYSTORE" \
    --signingKeyAlias "$KEY_ALIAS" \
    --signingKeyStorePassword "$KS_PASSWORD" \
    --signingKeyPassword "$KS_PASSWORD" 2>&1 | grep -v "^npm warn"
)

# ── Output ────────────────────────────────────────────────────────────────────
AAB_FILE=$(find "$OUTPUT_DIR" -name "*.aab" 2>/dev/null | head -1)
APK_FILE=$(find "$OUTPUT_DIR" -name "*.apk" 2>/dev/null | head -1)

echo ""
info "=== Build Complete ==="
if [[ -n "$AAB_FILE" ]]; then
  info "AAB (Play Store):  $AAB_FILE"
fi
if [[ -n "$APK_FILE" ]]; then
  info "APK (Testing):     $APK_FILE"
fi
echo ""
warn "Next steps:"
warn "1. Deploy updated assetlinks.json → $APP_URL/.well-known/assetlinks.json"
warn "2. Upload $AAB_FILE to Google Play Console → Produktion → Release erstellen"
warn "3. Fill in Play Store listing (screenshots, description, content rating)"
