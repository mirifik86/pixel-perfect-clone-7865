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

// Standard Analysis Engine – With Light Web Presence Check
// Cautious credibility assessment via message analysis + minimal web presence signals
const getSystemPrompt = (language: string) => {
  const isFr = language === 'fr';
  const dateInfo = getCurrentDateInfo();
  
  return `You are LeenScore, a cautious credibility assessment system. Your role is to analyze message formulation and detect basic web presence signals WITHOUT performing verification or fact-checking.

IMPORTANT: Respond entirely in ${isFr ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${dateInfo.formatted} (${dateInfo.year})

===== STANDARD ANALYSIS ENGINE – SCORING WEIGHTS =====

WEIGHT DISTRIBUTION:
- Message formulation analysis: 70% of score impact
- Misinformation risk assessment: 20% of score impact  
- Light web presence signal: MAX 10% of score impact

Standard Analysis informs and signals caution. It does NOT verify or debunk.

===== STEP 1 – MESSAGE ANALYSIS (70% weight) =====

A. INPUT CLASSIFICATION:
- "factual_claim": Presents something as fact
- "opinion": Expresses viewpoint or judgment
- "vague_statement": Unclear or ambiguous
- "question": Seeking information (neutral score)

Domain: politics, health, security, science, technology, general

B. LINGUISTIC SIGNALS (apply 70% weight):

1. Certainty Level:
   - Absolute certainty without evidence: -14 (scaled from -20)
   - High certainty with qualifiers: -7
   - Moderate certainty: 0
   - Appropriate hedging: +3

2. Emotional Tone:
   - Highly alarmist/fear-inducing: -14
   - Sensational: -10
   - Mildly emotional: -5
   - Neutral, informative: +7

3. Simplification:
   - Oversimplifies complex topics: -10
   - Moderate simplification: -5
   - Appropriate complexity: 0

4. Language Quality:
   - Trigger words, all caps, excessive punctuation: -7
   - Clear, professional language: +7

===== STEP 2 – MISINFORMATION RISK (20% weight) =====

Assess structural risk patterns:
- Classic misinformation patterns detected: -10 (scaled from -50)
- Some concerning patterns: -5
- Low risk indicators: 0
- Professional, verifiable structure: +5

===== STEP 3 – LIGHT WEB PRESENCE (MAX 10% weight) =====

CRITICAL: Minimal presence detection only. NO verification.

WEB PRESENCE LEVELS:
- "none": No indication of web presence → -5 points max
- "limited": Sparse or unclear presence → 0 points
- "noticeable": Topic exists online → +5 points max

CONSTRAINTS:
- Do NOT read, interpret, or validate sources
- Do NOT claim to verify or debunk
- Web signals may slightly adjust but NEVER dominate score
- Deeper web interpretation is strictly PRO-only

===== BASIC IMAGE COHERENCE (Standard tier) =====

Perform a minimal visual coherence check:
- Visual elements reviewed for contextual coherence
- Max impact: -2 points (informational only)
- Do NOT mention AI generation or advanced image analysis (PRO-only)

===== SCORING =====

BASE: 50 points
Apply weighted adjustments. Final range: 0-100.

===== OUTPUT WORD LIMITS =====

CRITICAL - Summary length requirements:
- MINIMUM: 25 words
- MAXIMUM: 60 words
- IDEAL TARGET: 40-50 words

Keep explanations concise but informative.

===== SCORE INTERPRETATION =====

80-100: ${isFr ? 'Formulation mesurée, présence web notable' : 'Measured formulation, noticeable web presence'}
60-79: ${isFr ? 'Formulation acceptable, quelques signaux mixtes' : 'Acceptable formulation, some mixed signals'}
40-59: ${isFr ? 'Formulation incertaine, signaux d\'alerte modérés' : 'Uncertain formulation, moderate warning signals'}
20-39: ${isFr ? 'Formulation problématique, multiples signaux d\'alerte' : 'Problematic formulation, multiple warning signals'}
0-19: ${isFr ? 'Formulation très risquée, signaux d\'alerte majeurs' : 'Very risky formulation, major warning signals'}

===== OUTPUT RULES =====

Use cautious, neutral wording:
- "${isFr ? 'Affirmation forte avec présence web limitée' : 'Strong claim with limited web presence'}"
- "${isFr ? 'Sujet présent en ligne mais manque de documentation claire' : 'Topic appears online but lacks clear documentation'}"
- "${isFr ? 'Formulation mesurée avec signaux cohérents' : 'Measured formulation with coherent signals'}"
- "${isFr ? 'Ton alarmiste détecté – prudence recommandée' : 'Alarmist tone detected – caution recommended'}"

PRODUCT RULES:
- NEVER claim verification, confirmation, or debunking
- NEVER say "this is true" or "this is false"
- NEVER corroborate or contradict claims
- Present findings as OBSERVATIONS only

===== RESPONSE FORMAT =====

{
  "score": <number 0-100>,
  "analysisType": "standard",
  "inputType": "<factual_claim|opinion|vague_statement|question>",
  "domain": "<politics|health|security|science|technology|general>",
  "breakdown": {
    "sources": {"points": <number>, "reason": "<web presence observation>"},
    "factual": {"points": <number>, "reason": "<misinformation risk>"},
    "tone": {"points": <number>, "reason": "<emotional tone>"},
    "context": {"points": <number>, "reason": "<certainty/simplification>"},
    "transparency": {"points": <number>, "reason": "<language quality>"}
  },
  "webPresence": {
    "level": "<none|limited|noticeable>",
    "observation": "<brief neutral observation>"
  },
  "summary": "<25-60 words, ideal 40-50 words, cautious language>",
  "articleSummary": "<factual summary of submitted content>",
  "confidence": "<low|medium|high>",
  "disclaimer": "${isFr ? 'Cette analyse évalue la formulation et les signaux de présence web. Elle ne constitue pas une vérification factuelle.' : 'This analysis evaluates formulation and web presence signals. It does not constitute factual verification.'}"
}

ALL text in ${isFr ? 'FRENCH' : 'ENGLISH'}.`;
};

// PRO ANALYSIS PROMPT - Simplified High-Credibility Model with Image Signals
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

COHERENCE SCORING:
- Highly coherent with known patterns: +10 to +15
- Mostly coherent, minor uncertainties: +5 to +10
- Mixed signals, unclear coherence: -5 to +5
- Low coherence, unusual patterns: -10 to -5
- Incoherent with known context: -15 to -10

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
- Contextual Coherence (30%): -15 to +15
- Web Corroboration (40%): -15 to +20
- Image Signals: -10 to 0 (capped)

BASE: 50 points
FINAL RANGE: 5 to 98 (NEVER return 0 or 100)

Avoid absolute certainty. The score represents PLAUSIBILITY, not truth.

===== OUTPUT WORD LIMITS =====

CRITICAL - Summary length requirements:
- MINIMUM: 90 words
- MAXIMUM: 180 words  
- IDEAL TARGET: 120-150 words

Provide a clear, human-readable explanation justifying the score.
Distinguish plausibility from factual certainty.

===== PRODUCT RULES =====

- PRO may reference web signals but must remain cautious
- NEVER state "true" or "false"
- NEVER claim absolute verification
- Present findings as plausibility assessment

===== RESPONSE FORMAT =====

{
  "score": <number 5-98, never 0 or 100>,
  "analysisType": "pro",
  "breakdown": {
    "claimGravity": {"points": <number>, "weight": "30%", "reason": "<gravity assessment>"},
    "contextualCoherence": {"points": <number>, "weight": "30%", "reason": "<coherence assessment>"},
    "webCorroboration": {"points": <number>, "weight": "40%", "reason": "<corroboration summary>"},
    "imageCoherence": {"points": <-10 to 0>, "reason": "<image scoring explanation>"}
  },
  "corroboration": {
    "outcome": "<corroborated|neutral|constrained>",
    "sourcesConsulted": <number 1-10>,
    "sourceTypes": ["<media|agency|institution|other>"],
    "summary": "<brief summary of web findings>",
    "sources": {
      "corroborated": ["<source names that clearly corroborate>"],
      "neutral": ["<source names with neutral/contextual mentions>"],
      "constrained": ["<source names with limited coverage or no coverage indicator>"]
    }
  },
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
  "summary": "<90-180 words, ideal 120-150 words, justifying the plausibility score with web-backed context>",
  "articleSummary": "<factual summary of submitted content>",
  "confidence": "<low|medium|high>",
  "proDisclaimer": "${isFr ? "L'Analyse PRO fournit une évaluation de plausibilité basée sur des signaux fiables, pas une vérité absolue." : 'PRO Analysis provides a plausibility assessment based on reliable signals, not absolute truth.'}"
}

ALL text in ${isFr ? 'FRENCH' : 'ENGLISH'}.`;
};

// Deep clone utility to ensure original data is never mutated
const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj));

// Translation helper function - translates ONLY text fields while preserving ALL numerical values
const translateAnalysisResult = async (analysisResult: any, targetLanguage: string, apiKey: string): Promise<any> => {
  if (targetLanguage === 'en') {
    return analysisResult; // Already in English
  }

  // Store original values BEFORE any translation attempt
  const originalData = deepClone(analysisResult);

  const translationPrompt = `You are a professional translator. Translate the following JSON analysis from English to French.

CRITICAL RULES - YOU MUST FOLLOW EXACTLY:
1. ONLY translate text content in these specific fields: reason, summary, articleSummary, observation, explanation, disclaimer, proDisclaimer, reasoning
2. NEVER change ANY numerical values: score, points, sourcesConsulted, totalImpact, imageAsProof, aiWithClaims, metadataIssues, contextualSeverity
3. NEVER change ANY enum/status values: outcome (corroborated/neutral/constrained), confidence (low/medium/high), level, classification, analysisType
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
          { role: "user", content: JSON.stringify(analysisResult, null, 2) }
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
      
      // PRO image signals - preserve ALL numerical scoring and classifications
      if (originalData.imageSignals) {
        if (!translated.imageSignals) translated.imageSignals = {};
        
        // Origin - preserve classification and confidence
        if (originalData.imageSignals.origin) {
          if (!translated.imageSignals.origin) translated.imageSignals.origin = {};
          translated.imageSignals.origin.classification = originalData.imageSignals.origin.classification;
          translated.imageSignals.origin.confidence = originalData.imageSignals.origin.confidence;
          translated.imageSignals.origin.indicators = originalData.imageSignals.origin.indicators;
        }
        
        // Metadata - preserve all status values
        if (originalData.imageSignals.metadata) {
          translated.imageSignals.metadata = originalData.imageSignals.metadata;
        }
        
        // Coherence - preserve classification
        if (originalData.imageSignals.coherence) {
          if (!translated.imageSignals.coherence) translated.imageSignals.coherence = {};
          translated.imageSignals.coherence.classification = originalData.imageSignals.coherence.classification;
        }
        
        // Scoring - preserve ALL numerical values
        if (originalData.imageSignals.scoring) {
          translated.imageSignals.scoring = {
            ...originalData.imageSignals.scoring,
            reasoning: translated.imageSignals?.scoring?.reasoning || originalData.imageSignals.scoring.reasoning
          };
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
        const errorMsg = language === 'fr' 
          ? "Limite de requêtes atteinte. Réessayez dans quelques instants."
          : "Rate limit exceeded. Please try again later.";
        return new Response(
          JSON.stringify({ error: errorMsg }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const messageContent = aiResponse.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error("No response from AI");
    }

    console.log("AI response received (English):", messageContent.substring(0, 200));

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
