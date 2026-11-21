// Auth API: exchanges one-time token for JWT via login-client-worker binding

export async function Auth(env, path, method, body, request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  // POST /api/auth/exchange  { username, oneTimeToken } -> { jwt, oneTimeToken }
  if (path === "exchange" && method === "POST") {
    const username = String(body?.username || "").trim();
    const oneTimeToken = String(body?.oneTimeToken || "");
    
    if (!username || !oneTimeToken) {
      return { valid: false, reason: "missing_params" };
    }

    // Call login-client-worker via service binding
    const loginWorker = env.LOGIN_CLIENT_WORKER;
    if (!loginWorker) {
      console.error("LOGIN_CLIENT_WORKER binding not configured");
      return { valid: false, reason: "binding_missing" };
    }

    try {
      const response = await loginWorker.fetch("https://login-client-worker/api/renew-jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
        body: JSON.stringify({ username, oneTimeToken }),
      });

      if (!response.ok) {
        return { valid: false, reason: "login_worker_error" };
      }

      const data = await response.json();
      return { valid: true, jwt: data.jwt, oneTimeToken: data.oneTimeToken };
    } catch (e) {
      console.error("LOGIN_WORKER_ERROR:", e);
      return { valid: false, reason: "login_worker_error" };
    }
  }

  // POST /api/auth/verify-jwt  { jwt } -> { valid, payload }
  if (path === "verify-jwt" && method === "POST") {
    const jwt = String(body?.jwt || "");
    if (!jwt) {
      return { valid: false, reason: "missing_jwt" };
    }

    // Verify JWT locally using same secret as login-client-worker
    try {
      const parts = jwt.split(".");
      if (parts.length !== 3) {
        return { valid: false, reason: "invalid_jwt_format" };
      }

      // Get JWT secret
      const jwtSecret = await getJWTSecret(env);
      if (!jwtSecret) {
        return { valid: false, reason: "no_secret" };
      }

      // Verify signature
      const [headerB64, payloadB64, signatureB64] = parts;
      const expected = await sign(`${headerB64}.${payloadB64}`, jwtSecret);
      if (expected !== signatureB64) {
        return { valid: false, reason: "bad_signature" };
      }

      const payload = decodeJwtPart(payloadB64);
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        return { valid: false, reason: "jwt_expired" };
      }

      return { valid: true, payload };
    } catch (e) {
      return { valid: false, reason: "jwt_parse_error" };
    }
  }

  return { valid: false, reason: "unknown_route" };
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
