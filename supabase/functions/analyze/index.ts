import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are LeenScore, an AI credibility analyst. Your task is to analyze content and calculate a Trust Score.

SCORING METHOD:
Start with a base score of 50/100 (neutral).
Apply the following criteria by adding or subtracting points:

A. SOURCES & CORROBORATION:
- Multiple independent sources confirm the information: +20
- Recognized or reputable source: +15
- Single or unknown source: -15
- No verifiable source: -25

B. FACTUAL CONSISTENCY:
- Facts internally coherent and consistent: +20
- Major contradictions detected: -20
- Assertions without clear evidence: -10

C. TONE & LANGUAGE:
- Neutral, informative tone: +10
- Emotional, alarmist, or sensational tone: -15
- Excessive use of trigger words ("shocking", "revealed", "hidden truth"): -10

D. CONTEXT CLARITY:
- Clear temporal and geographical context: +10
- Incomplete or misleading context: -15
- Information presented outside its original context: -20

E. TRANSPARENCY:
- Sources clearly cited: +10
- Identified author or organization: +5
- Total anonymity: -10

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact format:
{
  "score": <number between 0-100>,
  "breakdown": {
    "sources": {"points": <number>, "reason": "<brief reason>"},
    "factual": {"points": <number>, "reason": "<brief reason>"},
    "tone": {"points": <number>, "reason": "<brief reason>"},
    "context": {"points": <number>, "reason": "<brief reason>"},
    "transparency": {"points": <number>, "reason": "<brief reason>"}
  },
  "summary": "<2-3 sentence explanation of the final score>",
  "confidence": "<low|medium|high>"
}

IMPORTANT:
- Score must be between 0 and 100
- Be objective and analytical
- When data is insufficient, state uncertainty
- The summary should explain why the score is what it is`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, language } = await req.json();
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = language === 'fr' 
      ? `Analyse ce contenu et calcule le Trust Score. Réponds en français:\n\n${content}`
      : `Analyze this content and calculate the Trust Score:\n\n${content}`;

    console.log("Calling Lovable AI Gateway for analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: language === 'fr' ? "Limite de requêtes atteinte. Réessayez dans quelques instants." : "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: language === 'fr' ? "Crédits IA épuisés. Veuillez ajouter des crédits dans Settings → Workspace → Usage." : "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const messageContent = aiResponse.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error("No response from AI");
    }

    console.log("AI response received:", messageContent.substring(0, 200));

    // Parse the JSON response from AI
    let analysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response if parsing fails
      analysisResult = {
        score: 50,
        breakdown: {
          sources: { points: 0, reason: "Unable to analyze sources" },
          factual: { points: 0, reason: "Unable to verify facts" },
          tone: { points: 0, reason: "Unable to assess tone" },
          context: { points: 0, reason: "Unable to evaluate context" },
          transparency: { points: 0, reason: "Unable to check transparency" }
        },
        summary: "Analysis could not be completed. Please try again with clearer content.",
        confidence: "low"
      };
    }

    // Ensure score is within bounds
    analysisResult.score = Math.max(0, Math.min(100, analysisResult.score));

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
