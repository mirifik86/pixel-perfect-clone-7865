import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ui-lang, x-tier",
};

/**
 * LeenScore Analyze Edge Function
 * 
 * This function is a pure passthrough to the IA11 credibility intelligence engine.
 * IA11 is the SINGLE SOURCE OF TRUTH for all analysis logic.
 * 
 * NO local scoring, NO local reasoning, NO fake sources.
 */

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestStartTime = Date.now();
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    // =========================================================================
    // STEP 1: Read secrets - FAIL FAST if not configured
    // =========================================================================
    const IA11_BASE_URL = Deno.env.get("IA11_BASE_URL");
    const IA11_API_KEY = Deno.env.get("IA11_API_KEY");

    if (!IA11_BASE_URL || !IA11_API_KEY) {
      console.error(`[${requestId}] IA11 configuration missing: BASE_URL=${!!IA11_BASE_URL}, API_KEY=${!!IA11_API_KEY}`);
      return new Response(
        JSON.stringify({
          error: "IA11 is not configured. Please contact support.",
          errorCode: "IA11_NOT_CONFIGURED",
          requestId,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =========================================================================
    // STEP 2: Parse request body
    // =========================================================================
    const body = await req.json();
    const { content, text, language, lang, analysisType, mode } = body;

    // Normalize inputs (support both legacy and new field names)
    const analysisText = content || text || "";
    const analysisLang = language || lang || "en";
    const analysisMode = analysisType || mode || "standard";

    if (!analysisText || analysisText.trim().length < 10) {
      return new Response(
        JSON.stringify({
          error: analysisLang === "fr" 
            ? "Contenu trop court pour une analyse fiable." 
            : "Content too short for reliable analysis.",
          errorCode: "CONTENT_TOO_SHORT",
          requestId,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Calling IA11: mode=${analysisMode}, lang=${analysisLang}, text_length=${analysisText.length}`);

    // =========================================================================
    // STEP 3: Call IA11 API
    // =========================================================================
    const ia11Url = `${IA11_BASE_URL.replace(/\/$/, "")}/v1/analyze`;
    
    let ia11Response: Response;
    try {
      ia11Response = await fetch(ia11Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ia11-key": IA11_API_KEY,
        },
        body: JSON.stringify({
          text: analysisText,
          mode: analysisMode,
          lang: analysisLang,
        }),
      });
    } catch (networkError) {
      console.error(`[${requestId}] IA11 network error:`, networkError);
      return new Response(
        JSON.stringify({
          error: analysisLang === "fr"
            ? "IA11 est temporairement inaccessible. Veuillez réessayer."
            : "IA11 is temporarily unreachable. Try again.",
          errorCode: "IA11_NETWORK_ERROR",
          requestId,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =========================================================================
    // STEP 4: Handle IA11 response errors
    // =========================================================================
    if (!ia11Response.ok) {
      const status = ia11Response.status;
      console.error(`[${requestId}] IA11 returned status ${status}`);

      if (status === 401 || status === 403) {
        return new Response(
          JSON.stringify({
            error: analysisLang === "fr"
              ? "Configuration de clé IA11 invalide."
              : "Invalid IA11 key configuration.",
            errorCode: "IA11_AUTH_ERROR",
            requestId,
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (status === 429) {
        return new Response(
          JSON.stringify({
            error: analysisLang === "fr"
              ? "Trop de requêtes. Veuillez patienter quelques instants."
              : "Too many requests. Please wait a moment.",
            errorCode: "IA11_RATE_LIMIT",
            requestId,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generic IA11 error
      let errorText = "";
      try {
        errorText = await ia11Response.text();
      } catch {
        errorText = "Unknown error";
      }
      console.error(`[${requestId}] IA11 error body:`, errorText);

      return new Response(
        JSON.stringify({
          error: analysisLang === "fr"
            ? "IA11 est temporairement inaccessible. Veuillez réessayer."
            : "IA11 is temporarily unreachable. Try again.",
          errorCode: "IA11_ERROR",
          requestId,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =========================================================================
    // STEP 5: Parse IA11 JSON response
    // =========================================================================
    let ia11Data: Record<string, unknown>;
    try {
      ia11Data = await ia11Response.json();
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse IA11 response:`, parseError);
      return new Response(
        JSON.stringify({
          error: analysisLang === "fr"
            ? "Réponse IA11 invalide. Veuillez réessayer."
            : "Invalid IA11 response. Please try again.",
          errorCode: "IA11_PARSE_ERROR",
          requestId,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =========================================================================
    // STEP 6: Inject meta information for debugging/verification
    // =========================================================================
    const tookMs = Date.now() - requestStartTime;

    // Add/enhance meta block
    const existingMeta = (ia11Data.meta as Record<string, unknown>) || {};
    ia11Data.meta = {
      ...existingMeta,
      requestId,
      tookMs,
      engine: "IA11",
      version: existingMeta.version || "1.0",
    };

    // Ensure analysisType is set for UI compatibility
    if (!ia11Data.analysisType) {
      ia11Data.analysisType = analysisMode;
    }

    console.log(`[${requestId}] IA11 response received: score=${(ia11Data as any).score ?? (ia11Data as any).result?.score}, tookMs=${tookMs}`);

    // =========================================================================
    // STEP 7: Return IA11 response unchanged (passthrough)
    // =========================================================================
    return new Response(
      JSON.stringify(ia11Data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({
        error: "Analysis failed unexpectedly. Please try again.",
        errorCode: "UNEXPECTED_ERROR",
        requestId,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
