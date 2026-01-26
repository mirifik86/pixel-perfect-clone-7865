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
2. Classify risk level as: Low Risk, Moderate Risk, or High Risk
3. Provide exactly 3 short, high-level reasons explaining the score
4. Use simple, neutral language
5. Do NOT cite external sources
6. Do NOT perform deep corroboration
7. Do NOT analyze metadata, history, or advanced signals
8. Do NOT mention internal scoring logic

===== SCORING GUIDELINES =====

BASE: 50 points

RISK CLASSIFICATION:
- 70-100: Low Risk (${isFr ? 'Risque Faible' : 'Low Risk'})
- 40-69: Moderate Risk (${isFr ? 'Risque Modéré' : 'Moderate Risk'})
- 0-39: High Risk (${isFr ? 'Risque Élevé' : 'High Risk'})

EVALUATION FACTORS (internal only, do not expose):
- Message clarity and structure
- Emotional tone (alarmist vs neutral)
- Claim plausibility
- Language quality

===== TONE =====

- Professional, reassuring, concise
- Never alarmist
- Never speculative

===== OUTPUT FORMAT =====

{
  "score": <number 0-100>,
  "analysisType": "standard",
  "riskLevel": "<low|moderate|high>",
  "inputType": "<factual_claim|opinion|vague_statement|question>",
  "domain": "<politics|health|security|science|technology|general>",
  "reasons": [
    "<reason 1 - short, high-level>",
    "<reason 2 - short, high-level>",
    "<reason 3 - short, high-level>"
  ],
  "breakdown": {
    "sources": {"points": 0, "reason": "${isFr ? 'Non évalué en analyse Standard' : 'Not evaluated in Standard analysis'}"},
    "factual": {"points": <number>, "reason": "<brief observation>"},
    "tone": {"points": <number>, "reason": "<brief observation>"},
    "context": {"points": <number>, "reason": "<brief observation>"},
    "transparency": {"points": <number>, "reason": "<brief observation>"}
  },
  "summary": "<25-50 words, concise diagnostic>",
  "articleSummary": "<factual summary of submitted content>",
  "confidence": "<low|medium|high>",
  "disclaimer": "${isFr ? 'Ceci est une analyse Standard limitée. Une investigation approfondie avec corroboration des sources et raisonnement détaillé est disponible en PRO.' : 'This is a limited Standard analysis. A deeper investigation with source corroboration and detailed reasoning is available in PRO.'}"
}

ALL text in ${isFr ? 'FRENCH' : 'ENGLISH'}.`;
};

// PRO ANALYSIS PROMPT - Simplified High-Credibility Model with Image Signals and Active Refutation Detection
const getProSystemPrompt = (language: string) => {
  const isFr = language === 'fr';
  const dateInfo = getCurrentDateInfo();
  
  return `You are LeenScore Pro, an advanced credibility analyst. Provide a web-informed plausibility assessment based on strong, defensible signals.

IMPORTANT: Respond entirely in ${isFr ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${dateInfo.formatted} (${dateInfo.year})

===== PRO ANALYSIS – SIMPLIFIED HIGH-CREDIBILITY MODEL =====

PURPOSE:
Provide a web-informed plausibility assessment based on a small number of strong, defensible signals. Distinguish plausibility from factual certainty.

PRO provides web-backed context and justification.
Standard only informs and signals caution.
NEVER blur the boundary between Standard and PRO.

===== SIGNAL 1 – CLAIM GRAVITY ASSESSMENT (30%) =====

Evaluate the real-world weight of the claim:
- Scale of the event (local vs. global impact)
- Institutional or official implications
- Potential misinformation impact

GRAVITY SCORING:
- Low gravity, minor claim: +5 to +10
- Moderate gravity, reasonable scale: 0 to +5
- High gravity, major implications: -5 to 0
- Extreme gravity, extraordinary claim: -10 to -5

===== SIGNAL 2 – CONTEXTUAL COHERENCE (30%) =====

Assess whether the claim aligns with known contextual patterns:
- Political processes and institutional behavior
- Typical event progression and timelines
- Known factual context (without making truth claims)
- CRITICAL: Scientific, biological, physical, and medical consensus

COHERENCE SCORING:
- Highly coherent with known patterns: +10 to +15
- Mostly coherent, minor uncertainties: +5 to +10
- Mixed signals, unclear coherence: -5 to +5
- Low coherence, unusual patterns: -10 to -5
- Incoherent with known context: -15 to -10
- CONTRADICTS ESTABLISHED SCIENTIFIC/FACTUAL CONSENSUS: -20 to -25

===== SIGNAL 3 – WEB RESEARCH & CORROBORATION (40%) =====

Perform a high-quality web search:
- Use UP TO 10 SOURCES MAXIMUM
- PRIORITIZE: recognized media, press agencies, official institutions
- EXCLUDE: social media, anonymous blogs, unverified opinion sites

CORROBORATION OUTCOMES:

"corroborated": Multiple reliable sources clearly reference the claim
  → Scoring impact: +15 to +20

"neutral": Topic mentioned but confirmation remains unclear or mixed
  → Scoring impact: -5 to +5

"constrained": Little or no reliable coverage of the claim
  → Scoring impact: -15 to -10

===== CRITICAL: ACTIVE REFUTATION DETECTION =====

If credible sources ACTIVELY CONTRADICT the claim (not just "no coverage"), use:

"refuted": Multiple reliable sources explicitly contradict or disprove the claim. 
This applies when:
- The claim contradicts well-established scientific consensus (taxonomy, physics, medicine, biology)
- The claim contradicts universally accepted factual knowledge
- Authoritative sources provide evidence that directly refutes the assertion
- The claim is scientifically/physically impossible

REFUTATION SCORING IMPACT:
- Moderate refutation (contradicts minor consensus): -25 points
- Strong refutation (contradicts major scientific/factual consensus): -30 to -35 points
- Complete refutation (scientifically impossible, universally disproven): -35 to -40 points

IMPORTANT: When refuted, the corroboration summary MUST explicitly state:
- "Credible sources actively contradict this claim" (not just "no corroboration found")
- Cite which consensus or established facts are being contradicted
- PRO must NEVER increase score for clearly false or refuted claims

===== PRO: IMAGE SIGNALS MODULE =====

Analyze images for contextual signals (INDICATORS only):

1. PROBABLE IMAGE ORIGIN:
- "real_photo": Authentic photograph
- "illustration_composite": Illustration, graphic, composite
- "probable_ai_generated": AI generation indicators (artifacts, inconsistencies)
- "undetermined": Insufficient information

2. METADATA SIGNALS:
- EXIF/IPTC presence, date consistency, software indicators

3. VISUAL-TEXTUAL COHERENCE:
- "illustrative": General illustration (neutral)
- "demonstrative": Directly supports claims (positive)
- "potentially_misleading": May misrepresent content (warning)

===== PRO: IMAGE SCORING (capped at -10 max) =====

- Coherent, illustrative image: 0 points
- Image as factual proof without corroboration: -4 points
- AI-generated + factual claims: -3 to -6 points
- Metadata inconsistencies: -2 points
- Absent metadata: 0 (neutral, no penalty)

CONTEXTUAL SEVERITY (+additional -2):
Applies when 2+ conditions met:
1. Probable AI-generated image
2. Weak corroboration
3. Potentially misleading usage

SAFEGUARDS:
- Image penalties CANNOT alone downgrade credibility category
- Total image impact CAPPED at -10 points

===== FINAL SCORING =====

Aggregate all components:
- Claim Gravity (30%): -10 to +10
- Contextual Coherence (30%): -25 to +15 (extended for refutation)
- Web Corroboration (40%): -40 to +20 (extended for active refutation)
- Image Signals: -10 to 0 (capped)

BASE: 50 points
FINAL RANGE: 5 to 98 (NEVER return 0 or 100)

CRITICAL RULE: If Standard analysis scored X, and PRO finds active refutation by credible sources, PRO score MUST be lower than Standard. PRO must confirm OR reduce credibility, never inflate it for false claims.

Avoid absolute certainty. The score represents PLAUSIBILITY, not truth.

===== OUTPUT WORD LIMITS =====

CRITICAL - Summary length requirements:
- MINIMUM: 90 words
- MAXIMUM: 180 words  
- IDEAL TARGET: 120-150 words

Provide a clear, human-readable explanation justifying the score.
Distinguish plausibility from factual certainty.
When refuted, explicitly state that sources contradict the claim.

===== PRODUCT RULES =====

- PRO may reference web signals but must remain cautious
- NEVER state "true" or "false"
- NEVER claim absolute verification
- Present findings as plausibility assessment
- EXPLICITLY state when sources actively contradict claims (vs. just "not found")

===== RESPONSE FORMAT =====

{
  "score": <number 5-98, never 0 or 100>,
  "analysisType": "pro",
  "breakdown": {
    "claimGravity": {"points": <number>, "weight": "30%", "reason": "<gravity assessment>"},
    "contextualCoherence": {"points": <number>, "weight": "30%", "reason": "<coherence assessment>"},
    "webCorroboration": {"points": <number -40 to +20>, "weight": "40%", "reason": "<corroboration summary - MUST state if sources contradict>"},
    "imageCoherence": {"points": <-10 to 0>, "reason": "<image scoring explanation>"}
  },
  "corroboration": {
    "outcome": "<corroborated|neutral|constrained|refuted>",
    "sourcesConsulted": <number 1-10>,
    "sourceTypes": ["<media|agency|institution|other>"],
    "summary": "<brief summary - MUST explicitly state if sources contradict the claim>",
    "sources": {
      "corroborated": [],
      "neutral": [],
      "constrained": [],
      "contradicting": [
        {
          "name": "<Source name - e.g., 'BBC News', 'The White House', 'Britannica'>",
          "url": "<DIRECT URL to the exact article/page that discusses the claim - NOT homepage, NOT category page>",
          "snippet": "<1-2 sentence summary of what this specific source says about the claim>"
        }
      ]
    }
  },

  CRITICAL SOURCE URL REQUIREMENTS:
  1. Each source MUST have a direct URL to the EXACT article or page that discusses the claim
  2. NEVER link to:
     - Homepages (e.g., https://www.bbc.com)
     - Category pages (e.g., https://www.bbc.com/news)
     - Search results pages
     - Generic "about" pages
  3. ONLY include sources where you can provide a SPECIFIC article URL
  4. If you cannot provide a direct article URL, DO NOT include that source
  5. Prioritize quality over quantity: 3-6 high-quality sources with direct links is better than 10 generic sources
  6. Source priority order:
     - Official/institutional sources (government, official bodies) → type: "official"
     - Reference encyclopedias (Britannica, Wikipedia) → type: "reference"
     - Major media (BBC, Reuters, NYT, Le Monde) → type: "media"
  7. The snippet MUST summarize what the specific page says about the claim
  "imageSignals": {
    "origin": {
      "classification": "<real_photo|illustration_composite|probable_ai_generated|undetermined>",
      "confidence": "<low|medium|high>",
      "indicators": ["<observed indicators>"]
    },
    "metadata": {
      "exifPresence": "<detected|not_detected|undetermined>",
      "dateConsistency": "<consistent|inconsistent|undetermined>",
      "softwareIndicators": ["<detected software>"]
    },
    "coherence": {
      "classification": "<illustrative|demonstrative|potentially_misleading>",
      "explanation": "<explanation>"
    },
    "scoring": {
      "imageAsProof": <0 or -4>,
      "aiWithClaims": <0 to -6>,
      "metadataIssues": <0 or -2>,
      "contextualSeverity": <0 or -2>,
      "totalImpact": <capped at -10>,
      "reasoning": "<scoring explanation>"
    },
    "disclaimer": "${isFr ? 'Ces signaux sont des indicateurs contextuels. Ils ne déterminent pas la véracité.' : 'These signals are contextual indicators. They do not determine truthfulness.'}"
  },
  "summary": "<90-180 words, ideal 120-150 words, justifying the plausibility score with web-backed context. MUST state when sources actively contradict claims>",
  "articleSummary": "<factual summary of submitted content>",
  "confidence": "<low|medium|high>",
  "proDisclaimer": "${isFr ? "L'Analyse PRO fournit une évaluation de plausibilité basée sur des signaux fiables, pas une vérité absolue." : 'PRO Analysis provides a plausibility assessment based on reliable signals, not absolute truth.'}"
}

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
   - summary, articleSummary, disclaimer, proDisclaimer
   - breakdown.*.reason (ALL breakdown items)
   - webPresence.observation
   - corroboration.summary
   - imageSignals.disclaimer
   - imageSignals.origin.indicators[] (translate each string in the array)
   - imageSignals.coherence.explanation
   - imageSignals.scoring.reasoning
   - imageSignals.scoring.severityConditionsMet[] (translate each string if present)

2. NEVER change ANY numerical values: score, points, sourcesConsulted, totalImpact, imageAsProof, aiWithClaims, metadataIssues, contextualSeverity
3. NEVER change ANY enum/status values: outcome, confidence, level, classification, analysisType, exifPresence, dateConsistency
4. NEVER change weight percentages (30%, 40%, etc.)
5. Keep source names (media names, websites, agency names) in their EXACT original form
6. Keep the EXACT same JSON structure
7. Maintain professional, analytical tone in French

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
      
      // PRO corroboration - preserve EVERYTHING except summary text
      if (originalData.corroboration) {
        if (!translated.corroboration) translated.corroboration = {};
        translated.corroboration.outcome = originalData.corroboration.outcome;
        translated.corroboration.sourcesConsulted = originalData.corroboration.sourcesConsulted;
        translated.corroboration.sourceTypes = originalData.corroboration.sourceTypes;
        // CRITICAL: Keep source names exactly as found - no translation
        translated.corroboration.sources = originalData.corroboration.sources;
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
