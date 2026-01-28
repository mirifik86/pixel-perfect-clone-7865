import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get current date for temporal context
const getCurrentDateInfo = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    formatted: now.toISOString().split('T')[0]
  };
};

// Standard Analysis Engine – LeenScore Standard Scan
// Clear, limited credibility diagnostic – not a full investigation
const getSystemPrompt = (language: string) => {
  const isFr = language === 'fr';
  const dateInfo = getCurrentDateInfo();
  
  return `You are LeenScore Standard Scan.

Your role is to provide a clear, limited credibility diagnostic — not a full investigation.

IMPORTANT: Respond entirely in ${isFr ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${dateInfo.formatted} (${dateInfo.year})

===== RULES =====

1. Deliver a single Trust Score (0–100)
2. Classify risk level as: Low, Moderate, or High
3. Provide exactly 3 short, high-level reasons explaining the score
4. Use simple, neutral language
5. Do NOT cite external sources
6. Do NOT perform deep corroboration
7. Do NOT analyze metadata, history, or advanced signals
8. Do NOT mention internal scoring logic or sub-scores to the user

===== INTERNAL SCORING MODEL (INVISIBLE TO USER) =====

BASE: 50 points

CRITICAL: Scoring must NOT depend on text length. A 10-word claim and a 500-word article should be evaluated equally based on their linguistic signals.

WEIGHTED EVALUATION CRITERIA (internal only, never expose):

1. INTERNAL LOGICAL CONSISTENCY (25% weight)
   - Does the text contradict itself?
   - Are claims coherent with each other?
   - Adjustment: -15 to +10 points

2. FACTUAL CLAIMS vs OPINIONS (25% weight)
   - Distinguish verifiable assertions from subjective opinions
   - Heavy opinion content: neutral (0)
   - Clear factual claims requiring verification: variable (-5 to +5)
   - Mixed or unclear: slight negative (-3)
   - Adjustment: -10 to +10 points

3. REAL-WORLD PLAUSIBILITY (25% weight)
   - Do stated facts align with known real-world patterns?
   - Highly plausible, common knowledge: +10
   - Plausible but unverified: +3 to +7
   - Unusual but possible: -3 to +3
   - Implausible or extraordinary: -10 to -5
   - Adjustment: -15 to +10 points

4. TONE CERTAINTY & ASSERTIVENESS (25% weight)
   - Measured, hedged language: +5 to +10
   - Neutral informational tone: +3 to +5
   - Assertive but balanced: 0 to +3
   - Overly certain, absolute claims: -5 to -3
   - Alarmist, manipulative, or emotionally charged: -10 to -5
   - Adjustment: -15 to +10 points

AGGREGATE SCORING:
- Sum all weighted adjustments to BASE (50)
- Apply bounds: minimum 5, maximum 98
- NEVER return 0 or 100

CONFIDENCE CALCULATION (internal, output as decimal):
- High confidence (0.80-1.00): Clear signals, consistent text, unambiguous characteristics
- Medium confidence (0.50-0.79): Mixed signals, some ambiguity
- Low confidence (0.00-0.49): Unclear text, conflicting signals, insufficient data

RISK CLASSIFICATION:
- 70-100: Low Risk (${isFr ? 'Risque Faible' : 'Low Risk'})
- 40-69: Moderate Risk (${isFr ? 'Risque Modéré' : 'Moderate Risk'})
- 0-39: High Risk (${isFr ? 'Risque Élevé' : 'High Risk'})

===== TONE =====

- Professional, reassuring, concise
- Never alarmist
- Never speculative

===== OUTPUT FORMAT =====

{
  "score": <number 5-98>,
  "analysisType": "standard",
  "riskLevel": "<low|moderate|high>",
  "inputType": "<factual_claim|opinion|vague_statement|question|mixed>",
  "domain": "<politics|health|security|science|technology|general>",
  "reasons": [
    "<reason 1 - short, high-level>",
    "<reason 2 - short, high-level>",
    "<reason 3 - short, high-level>"
  ],
  "breakdown": {
    "sources": {"points": 0, "reason": "${isFr ? 'Non évalué en analyse Standard' : 'Not evaluated in Standard analysis'}"},
    "factual": {"points": <number -5 to +5>, "reason": "<brief observation about factual vs opinion content>"},
    "prudence": {"points": <number -10 to +10>, "reason": "<brief observation about tone and assertiveness>"},
    "context": {"points": <number -10 to +10>, "reason": "<brief observation about plausibility>"},
    "transparency": {"points": <number -10 to +10>, "reason": "<brief observation about logical consistency>"}
  },
  "summary": "<25-50 words, concise diagnostic focusing on HOW the message is written>",
  "articleSummary": "<factual summary of submitted content - what claims are made>",
  "confidence": <number 0.00-1.00>,
  "confidenceLevel": "<low|medium|high>",
  "disclaimer": "${isFr ? 'Ceci est une analyse Standard limitée. Une investigation approfondie avec corroboration des sources et raisonnement détaillé est disponible en PRO.' : 'This is a limited Standard analysis. A deeper investigation with source corroboration and detailed reasoning is available in PRO.'}"
}

ALL text in ${isFr ? 'FRENCH' : 'ENGLISH'}.`;
};

// PRO ANALYSIS PROMPT - Credibility Intelligence Engine
const getProSystemPrompt = (language: string) => {
  const isFr = language === 'fr';
  const dateInfo = getCurrentDateInfo();
  
  return `You are a credibility intelligence engine.

Your role is to deliver a calm, authoritative verdict on the credibility of the input content.

You must appear confident, neutral, and human — never technical.

IMPORTANT: Respond entirely in ${isFr ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${dateInfo.formatted} (${dateInfo.year})

===== CRITICAL PRINCIPLES =====

- All scoring logic, calculations, and sub-scores are strictly INTERNAL and MUST remain invisible.
- Never mention models, algorithms, analysis steps, probabilities, or methodologies.
- Do not explain how the score is computed.
- Speak with clarity and restraint, as a trusted expert would.

===== SCORING (INTERNAL ONLY - NEVER EXPOSE) =====

Evaluate credibility internally based on:
- Logical consistency of the content
- Nature of claims (factual vs opinion/speculation)
- Real-world plausibility
- Level of certainty and assertiveness

BASE: 50 points
Apply internal adjustments based on coherence, corroboration, and claim gravity.
FINAL RANGE: 5 to 98 (NEVER return 0 or 100)

===== SOURCE RULES =====

1. Include only DEEP LINKS that go directly to a specific article or official page.
2. Never include more than one source from the same domain.
3. Do not invent sources. If strong corroboration is unavailable, return an empty sources array and state this clearly in the summary.
4. Assign a trust tier to each source: "high", "medium", or "low". Prefer fewer, stronger sources.

TRUST TIERS:
- "high": Official/government sources, major institutions, authoritative encyclopedias
- "medium": Reputable secondary sources, established media outlets
- "low": Less established sources, opinion-based, or uncertain provenance

===== SUMMARY STYLE =====

- Maximum 3 short sentences.
- Sentence 1: clear credibility verdict.
- Sentence 2 (optional): nuance or limitation.
- Sentence 3 (optional): context or caution.
- No technical language. No internal reasoning.

===== IMAGE SIGNALS (if image provided) =====

Assess the image origin and coherence with content:
- Origin: real_photo, illustration_composite, probable_ai_generated, undetermined
- Coherence: illustrative, demonstrative, potentially_misleading
- Keep all image scoring internal, only expose classification and brief explanation

===== OUTPUT FORMAT =====

Return ONLY valid JSON with this exact structure and no additional keys:

{
  "status": "ok",
  "result": {
    "score": <number 5-98>,
    "riskLevel": "<low|medium|high>",
    "summary": "<${isFr ? 'Verdict de crédibilité concis et calme, rédigé pour un public général.' : 'Concise, calm credibility verdict written for a general audience.'}>",
    "confidence": <number 0.00-1.00>,
    "sources": [
      {
        "title": "<Article or page title>",
        "publisher": "<Organization or site name>",
        "url": "<https://... direct deep link>",
        "trustTier": "<high|medium|low>",
        "whyItMatters": "<${isFr ? 'Une phrase courte expliquant comment cette source soutient ou contredit la revendication.' : 'One short sentence explaining how this source supports or contradicts the claim.'}>"
      }
    ]
  },
  "analysisType": "pro",
  "articleSummary": "<factual summary of the submitted content>",
  "corroboration": {
    "outcome": "<corroborated|neutral|constrained|refuted>",
    "sourcesConsulted": <number 1-10>
  },
  "imageSignals": {
    "origin": {
      "classification": "<real_photo|illustration_composite|probable_ai_generated|undetermined>",
      "confidence": "<low|medium|high>",
      "indicators": ["<observed indicators>"]
    },
    "coherence": {
      "classification": "<illustrative|demonstrative|potentially_misleading>",
      "explanation": "<brief explanation>"
    },
    "disclaimer": "${isFr ? 'Ces signaux sont des indicateurs contextuels. Ils ne déterminent pas la véracité.' : 'These signals are contextual indicators. They do not determine truthfulness.'}"
  },
  "proDisclaimer": "${isFr ? "Cette évaluation reflète la plausibilité selon les informations disponibles, pas une vérité absolue." : 'This assessment reflects plausibility based on available information, not absolute truth.'}"
}

IMPORTANT: Return ONLY valid JSON. Do not include breakdown, points, weights, or internal reasoning in the output.

ALL text in ${isFr ? 'FRENCH' : 'ENGLISH'}.`;
};

// Deep clone utility to ensure original data is never mutated
const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj));

// Translation helper function - translates ALL text fields while preserving ALL numerical values
const translateAnalysisResult = async (analysisResult: any, targetLanguage: string, apiKey: string): Promise<any> => {
  if (targetLanguage === 'en') {
    return analysisResult; // Already in English
  }

  // Store original values BEFORE any translation attempt
  const originalData = deepClone(analysisResult);

  const translationPrompt = `You are a professional translator. Translate the following JSON analysis from English to French.

CRITICAL RULES - YOU MUST FOLLOW EXACTLY:
1. Translate ALL human-readable text in these fields:
   - summary, articleSummary, proDisclaimer
   - sources[].whyItMatters (translate each source's explanation)
   - imageSignals.disclaimer
   - imageSignals.origin.indicators[] (translate each string in the array)
   - imageSignals.coherence.explanation
   - breakdown.*.reason (if present)

2. NEVER change ANY numerical values: score, confidence, sourcesConsulted
3. NEVER change ANY enum/status values: outcome, riskLevel, status, analysisType, trustTier, classification
4. Keep source URLs, titles, and publisher names in their EXACT original form
5. Keep the EXACT same JSON structure
6. Maintain professional, analytical tone in French

Respond with ONLY the translated JSON object, no other text.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: translationPrompt },
          { role: "user", content: `Translate to French:\n\n${JSON.stringify(analysisResult, null, 2)}` }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error("Translation failed, returning English version");
      return originalData;
    }

    const aiResponse = await response.json();
    const messageContent = aiResponse.choices?.[0]?.message?.content;

    if (!messageContent) {
      return originalData;
    }

    const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const translated = JSON.parse(jsonMatch[0]);
      
      // ===== STRICT ENFORCEMENT: Force ALL numerical and enum values from original =====
      
      // Core fields
      translated.score = originalData.score;
      translated.analysisType = originalData.analysisType;
      translated.confidence = originalData.confidence;
      translated.inputType = originalData.inputType;
      translated.domain = originalData.domain;
      
      // Standard breakdown - preserve all points
      if (originalData.breakdown) {
        if (!translated.breakdown) translated.breakdown = {};
        
        if (originalData.breakdown.sources) {
          if (!translated.breakdown.sources) translated.breakdown.sources = {};
          translated.breakdown.sources.points = originalData.breakdown.sources.points;
        }
        if (originalData.breakdown.factual) {
          if (!translated.breakdown.factual) translated.breakdown.factual = {};
          translated.breakdown.factual.points = originalData.breakdown.factual.points;
        }
        if (originalData.breakdown.tone) {
          if (!translated.breakdown.tone) translated.breakdown.tone = {};
          translated.breakdown.tone.points = originalData.breakdown.tone.points;
        }
        if (originalData.breakdown.context) {
          if (!translated.breakdown.context) translated.breakdown.context = {};
          translated.breakdown.context.points = originalData.breakdown.context.points;
        }
        if (originalData.breakdown.transparency) {
          if (!translated.breakdown.transparency) translated.breakdown.transparency = {};
          translated.breakdown.transparency.points = originalData.breakdown.transparency.points;
        }
        
        // PRO breakdown - preserve all points AND weights
        if (originalData.breakdown.claimGravity) {
          if (!translated.breakdown.claimGravity) translated.breakdown.claimGravity = {};
          translated.breakdown.claimGravity.points = originalData.breakdown.claimGravity.points;
          translated.breakdown.claimGravity.weight = originalData.breakdown.claimGravity.weight;
        }
        if (originalData.breakdown.contextualCoherence) {
          if (!translated.breakdown.contextualCoherence) translated.breakdown.contextualCoherence = {};
          translated.breakdown.contextualCoherence.points = originalData.breakdown.contextualCoherence.points;
          translated.breakdown.contextualCoherence.weight = originalData.breakdown.contextualCoherence.weight;
        }
        if (originalData.breakdown.webCorroboration) {
          if (!translated.breakdown.webCorroboration) translated.breakdown.webCorroboration = {};
          translated.breakdown.webCorroboration.points = originalData.breakdown.webCorroboration.points;
          translated.breakdown.webCorroboration.weight = originalData.breakdown.webCorroboration.weight;
        }
        if (originalData.breakdown.imageCoherence) {
          if (!translated.breakdown.imageCoherence) translated.breakdown.imageCoherence = {};
          translated.breakdown.imageCoherence.points = originalData.breakdown.imageCoherence.points;
        }
      }
      
      // PRO sources - handle both flat and nested result structure
      const origSources = originalData.result?.sources || originalData.sources;
      const translatedSources = translated.result?.sources || translated.sources;
      
      if (origSources && Array.isArray(origSources)) {
        const processedSources = origSources.map((origSource: any, idx: number) => {
          const translatedSource = translatedSources?.[idx] || {};
          return {
            title: origSource.title,
            publisher: origSource.publisher,
            url: origSource.url,
            trustTier: origSource.trustTier,
            whyItMatters: translatedSource.whyItMatters || origSource.whyItMatters
          };
        });
        
        // Apply to correct location based on structure
        if (originalData.result) {
          if (!translated.result) translated.result = {};
          translated.result.sources = processedSources;
          translated.result.score = originalData.result.score;
          translated.result.riskLevel = originalData.result.riskLevel;
          translated.result.confidence = originalData.result.confidence;
        } else {
          translated.sources = processedSources;
        }
      }
      
      // PRO corroboration - preserve outcome and sourcesConsulted
      if (originalData.corroboration) {
        if (!translated.corroboration) translated.corroboration = {};
        translated.corroboration.outcome = originalData.corroboration.outcome;
        translated.corroboration.sourcesConsulted = originalData.corroboration.sourcesConsulted;
      }
      
      // PRO image signals - preserve ALL numerical scoring and classifications, BUT allow translated text
      if (originalData.imageSignals) {
        if (!translated.imageSignals) translated.imageSignals = {};
        
        // Origin - preserve classification and confidence, allow translated indicators
        if (originalData.imageSignals.origin) {
          if (!translated.imageSignals.origin) translated.imageSignals.origin = {};
          translated.imageSignals.origin.classification = originalData.imageSignals.origin.classification;
          translated.imageSignals.origin.confidence = originalData.imageSignals.origin.confidence;
          // Keep translated indicators if valid, otherwise use original
          if (!Array.isArray(translated.imageSignals.origin.indicators) || 
              translated.imageSignals.origin.indicators.length !== originalData.imageSignals.origin.indicators?.length) {
            translated.imageSignals.origin.indicators = originalData.imageSignals.origin.indicators;
          }
        }
        
        // Metadata - preserve all status values (these are enums, not text)
        if (originalData.imageSignals.metadata) {
          translated.imageSignals.metadata = originalData.imageSignals.metadata;
        }
        
        // Coherence - preserve classification, allow translated explanation
        if (originalData.imageSignals.coherence) {
          if (!translated.imageSignals.coherence) translated.imageSignals.coherence = {};
          translated.imageSignals.coherence.classification = originalData.imageSignals.coherence.classification;
          // Keep translated explanation if present
          if (!translated.imageSignals.coherence.explanation) {
            translated.imageSignals.coherence.explanation = originalData.imageSignals.coherence.explanation;
          }
        }
        
        // Scoring - preserve ALL numerical values, allow translated reasoning
        if (originalData.imageSignals.scoring) {
          const translatedReasoning = translated.imageSignals?.scoring?.reasoning;
          const translatedSeverity = translated.imageSignals?.scoring?.severityConditionsMet;
          
          translated.imageSignals.scoring = {
            ...originalData.imageSignals.scoring,
            reasoning: translatedReasoning || originalData.imageSignals.scoring.reasoning,
            severityConditionsMet: (Array.isArray(translatedSeverity) && 
              translatedSeverity.length === originalData.imageSignals.scoring.severityConditionsMet?.length)
              ? translatedSeverity
              : originalData.imageSignals.scoring.severityConditionsMet
          };
        }
        
        // Keep translated disclaimer if present
        if (!translated.imageSignals.disclaimer) {
          translated.imageSignals.disclaimer = originalData.imageSignals.disclaimer;
        }
      }
      
      // Standard web presence - preserve level
      if (originalData.webPresence) {
        if (!translated.webPresence) translated.webPresence = {};
        translated.webPresence.level = originalData.webPresence.level;
      }
      
      console.log("Translation complete. Score preserved:", translated.score, "=", originalData.score);
      return translated;
    }
  } catch (e) {
    console.error("Translation error:", e);
  }
  
  // Always return original on any error
  return originalData;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, language, analysisType } = await req.json();
    
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

    const isPro = analysisType === 'pro';
    
    // CRITICAL: Always use English prompts for consistent web corroboration
    // Then translate output to user's language
    const systemPrompt = isPro ? getProSystemPrompt('en') : getSystemPrompt('en');
    
    // User prompt always in English for consistency
    const userPrompt = `Analyze this content and calculate the Trust Score${isPro ? ' with full Pro analysis' : ''}:\n\n${content}`;

    console.log(`Calling Lovable AI Gateway for ${isPro ? 'Pro' : 'Standard'} analysis (English base)...`);

    // Retry logic for transient failures
    const maxRetries = 3;
    let messageContent: string | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`Retry attempt ${attempt + 1}, waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: isPro ? "google/gemini-2.5-pro" : "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.warn(`Rate limited on attempt ${attempt + 1}`);
            lastError = new Error("Rate limit exceeded");
            continue; // Retry
          }
          if (response.status === 402) {
            const errorMsg = language === 'fr'
              ? "Crédits IA épuisés. Veuillez ajouter des crédits dans Settings → Workspace → Usage."
              : "AI credits exhausted. Please add credits in Settings → Workspace → Usage.";
            return new Response(
              JSON.stringify({ error: errorMsg }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const errorText = await response.text();
          console.error("AI gateway error:", response.status, errorText);
          lastError = new Error(`AI gateway error: ${response.status}`);
          continue; // Retry for other errors
        }

        const aiResponse = await response.json();
        messageContent = aiResponse.choices?.[0]?.message?.content;

        if (messageContent) {
          console.log("AI response received (English):", messageContent.substring(0, 200));
          break; // Success!
        } else {
          console.warn(`Empty response on attempt ${attempt + 1}`);
          lastError = new Error("Empty AI response");
        }
      } catch (fetchError) {
        console.error(`Fetch error on attempt ${attempt + 1}:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error("Network error");
      }
    }

    // If all retries failed, return a graceful fallback
    if (!messageContent) {
      console.error("All retries exhausted, returning fallback response");
      const fallbackMsg = language === 'fr'
        ? "L'analyse n'a pas pu être complétée. Veuillez réessayer dans quelques instants."
        : "Analysis could not be completed. Please try again in a moment.";
      
      return new Response(
        JSON.stringify({
          score: 50,
          analysisType: isPro ? 'pro' : 'standard',
          breakdown: {
            sources: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" },
            factual: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" },
            tone: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" },
            context: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" },
            transparency: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" }
          },
          summary: fallbackMsg,
          confidence: "low",
          isRetryFallback: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        analysisType: isPro ? 'pro' : 'standard',
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

    // Ensure score is within bounds and set analysis type
    analysisResult.score = Math.max(0, Math.min(100, analysisResult.score));
    analysisResult.analysisType = isPro ? 'pro' : 'standard';

    // Translate to French if needed (after consistent English analysis)
    if (language === 'fr') {
      console.log("Translating analysis to French...");
      analysisResult = await translateAnalysisResult(analysisResult, 'fr', LOVABLE_API_KEY);
    }

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
