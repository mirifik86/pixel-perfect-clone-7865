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

// Detect social media platform from URL
const detectSocialPlatform = (url: string): "facebook" | "instagram" | "x" | "tiktok" | "other" => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.com") || lowerUrl.includes("fb.watch")) {
    return "facebook";
  }
  if (lowerUrl.includes("instagram.com") || lowerUrl.includes("instagr.am")) {
    return "instagram";
  }
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com") || lowerUrl.includes("t.co")) {
    return "x";
  }
  if (lowerUrl.includes("tiktok.com") || lowerUrl.includes("vm.tiktok.com")) {
    return "tiktok";
  }
  return "other";
};

// Check if URL is a social media URL
const isSocialMediaUrl = (url: string): boolean => {
  return detectSocialPlatform(url) !== "other";
};

// Get Social URL v2 prompt for STANDARD analysis
const getSocialUrlV2Prompt = (language: string) => `You are LeenScore, a credibility analyst for social media posts.

IMPORTANT: You MUST respond entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.

SCOPE: This analysis applies ONLY to social media URLs (Facebook, Instagram, X, TikTok).
This is a STANDARD analysis (not PRO).

NON-NEGOTIABLE RULES:
- Never fabricate text, links, sources, summaries, or counts.
- Never claim content was read if it was not.
- If evidence is missing, be explicit and conservative.

STEP 1 — Evidence Collection
Analyze the content and compute:
- platform: "facebook" | "instagram" | "x" | "tiktok" | "other"
- extracted_text: the actual text you can read from the post (may be empty)
- extracted_text_length: character count of extracted_text
- detected_links: array of ONLY links actually found in extracted_text or page context (NOT fabricated)
- detected_links_count: count of detected_links array

Set access_status:
- "READABLE" if extracted_text_length >= 160
- "BLOCKED_OR_EMPTY" otherwise

STEP 2 — Mode
If access_status = "READABLE": mode = "TEXT_BASED"
Else: mode = "LIMITED_SIGNAL"

STEP 3 — Deterministic Scoring (NO randomness)
Base score = 50

TEXT_BASED scoring (apply ONLY if mode="TEXT_BASED"):
- Language tone:
  - neutral / informational: +6
  - emotional (non-alarmist): -2
  - alarmist / manipulative: -10
- Claim quality:
  - strong claim without evidence markers (no sources, no specifics): -10
  - cautious language / uncertainty: +2
- Specificity:
  - names/dates/locations/numbers present: +6
  - vague / generic wording: -6
- Coherence:
  - coherent and consistent: +4
  - contradictory / confusing: -8
- Links (ONLY if detected_links_count > 0):
  - reputable domains present: +6
  - shorteners / unknown / tracking-heavy: -6

LIMITED_SIGNAL scoring (apply ONLY if mode="LIMITED_SIGNAL"):
- Do NOT summarize content (summary MUST be empty string).
- Apply platform limitation penalty: -5
- URL risk signals (ONLY if present):
  - obvious shorteners / redirect chains: -8
  - tracking-only parameters heavy: -4
- Otherwise keep score near mid-range.

STEP 4 — Clamp to STANDARD range
Final score = clamp(Base score after adjustments, 25, 70)

STEP 5 — Compute subScores
Each subScore is 0-100, derived from the rules applied:
- content_readability: Based on extracted_text_length and access_status (READABLE = 70-85, BLOCKED_OR_EMPTY = 20-35)
- language_risk: Based on tone assessment (neutral = 75-90, emotional = 40-55, alarmist = 15-30)
- evidence_strength: Based on specificity and claim quality (strong specifics = 70-85, weak/vague = 25-40)
- link_risk: Based on detected links quality (reputable = 75-90, none detected = 50, risky = 20-35)

RESPONSE FORMAT (strict JSON with EXACT keys):
{
  "score": <number 25-70>,
  "subScores": {
    "content_readability": <number 0-100>,
    "language_risk": <number 0-100>,
    "evidence_strength": <number 0-100>,
    "link_risk": <number 0-100>
  },
  "summary": "<2-3 neutral sentences ONLY if mode=TEXT_BASED, otherwise MUST be empty string \"\">",
  "explanation": "<2-3 sentences stating the mode and top 2 drivers of the score in ${language === 'fr' ? 'French' : 'English'}>",
  "transparency": {
    "mode": "<TEXT_BASED|LIMITED_SIGNAL>",
    "extracted_text_length": <integer>,
    "detected_links_count": <integer>,
    "platform": "<facebook|instagram|x|tiktok|other>"
  }
}

CRITICAL:
- If detected_links_count = 0, you MUST state "0 links detected" in explanation and MUST NOT list or analyze any links.
- In LIMITED_SIGNAL mode, summary MUST be exactly "" (empty string).
- Never invent or assume links that were not actually found.
- ALL text responses MUST be in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.`;

const getSystemPrompt = (language: string) => `You are LeenScore, an AI credibility analyst. Your task is to analyze content and calculate a Trust Score.

IMPORTANT: You MUST respond entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}. All text including reasons and summary must be in ${language === 'fr' ? 'French' : 'English'}.

CURRENT DATE CONTEXT:
Today's date is ${getCurrentDateInfo().formatted} (${getCurrentDateInfo().year}).
You MUST use this as your temporal reference point for all date evaluations.

SCORING METHOD:
Start with a base score of 50/100 (neutral).
Apply the following criteria by adding or subtracting points:

===== CORE CRITERIA (A-E) =====

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

TEMPORAL CONTEXT EVALUATION (CRITICAL):
When evaluating publication dates:
1. Compare detected dates against TODAY'S DATE (${getCurrentDateInfo().formatted})
2. A date in ${getCurrentDateInfo().year} is CURRENT YEAR content - this is NORMAL and expected
3. Apply NO penalty for:
   - Same year and month as current date
   - Dates within ±30 days of current date
   - Content clearly labeled as forecasts, projections, or future-oriented
4. Apply context penalty (-15 to -20) ONLY if:
   - Date is more than 60 days in the future AND not clearly forward-looking content
   - Date appears fabricated or contradicts the content narrative
5. When uncertain about dates, state uncertainty - do NOT penalize

E. TRANSPARENCY:
- Sources clearly cited: +10
- Identified author or organization: +5
- Total anonymity: -10

===== EXTENDED CREDIBILITY SIGNALS (F-J) =====
Each signal has LIMITED IMPACT: maximum +5 or -5 points per signal.
These signals create score differentiation without dominating the overall assessment.

F. CONTENT FRESHNESS RELEVANCE:
Evaluate if the content's age aligns with its purpose and claims.
- Fresh, timely content on current events: +3 to +5
- Content appropriately dated for its topic (historical, evergreen): 0 (neutral)
- Outdated information presented as current: -3 to -5
- Unable to assess freshness: 0 (neutral)

G. LANGUAGE PRUDENCE:
Assess whether claims are stated with appropriate caution or speculation.
- Uses measured language ("suggests", "indicates", "according to"): +3 to +5
- Balanced mix of firm and qualified statements: 0 (neutral)
- Overconfident assertions without justification: -3 to -5
- Speculative claims presented as facts: -5

H. FACTUAL DENSITY:
Evaluate the ratio of verifiable facts to opinions/claims.
- High density of specific, verifiable facts (names, dates, figures): +3 to +5
- Average mix of facts and analysis: 0 (neutral)
- Vague claims lacking specific details: -3 to -5
- Almost no verifiable factual content: -5

I. ATTRIBUTION CLARITY:
Assess how clearly claims are attributed to their sources.
- Direct quotes with clear attribution: +3 to +5
- Named sources referenced generally: +1 to +3
- Vague attributions ("experts say", "sources claim"): -2 to -4
- No attribution for major claims: -5

J. VISUAL-TEXTUAL COHERENCE:
Evaluate alignment between images and text content.
- Images directly support and match the text narrative: +2 to +3
- Neutral, illustrative images (stock, decorative): 0 (neutral)
- Misleading or unrelated images: -3 to -5
- No images present: 0 (neutral)

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact format:
{
  "score": <number between 0-100>,
  "breakdown": {
    "sources": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "factual": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "tone": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "context": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "transparency": {"points": <number>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "freshness": {"points": <number between -5 and +5>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "prudence": {"points": <number between -5 and +5>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "density": {"points": <number between -5 and +5>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "attribution": {"points": <number between -5 and +5>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"},
    "visualCoherence": {"points": <number between -5 and +5>, "reason": "<brief reason in ${language === 'fr' ? 'French' : 'English'}>"}
  },
  "summary": "<2-3 sentence explanation in ${language === 'fr' ? 'French' : 'English'}>",
  "articleSummary": "<2-3 sentence FACTUAL summary of what the article is about - ONLY describe the main topic and key reported facts. Use neutral, journalistic tone with verbs like 'reports', 'states', 'outlines', 'describes'. NO opinions, NO conclusions, NO mention of credibility or score. This must be in ${language === 'fr' ? 'French' : 'English'}>",
  "confidence": "<low|medium|high>"
}

IMPORTANT:
- Score must be between 0 and 100
- Be objective and analytical
- When data is insufficient, state uncertainty instead of penalizing
- Extended signals (F-J) are CAPPED at ±5 points each - they refine the score, not dominate it
- The "summary" field should explain why the score is what it is (analysis conclusion)
- The "articleSummary" field should ONLY describe what the content is about factually - it must NOT influence or mention the score
- NEVER penalize content simply because it mentions dates in ${getCurrentDateInfo().year} - that is the CURRENT YEAR
- ALL text responses (reasons, summary, articleSummary) MUST be in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}`;

// PRO ANALYSIS PROMPT - Includes advanced Image Signals Module
const getProSystemPrompt = (language: string) => `You are LeenScore Pro, an advanced AI credibility analyst. Your task is to perform a comprehensive Pro Analysis including advanced Image Signals analysis.

IMPORTANT: You MUST respond entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}. All text including reasons and summary must be in ${language === 'fr' ? 'French' : 'English'}.

CURRENT DATE CONTEXT:
Today's date is ${getCurrentDateInfo().formatted} (${getCurrentDateInfo().year}).

PRO ANALYSIS SCORING METHOD:
Start with a base score of 50/100 (neutral).
Apply the Standard Analysis criteria (A-F) plus enhanced Pro modules.

STANDARD CRITERIA (same as Standard Analysis):

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
- Excessive use of trigger words: -10

D. CONTEXT CLARITY:
- Clear temporal and geographical context: +10
- Incomplete or misleading context: -15
- Information presented outside its original context: -20

E. TRANSPARENCY:
- Sources clearly cited: +10
- Identified author or organization: +5
- Total anonymity: -10

===== PRO ANALYSIS: IMAGE SIGNALS MODULE =====

Analyze images/visuals for the following contextual signals (these are INDICATORS only, not determinants of truth):

1. PROBABLE IMAGE ORIGIN:
Assess the likely origin category:
- "real_photo": Appears to be an authentic photograph
- "illustration_composite": Appears to be an illustration, graphic, or composite image
- "probable_ai_generated": Shows indicators of AI generation (unusual textures, artifacts, inconsistent details, uncanny elements)
- "undetermined": Insufficient information to assess

2. METADATA SIGNALS (when detectable from context):
- EXIF/IPTC presence indicators: Look for mentions of camera models, dates, location data
- Date consistency: Does any mentioned image date align with the content timeline?
- Software indicators: Any mentioned editing software, AI tools, or generation methods

3. VISUAL-TEXTUAL COHERENCE (Pro depth):
- "illustrative": Image serves as general illustration of the topic (neutral)
- "demonstrative": Image directly supports or documents the claims (positive indicator)
- "potentially_misleading": Image may misrepresent the content or be used out of context (warning indicator)

===== PRO ANALYSIS: IMAGE SCORING RULES =====

CRITICAL: Image analysis cannot dominate the score. Image signals act as RISK MODIFIERS, not evidence.
TOTAL IMAGE-RELATED IMPACT IS CAPPED AT -10 POINTS MAXIMUM.

IMAGE SCORING LOGIC:
- Coherent, illustrative image: 0 points (no impact)
- Image used as factual proof without corroboration: -4 points
- Probable AI-generated image combined with factual claims: -3 to -6 points (scale based on severity)
- Metadata inconsistencies (date mismatch, edited indicators): -2 points

IMPORTANT SCORING NOTES:
- Absence of metadata is NEUTRAL (0 points) - do not penalize missing metadata
- AI-generated image ALONE does not trigger penalties - only penalize when combined with misleading factual claims
- Calculate total imageImpact as sum of applicable penalties, but CAP at -10 maximum

===== CONTEXTUAL IMAGE SEVERITY (Amplification Rule) =====

ACTIVATION CONDITION:
Apply an additional -2 point penalty ONLY when AT LEAST TWO of the following risk factors are SIMULTANEOUSLY present:
1. Probable AI-generated image (origin.classification = "probable_ai_generated")
2. Weak or unreliable source (sources.points < 0)
3. Lack of corroboration (no independent verification of claims)
4. Misleading or manipulative visual usage (coherence.classification = "potentially_misleading")

EFFECT:
- When 2+ conditions are met: Apply additional -2 points (contextualSeverity)
- This penalty is INCLUDED in the -10 point cap

SAFEGUARDS:
- This rule NEVER activates in isolation (requires 2+ conditions)
- Image-related penalties CANNOT downgrade a credibility category alone
- If image penalties would push score across a category boundary (e.g., 60→59), and NO other criteria support the downgrade, do NOT apply the crossing penalty

CONSTRAINTS:
- Image signals are CONTEXTUAL INDICATORS only
- Image analysis does NOT determine truth or falsity
- Present findings as observations, not verdicts
- If uncertain, state uncertainty clearly

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact format:
{
  "score": <number between 0-100>,
  "analysisType": "pro",
  "breakdown": {
    "sources": {"points": <number>, "reason": "<brief reason>"},
    "factual": {"points": <number>, "reason": "<brief reason>"},
    "tone": {"points": <number>, "reason": "<brief reason>"},
    "context": {"points": <number>, "reason": "<brief reason>"},
    "transparency": {"points": <number>, "reason": "<brief reason>"},
    "imageCoherence": {"points": <number between -10 and 0>, "reason": "<brief reason explaining the image scoring>"}
  },
  "imageSignals": {
    "origin": {
      "classification": "<real_photo|illustration_composite|probable_ai_generated|undetermined>",
      "confidence": "<low|medium|high>",
      "indicators": ["<list of observed indicators in ${language === 'fr' ? 'French' : 'English'}>"]
    },
    "metadata": {
      "exifPresence": "<detected|not_detected|undetermined>",
      "dateConsistency": "<consistent|inconsistent|undetermined>",
      "softwareIndicators": ["<list any detected software mentions>"]
    },
    "coherence": {
      "classification": "<illustrative|demonstrative|potentially_misleading>",
      "explanation": "<brief explanation in ${language === 'fr' ? 'French' : 'English'}>"
    },
    "scoring": {
      "imageAsProof": <0 or -4>,
      "aiWithClaims": <0 to -6>,
      "metadataIssues": <0 or -2>,
      "contextualSeverity": <0 or -2>,
      "severityConditionsMet": ["<list which conditions triggered severity, if any>"],
      "totalImpact": <sum capped at -10>,
      "reasoning": "<brief explanation of scoring decisions in ${language === 'fr' ? 'French' : 'English'}>"
    },
    "disclaimer": "${language === 'fr' ? 'Ces signaux sont des indicateurs contextuels uniquement. Ils ne déterminent pas la véracité du contenu.' : 'These signals are contextual indicators only. They do not determine content truthfulness.'}"
  },
  "summary": "<2-3 sentence explanation>",
  "articleSummary": "<2-3 sentence FACTUAL summary of the article content>",
  "confidence": "<low|medium|high>",
  "proNote": "${language === 'fr' ? 'Analyse Pro : signaux visuels avancés évalués avec indicateurs contextuels. Impact image plafonné à -10 points.' : 'Pro Analysis: advanced visual signals evaluated with contextual indicators. Image impact capped at -10 points.'}"
}

ALL responses must be in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.`;

// Transform Social URL v2 response to standard format for frontend compatibility
const transformSocialV2Response = (result: any, language: string) => {
  const isFr = language === 'fr';
  const mode = result.transparency?.mode || 'LIMITED_SIGNAL';
  const platform = result.transparency?.platform || 'other';
  
  // Build breakdown from subScores
  const breakdown: any = {
    sources: { 
      points: result.subScores?.evidence_strength >= 60 ? 10 : result.subScores?.evidence_strength >= 40 ? 0 : -10, 
      reason: isFr 
        ? (mode === 'TEXT_BASED' ? 'Évalué à partir du contenu extrait' : 'Accès limité au contenu')
        : (mode === 'TEXT_BASED' ? 'Evaluated from extracted content' : 'Limited content access')
    },
    factual: { 
      points: result.subScores?.evidence_strength >= 60 ? 10 : result.subScores?.evidence_strength >= 40 ? 0 : -5, 
      reason: isFr 
        ? (mode === 'TEXT_BASED' ? 'Cohérence factuelle évaluée' : 'Impossible de vérifier les faits')
        : (mode === 'TEXT_BASED' ? 'Factual coherence assessed' : 'Unable to verify facts')
    },
    tone: { 
      points: result.subScores?.language_risk >= 70 ? 5 : result.subScores?.language_risk >= 40 ? 0 : -10, 
      reason: isFr 
        ? (result.subScores?.language_risk >= 70 ? 'Ton neutre détecté' : result.subScores?.language_risk >= 40 ? 'Ton émotionnel modéré' : 'Ton alarmiste ou manipulateur')
        : (result.subScores?.language_risk >= 70 ? 'Neutral tone detected' : result.subScores?.language_risk >= 40 ? 'Moderately emotional tone' : 'Alarmist or manipulative tone')
    },
    context: { 
      points: mode === 'TEXT_BASED' ? 0 : -5, 
      reason: isFr 
        ? (mode === 'TEXT_BASED' ? 'Contexte partiel disponible' : 'Contexte non accessible')
        : (mode === 'TEXT_BASED' ? 'Partial context available' : 'Context not accessible')
    },
    transparency: { 
      points: -5, 
      reason: isFr 
        ? `Publication ${platform} - sources non vérifiées`
        : `${platform} post - unverified sources`
    }
  };

  // Build article summary based on mode
  let articleSummary = '';
  if (mode === 'LIMITED_SIGNAL') {
    articleSummary = isFr 
      ? `Le contenu de cette publication n'a pas pu être extrait. Ce score est basé sur des signaux limités de l'URL ${platform}, et non sur un accès direct à la publication.`
      : `The content of this post could not be extracted. This score is based on limited signals from the ${platform} URL, not direct access to the post.`;
  } else if (result.summary && result.summary.trim() !== '') {
    articleSummary = result.summary;
  }

  return {
    score: result.score,
    analysisType: 'standard',
    isSocialUrl: true,
    socialMode: mode,
    breakdown,
    subScores: result.subScores,
    summary: result.explanation || (isFr 
      ? `Analyse ${mode === 'TEXT_BASED' ? 'basée sur le texte' : 'à signaux limités'} d'une publication ${platform}.`
      : `${mode === 'TEXT_BASED' ? 'Text-based' : 'Limited signal'} analysis of a ${platform} post.`),
    articleSummary,
    transparency: result.transparency,
    confidence: mode === 'TEXT_BASED' ? 'medium' : 'low',
    socialDisclaimer: isFr 
      ? 'Ce score reflète les signaux de crédibilité d\'une publication de réseau social, pas une vérification factuelle.'
      : 'This score reflects credibility signals of a social media post, not factual verification.'
  };
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
    
    // Check if content is a social media URL for STANDARD analysis
    const isSocialUrl = !isPro && isSocialMediaUrl(content);
    
    let systemPrompt: string;
    let userPrompt: string;
    
    if (isSocialUrl) {
      // Use Social URL v2 methodology
      systemPrompt = getSocialUrlV2Prompt(language || 'en');
      userPrompt = language === 'fr' 
        ? `Analyse cette URL de réseau social selon la méthodologie Social URL v2. Réponds en français:\n\n${content}`
        : `Analyze this social media URL using the Social URL v2 methodology:\n\n${content}`;
      console.log(`Calling Lovable AI Gateway for Social URL v2 analysis (platform: ${detectSocialPlatform(content)})...`);
    } else {
      systemPrompt = isPro ? getProSystemPrompt(language || 'en') : getSystemPrompt(language || 'en');
      userPrompt = language === 'fr' 
        ? `Analyse ce contenu et calcule le Trust Score${isPro ? ' avec analyse Pro complète' : ''}. Réponds en français:\n\n${content}`
        : `Analyze this content and calculate the Trust Score${isPro ? ' with full Pro analysis' : ''}:\n\n${content}`;
      console.log(`Calling Lovable AI Gateway for ${isPro ? 'Pro' : 'Standard'} analysis...`);
    }

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
        temperature: 0.2, // Lower temperature for more deterministic results
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

    // Transform Social URL v2 response to standard format
    if (isSocialUrl && analysisResult.transparency) {
      analysisResult = transformSocialV2Response(analysisResult, language || 'en');
    } else {
      // Ensure score is within bounds and set analysis type for non-social URLs
      analysisResult.score = Math.max(0, Math.min(100, analysisResult.score));
      analysisResult.analysisType = isPro ? 'pro' : 'standard';
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
