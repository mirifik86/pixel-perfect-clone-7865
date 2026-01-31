import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IA11 API Configuration
const IA11_API_BASE = "https://ia11-api-1.onrender.com/v1/analyze";
const IA11_TIMEOUT_MS = 60000; // 60 seconds for IA11 processing

interface IA11Response {
  result: {
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    summary: string;
    reasons: string[];
    confidence: number;
    sources?: Array<{
      title: string;
      url: string;
      publisher?: string;
      trustTier?: 'high' | 'medium' | 'low';
      stance?: 'corroborating' | 'neutral' | 'contradicting';
    }>;
  };
}

/**
 * IA11-ONLY Analysis Engine
 * 
 * LeenScore is 100% powered by IA11.
 * This function acts as a secure proxy to the IA11 API.
 * NO LOCAL SCORING, NO FALLBACKS.
 * 
 * Required headers to IA11:
 * - x-ia11-key: API key (from secret)
 * - x-ui-lang: UI language code (fr/en/es/it/de/pt/ru/uk/ja)
 * - x-tier: analysis tier (standard/pro)
 */
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  const url = new URL(req.url);
  if (url.pathname.endsWith("/health")) {
    return new Response(JSON.stringify({ status: "ok", engine: "IA11" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { content, text, language = 'fr', analysisType = 'standard' } = body;
    
    // Support both 'content' and 'text' field names for flexibility
    const inputText = content || text;
    
    // Determine UI language (default to 'fr')
    const uiLang = language || 'fr';
    const tier = analysisType || 'standard';
    
    if (!inputText || typeof inputText !== 'string' || inputText.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: uiLang === 'fr' 
            ? "Texte requis pour l'analyse" 
            : "Text required for analysis",
          code: "MISSING_INPUT"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get IA11 API key from secrets
    const ia11ApiKey = Deno.env.get("IA11_API_KEY");
    
    if (!ia11ApiKey) {
      console.error("[IA11] API key not configured");
      return new Response(
        JSON.stringify({ 
          error: uiLang === 'fr'
            ? "Configuration IA11 manquante"
            : "IA11 configuration missing",
          code: "CONFIG_ERROR"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Debug: log request info (key masked for security)
    const keyPreview = ia11ApiKey.length > 8 
      ? `${ia11ApiKey.substring(0, 4)}...${ia11ApiKey.substring(ia11ApiKey.length - 4)}` 
      : '[too short]';
    console.log(`[IA11] Request | text=${inputText.length} chars | lang=${uiLang} | tier=${tier} | key=${keyPreview}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IA11_TIMEOUT_MS);

    try {
      // Call IA11 API with required headers
      // Headers: x-ia11-key, x-ui-lang, x-tier
      // Body: { "text": "..." }
      const ia11Response = await fetch(IA11_API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ia11-key": ia11ApiKey,
          "x-ui-lang": uiLang,
          "x-tier": tier,
        },
        body: JSON.stringify({
          text: inputText.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log response status for debugging
      console.log(`[IA11] Response status: ${ia11Response.status}`);

      if (!ia11Response.ok) {
        const errorText = await ia11Response.text().catch(() => "Unknown error");
        console.error(`[IA11] API error: ${ia11Response.status} - ${errorText}`);
        
        // Return IA11-specific error with localized message
        const errorMessage = uiLang === 'fr'
          ? "Connexion au moteur IA11 impossible. Veuillez réessayer."
          : "Unable to connect to IA11 engine. Please try again.";
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            code: `IA11_HTTP_${ia11Response.status}`,
            details: errorText
          }),
          { status: ia11Response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Parse IA11 response - USE IT DIRECTLY
      const ia11Data: IA11Response = await ia11Response.json();

      console.log(`[IA11] Success | score=${ia11Data.result?.score} | risk=${ia11Data.result?.riskLevel}`);

      // Deduplicate sources by URL if present
      let deduplicatedSources = ia11Data.result?.sources || [];
      if (deduplicatedSources.length > 0) {
        const seen = new Set<string>();
        deduplicatedSources = deduplicatedSources.filter(source => {
          if (seen.has(source.url)) return false;
          seen.add(source.url);
          return true;
        });
      }

      // Return IA11 response with consistent structure for frontend
      // Map directly from response.result.* as specified
      return new Response(
        JSON.stringify({
          status: "ok",
          engine: "IA11",
          
          // Core fields from IA11 response.result - passed through directly
          score: ia11Data.result?.score ?? 0,
          riskLevel: ia11Data.result?.riskLevel ?? 'medium',
          summary: ia11Data.result?.summary ?? '',
          reasons: ia11Data.result?.reasons ?? [],
          confidence: ia11Data.result?.confidence ?? 0.5,
          sources: deduplicatedSources,
          
          // Metadata
          analysisType: tier,
          
          // Nested result object for compatibility
          result: {
            score: ia11Data.result?.score ?? 0,
            riskLevel: ia11Data.result?.riskLevel ?? 'medium',
            summary: ia11Data.result?.summary ?? '',
            reasons: ia11Data.result?.reasons ?? [],
            confidence: ia11Data.result?.confidence ?? 0.5,
            sources: deduplicatedSources,
          },
          
          // Empty breakdown for UI compatibility (IA11 doesn't use point breakdown)
          breakdown: {
            sources: { points: 0, reason: "" },
            factual: { points: 0, reason: "" },
            tone: { points: 0, reason: "" },
            context: { points: 0, reason: "" },
            transparency: { points: 0, reason: "" },
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("[IA11] Request timeout");
        const errorMessage = uiLang === 'fr'
          ? "Délai d'attente IA11 dépassé. Veuillez réessayer."
          : "IA11 request timed out. Please try again.";
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            code: "IA11_TIMEOUT"
          }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error("[IA11] Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        code: "IA11_INTERNAL_ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
