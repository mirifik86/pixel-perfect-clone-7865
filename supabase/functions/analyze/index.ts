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

// ============= URL TYPE DETECTION =============

type UrlType = 'SOCIAL_POST' | 'NEWS_ARTICLE' | 'WEB_OTHER';

const SOCIAL_DOMAINS = [
  'facebook.com', 'fb.com', 'fb.watch',
  'instagram.com',
  'twitter.com', 'x.com',
  'tiktok.com',
  'reddit.com',
  'linkedin.com',
  'threads.net',
  'mastodon.social',
  'bsky.app',
  'youtube.com', 'youtu.be',
  'pinterest.com',
  'tumblr.com',
  'snapchat.com'
];

const NEWS_DOMAINS = [
  // Major international news
  'bbc.com', 'bbc.co.uk',
  'cnn.com',
  'reuters.com',
  'apnews.com',
  'theguardian.com',
  'nytimes.com',
  'washingtonpost.com',
  'wsj.com',
  'bloomberg.com',
  'forbes.com',
  'economist.com',
  'ft.com',
  'aljazeera.com',
  'npr.org',
  'abc.net.au',
  'news.sky.com',
  // French news
  'lemonde.fr',
  'lefigaro.fr',
  'liberation.fr',
  'leparisien.fr',
  'francetvinfo.fr',
  'france24.com',
  'rfi.fr',
  'bfmtv.com',
  'tf1info.fr',
  'lexpress.fr',
  'lobs.com',
  'lepoint.fr',
  'lavoixdunord.fr',
  'sudouest.fr',
  'ouestfrance.fr',
  '20minutes.fr',
  // Canadian news
  'cbc.ca',
  'globalnews.ca',
  'thestar.com',
  'nationalpost.com',
  'lapresse.ca',
  'ledevoir.com',
  'journaldemontreal.com',
  'radio-canada.ca',
  // Tech news
  'techcrunch.com',
  'wired.com',
  'theverge.com',
  'arstechnica.com',
  'engadget.com',
  // Science news
  'nature.com',
  'sciencemag.org',
  'scientificamerican.com',
  // Fact-checking
  'snopes.com',
  'factcheck.org',
  'politifact.com',
  'fullfact.org',
  'lesdecodeurs.fr'
];

function detectUrlType(content: string): { type: UrlType; detectedDomain: string | null } {
  // Try to extract URL from content
  const urlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^\[\]`]+/i);
  
  if (!urlMatch) {
    // No URL detected, treat as plain text (WEB_OTHER behavior)
    return { type: 'WEB_OTHER', detectedDomain: null };
  }

  try {
    const url = new URL(urlMatch[0]);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    
    // Check social domains
    for (const domain of SOCIAL_DOMAINS) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return { type: 'SOCIAL_POST', detectedDomain: domain };
      }
    }
    
    // Check news domains
    for (const domain of NEWS_DOMAINS) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return { type: 'NEWS_ARTICLE', detectedDomain: domain };
      }
    }
    
    // Default to WEB_OTHER
    return { type: 'WEB_OTHER', detectedDomain: hostname };
  } catch {
    return { type: 'WEB_OTHER', detectedDomain: null };
  }
}

// ============= DETERMINISTIC MICRO-VARIABILITY LAYER =============
// Prevents identical scores for similar content using secondary signals
// Range: -2 to +4 (max absolute impact ≤ 5)

function calculateMicroAdjustment(content: string): number {
  const text = content.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  let adjustment = 0;
  
  // 1. Text length signal (-1 to +1)
  // Very short content: slight penalty, moderately developed: slight bonus
  if (wordCount < 30) {
    adjustment -= 1; // Very short - less context available
  } else if (wordCount >= 100 && wordCount <= 500) {
    adjustment += 1; // Well-developed content
  } else if (wordCount > 500) {
    adjustment += 0.5; // Long but may be verbose
  }
  
  // 2. Lexical richness signal (-1 to +1)
  // Unique word ratio as proxy for vocabulary diversity
  const uniqueWords = new Set(words.filter(w => w.length > 3));
  const richness = wordCount > 0 ? uniqueWords.size / Math.min(wordCount, 100) : 0;
  if (richness < 0.3) {
    adjustment -= 1; // High repetition
  } else if (richness > 0.6) {
    adjustment += 1; // Varied vocabulary
  }
  
  // 3. Nuance markers signal (-0.5 to +1.5)
  // Presence of hedging/measured language
  const nuanceMarkers = [
    'may', 'might', 'could', 'possibly', 'perhaps', 'suggests', 'indicates',
    'according to', 'reportedly', 'allegedly', 'appears', 'seems', 'likely',
    'peut-être', 'pourrait', 'suggère', 'indique', 'selon', 'apparemment',
    'semble', 'probablement', 'il est possible'
  ];
  const nuanceCount = nuanceMarkers.filter(marker => text.includes(marker)).length;
  if (nuanceCount >= 3) {
    adjustment += 1.5; // Strong nuanced language
  } else if (nuanceCount >= 1) {
    adjustment += 0.5; // Some nuance
  } else {
    adjustment -= 0.5; // Overly assertive
  }
  
  // 4. Structure quality signal (-0.5 to +1)
  // Check for complete sentences (periods, question marks, exclamation)
  const sentenceEndings = (text.match(/[.!?]/g) || []).length;
  const avgSentenceLength = wordCount / Math.max(sentenceEndings, 1);
  if (sentenceEndings >= 3 && avgSentenceLength >= 8 && avgSentenceLength <= 35) {
    adjustment += 1; // Well-structured sentences
  } else if (sentenceEndings === 0 || avgSentenceLength < 5) {
    adjustment -= 0.5; // Slogan-like or fragmented
  }
  
  // 5. Content hash micro-variation (deterministic)
  // Creates slight variation for similar content without pure randomness
  // Uses character-based hash to add -0.5 to +0.5 variation
  let hash = 0;
  for (let i = 0; i < Math.min(text.length, 200); i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const hashVariation = ((Math.abs(hash) % 100) / 100 - 0.5); // -0.5 to +0.5
  adjustment += hashVariation;
  
  // Clamp final adjustment to -2 to +4 range
  return Math.round(Math.max(-2, Math.min(4, adjustment)) * 10) / 10;
}

function getMicroAdjustmentReason(content: string, language: string): string {
  const text = content.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  const reasons: string[] = [];
  
  // Text length
  if (wordCount < 30) {
    reasons.push(language === 'fr' ? 'contenu court' : 'short content');
  } else if (wordCount >= 100) {
    reasons.push(language === 'fr' ? 'contenu développé' : 'developed content');
  }
  
  // Lexical richness
  const uniqueWords = new Set(words.filter(w => w.length > 3));
  const richness = wordCount > 0 ? uniqueWords.size / Math.min(wordCount, 100) : 0;
  if (richness > 0.6) {
    reasons.push(language === 'fr' ? 'vocabulaire varié' : 'varied vocabulary');
  } else if (richness < 0.3) {
    reasons.push(language === 'fr' ? 'vocabulaire répétitif' : 'repetitive vocabulary');
  }
  
  // Nuance markers
  const nuanceMarkers = ['may', 'might', 'could', 'possibly', 'suggests', 'indicates', 'according to',
    'peut-être', 'pourrait', 'suggère', 'selon', 'probablement'];
  const hasNuance = nuanceMarkers.some(marker => text.includes(marker));
  if (hasNuance) {
    reasons.push(language === 'fr' ? 'langage nuancé' : 'nuanced language');
  }
  
  if (reasons.length === 0) {
    return language === 'fr' ? 'signaux secondaires neutres' : 'neutral secondary signals';
  }
  
  return reasons.slice(0, 2).join(', ');
}

// ============= SOCIAL POST PLAUSIBILITY ANALYSIS =============


const getSocialPostPrompt = (language: string) => `You are LeenScore, an AI plausibility analyst for social media content.

IMPORTANT: You MUST respond entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${getCurrentDateInfo().formatted}

CONTEXT: You are analyzing a SOCIAL MEDIA POST (Facebook, Instagram, X/Twitter, TikTok, etc.)
Social media posts are inherently unverified personal opinions or claims. Your task is to assess PLAUSIBILITY, not truth.

CRITICAL SCORING RULE FOR SOCIAL POSTS:
- Standard analysis scores for social posts should naturally range between 30-60.
- Scores above 60 require explicit evidence of verification (which is rare in social content).
- Social posts lack editorial oversight and cannot achieve high credibility without Pro verification.

PLAUSIBILITY SCORING METHOD:
Start with a base score of 45/100 (lower baseline for unverified social content).

A. INTERNAL COHERENCE (not external verification):
- Narrative is internally consistent and logical: +10
- Contains obvious contradictions or logical fallacies: -15
- Claims without any supporting context: -10

B. TONE & LANGUAGE QUALITY:
- Measured, reasonable tone: +5
- Alarmist, sensational, or emotionally manipulative: -15
- Excessive caps, emojis, or clickbait language: -10
- Conspiracy-like language ("they don't want you to know", "wake up"): -15

C. SCAM/FRAUD SIGNALS:
- No suspicious patterns detected: 0
- Financial promises or get-rich schemes: -20
- Urgency tactics ("act now", "limited time"): -10
- Requests for personal info or account access: -20
- Impersonation signals (claiming to be official account): -15

D. SOURCE TRANSPARENCY:
- Personal opinion clearly labeled as such: +5
- Claims to have insider/expert knowledge without credentials: -10
- Complete anonymity or fake-looking profile: -10
- Shares traceable media mentions (even if unverified): +3

E. CONTENT QUALITY:
- Provides specific, verifiable details (names, dates, locations): +5
- Vague generalizations only: -5
- Contains obvious factual errors or outdated information: -10
- Mixes opinion with assertion without distinction: -5

SCORE CEILING ENFORCEMENT:
- If calculated score > 60, cap at 60 and note: "Social content requires Pro verification for higher scores"
- If calculated score < 20, floor at 20 unless clear fraud indicators present

RESPONSE FORMAT (JSON):
{
  "score": <number 20-60 for social posts>,
  "contentType": "social_post",
  "breakdown": {
    "sources": {"points": <number>, "reason": "<brief reason>"},
    "factual": {"points": <number>, "reason": "<brief reason - assess internal coherence>"},
    "tone": {"points": <number>, "reason": "<brief reason>"},
    "context": {"points": <number>, "reason": "<brief reason>"},
    "transparency": {"points": <number>, "reason": "<brief reason>"},
    "freshness": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "prudence": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "density": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "attribution": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "visualCoherence": {"points": <-5 to +5>, "reason": "<brief reason>"}
  },
  "summary": "<2-3 sentences explaining plausibility assessment>",
  "articleSummary": "<2-3 sentence neutral description of what the post claims/discusses>",
  "confidence": "<low|medium|high>",
  "plausibilityNote": "${language === 'fr' ? 'Contenu social plausible mais non vérifié. Une analyse Pro est requise pour une vérification factuelle.' : 'Plausible but unverified social content. Pro analysis required for factual verification.'}"
}

ALL text must be in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.`;

// ============= NEWS ARTICLE EDITORIAL ANALYSIS =============

const getNewsArticlePrompt = (language: string) => `You are LeenScore, an AI credibility analyst for news and journalistic content.

IMPORTANT: You MUST respond entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${getCurrentDateInfo().formatted}

CONTEXT: You are analyzing a NEWS ARTICLE from a recognized media outlet.
News articles undergo editorial processes and can be evaluated for journalistic credibility.

EDITORIAL CREDIBILITY SCORING METHOD:
Start with a base score of 55/100 (slightly above neutral for published journalism).

A. SOURCES & CORROBORATION:
- Multiple independent sources cited: +20
- Official sources or experts quoted: +15
- Single anonymous source: -10
- No sources cited: -20

B. JOURNALISTIC STANDARDS:
- Balanced presentation of multiple viewpoints: +15
- Clear separation of news and opinion: +10
- One-sided or advocacy journalism: -10
- Mixing facts with editorial opinion: -15

C. FACTUAL CONSISTENCY:
- Claims supported by data or evidence: +15
- Internal consistency throughout article: +10
- Contradictions or unverified claims: -15
- Factual errors detected: -20

D. CONTEXT & TRANSPARENCY:
- Clear date, author, and publication: +10
- Proper context for claims and statistics: +10
- Missing important context: -15
- Clickbait headline vs. actual content mismatch: -10

E. MEDIA REPUTATION SIGNALS:
- Established news organization with editorial standards: +10
- Known for corrections and accountability: +5
- History of retractions or bias complaints: -10
- Unverified or new outlet: -5

EXTENDED SIGNALS (±5 points each):
F. FRESHNESS: Timeliness appropriate to story
G. PRUDENCE: Appropriate hedging on uncertain claims
H. DENSITY: Rich in verifiable facts vs. speculation
I. ATTRIBUTION: Clear attribution for all major claims
J. VISUAL-TEXTUAL COHERENCE: Images support the narrative appropriately

NEWS SCORE RANGE:
- High-quality journalism: 70-90
- Standard news: 55-70
- Problematic journalism: 35-55
- Unreliable: below 35

RESPONSE FORMAT (JSON):
{
  "score": <number 0-100>,
  "contentType": "news_article",
  "breakdown": {
    "sources": {"points": <number>, "reason": "<brief reason>"},
    "factual": {"points": <number>, "reason": "<brief reason>"},
    "tone": {"points": <number>, "reason": "<brief reason>"},
    "context": {"points": <number>, "reason": "<brief reason>"},
    "transparency": {"points": <number>, "reason": "<brief reason>"},
    "freshness": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "prudence": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "density": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "attribution": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "visualCoherence": {"points": <-5 to +5>, "reason": "<brief reason>"}
  },
  "summary": "<2-3 sentences explaining credibility assessment>",
  "articleSummary": "<2-3 sentence factual summary of the article content>",
  "confidence": "<low|medium|high>"
}

ALL text must be in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.`;

// ============= WEB OTHER (GENERIC) ANALYSIS =============

const getWebOtherPrompt = (language: string) => `You are LeenScore, an AI credibility analyst. Your task is to analyze content and calculate a Trust Score.

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

E. TRANSPARENCY:
- Sources clearly cited: +10
- Identified author or organization: +5
- Total anonymity: -10

===== EXTENDED CREDIBILITY SIGNALS (F-J) =====
Each signal has LIMITED IMPACT: maximum +5 or -5 points per signal.

F. CONTENT FRESHNESS RELEVANCE:
- Fresh, timely content on current events: +3 to +5
- Content appropriately dated for its topic: 0 (neutral)
- Outdated information presented as current: -3 to -5

G. LANGUAGE PRUDENCE:
- Uses measured language ("suggests", "indicates"): +3 to +5
- Overconfident assertions without justification: -3 to -5

H. FACTUAL DENSITY:
- High density of specific, verifiable facts: +3 to +5
- Vague claims lacking specific details: -3 to -5

I. ATTRIBUTION CLARITY:
- Direct quotes with clear attribution: +3 to +5
- No attribution for major claims: -5

J. VISUAL-TEXTUAL COHERENCE:
- Images directly support the text narrative: +2 to +3
- Misleading or unrelated images: -3 to -5

RESPONSE FORMAT (JSON):
{
  "score": <number between 0-100>,
  "contentType": "web_other",
  "breakdown": {
    "sources": {"points": <number>, "reason": "<brief reason>"},
    "factual": {"points": <number>, "reason": "<brief reason>"},
    "tone": {"points": <number>, "reason": "<brief reason>"},
    "context": {"points": <number>, "reason": "<brief reason>"},
    "transparency": {"points": <number>, "reason": "<brief reason>"},
    "freshness": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "prudence": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "density": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "attribution": {"points": <-5 to +5>, "reason": "<brief reason>"},
    "visualCoherence": {"points": <-5 to +5>, "reason": "<brief reason>"}
  },
  "summary": "<2-3 sentence explanation>",
  "articleSummary": "<2-3 sentence factual summary>",
  "confidence": "<low|medium|high>"
}

ALL text must be in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.`;

// ============= PRO ANALYSIS PROMPT (unchanged, applies to all URL types) =============

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
    
    // Detect URL type for routing (only for Standard analysis)
    const { type: urlType, detectedDomain } = detectUrlType(content);
    console.log(`URL Type Detection: ${urlType}, Domain: ${detectedDomain || 'N/A'}`);
    
    // Select the appropriate system prompt based on analysis type and URL type
    let systemPrompt: string;
    if (isPro) {
      systemPrompt = getProSystemPrompt(language || 'en');
    } else {
      switch (urlType) {
        case 'SOCIAL_POST':
          systemPrompt = getSocialPostPrompt(language || 'en');
          console.log('Routing to SOCIAL_POST plausibility analysis');
          break;
        case 'NEWS_ARTICLE':
          systemPrompt = getNewsArticlePrompt(language || 'en');
          console.log('Routing to NEWS_ARTICLE editorial analysis');
          break;
        default:
          systemPrompt = getWebOtherPrompt(language || 'en');
          console.log('Routing to WEB_OTHER generic analysis');
      }
    }
    
    const userPrompt = language === 'fr' 
      ? `Analyse ce contenu et calcule le Trust Score${isPro ? ' avec analyse Pro complète' : ''}. Réponds en français:\n\n${content}`
      : `Analyze this content and calculate the Trust Score${isPro ? ' with full Pro analysis' : ''}:\n\n${content}`;

    console.log(`Calling Lovable AI Gateway for ${isPro ? 'Pro' : 'Standard'} analysis...`);

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
        contentType: urlType.toLowerCase(),
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

    // ============= DETERMINISTIC MICRO-VARIABILITY LAYER =============
    // Apply subtle score adjustment based on secondary content signals
    // Range: -2 to +4 points (max absolute impact ≤ 5)
    // Purpose: Prevent identical scores for similar content without destabilizing results
    
    const microAdjustment = calculateMicroAdjustment(content);
    console.log(`Micro-adjustment calculated: ${microAdjustment}`);
    
    // Apply adjustment to base score
    let adjustedScore = analysisResult.score + microAdjustment;
    
    // Clamp to allowed ranges based on URL type
    if (!isPro && urlType === 'SOCIAL_POST') {
      adjustedScore = Math.max(20, Math.min(60, adjustedScore));
    } else {
      adjustedScore = Math.max(0, Math.min(100, adjustedScore));
    }
    
    analysisResult.score = adjustedScore;
    analysisResult.analysisType = isPro ? 'pro' : 'standard';
    
    // Add micro-adjustment metadata (for debugging/transparency)
    analysisResult.microAdjustment = {
      applied: microAdjustment,
      reason: getMicroAdjustmentReason(content, language || 'en')
    };
    
    // Add URL type metadata for frontend display
    analysisResult.urlType = urlType;
    analysisResult.detectedDomain = detectedDomain;

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
