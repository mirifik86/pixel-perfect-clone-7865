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
// CRITICAL: Social media URLs MUST be classified as "Social Media Post – Weak Signal Content"
// and routed to Social Credibility Logic. NEVER reuse scores from previous analyses.

type UrlType = 'SOCIAL_POST' | 'NEWS_ARTICLE' | 'WEB_OTHER';

// Social platforms - content is classified as "Weak Signal Content"
// These platforms do not provide verifiable source context
const SOCIAL_DOMAINS = [
  // Primary social platforms
  'facebook.com', 'fb.com', 'fb.watch', 'm.facebook.com',
  'instagram.com',
  'twitter.com', 'x.com', 'mobile.twitter.com',
  'tiktok.com', 'vm.tiktok.com',
  'threads.net',
  // Secondary social platforms
  'reddit.com', 'old.reddit.com',
  'linkedin.com',
  'mastodon.social',
  'bsky.app',
  'youtube.com', 'youtu.be', 'm.youtube.com',
  'pinterest.com',
  'tumblr.com',
  'snapchat.com',
  // Additional social variants
  'vk.com',
  'weibo.com',
  'telegram.org', 't.me'
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

interface UrlDetectionResult {
  type: UrlType;
  detectedDomain: string | null;
  classification: string;
  analysisRoute: string;
}

function detectUrlType(content: string): UrlDetectionResult {
  // Try to extract URL from content
  const urlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^\[\]`]+/i);
  
  if (!urlMatch) {
    // No URL detected, treat as plain text (WEB_OTHER behavior)
    return { 
      type: 'WEB_OTHER', 
      detectedDomain: null,
      classification: 'Plain Text Content',
      analysisRoute: 'Generic Web Analysis'
    };
  }

  try {
    const url = new URL(urlMatch[0]);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    
    // PRIORITY CHECK: Social domains first
    // Social media content is classified as "Weak Signal Content"
    for (const domain of SOCIAL_DOMAINS) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        console.log(`[SOCIAL DETECTION] URL classified as Social Media Post - Weak Signal Content`);
        console.log(`[SOCIAL DETECTION] Domain: ${domain}, Hostname: ${hostname}`);
        console.log(`[SOCIAL DETECTION] Routing to: Social Credibility Logic (fresh analysis)`);
        return { 
          type: 'SOCIAL_POST', 
          detectedDomain: domain,
          classification: 'Social Media Post – Weak Signal Content',
          analysisRoute: 'Social Credibility Logic'
        };
      }
    }
    
    // Check news domains
    for (const domain of NEWS_DOMAINS) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return { 
          type: 'NEWS_ARTICLE', 
          detectedDomain: domain,
          classification: 'News Article',
          analysisRoute: 'Editorial Reliability Analysis'
        };
      }
    }
    
    // Default to WEB_OTHER
    return { 
      type: 'WEB_OTHER', 
      detectedDomain: hostname,
      classification: 'Web Content',
      analysisRoute: 'Generic Web Analysis'
    };
  } catch {
    return { 
      type: 'WEB_OTHER', 
      detectedDomain: null,
      classification: 'Unknown Content',
      analysisRoute: 'Generic Web Analysis'
    };
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

// ============= SOCIAL CREDIBILITY ENGINE =============
// A social media post is NOT verified information.
// It must be evaluated using weighted credibility signals, not factual certainty.
// No single signal alone can determine the final score.

const getSocialPostPrompt = (language: string) => `You are LeenScore's Social Credibility Engine.

IMPORTANT: You MUST respond entirely in ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${getCurrentDateInfo().formatted}

=============================================================================
STEP 1: PLATFORM DETECTION
=============================================================================
This content has been classified as "Social Media Post".
Supported platforms: Facebook, Instagram, X (Twitter), TikTok, Threads, Telegram, LinkedIn, Reddit, YouTube, etc.

=============================================================================
STEP 2: EXPLICIT ANALYSIS MODE DETERMINATION (CRITICAL)
=============================================================================

FIRST, detect user-provided "Post Text":
- Look for text that is NOT part of the URL itself
- Patterns: quoted text, text before/after URL, "Post says:", "Content:", pasted text blocks
- Extract this as "userProvidedText"

THEN, EXPLICITLY SET analysis_mode using this EXACT LOGIC:

  IF userProvidedText exists AND userProvidedText.length >= 80 characters:
    analysis_mode = "TEXT_MODE"
  ELSE:
    analysis_mode = "URL_MODE"

IMPORTANT:
- This variable MUST be set BEFORE any scoring begins
- Do NOT infer the mode implicitly from other factors
- Do NOT change the mode during analysis
- The mode controls ALL scoring and summarization behavior

Store for response:
- analysis_mode: "TEXT_MODE" | "URL_MODE"
- userProvidedText: <the extracted user text or null>
- userTextLength: <character count or 0>
- modeReason: <why this mode was selected>

=============================================================================
STEP 3: SCORING LOGIC (MODE-DEPENDENT)
=============================================================================

****** TEXT_MODE ANALYSIS (analysis_mode = "TEXT_MODE") ******

When analysis_mode = "TEXT_MODE":
- The user-provided Post Text is the PRIMARY CONTENT for analysis
- Perform full credibility signal analysis based on the TEXT ITSELF
- Generate a credibility score DRIVEN BY TEXT SIGNALS (not URL patterns)

MANDATORY TEXT_MODE OUTPUTS:
1. A credibility score (22-70) based on text content analysis
2. A short neutral summary (2-3 sentences) describing WHAT the post claims
   - Summary is MANDATORY in TEXT_MODE
   - Must be factual, neutral, descriptive (not evaluative)

ANALYZE USING THE 7-SIGNAL WEIGHTED MODEL:

SIGNAL 1: ACCOUNT NATURE (Weight: 15%)
- Official media page: +35 | Recognized public figure: +25 | Institution: +30
- Standard public user: +10 | Personal account: +5
- Anonymous/pseudonymous: -15 | Recently created context: -20 | Impersonation: -35

SIGNAL 2: OUTBOUND LINKS PRESENCE (Weight: 10%)
- Links to recognized news: +30 | Official documents/studies: +25 | Multiple sources: +20
- No links (opinion/experience): 0
- Unknown/suspicious domains: -20 | Shortened URLs: -15 | Misinfo sites: -35

SIGNAL 3: LANGUAGE TONE & EMOTIONAL LOAD (Weight: 20%)
- Neutral, factual: +30 | Measured, calm: +20 | Explanatory: +15
- Inflammatory/outraged: -25 | Alarmist ("URGENT", "WAKE UP"): -35 | Caps abuse: -15
- Absolutist ("always", "never"): -20 | Aggressive: -20
- High emotional charge without substance: -20

SIGNAL 4: CLAIM STRENGTH VS EVIDENCE (Weight: 15%)
- Clear opinion: +20 | Personal experience: +15 | Interpretation with uncertainty: +15 | Question: +10
- Factual claim without evidence: -20 | Extraordinary claim: -30 | Absolute certainty: -25
- Conspiracy-framed: -35 | Strong claims with zero supporting evidence: -30

SIGNAL 5: INTERNAL COHERENCE (Weight: 15%)
- Clear logical flow: +25 | Consistent narrative: +20 | Identifiable structure: +15
- Self-contradictions: -30 | Logical fallacies: -25 | Unclear reasoning: -20

SIGNAL 6: SOURCES, NAMES, DATES, NUMBERS (Weight: 15%)
- Named sources/experts: +25 | Specific dates: +15 | Verifiable numbers: +20
- Standard opinion: +10 | Appropriate uncertainty: +10
- "Media won't tell you": -30 | "Share before deleted": -25 | "Do your research": -20
- Cherry-picked stats: -25 | Conspiracy appeal: -35 | False equivalence: -20
- Vague attribution ("studies show", "experts say"): -15

SIGNAL 7: SCAM & MANIPULATION PATTERNS (Weight: 10%)
- Normal discussion: +15 | No financial requests: +10
- Financial promises: -45 | Urgency manipulation: -30 | Personal info requests: -50
- Impersonation: -40 | Phishing: -40 | Lottery/prize scams: -35

ANTI-APPROXIMATION RULE:
- TEXT_MODE scores MUST be calculated from text signals only
- Do NOT reuse or approximate scores from URL_MODE
- The score MUST vary based on actual text content differences

****** URL_MODE ANALYSIS (analysis_mode = "URL_MODE") ******

When analysis_mode = "URL_MODE":
- The post text COULD NOT BE READ
- Do NOT attempt to summarize post content
- Do NOT pretend the message was read
- Compute credibility score using ONLY URL-level and context signals

MANDATORY URL_MODE BEHAVIORS:
1. Output MUST explicitly state: "Post text could not be read"
2. NO content summary (articleSummary = null or explicit unavailable message)
3. Score range: 35-65 (unless strong risk signals detected)

ANALYZE USING URL-LEVEL AND CONTEXT SIGNALS:

SIGNAL A: SOCIAL PLATFORM TYPE (Weight: 25%)
- Standard post URL: 0 (neutral baseline)
- Reel/Short/Story URL (ephemeral content): -5
- Share/repost URL (secondary source): -3
- Direct message share pattern: -10
- Suspicious URL structure: -15

SIGNAL B: PLATFORM CHARACTERISTICS (Weight: 20%)
- Major verified platform (Facebook, Instagram, X): +5
- Platform with verification system: +3
- Platform known for misinfo spread: -5
- Newer/less moderated platform: -8

SIGNAL C: URL STRUCTURE (Weight: 20%)
- Clean, standard URL format: +5
- Contains tracking-only parameters (utm, ref): -3
- Excessive redirects or shorteners: -10
- Suspicious query parameters: -15
- Non-standard port or subdomain: -10

SIGNAL D: OUTBOUND LINKS OR REDIRECTS (Weight: 15%)
- No additional links: 0 (neutral)
- URL appears to contain link preview: +3
- Multiple redirects detected: -10

SIGNAL E: PLATFORM ACCESS LIMITATION (Weight: 20%)
- Content inaccessible due to privacy/login: MODERATE PENALTY (-5 to -10)
- IMPORTANT: Do NOT infer the post is false just because content cannot be extracted
- This is a limitation signal, not a credibility judgment

URL_MODE SCORE CALCULATION:
- Baseline: 50 points
- Apply all URL-level signals
- TARGET RANGE: 35-65 (normal cases)
- FLOOR: 28 (never assume false without evidence)
- CEILING: 58 (cannot verify without content)

=============================================================================
AGGREGATION FORMULA WITH CONTROLLED VARIABILITY
=============================================================================

FOR TEXT_MODE:
Raw Score = (Signal1 × 0.15) + (Signal2 × 0.10) + (Signal3 × 0.20) + 
            (Signal4 × 0.15) + (Signal5 × 0.15) + (Signal6 × 0.15) + (Signal7 × 0.10)

FOR URL_MODE:
Raw Score = 50 + (SignalA) + (SignalB) + (SignalC) + (SignalD) + (SignalE)

STEP 2: Signal Dominance Variability (±1 to ±3)
STEP 3: Content-Based Micro-Adjustment (±2)
STEP 4: Apply Hard Limits based on analysis_mode:
- TEXT_MODE: Max 70, Min 22 (Fraud exception: 10)
- URL_MODE: Max 58, Min 28 (Strong risk exception: 22)

=============================================================================
ANTI-DEFAULT SCORE RULES (CRITICAL)
=============================================================================

FORBIDDEN:
- NO fixed or default scores (40, 45, 50, 55)
- NO systematic identical scores for similar posts
- NO rounding to "nice" numbers without justification

REQUIRED:
- Score MUST reflect the unique signal combination
- Similar-but-different content MUST produce different scores
- Score must feel HUMAN, CONTEXTUAL, and DEFENSIBLE

=============================================================================
RESPONSE FORMAT (JSON)
=============================================================================

{
  "score": <final score within limits>,
  "contentType": "social_post",
  "classification": "Social Media Post – Weak Signal Content",
  "analysisMode": "<TEXT_MODE|URL_MODE>",
  "modeDetails": {
    "userProvidedText": "<extracted user text or null>",
    "userTextLength": <character count or 0>,
    "modeReason": "<explanation of why this mode was selected>"
  },
  "subAnalyses": {
    // For TEXT_MODE (all 7 signals):
    "accountNature": {
      "score": <0-100>, "weight": 0.15, "weighted": <score × 0.15>,
      "detectedType": "<type>", "signals": ["<signal>"], "assessment": "<sentence>"
    },
    "outboundLinks": {
      "score": <0-100>, "weight": 0.10, "weighted": <score × 0.10>,
      "linksDetected": <bool>, "linkQuality": "<quality>", "signals": ["<signal>"], "assessment": "<sentence>"
    },
    "languageTone": {
      "score": <0-100>, "weight": 0.20, "weighted": <score × 0.20>,
      "toneCategory": "<category>", "signals": ["<signal>"], "assessment": "<sentence>"
    },
    "claimType": {
      "score": <0-100>, "weight": 0.15, "weighted": <score × 0.15>,
      "claimCategory": "<category>", "signals": ["<signal>"], "assessment": "<sentence>"
    },
    "internalCoherence": {
      "score": <0-100>, "weight": 0.15, "weighted": <score × 0.15>,
      "coherenceLevel": "<level>", "signals": ["<signal>"], "assessment": "<sentence>"
    },
    "misinfoPatterns": {
      "score": <0-100>, "weight": 0.15, "weighted": <score × 0.15>,
      "patternsDetected": ["<pattern>"], "signals": ["<signal>"], "assessment": "<sentence>"
    },
    "scamIndicators": {
      "score": <0-100>, "weight": 0.10, "weighted": <score × 0.10>,
      "fraudRisk": "<risk>", "signals": ["<signal>"], "assessment": "<sentence>"
    },
    // For URL_MODE (5 URL signals):
    "urlTypePattern": {
      "score": <-15 to +5>, "weight": 0.25, "assessment": "<sentence>"
    },
    "platformCharacteristics": {
      "score": <-8 to +5>, "weight": 0.20, "assessment": "<sentence>"
    },
    "urlStructure": {
      "score": <-15 to +5>, "weight": 0.20, "assessment": "<sentence>"
    },
    "outboundLinkUrl": {
      "score": <-10 to +3>, "weight": 0.15, "assessment": "<sentence>"
    },
    "platformAccessLimitation": {
      "score": <-10 to 0>, "weight": 0.20, "assessment": "<sentence>"
    }
  },
  "aggregation": {
    "modeUsed": "<TEXT_MODE|URL_MODE>",
    "rawScore": <sum before adjustments>,
    "dominanceAdjustment": <-3 to +3>,
    "microAdjustment": <-2 to +2>,
    "adjustedScore": <after adjustments>,
    "hardLimitApplied": "<none|ceiling|floor|fraud_floor>",
    "finalScore": <after hard limits, TEXT_MODE: 22-70, URL_MODE: 28-58>,
    "dominantSignal": "<signal name>",
    "variabilityReason": "<brief explanation>"
  },
  "breakdown": {
    "sources": {"points": 0, "reason": "${language === 'fr' ? 'Non applicable aux réseaux sociaux' : 'Not applicable to social media'}"},
    "factual": {"points": <-10 to +10>, "reason": "<reason>"},
    "tone": {"points": <-15 to +10>, "reason": "<reason>"},
    "context": {"points": <-10 to +5>, "reason": "<reason>"},
    "transparency": {"points": <-10 to +5>, "reason": "<reason>"},
    "freshness": {"points": <-5 to +5>, "reason": "<reason>"},
    "prudence": {"points": <-5 to +5>, "reason": "<reason>"},
    "density": {"points": <-5 to +5>, "reason": "<reason>"},
    "attribution": {"points": <-5 to +5>, "reason": "<reason>"},
    "visualCoherence": {"points": <-5 to +5>, "reason": "<reason>"}
  },
  "summary": "<2-3 sentences: MUST state whether score is based on TEXT_MODE or URL_MODE. Describe dominant signals.>",
  "articleSummary": "<DESCRIPTIVE SUMMARY - see rules below>",
  "confidence": "<low|medium|high>",
  "disclaimer": "${language === 'fr' ? "Ce score reflète les signaux de crédibilité d'une publication sur les réseaux sociaux, pas une vérification factuelle." : 'This score reflects credibility signals of a social media post, not factual verification.'}"
}

=============================================================================
SUMMARY FIELD RULES BASED ON analysis_mode (CRITICAL)
=============================================================================

IF analysis_mode = "TEXT_MODE":
"The score is based on text analysis of the user-provided post content. [Describe dominant signals from 7-signal model]."

IF analysis_mode = "URL_MODE":
${language === 'fr' ? '"Le texte de la publication n\'a pas pu être lu. Le score est basé uniquement sur les signaux au niveau de l\'URL. [Décrire les signaux URL]."' : '"Post text could not be read. The score is based on URL-level signals only. [Describe URL-level signals]."'}
${language === 'fr' ? '"Note: L\'impossibilité de lire le contenu ne signifie pas que la publication est fausse."' : '"Note: Inability to read content does not imply the post is false."'}

=============================================================================
ARTICLE SUMMARY RULES (CRITICAL - Summary ≠ Analysis)
=============================================================================

FOR TEXT_MODE (MANDATORY):
- The articleSummary is REQUIRED and cannot be empty
- Describe WHAT the post claims (main topic, assertion, or message)
- Use neutral, factual, descriptive language (2-3 sentences)
- Focus on the content itself, not its credibility

FOR URL_MODE (NO CONTENT SUMMARY):
- articleSummary MUST be: ${language === 'fr' ? '"Le contenu de cette publication n\'a pas pu être extrait."' : '"The content of this post could not be extracted."'}
- Do NOT attempt to summarize what the post says
- Do NOT pretend the message was read
- Do NOT fabricate or assume post content

FORBIDDEN IN ALL MODES:
- NO credibility judgments ("unverified", "questionable", "suspicious")
- NO analysis language ("the post lacks", "no sources provided")
- NO references to the score or assessment
- NO evaluative adjectives

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
  "articleSummary": "<DESCRIPTIVE SUMMARY - see rules below>",
  "confidence": "<low|medium|high>"
}

=============================================================================
ARTICLE SUMMARY RULES (CRITICAL - Summary ≠ Analysis)
=============================================================================
The "articleSummary" field must be a FACTUAL, DESCRIPTIVE summary of the article.

REQUIRED:
- Describe WHAT the article reports (main story, facts, narrative)
- Use neutral, informational language
- Include key details: who, what, where, when
- 2-4 short, clear sentences

FORBIDDEN:
- NO credibility judgments or analysis language
- NO references to journalistic quality or sources
- NO evaluative terms ("reliable", "well-sourced", "questionable")
- NO phrases that editorialize the content

EXAMPLES:
✓ GOOD: "The article reports on a summit meeting between European leaders in Brussels. It covers discussions about economic cooperation and climate agreements, with statements from the French and German delegations."
✗ BAD: "The article presents a well-sourced account of a summit meeting. Multiple officials are quoted, lending credibility to the reporting."

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
  "articleSummary": "<DESCRIPTIVE SUMMARY - see rules below>",
  "confidence": "<low|medium|high>"
}

=============================================================================
ARTICLE SUMMARY RULES (CRITICAL - Summary ≠ Analysis)
=============================================================================
The "articleSummary" field must be a FACTUAL, DESCRIPTIVE summary of the content.

REQUIRED:
- Describe WHAT the content says (main topic, claim, or message)
- Use neutral, informational language
- Include context: who says what, about what
- 2-4 short, clear sentences

FORBIDDEN:
- NO credibility judgments ("unverified", "questionable", "appears to be")
- NO analysis language ("the content lacks", "no sources provided")
- NO warnings or evaluative terms
- NO references to the score or analysis
- NO phrases like "claims" or "allegedly" that imply doubt

EXAMPLES:
✓ GOOD: "The page discusses benefits of a new software tool for project management. It describes features including task tracking, team collaboration, and integration with popular platforms."
✗ BAD: "The content makes unsupported claims about software benefits without citing sources or evidence."

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
    
    // Generate unique analysis ID to prevent score reuse
    const analysisId = crypto.randomUUID();
    console.log(`[ANALYSIS START] ID: ${analysisId}, Timestamp: ${new Date().toISOString()}`);
    
    // Detect URL type for routing (only for Standard analysis)
    const urlDetection = detectUrlType(content);
    const { type: urlType, detectedDomain, classification, analysisRoute } = urlDetection;
    
    console.log(`[URL CLASSIFICATION] Type: ${urlType}`);
    console.log(`[URL CLASSIFICATION] Domain: ${detectedDomain || 'N/A'}`);
    console.log(`[URL CLASSIFICATION] Classification: ${classification}`);
    console.log(`[URL CLASSIFICATION] Route: ${analysisRoute}`);
    
    // CRITICAL: For social media, explicitly log the routing decision
    if (urlType === 'SOCIAL_POST') {
      console.log(`[SOCIAL ROUTING] ⚠️ SOCIAL MEDIA DETECTED`);
      console.log(`[SOCIAL ROUTING] Classification: "Social Media Post – Weak Signal Content"`);
      console.log(`[SOCIAL ROUTING] DO NOT use standard web article credibility logic`);
      console.log(`[SOCIAL ROUTING] DO NOT reuse scores from previous analyses`);
      console.log(`[SOCIAL ROUTING] Initiating fresh Social Credibility Logic analysis...`);
    }
    
    // Select the appropriate system prompt based on analysis type and URL type
    let systemPrompt: string;
    if (isPro) {
      systemPrompt = getProSystemPrompt(language || 'en');
      console.log('[PROMPT SELECTION] Using Pro analysis prompt');
    } else {
      switch (urlType) {
        case 'SOCIAL_POST':
          systemPrompt = getSocialPostPrompt(language || 'en');
          console.log('[PROMPT SELECTION] Using SOCIAL_POST plausibility model (weighted sub-analyses)');
          break;
        case 'NEWS_ARTICLE':
          systemPrompt = getNewsArticlePrompt(language || 'en');
          console.log('[PROMPT SELECTION] Using NEWS_ARTICLE editorial reliability model');
          break;
        default:
          systemPrompt = getWebOtherPrompt(language || 'en');
          console.log('[PROMPT SELECTION] Using WEB_OTHER generic analysis model');
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
