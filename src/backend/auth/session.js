// JWT token verification for main-client-worker
// Verifies JWTs issued by login-client-worker

export async function verifySessionToken(env, token) {
  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing_token" };
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "malformed_token" };
  }
  const [headerB64, payloadB64, signatureB64] = parts;

  // Get JWT secret from environment
  const jwtSecret = await getJWTSecret(env);
  if (!jwtSecret) {
    return { valid: false, reason: "no_secret" };
  }

  // Verify signature
  const expected = await sign(`${headerB64}.${payloadB64}`, jwtSecret);
  if (expected !== signatureB64) {
    return { valid: false, reason: "bad_signature" };
  }

  // Decode payload
  const payload = decodeJwtPart(payloadB64);
  if (!payload) {
    return { valid: false, reason: "malformed_token" };
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, payload };
}

// Helper functions for JWT operations
async function getJWTSecret(env) {
  const binding = env.JWT_SECRET_KEY;
  if (typeof binding === "string") return binding;
  if (binding && typeof binding.get === "function") {
    try {
      return await binding.get();
    } catch (e) {
      console.error("JWT_SECRET_KEY get error:", e);
      return null;
    }
  }
  return null;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(signingInput, secret) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  return bytesToBase64Url(new Uint8Array(sig));
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(input) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlToString(input) {
  return new TextDecoder().decode(base64UrlToBytes(input));
}

function decodeJwtPart(part) {
  try {
    return JSON.parse(base64UrlToString(part));
  } catch (e) {
    return null;
  }
}
