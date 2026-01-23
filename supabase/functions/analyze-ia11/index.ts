import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IA11_ENDPOINT = "https://ia11-api-1.onrender.com/v1/analyze";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Health check endpoint
  if (req.method === "GET" && url.pathname.endsWith("/health")) {
    return new Response(
      JSON.stringify({ ok: true, service: "analyze-ia11" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Main POST handler
  if (req.method === "POST") {
    try {
      const { text, mode = "standard" } = await req.json();

      if (!text || typeof text !== "string") {
        return new Response(
          JSON.stringify({ error: "Missing or invalid 'text' parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const IA11_API_KEY = Deno.env.get("IA11_API_KEY");

      if (!IA11_API_KEY) {
        console.log("[analyze-ia11] No IA11_API_KEY configured");
        return new Response(
          JSON.stringify({ fallback: true, status: "error", error: "IA11_failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[analyze-ia11] Calling IA11 API...");

      const response = await fetch(IA11_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ia11-key": IA11_API_KEY,
        },
        body: JSON.stringify({ text, mode }),
      });

      if (!response.ok) {
        console.log(`[analyze-ia11] IA11 returned non-200: ${response.status}`);
        return new Response(
          JSON.stringify({ fallback: true, status: "error", error: "IA11_failed" }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return upstream JSON as-is
      const data = await response.json();
      console.log("[analyze-ia11] Success!");

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error("[analyze-ia11] Error:", error);
      return new Response(
        JSON.stringify({ fallback: true, status: "error", error: "IA11_failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
