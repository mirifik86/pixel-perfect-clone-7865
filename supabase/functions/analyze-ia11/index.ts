import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// IA11 PRO ANALYSIS EDGE FUNCTION
// Exclusive engine for LeenScore PRO - no fallback to other AI providers
// ============================================================================

interface IA11Request {
  userText: string;
  uiLanguage: string;
  mode: "pro";
  context: "leenscore";
}

interface IA11Source {
  title: string;
  url: string;
  stance: "corroborates" | "contradicts" | "context" | "unknown";
  confidence: number;
}

interface IA11Response {
  score: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  explanation: string;
  keySignals: string[];
  verdict: string;
  sources: IA11Source[];
  confidence: number;
  tookMs: number;
}

// Quality guardrails - enforce minimum standards
interface QualityCheckResult {
  passed: boolean;
  reason?: string;
}

const MIN_SOURCES = 5;
const MIN_EXPLANATION_LENGTH = 200;
const MIN_KEY_SIGNALS = 5;

const checkQuality = (response: IA11Response): QualityCheckResult => {
  if (!response.score && response.score !== 0) {
    return { passed: false, reason: "missing_score" };
  }
  
  if (!response.riskLevel) {
    return { passed: false, reason: "missing_risk_level" };
  }
  
  if (!response.summary || response.summary.length < 20) {
    return { passed: false, reason: "missing_summary" };
  }
  
  if (!response.explanation || response.explanation.length < MIN_EXPLANATION_LENGTH) {
    return { passed: false, reason: "explanation_too_short" };
  }
  
  if (!response.keySignals || response.keySignals.length < MIN_KEY_SIGNALS) {
    return { passed: false, reason: "insufficient_signals" };
  }
  
  if (!response.verdict) {
    return { passed: false, reason: "missing_verdict" };
  }
  
  if (!response.sources || response.sources.length < MIN_SOURCES) {
    return { passed: false, reason: "insufficient_sources" };
  }
  
  if (response.confidence === undefined || response.confidence === null) {
    return { passed: false, reason: "missing_confidence" };
  }
  
  return { passed: true };
};

// Map IA11 source stance to existing UI format
const mapStanceToUI = (stance: string): "corroborating" | "neutral" | "contradicting" => {
  switch (stance) {
    case "corroborates":
      return "corroborating";
    case "contradicts":
      return "contradicting";
    case "context":
    case "unknown":
    default:
      return "neutral";
  }
};

// Infer trust tier from URL domain
const inferTrustTier = (url: string): "high" | "medium" | "low" => {
  const lowerUrl = url.toLowerCase();
  
  // High trust: government, major institutions, top-tier media
  const highTrustPatterns = /\.(gov|gouv|edu|int)\b|wikipedia|britannica|reuters|associated[\s-]*press|afp|bbc|cnn|nytimes|washingtonpost|wsj|nature\.com|science\.org|pubmed|who\.int|un\.org|nasa|nih|cdc|fda/i;
  if (highTrustPatterns.test(lowerUrl)) {
    return "high";
  }
  
  // Medium trust: major media
  const mediumTrustPatterns = /guardian|telegraph|lemonde|figaro|economist|bloomberg|politico|npr|pbs|time\.com|forbes|wired|apnews|france24|rfi/i;
  if (mediumTrustPatterns.test(lowerUrl)) {
    return "medium";
  }
  
  return "medium"; // Default to medium for unknown sources
};

// Extract domain/publisher from URL
const extractPublisher = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// Transform IA11 response to existing UI data contract
const transformToUIFormat = (ia11Response: IA11Response) => {
  // Map sources to existing bestLinks/sources format
  const sources = ia11Response.sources.map((src) => ({
    title: src.title,
    publisher: extractPublisher(src.url),
    url: src.url,
    trustTier: inferTrustTier(src.url),
    stance: mapStanceToUI(src.stance),
    whyItMatters: `Confidence: ${Math.round(src.confidence * 100)}%`,
  }));
  
  // Take top 4 as bestLinks
  const bestLinks = sources.slice(0, 4);
  
  // Map confidence (0-1) to tier
  const confidenceTier = ia11Response.confidence >= 0.75 ? "high" 
    : ia11Response.confidence >= 0.45 ? "medium" 
    : "low";
  
  return {
    status: "ok",
    analysisType: "pro" as const,
    score: Math.max(0, Math.min(100, ia11Response.score)),
    summary: ia11Response.summary,
    confidence: confidenceTier,
    
    // PRO result structure for existing UI components
    result: {
      score: ia11Response.score,
      riskLevel: ia11Response.riskLevel,
      summary: ia11Response.summary,
      confidence: ia11Response.confidence,
      bestLinks,
      sources,
      // Additional fields for PRO UI
      explanation: ia11Response.explanation,
      keySignals: ia11Response.keySignals,
      verdict: ia11Response.verdict,
    },
    
    // Legacy corroboration format for backward compatibility
    corroboration: {
      outcome: ia11Response.riskLevel === "low" ? "supported" 
        : ia11Response.riskLevel === "high" ? "contested" 
        : "neutral",
      sourcesConsulted: ia11Response.sources.length,
      sourceTypes: [...new Set(sources.map(s => s.publisher))],
      summary: ia11Response.verdict,
      sources: {
        corroborated: sources.filter(s => s.stance === "corroborating").map(s => ({
          name: s.title,
          url: s.url,
          snippet: s.whyItMatters,
        })),
        contradicting: sources.filter(s => s.stance === "contradicting").map(s => ({
          name: s.title,
          url: s.url,
          snippet: s.whyItMatters,
        })),
        neutral: sources.filter(s => s.stance === "neutral").map(s => ({
          name: s.title,
          url: s.url,
          snippet: s.whyItMatters,
        })),
      },
    },
    
    // Meta information
    meta: {
      engine: "IA11",
      requestId: crypto.randomUUID(),
      tookMs: ia11Response.tookMs,
    },
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { userText, uiLanguage, qaCompare } = await req.json();
    
    if (!userText || userText.trim().length < 10) {
      return new Response(
        JSON.stringify({
          status: "retry",
          reason: "quality_gate",
          message: uiLanguage === "fr"
            ? "Le texte est trop court pour une analyse PRO fiable."
            : "The text is too short for a reliable PRO analysis."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get IA11 configuration from secrets
    const IA11_BASE_URL = Deno.env.get("IA11_BASE_URL");
    const IA11_API_KEY = Deno.env.get("IA11_API_KEY");
    
    if (!IA11_BASE_URL || !IA11_API_KEY) {
      console.error("IA11 secrets not configured");
      return new Response(
        JSON.stringify({
          status: "retry",
          reason: "quality_gate",
          code: "IA11_NOT_CONFIGURED",
          message: uiLanguage === "fr"
            ? "Service PRO temporairement indisponible. Veuillez réessayer."
            : "PRO service temporarily unavailable. Please try again."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build IA11 request
    const ia11Request: IA11Request = {
      userText: userText.trim(),
      uiLanguage: uiLanguage || "en",
      mode: "pro",
      context: "leenscore",
    };

    console.log(`[IA11] Calling API for PRO analysis (lang: ${uiLanguage})...`);

    // Call IA11 API
    const ia11Response = await fetch(`${IA11_BASE_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ia11-key": IA11_API_KEY,
      },
      body: JSON.stringify(ia11Request),
    });

    if (!ia11Response.ok) {
      const errorText = await ia11Response.text();
      console.error(`[IA11] API error: ${ia11Response.status}`, errorText);
      
      return new Response(
        JSON.stringify({
          status: "retry",
          reason: "quality_gate",
          code: `IA11_HTTP_${ia11Response.status}`,
          message: uiLanguage === "fr"
            ? "Analyse en cours de raffinement pour garantir une qualité PRO."
            : "Analysis is being refined to ensure PRO quality."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ia11Data: IA11Response = await ia11Response.json();
    
    // Add processing time if not provided
    if (!ia11Data.tookMs) {
      ia11Data.tookMs = Date.now() - startTime;
    }

    // QA Compare flag - log raw response for dev review
    if (qaCompare) {
      console.log("[IA11-QA] Raw IA11 response:", JSON.stringify(ia11Data, null, 2));
    }

    // Quality guardrails
    const qualityCheck = checkQuality(ia11Data);
    if (!qualityCheck.passed) {
      console.warn(`[IA11] Quality check failed: ${qualityCheck.reason}`);
      
      return new Response(
        JSON.stringify({
          status: "retry",
          reason: "quality_gate",
          code: `QUALITY_${qualityCheck.reason?.toUpperCase()}`,
          message: uiLanguage === "fr"
            ? "L'analyse nécessite une nouvelle tentative pour une qualité maximale."
            : "Analysis needs a retry for maximum quality."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform to UI format
    const uiResponse = transformToUIFormat(ia11Data);

    console.log(`[IA11] Success: score=${uiResponse.score}, sources=${ia11Data.sources.length}, took=${ia11Data.tookMs}ms`);

    return new Response(
      JSON.stringify(uiResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[IA11] Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred.",
        code: "IA11_UNEXPECTED"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
