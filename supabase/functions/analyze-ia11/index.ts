import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IA11_ENDPOINT = "https://ia11-api-1.onrender.com/v1/analyze";
const IA11_TIMEOUT_MS = 12000; // 12 second timeout

interface IA11Request {
  mode: "standard" | "pro";
  text: string;
}

interface IA11Response {
  engine: string;
  score: number;
  verdict: string;
  reasons?: string[];
  sources?: Array<{ url?: string; title?: string; snippet?: string }>;
  status: string;
}

/**
 * Normalize IA11 response to LeenScore UI format
 */
function normalizeIA11Response(ia11Data: IA11Response): Record<string, unknown> {
  const reasons = ia11Data.reasons || [];
  
  // Build summary from verdict + top reasons
  let summary = ia11Data.verdict || "";
  if (reasons.length > 0 && summary.length < 200) {
    summary += " " + reasons.slice(0, 2).join(" ");
  }
  
  // Map reasons to breakdown structure
  const breakdown = {
    sources: {
      points: 0,
      reason: reasons[0] || "Analysis via external engine",
    },
    factual: {
      points: 0,
      reason: reasons[1] || "External verification performed",
    },
    tone: {
      points: 0,
      reason: reasons[2] || "Tone evaluated by external engine",
    },
    context: {
      points: 0,
      reason: reasons[3] || "Context assessed",
    },
    transparency: {
      points: 0,
      reason: reasons[4] || "Transparency check complete",
    },
  };
  
  // Determine confidence based on score
  let confidence: "low" | "medium" | "high" = "medium";
  if (ia11Data.score >= 70) confidence = "high";
  else if (ia11Data.score <= 30) confidence = "low";
  
  return {
    score: Math.min(100, Math.max(0, ia11Data.score)),
    analysisType: "standard",
    breakdown,
    summary: summary.trim(),
    articleSummary: ia11Data.verdict || summary.trim(),
    confidence,
    sources: ia11Data.sources || [],
    engineUsed: "IA11",
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
      console.log("[analyze-ia11] No IA11_API_KEY configured, returning fallback signal");
      return new Response(
        JSON.stringify({ fallback: true, reason: "NO_API_KEY" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IA11_TIMEOUT_MS);

    try {
      console.log("[analyze-ia11] Calling IA11 API...");
      
      const response = await fetch(IA11_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ia11-key": IA11_API_KEY,
        },
        body: JSON.stringify({ mode, text } as IA11Request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        console.log("[analyze-ia11] IA11 returned 401 Unauthorized");
        return new Response(
          JSON.stringify({ fallback: true, reason: "UNAUTHORIZED" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!response.ok) {
        console.log(`[analyze-ia11] IA11 returned non-2xx: ${response.status}`);
        return new Response(
          JSON.stringify({ fallback: true, reason: `HTTP_${response.status}` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ia11Data = await response.json() as IA11Response;
      
      if (ia11Data.status !== "success") {
        console.log("[analyze-ia11] IA11 returned non-success status:", ia11Data.status);
        return new Response(
          JSON.stringify({ fallback: true, reason: "API_STATUS_FAILED" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Normalize and return successful response
      const normalized = normalizeIA11Response(ia11Data);
      console.log("[analyze-ia11] Success! Score:", normalized.score);
      
      return new Response(
        JSON.stringify(normalized),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.log("[analyze-ia11] Request timed out after 12s");
        return new Response(
          JSON.stringify({ fallback: true, reason: "TIMEOUT" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[analyze-ia11] Network error:", fetchError);
      return new Response(
        JSON.stringify({ fallback: true, reason: "NETWORK_ERROR" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("[analyze-ia11] Unexpected error:", error);
    return new Response(
      JSON.stringify({ fallback: true, reason: "PARSE_ERROR" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
