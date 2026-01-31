import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IA11 API Configuration
const IA11_API_BASE = "https://ia11-api-1.onrender.com/v1/analyze";
const IA11_TIMEOUT_MS = 60000; // 60 seconds for IA11 processing

interface IA11Request {
  text: string;
  language?: 'en' | 'fr';
  mode?: 'standard' | 'pro';
}

interface IA11Response {
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
  bestLinks?: Array<{
    title: string;
    url: string;
    publisher?: string;
    trustTier?: 'high' | 'medium' | 'low';
    stance?: 'corroborating' | 'neutral' | 'contradicting';
    whyItMatters?: string;
  }>;
  articleSummary?: string;
  analysisType?: 'standard' | 'pro';
}

/**
 * IA11-ONLY Analysis Engine
 * 
 * LeenScore is now 100% powered by IA11.
 * This function acts as a secure proxy to the IA11 API.
 * NO LOCAL SCORING, NO FALLBACKS.
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
    const { content, text, language = 'en', analysisType = 'standard' } = body;
    
    // Support both 'content' and 'text' field names for flexibility
    const inputText = content || text;
    
    if (!inputText || typeof inputText !== 'string' || inputText.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: language === 'fr' 
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
          error: language === 'fr'
            ? "Configuration IA11 manquante"
            : "IA11 configuration missing",
          code: "CONFIG_ERROR"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Debug: log key info (masked for security)
    const keyPreview = ia11ApiKey.length > 8 ? `${ia11ApiKey.substring(0, 4)}...${ia11ApiKey.substring(ia11ApiKey.length - 4)}` : '[too short]';
    console.log(`[IA11] Analyzing text (${inputText.length} chars) | lang=${language} | mode=${analysisType} | key=${keyPreview} (${ia11ApiKey.length} chars)`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IA11_TIMEOUT_MS);

    try {
      // Call IA11 API - THE SINGLE SOURCE OF TRUTH
      // Use x-ia11-key header format (IA11 specific authentication)
      const ia11Response = await fetch(IA11_API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ia11-key": ia11ApiKey,
        },
        body: JSON.stringify({
          text: inputText.trim(),
          language: language,
          mode: analysisType,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!ia11Response.ok) {
        const errorText = await ia11Response.text().catch(() => "Unknown error");
        console.error(`[IA11] API error: ${ia11Response.status} - ${errorText}`);
        
        return new Response(
          JSON.stringify({ 
            error: language === 'fr'
              ? `Erreur IA11: ${ia11Response.status}`
              : `IA11 error: ${ia11Response.status}`,
            code: `IA11_HTTP_${ia11Response.status}`,
            details: errorText
          }),
          { status: ia11Response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Parse IA11 response - USE IT DIRECTLY, NO MODIFICATIONS
      const ia11Data: IA11Response = await ia11Response.json();

      console.log(`[IA11] Success | score=${ia11Data.score} | risk=${ia11Data.riskLevel} | confidence=${ia11Data.confidence}`);

      // Return IA11 response with consistent structure for frontend
      // NO LOCAL SCORING OR ADJUSTMENTS - IA11 is the single source of truth
      return new Response(
        JSON.stringify({
          status: "ok",
          engine: "IA11",
          
          // Core fields from IA11 - passed through directly
          score: ia11Data.score,
          riskLevel: ia11Data.riskLevel,
          summary: ia11Data.summary,
          reasons: ia11Data.reasons || [],
          confidence: ia11Data.confidence,
          
          // PRO-specific fields if present
          sources: ia11Data.sources || [],
          bestLinks: ia11Data.bestLinks || [],
          
          // Metadata
          analysisType: ia11Data.analysisType || analysisType,
          articleSummary: ia11Data.articleSummary || "",
          
          // Nested result object for PRO compatibility
          result: {
            score: ia11Data.score,
            riskLevel: ia11Data.riskLevel,
            summary: ia11Data.summary,
            confidence: ia11Data.confidence,
            sources: ia11Data.sources || [],
            bestLinks: ia11Data.bestLinks || [],
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
        return new Response(
          JSON.stringify({ 
            error: language === 'fr'
              ? "Délai d'attente IA11 dépassé. Veuillez réessayer."
              : "IA11 request timed out. Please try again.",
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
