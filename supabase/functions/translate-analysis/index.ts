import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getTranslationPrompt = (targetLanguage: string) => `You are a professional translator. Your task is to translate analysis text while preserving the exact meaning.

CRITICAL RULES:
1. Translate ONLY the text content - NEVER change any numerical values
2. Keep the same JSON structure exactly
3. Translate to ${targetLanguage === 'fr' ? 'FRENCH' : 'ENGLISH'}
4. Maintain the same professional, analytical tone
5. Keep technical terms accurate

You will receive a JSON object with analysis results. Translate ONLY these text fields:
- breakdown.sources.reason
- breakdown.factual.reason
- breakdown.tone.reason
- breakdown.context.reason
- breakdown.transparency.reason
- summary

DO NOT modify:
- score (number)
- breakdown.*.points (numbers)
- confidence (enum value)

Respond with the complete JSON object with translated text fields.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisData, targetLanguage } = await req.json();
    
    if (!analysisData) {
      return new Response(
        JSON.stringify({ error: "Analysis data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Translating analysis to:", targetLanguage);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: getTranslationPrompt(targetLanguage) },
          { role: "user", content: `Translate this analysis JSON to ${targetLanguage === 'fr' ? 'French' : 'English'}:\n\n${JSON.stringify(analysisData, null, 2)}` }
        ],
        temperature: 0.1, // Low temperature for consistent translation
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Parse the translated JSON
    let translatedResult;
    try {
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        translatedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse translation response:", parseError);
      // Return original data if translation fails
      return new Response(
        JSON.stringify(analysisData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CRITICAL: Preserve original numerical values to ensure score consistency
    translatedResult.score = analysisData.score;
    translatedResult.confidence = analysisData.confidence;
    translatedResult.breakdown.sources.points = analysisData.breakdown.sources.points;
    translatedResult.breakdown.factual.points = analysisData.breakdown.factual.points;
    translatedResult.breakdown.tone.points = analysisData.breakdown.tone.points;
    translatedResult.breakdown.context.points = analysisData.breakdown.context.points;
    translatedResult.breakdown.transparency.points = analysisData.breakdown.transparency.points;

    return new Response(
      JSON.stringify(translatedResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Translation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
