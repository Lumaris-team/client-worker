// Workflows
import { CheckGradesWorkflow } from "./workflows/check_grades.js";

// API features
import { EDfunction } from "./backend/ecole_directe/index.js";
import { AIfunction } from "./backend/ai/index.js";
import { Cache } from "./backend/cache/index.js";
import { Auth, issueSessionToken, verifySessionToken } from "./backend/auth/index.js";
import { Pomodoro } from "./backend/database/pomodoro.js";
import { WebsitesFunction } from "./backend/database/websites.js";
import { FilesFunction, initializeFolderArchitecture } from "./backend/database/files_management.js";
import { StudyNotesFunction } from "./backend/database/study_notes.js";
import { ToolsFunction } from "./backend/tools/index.js";
import { StatsFunction } from "./backend/settings/stats.js";
import { CustomizationFunction } from "./backend/settings/customization.js";

// Helper to extract username from JWT (without verification)
function extractUsernameFromJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub || null;
  } catch (e) {
    return null;
  }
}

import { sendMail } from "./backend/notifications/mail.js";

async function sendErrorEmail(env, error, context) {
  try {
    const rawError = error instanceof Error ? error.stack || error.message : String(error);
    await sendMail(env, {
      subject: `Dashboard error: ${context}`,
      text: `A runtime error occurred while processing the request in the Dashboard application.\n\nContext: ${context}\n\nRaw error:\n${rawError}`,
    });
  } catch (mailError) {
    console.error("Failed to send error email:", mailError);
  }
}

// API funtion
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const headers = request.headers
    let body;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (file upload)
      const formData = await request.formData();
      body = formData;
    } else {
      // Handle JSON
      try {
        body = JSON.parse(await request.text());
      } catch (e) {
        body = {};
      }
    } 
    
    // =========================
    // 📶 MAIN API
    // =========================
    /// CORS
    const corsHeaders = {
      "Content-Type":
        "application/json",

      "Access-Control-Allow-Origin":
        "*",

      "Access-Control-Allow-Methods":
        "GET, POST, DELETE, PUT, PATCH, OPTIONS",

      "Access-Control-Allow-Headers":
        "*"
    };

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    
    // Public Supabase config for the frontend (anon key is public).
    if (url.pathname === "/api/config") {
      return new Response(JSON.stringify({
        supabaseUrl: env.SUPABASE_URL ?? null,
        supabaseAnonKey: env.SUPABASE_ANON_KEY ?? null,
      }), {
        headers: corsHeaders
      });
    }

    // Auth: verify one-time token from login-client-worker and issue JWT
    if (url.pathname === "/api/auth/one-time" && method === "POST") {
      const username = String(body?.username || "").trim();
      const token = String(body?.token || "");
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const verifier = `https://login-client-worker.${username}-cloudflare-account.workers.dev/api/verify`;
      const verified = await fetch(verifier, {
        method: "POST",
        headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip },
        body: JSON.stringify({ username, token, ip }),
      });
      if (!verified.ok) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
      const verifyResult = await verified.json();
      if (!verifyResult.valid || !verifyResult.jwt) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
      }
      return new Response(JSON.stringify({ token: verifyResult.jwt, exp: verifyResult.expiresIn, valid: true }), { headers: corsHeaders });
    }

    if (url.pathname === "/api/auth/invalidate" && method === "POST") {
      await caches.default.delete(new Request("https://cache/session_tokens"));
      return new Response(JSON.stringify({ invalidated: true }), { headers: corsHeaders });
    }

    // Auth: verify JWT from login-client-worker
    if (url.pathname === "/api/auth/check" && method === "POST") {
      const token = String(body?.token || "");
      const username = String(body?.username || "");
      
      // Verify JWT with login-client-worker
      const verifier = `https://login-client-worker.${username}-cloudflare-account.workers.dev/api/verify-jwt`;
      const verified = await fetch(verifier, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, username }),
      });
      
      if (!verified.ok) {
        return new Response(JSON.stringify({ valid: false }), { headers: corsHeaders });
      }
      
      const verifyResult = await verified.json();
      return new Response(JSON.stringify({ valid: verifyResult.valid }), { headers: corsHeaders });
    }


    if (url.pathname.startsWith("/api/")) {
      // Every data route requires a valid JWT from login-client-worker
      const authHeader = headers.get("Authorization") || "";
      const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
      
      if (!bearer) {
        return new Response(JSON.stringify({ error: "unauthorized", reason: "missing_token" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
      
      // Extract username from JWT to know which login-client-worker to verify with
      const username = extractUsernameFromJWT(bearer);
      if (!username) {
        return new Response(JSON.stringify({ error: "unauthorized", reason: "invalid_token" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
      
      // Verify JWT with login-client-worker
      const verifier = `https://login-client-worker.${username}-cloudflare-account.workers.dev/api/verify-jwt`;
      const verified = await fetch(verifier, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: bearer, username }),
      });
      
      if (!verified.ok) {
        return new Response(JSON.stringify({ error: "unauthorized", reason: "verification_failed" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
      
      const verifyResult = await verified.json();
      if (!verifyResult.valid) {
        return new Response(JSON.stringify({ error: "unauthorized", reason: verifyResult.reason || "invalid" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
      try {
        // Ecole directe paths
        let resp;
        if (url.pathname.startsWith("/api/ed/")) {
          resp = await EDfunction(env, url.pathname.slice("/api/ed/".length), method, headers, body);
        } else if (url.pathname.startsWith("/api/ai/")) {
          resp = await AIfunction(env, url.pathname.slice("/api/ai/".length), method, headers, body, request);
        } else if (url.pathname.startsWith("/api/pomodoro/")) {
          resp = await Pomodoro(env, url.pathname.slice("/api/pomodoro/".length), method, body);
        } else if (url.pathname.startsWith("/api/websites/")) {
          resp = await WebsitesFunction(env, url.pathname.slice("/api/websites/".length), method, body);
        } else if (url.pathname.startsWith("/api/tools/")) {
          resp = await ToolsFunction(env, url.pathname.slice("/api/tools/".length), method, body);
        } else if (url.pathname.startsWith("/api/files/")) {
          resp = await FilesFunction(env, url.pathname.slice("/api/files/".length), method, body);
        } else if (url.pathname.startsWith("/api/study-notes/")) {
          resp = await StudyNotesFunction(env, url.pathname.slice("/api/study-notes/".length), method, body);
        } else if (url.pathname === "/api/settings/stats" || url.pathname === "/api/settings/stats/") {
          resp = await StatsFunction(env);
        } else if (url.pathname === "/api/settings/customization" || url.pathname === "/api/settings/customization/") {
          resp = await CustomizationFunction(env, url.pathname.slice("/api/settings/customization".length), method, body, session.payload);
        };
        // Return response
        return new Response(JSON.stringify({
          resp
        }), {
          headers: corsHeaders
        })
      } catch (e) {
        console.error("API ERROR:", e?.stack || e);
        // await sendErrorEmail(env, e, `API ${url.pathname}`);
        return new Response(JSON.stringify({
          error: e?.message,
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response("Not found", { status: 404 });
  },

  async scheduled(event, env, ctx) {
    // Déclencher le workflow check_grades
    try {
      await env.CHECK_GRADES.create();
    } catch (error) {
      console.error("Error triggering check_grades workflow:", error);
    }
  }
}

// Export the workflows code
export { CheckGradesWorkflow };
