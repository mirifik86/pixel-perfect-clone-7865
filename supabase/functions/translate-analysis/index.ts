import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

const getTranslationPrompt = (targetLanguage: string) => `You are a professional translator. Your task is to translate analysis JSON text while preserving the exact meaning.

CRITICAL RULES:
1. Translate ONLY human-readable text fields - NEVER change any numerical values
2. Keep the same JSON structure exactly (keys, arrays, nesting)
3. Translate to ${targetLanguage === 'fr' ? 'FRENCH' : 'ENGLISH'}
4. Maintain the same professional, analytical tone
5. Keep technical terms accurate
6. DO NOT translate proper names of sources (media names, institutions, websites)

You will receive a JSON object with analysis results. Translate ONLY these text fields:
- breakdown.*.reason (for both Standard and PRO breakdown keys)
- webPresence.observation (if present)
- summary
- articleSummary (if present)
- disclaimer / proDisclaimer (if present)
- corroboration.summary (if present)
- imageSignals.disclaimer (if present)
- imageSignals.coherence.explanation (if present)
- imageSignals.scoring.reasoning (if present)
- imageSignals.origin.indicators[] (if present)
- imageSignals.scoring.severityConditionsMet[] (if present)

DO NOT modify:
- score (number)
- breakdown.*.points (numbers)
- breakdown.*.weight (strings like "30%")
- confidence (enum value)
- analysisType
- corroboration.outcome / sourcesConsulted / sourceTypes
- corroboration.sources (keep EXACTLY as-is)

Respond with the complete JSON object with translated text fields.`;

// Merge translated text fields into the original analysis object.
// This guarantees that scores, corroboration sources, enums, and all other data remain IDENTICAL.
const mergeTranslatedText = (original: any, translated: any) => {
  const out = deepClone(original);

  const setIfString = (setter: () => void, value: any) => {
    if (typeof value === 'string' && value.trim().length > 0) setter();
  };

  // Top-level fields
  setIfString(() => (out.summary = translated?.summary), translated?.summary);
  setIfString(() => (out.articleSummary = translated?.articleSummary), translated?.articleSummary);
  setIfString(() => (out.disclaimer = translated?.disclaimer), translated?.disclaimer);
  setIfString(() => (out.proDisclaimer = translated?.proDisclaimer), translated?.proDisclaimer);

  // Standard web presence
  if (out.webPresence?.observation) {
    setIfString(
      () => (out.webPresence.observation = translated?.webPresence?.observation),
      translated?.webPresence?.observation,
    );
  }

  // Breakdown reasons (standard + pro)
  if (out.breakdown && typeof out.breakdown === 'object') {
    for (const key of Object.keys(out.breakdown)) {
      if (out.breakdown?.[key]?.reason) {
        const nextReason = translated?.breakdown?.[key]?.reason;
        setIfString(() => (out.breakdown[key].reason = nextReason), nextReason);
      }
    }
  }

  // PRO corroboration summary (preserve sources & all enums/numbers by keeping original object)
  if (out.corroboration?.summary) {
    setIfString(
      () => (out.corroboration.summary = translated?.corroboration?.summary),
      translated?.corroboration?.summary,
    );
  }

  // Image signal explanatory text
  if (out.imageSignals) {
    const tImg = translated?.imageSignals;

    // Nested image disclaimer
    if (out.imageSignals.disclaimer) {
      setIfString(
        () => (out.imageSignals.disclaimer = tImg?.disclaimer),
        tImg?.disclaimer,
      );
    }

    // Origin indicators (these are human-readable signals, not enums)
    if (Array.isArray(out.imageSignals.origin?.indicators) && Array.isArray(tImg?.origin?.indicators)) {
      const nextIndicators = tImg.origin.indicators.filter((x: any) => typeof x === 'string' && x.trim().length > 0);
      if (nextIndicators.length === out.imageSignals.origin.indicators.length) {
        out.imageSignals.origin.indicators = nextIndicators;
      }
    }

    if (out.imageSignals.coherence?.explanation) {
      setIfString(
        () => (out.imageSignals.coherence.explanation = tImg?.coherence?.explanation),
        tImg?.coherence?.explanation,
      );
    }

    if (out.imageSignals.scoring?.reasoning) {
      setIfString(
        () => (out.imageSignals.scoring.reasoning = tImg?.scoring?.reasoning),
        tImg?.scoring?.reasoning,
      );
    }

    // Optional severity conditions list (if present)
    if (
      Array.isArray(out.imageSignals.scoring?.severityConditionsMet) &&
      Array.isArray(tImg?.scoring?.severityConditionsMet)
    ) {
      const next = tImg.scoring.severityConditionsMet.filter((x: any) => typeof x === 'string' && x.trim().length > 0);
      if (next.length === out.imageSignals.scoring.severityConditionsMet.length) {
        out.imageSignals.scoring.severityConditionsMet = next;
      }
    }
  }

  return out;
};

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

    // Retry logic with exponential backoff for rate limits
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`Retry attempt ${attempt + 1}, waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

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
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        const messageContent = aiResponse.choices?.[0]?.message?.content;

        if (!messageContent) {
          console.warn("Empty AI response, returning original data");
          return new Response(
            JSON.stringify(analysisData),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
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
          return new Response(
            JSON.stringify(analysisData),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // CRITICAL: Keep the original object as the single source of truth
        const merged = mergeTranslatedText(analysisData, translatedResult);

        return new Response(
          JSON.stringify(merged),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 429) {
        console.warn(`Rate limited on attempt ${attempt + 1}`);
        lastError = new Error("Rate limit exceeded");
        continue; // Retry
      }

      // Non-retryable error
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      // Fallback: return original untranslated data instead of failing
      console.warn("Returning original data due to API error");
      return new Response(
        JSON.stringify(analysisData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // All retries exhausted - return original data as graceful fallback
    console.warn("All retries exhausted, returning original (English) data");
    return new Response(
      JSON.stringify(analysisData),
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
