// Workflows
import { CheckGradesWorkflow } from "./workflows/check_grades";

// API features
import { EDfunction } from "./backend/ecole_directe/index.js";
import { AIfunction } from "./backend/ai/index.js";
import { Cache } from "./backend/cache/index.js";
import { Auth, verifySessionToken } from "./backend/auth/index.js";
import { Pomodoro } from "./backend/database/pomodoro.js";
import { WebsitesFunction } from "./backend/database/websites.js";
import { FilesFunction, initializeFolderArchitecture } from "./backend/database/files_management.js";
import { StudyNotesFunction } from "./backend/database/study_notes.js";
import { ToolsFunction } from "./backend/tools/index.js";
import { StatsFunction } from "./backend/settings/stats.js";
import { CustomizationFunction } from "./backend/settings/customization.js";
  
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
        turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? null,
      }), {
        headers: corsHeaders
      });
    }

    // Auth: verify Supabase token + issue/validate server session tokens.
    if (url.pathname.startsWith("/api/auth/")) {
      try {
        const resp = await Auth(env, url.pathname.slice("/api/auth/".length), method, body, request);
        return new Response(JSON.stringify(resp), { headers: corsHeaders });
      } catch (e) {
        console.error("AUTH ERROR:", e?.stack || e);
        await sendErrorEmail(env, e, "AUTH");
        return new Response(JSON.stringify({ valid: false, error: e?.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    if (url.pathname.startsWith("/api/")) {
      // Every data route requires a valid server-issued JWT in the
      // Authorization header. /api/config and /api/auth/* are intentionally
      // reachable without one (they bootstrap the login + token exchange), and
      // google site verification is handled earlier, before any gating.
      const authHeader = headers.get("Authorization") || "";
      const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
      const session = await verifySessionToken(env, bearer);
      if (!session.valid) {
        return new Response(JSON.stringify({ error: "unauthorized", reason: session.reason }), {
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
