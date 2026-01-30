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
// Linguistic credibility diagnostic - answers the question WITHOUT proving it
const getSystemPrompt = (language: string) => {
  const isFr = language === 'fr';
  const dateInfo = getCurrentDateInfo();
  
  return `You are LeenScore Standard Scan - a LINGUISTIC credibility diagnostic tool.

===== CRITICAL ROLE DEFINITION =====

Standard Analysis ANSWERS the question: "Does this text show credibility red flags?"
Standard Analysis does NOT PROVE anything - that's what PRO does.

You analyze LINGUISTIC SIGNALS ONLY:
- How the text is written (tone, structure, style)
- Red flag patterns (sensationalism, manipulation tactics)
- Internal logical consistency
- Claim presentation quality

You DO NOT:
- Search the web
- Cite external sources
- Verify factual accuracy against real-world data
- Provide corroboration or evidence links

IMPORTANT: Respond entirely in ${isFr ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${dateInfo.formatted} (${dateInfo.year})

===== STANDARD OUTPUT CONSTRAINTS =====

MUST INCLUDE:
1. Trust Score (0-100) based on linguistic signals
2. Risk level: Low, Moderate, or High
3. Exactly 3 short, high-level reasons (one sentence each)
4. A concise summary (25-50 words)
5. Confidence level (low/medium/high)
6. A clear disclaimer that this is a limited analysis

MUST NOT INCLUDE:
- Source lists or external links
- Web corroboration details
- Detailed multi-paragraph explanations
- Point breakdowns visible to user
- Badges or internal scoring systems
- Factual verification claims

===== SEMANTIC ANALYSIS LAYERS (INTERNAL ONLY) =====

Evaluate through these 4 linguistic lenses:

LAYER 1: CLAIM DETECTION (20% weight)
- Concrete, verifiable claims with specifics = positive (+3 to +8)
- Vague assertions = neutral to negative (-2 to +2)
- Pure opinion with no claims = neutral (0)

LAYER 2: SENSATIONALISM & MANIPULATION (30% weight) — HIGHEST PRIORITY
Red flags:
- ALL CAPS for emphasis
- Urgent share phrases ("share before deleted", "they don't want you to know")
- Fear/outrage language ("shocking", "BREAKING", "exposed")
- Conspiracy framing
Scoring: 0 (none) to -20 (heavy manipulation)
SPECIAL: If score <= -15, cap final score at 45

LAYER 3: LOGICAL CONSISTENCY (25% weight)
- Coherent, non-contradictory = +5 to +10
- Minor gaps = 0 to +4
- Contradictions = -5 to -15

LAYER 4: EVIDENCE STRUCTURE (25% weight)
- Well-structured, neutral = +5 to +10
- Disorganized/emotional = -5 to -15

===== SCORING (INTERNAL - NEVER EXPOSE) =====

BASE: 50 points
Apply weighted layer adjustments
FINAL RANGE: 5 to 98 (never 0 or 100)

RISK CLASSIFICATION:
- 70-100: Low Risk
- 40-69: Moderate Risk
- 0-39: High Risk

===== REASON WRITING RULES =====

Each reason must be:
- ONE sentence only
- High-level observation (not detailed analysis)
- Tied to a specific detected pattern
- Written for general audience (no jargon)

Example good reasons:
- "The text uses urgent, emotionally charged language typical of viral content."
- "Claims are presented without supporting context or verifiable details."
- "The writing style is structured and maintains a neutral, factual tone."

Example BAD reasons (too detailed for Standard):
- "Analysis of 47 sources confirms the claim aligns with WHO guidelines..."
- "Cross-referencing Reuters, BBC, and official data shows..."

===== OUTPUT FORMAT =====

{
  "score": <number 5-98>,
  "analysisType": "standard",
  "riskLevel": "<low|moderate|high>",
  "inputType": "<factual_claim|opinion|vague_statement|question|mixed>",
  "domain": "<politics|health|security|science|technology|general>",
  "reasons": [
    "<high-level reason 1>",
    "<high-level reason 2>",
    "<high-level reason 3>"
  ],
  "breakdown": {
    "sources": {"points": 0, "reason": "${isFr ? 'Non évalué - disponible en PRO' : 'Not evaluated - available in PRO'}"},
    "factual": {"points": <number>, "reason": "<brief observation>"},
    "prudence": {"points": <number>, "reason": "<brief observation>"},
    "context": {"points": <number>, "reason": "<brief observation>"},
    "transparency": {"points": <number>, "reason": "<brief observation>"}
  },
  "semanticSignals": {
    "claimsDetected": <boolean>,
    "claimTypes": ["<types>"],
    "sensationalismLevel": "<none|mild|moderate|high>",
    "manipulationPatterns": ["<patterns if any>"],
    "logicalCoherence": "<strong|moderate|weak|incoherent>",
    "evidenceStructure": "<well_structured|moderate|poor|absent>"
  },
  "summary": "<25-50 words: what linguistic signals suggest about credibility>",
  "articleSummary": "<factual summary of what the text claims>",
  "confidence": <number 0.00-1.00>,
  "confidenceLevel": "<low|medium|high>",
  "disclaimer": "${isFr ? 'Ceci est une analyse linguistique limitée. Pour une vérification factuelle avec corroboration des sources, passez à PRO.' : 'This is a limited linguistic analysis. For factual verification with source corroboration, upgrade to PRO.'}"
}

===== UX PRINCIPLE =====

Standard ANSWERS: "This text shows X linguistic patterns that suggest Y credibility level."
Standard does NOT prove: "This claim is true/false because sources confirm..."

The gap between Standard and PRO must be IMMEDIATELY OBVIOUS.
Standard is intentionally limited to drive PRO value.

ALL text in ${isFr ? 'FRENCH' : 'ENGLISH'}.`;
};

// PRO ANALYSIS PROMPT - Credibility Intelligence Engine with Web Corroboration
// PRO PROVES the answer with evidence and detailed reasoning
const getProSystemPrompt = (language: string) => {
  const isFr = language === 'fr';
  const dateInfo = getCurrentDateInfo();
  
  return `You are LeenScore PRO - an advanced credibility intelligence engine with web corroboration.

===== CRITICAL ROLE DEFINITION =====

PRO Analysis PROVES the answer: "This claim is true/false/uncertain, and here is the evidence."

While Standard Analysis only examines linguistic patterns, PRO goes further:
- Searches and verifies against real-world information
- Provides corroborating sources with direct article links
- Delivers detailed reasoning explaining WHY the claim is credible or not
- Shows explicit evidence that users can verify themselves

The difference must be IMMEDIATELY OBVIOUS:
- Standard ANSWERS the question
- PRO PROVES the answer

IMPORTANT: Respond entirely in ${isFr ? 'FRENCH' : 'ENGLISH'}.

CURRENT DATE: ${dateInfo.formatted} (${dateInfo.year})

===== DYNAMIC FACT VERIFICATION MODE =====

CRITICAL: When a claim involves TIME-SENSITIVE REAL-WORLD FACTS, activate Dynamic Fact Verification Mode.
These claims require TEMPORAL AWARENESS because their truth value changes over time.
Static background knowledge is UNRELIABLE for these topics.

TIME-SENSITIVE CATEGORIES (REQUIRE DYNAMIC VERIFICATION):

1. CURRENT LEADERSHIP POSITIONS:
   - Heads of state: presidents, monarchs, prime ministers, chancellors
   - Government officials: ministers, secretaries, governors, mayors
   - International organizations: UN Secretary-General, WHO Director, IMF head
   - Corporate leadership: CEO, CFO, chairman of major companies
   - Judicial positions: chief justice, attorney general
   - Military leadership: commanders, generals, admirals

2. ACTIVE GEOPOLITICAL SITUATIONS:
   - Ongoing wars and armed conflicts
   - Active peace negotiations or ceasefires
   - Current sanctions and embargoes
   - Territorial disputes and occupations
   - Humanitarian crises in progress

3. RECENT LEGISLATION AND POLICIES:
   - Recently passed or repealed laws
   - Current government policies
   - Active executive orders or decrees
   - Pending legislation under debate
   - Recent court rulings with ongoing effects

4. CURRENT EVENTS AND SITUATIONS:
   - Ongoing elections or political transitions
   - Active natural disasters or emergencies
   - Current economic conditions (inflation, interest rates)
   - Ongoing investigations or trials
   - Recent deaths, resignations, or appointments

5. EVOLVING SCIENTIFIC/HEALTH FACTS:
   - Current pandemic status or health emergencies
   - Recently updated medical guidelines
   - Evolving scientific consensus on active research

===== MANDATORY DYNAMIC VERIFICATION RULES =====

RULE 1 - TEMPORAL CONTEXT ANCHOR:
- The current date is ${dateInfo.formatted}. Use this as your absolute reference.
- For ANY time-sensitive claim, verify it is accurate AS OF TODAY.
- Do NOT assume your training data reflects the current state of the world.
- Treat claims with implicit "now" or "current" as requiring active verification.

RULE 2 - REJECT STATIC BACKGROUND KNOWLEDGE:
- Do NOT rely on generalized or memorized knowledge for time-sensitive topics.
- Your training data may be months or years outdated.
- If you cannot find a recent authoritative source, EXPLICITLY STATE UNCERTAINTY.
- Never confidently assert time-sensitive facts without a dated, verifiable source.

RULE 3 - SOURCE RECENCY REQUIREMENTS:
- For leadership roles: Require sources from ${dateInfo.year} or late ${dateInfo.year - 1}
- For active conflicts: Require sources from the last 3-6 months
- For recent events: Require sources from the relevant time period
- For legislation: Require official government sources with dates
- REJECT: Undated sources or sources clearly outdated for the topic

RULE 4 - AUTHORITATIVE SOURCE HIERARCHY (strict order):
   1. Official government/institutional websites (.gov, .gouv, ministry sites)
   2. International organization sites (un.org, who.int, nato.int, eu.europa.eu)
   3. Major wire services: Reuters, AP, AFP (date-stamped articles)
   4. Major recognized international news: BBC, CNN, NYT, Le Monde, Der Spiegel, The Guardian
   5. Recently updated reference sources: Wikipedia (check revision date), official portals

RULE 5 - SOURCE QUALITY PENALTIES:
   - Undated sources: -30 credibility points (temporal accuracy unverifiable)
   - Sources older than 2 years for current facts: -25 points
   - Sources older than 1 year for current facts: -15 points
   - Opinion blogs or non-institutional content: -20 points
   - Social media without official verification: -25 points
   - Sources contradicted by more recent official sources: -35 points

RULE 6 - CONFLICT RESOLUTION PRIORITY:
   - ALWAYS prefer the most recent AND institutionally authoritative source
   - Official government announcement > Wire service > Major news > Encyclopedia
   - A ${dateInfo.year} source from official government outweighs a ${dateInfo.year - 2} source from major media
   - When sources conflict on current facts, choose recency over historical authority
   - If conflict cannot be resolved, note the discrepancy in your summary

RULE 7 - MANDATORY TEMPORAL MARKERS IN OUTPUT:
   - For leadership claims: "As of [month/year], [person] holds [role] according to [source]."
   - For ongoing situations: "As of [date], [situation] is [status] per [source]."
   - For recently changed facts: "This was accurate until [date], but [new fact] as of [date]."
   - If uncertain: "As of [date], available sources indicate [X], but this requires verification."

RULE 8 - SCORING IMPACT FOR TIME-SENSITIVE CLAIMS:
   - Verified with ${dateInfo.year} official/authoritative sources: +15 to score
   - Verified with ${dateInfo.year - 1} sources only: +5 to score
   - Uses outdated information (>1 year for current facts): cap score at 45
   - Presents past facts as current: cap score at 35
   - Cannot find recent verification: cap score at 50, add explicit uncertainty note
   - Contradicts recent authoritative sources: cap score at 30

===== PRO-EXCLUSIVE FEATURES =====

PRO MUST include (Standard cannot):
1. CORROBORATING SOURCES: Up to 10 sources with direct article links
2. BEST EVIDENCE: 4 curated top sources for immediate user verification
3. DETAILED REASONING: Multi-sentence explanation of credibility factors
4. TRUST INDICATORS: Explicit trustTier for each source (high/medium/low)
5. STANCE ANALYSIS: Clear categorization (corroborating/neutral/contradicting)
6. CORROBORATION OUTCOME: Explicit verdict (corroborated/neutral/refuted)

===== SUMMARY STYLE (PRO-EXCLUSIVE DEPTH) =====

PRO summaries follow a STRICT 3-SENTENCE FRAMEWORK:

SENTENCE 1 - QUALIFICATION:
Clearly qualify the claim:
- "false" or "unsupported"
- "misleading" or "half-true"
- "factually accurate but incomplete"
- "factually accurate"

SENTENCE 2 - FACTUAL ANCHOR:
Present a concrete, verifiable fact with:
- Names, dates, or documented context
- Reference to what sources confirm
- Evidence that users can verify

SENTENCE 3 - INTELLIGENT CONTEXT (optional):
Add clarifying nuance:
- Time frame limitations
- Scope clarifications
- Common misunderstandings

EXAMPLE PRO SUMMARY:
"The claim is factually inaccurate. According to WHO data and peer-reviewed research from 2023, the actual figure is X, not Y as stated. This is a common misconception that confuses correlation with causation."

EXAMPLE STANDARD SUMMARY (for comparison - NOT what PRO should produce):
"The text uses neutral language and presents verifiable claims with specific details."

===== SCORING (INTERNAL ONLY - NEVER EXPOSE) =====

Internal credibility weighting:
- Claim Gravity (30%): Severity and impact of claims
- Logical Coherence (30%): Internal consistency
- Web Corroboration (40%): Evidence from authoritative sources

BASE: 50 points
FINAL RANGE: 5 to 98

RISK CLASSIFICATION:
- 70-100: low
- 40-69: medium
- 0-39: high

===== SOURCE QUALITY RULES (MANDATORY) =====

QUALITY OVER QUANTITY - Accuracy and precision are mandatory.

1) DIRECT ARTICLE URLs ONLY:
   - Every source MUST link to a specific article that directly addresses the claim
   - NEVER include: homepages, category pages, search results, tag pages

2) ZERO TOLERANCE FOR WEAK SOURCES:
   - If no precise corroborating article exists, return ZERO sources
   - Do NOT invent URLs
   - Do NOT include tangentially related sources

3) STRICT DEDUPLICATION:
   - One source per domain maximum
   - Deduplicate by exact URL

4) HIGH-CREDIBILITY PRIORITIZATION:
   - Official sources (.gov, .edu) > Major institutions > Established media > Other
   - Primary sources always rank above secondary reporting

===== TRUST TIERS =====

- "high": Official/government (.gov, .edu), major institutions (WHO, CDC, NASA), encyclopedias (Wikipedia, Britannica), peer-reviewed journals
- "medium": Established media (BBC, Reuters, AP, NYT), reputable secondary sources
- "low": Less established sources, opinion content

===== STANCE CATEGORIES =====

- "corroborating": Source directly confirms the claim with evidence
- "neutral": Source provides context without strong support/contradiction
- "contradicting": Source refutes the claim with evidence

===== OUTPUT FORMAT =====

{
  "status": "ok",
  "result": {
    "score": <number 5-98>,
    "riskLevel": "<low|medium|high>",
    "summary": "<PRO-depth summary following 3-sentence framework with factual anchors>",
    "confidence": <number 0.00-1.00>,
    "bestLinks": [
      {
        "title": "<Exact article headline>",
        "publisher": "<Organization name>",
        "url": "<https://... direct article link>",
        "trustTier": "<high|medium|low>",
        "stance": "<corroborating|neutral|contradicting>",
        "whyItMatters": "<${isFr ? 'Explication précise de la pertinence' : 'Precise explanation of relevance'}>"
      }
    ],
    "sources": [<up to 10 sources with same structure>]
  },
  "analysisType": "pro",
  "articleSummary": "<factual summary of what the text claims>",
  "corroboration": {
    "outcome": "<corroborated|neutral|constrained|refuted>",
    "sourcesConsulted": <number 1-10>
  },
  "proDisclaimer": "${isFr ? "Cette évaluation reflète la plausibilité selon les informations disponibles, pas une vérité absolue." : 'This assessment reflects plausibility based on available information, not absolute truth.'}"
}

===== LIST RULES =====

- bestLinks: Max 4 items. Only strongest evidence. Never pad with weak sources.
- sources: Max 10 items across all stances.
- bestLinks must be subset of sources.
- Diversity of publishers preferred.

ALL text in ${isFr ? 'FRENCH' : 'ENGLISH'}.`;
};

// Deep clone utility to ensure original data is never mutated
const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj));

// ===== PRO SOURCE SANITIZATION HELPERS =====

// Extract domain from URL (without www)
const getDomainFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

// Check if URL is a valid deep article link (not homepage/section/search)
const isValidDeepLink = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    const search = parsed.search;
    
    // Reject if too short (likely homepage)
    if (pathname === '/' || pathname.length < 5) {
      return false;
    }
    
    // Reject search result pages
    if (search && (search.includes('q=') || search.includes('query=') || search.includes('search='))) {
      return false;
    }
    
    // Hub/section/category patterns to reject
    const HUB_PATHS = [
      '/news', '/politics', '/world', '/business', '/sports', '/entertainment',
      '/opinion', '/lifestyle', '/technology', '/science', '/health', '/travel',
      '/search', '/video', '/live', '/tag/', '/category/', '/topic/', '/section/',
      '/author/', '/archive/', '/index', '/home', '/latest', '/trending',
      '/topics/', '/tags/', '/authors/', '/contributors/', '/about', '/contact',
      '/subscribe', '/newsletters', '/podcast', '/podcasts', '/all-news'
    ];
    
    for (const hub of HUB_PATHS) {
      if (pathname === hub || pathname === hub + '/' || pathname.startsWith(hub + '/') && pathname.split('/').filter(Boolean).length <= 2) {
        return false;
      }
    }
    
    // Reject Wikipedia category/portal/special pages
    const domain = getDomainFromUrl(url);
    if (domain.includes('wikipedia.org')) {
      if (pathname.includes('/Category:') || pathname.includes('/Portal:') || 
          pathname.includes('/Special:') || pathname.includes('/Help:') ||
          pathname.includes('/Wikipedia:') || pathname.includes('/Template:')) {
        return false;
      }
      // Valid Wikipedia article
      if (pathname.startsWith('/wiki/') && pathname.length > 7) {
        return true;
      }
    }
    
    // Trusted domains can pass with article-like paths
    const TRUSTED_DOMAINS = [
      'wikipedia.org', 'britannica.com', 'who.int', 'cdc.gov', 'nih.gov',
      'nasa.gov', 'nature.com', 'sciencedirect.com', 'pubmed.ncbi.nlm.nih.gov',
      'scholar.google.com', 'arxiv.org'
    ];
    
    const isTrusted = TRUSTED_DOMAINS.some(d => domain.includes(d)) ||
      domain.endsWith('.gov') || domain.endsWith('.edu');
    
    if (isTrusted && pathname.length > 10) {
      return true;
    }
    
    // For non-trusted, require strong article-like patterns
    const segments = pathname.split('/').filter(Boolean);
    
    // Must have at least 2 path segments (e.g., /2024/01/article-slug)
    if (segments.length < 2) {
      return false;
    }
    
    // Check for article patterns
    const hasDatePattern = /\/\d{4}\/\d{2}\//.test(pathname) || /\/\d{4}-\d{2}-\d{2}/.test(pathname);
    const hasArticleKeyword = pathname.includes('/article') || pathname.includes('/story') || 
                              pathname.includes('/post') || pathname.includes('/news/');
    const hasLongSlug = segments.some(seg => seg.length > 15 && seg.includes('-'));
    const hasNumericId = segments.some(seg => /^\d{5,}$/.test(seg) || /^[a-f0-9]{8,}$/.test(seg));
    
    return hasDatePattern || hasArticleKeyword || hasLongSlug || hasNumericId;
  } catch {
    return false;
  }
};

// PRO source with stance field
interface ProSource {
  title: string;
  publisher: string;
  url: string;
  trustTier: 'high' | 'medium' | 'low';
  stance: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters: string;
}

// Sanitize and deduplicate PRO sources (supports both bestLinks and sources arrays)
const sanitizeProSources = (sources: any[], limit: number = 10): ProSource[] => {
  if (!Array.isArray(sources) || sources.length === 0) {
    return [];
  }
  
  const tierOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  
  // Filter to valid deep links only
  const validSources = sources.filter((src: any) => 
    src && typeof src.url === 'string' && isValidDeepLink(src.url)
  );
  
  // Deduplicate by domain, keeping highest trust tier
  const byDomain = new Map<string, ProSource>();
  
  for (const src of validSources) {
    const domain = getDomainFromUrl(src.url);
    const existing = byDomain.get(domain);
    const srcTier = src.trustTier || 'medium';
    const srcStance = src.stance || 'neutral';
    
    if (!existing || (tierOrder[srcTier] ?? 1) < (tierOrder[existing.trustTier] ?? 1)) {
      byDomain.set(domain, {
        title: String(src.title || 'Source'),
        publisher: String(src.publisher || domain),
        url: String(src.url),
        trustTier: srcTier as 'high' | 'medium' | 'low',
        stance: srcStance as 'corroborating' | 'neutral' | 'contradicting',
        whyItMatters: String(src.whyItMatters || '')
      });
    }
  }
  
  // Sort by trust tier and apply limit
  return Array.from(byDomain.values())
    .sort((a, b) => (tierOrder[a.trustTier] ?? 1) - (tierOrder[b.trustTier] ?? 1))
    .slice(0, limit);
};

// ===== LIVE URL VALIDATION =====

// Check if a URL is live (responds with 200-399)
const isLiveUrl = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; LeenScoreBot/1.0)',
      'Accept': 'text/html,*/*',
    };
    
    // Try HEAD first (lighter)
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers,
        redirect: 'follow',
      });
      
      // If HEAD returns 403/405, some servers block HEAD - fallback to GET
      if (response.status === 403 || response.status === 405) {
        response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers,
          redirect: 'follow',
        });
      }
    } catch {
      // HEAD failed, try GET
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers,
        redirect: 'follow',
      });
    }
    
    clearTimeout(timeout);
    
    // Accept 2xx and 3xx as valid (also accept 403 for trusted domains that block bots)
    const status = response.status;
    if (status >= 200 && status < 400) {
      return true;
    }
    
    // Allow 403 for known trusted domains that block bots
    if (status === 403) {
      const domain = getDomainFromUrl(url);
      const TRUSTED_ALLOW_403 = ['britannica.com', 'wikipedia.org', 'nature.com', 'nytimes.com', 'bbc.com'];
      if (TRUSTED_ALLOW_403.some(d => domain.includes(d)) || domain.endsWith('.gov') || domain.endsWith('.edu')) {
        return true;
      }
    }
    
    return false;
  } catch {
    // Network error, timeout, or abort
    return false;
  }
};

// Validate bestLinks and replace invalid ones with live candidates from sources
const validateAndReplaceBestLinks = async (
  bestLinks: ProSource[],
  allSources: ProSource[]
): Promise<ProSource[]> => {
  if (bestLinks.length === 0) {
    return [];
  }
  
  // Track domains already used
  const usedDomains = new Set<string>();
  const validatedBest: ProSource[] = [];
  let totalChecks = 0;
  const MAX_CHECKS = 8; // Performance cap
  
  // First, validate the original bestLinks
  for (const link of bestLinks) {
    if (totalChecks >= MAX_CHECKS) break;
    
    totalChecks++;
    const isLive = await isLiveUrl(link.url);
    
    if (isLive) {
      const domain = getDomainFromUrl(link.url);
      usedDomains.add(domain);
      validatedBest.push(link);
    }
  }
  
  // If we have 4 valid links, we're done
  if (validatedBest.length >= 4) {
    return validatedBest.slice(0, 4);
  }
  
  // Find replacement candidates from sources (not in usedDomains)
  const replacementCandidates = allSources.filter(src => {
    const domain = getDomainFromUrl(src.url);
    // Not already used and not already in bestLinks
    return !usedDomains.has(domain) && !bestLinks.some(b => b.url === src.url);
  });
  
  // Try replacements until we have 4 or run out
  for (const candidate of replacementCandidates) {
    if (validatedBest.length >= 4 || totalChecks >= MAX_CHECKS) break;
    
    totalChecks++;
    const isLive = await isLiveUrl(candidate.url);
    
    if (isLive) {
      const domain = getDomainFromUrl(candidate.url);
      usedDomains.add(domain);
      validatedBest.push(candidate);
    }
  }
  
  return validatedBest;
};

// Convert numeric confidence to legacy tier
const confidenceToTier = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.45) return 'medium';
  return 'low';
};

// Normalize PRO response to legacy-compatible format (async for live URL validation)
const normalizeProResponse = async (analysisResult: any): Promise<any> => {
  // If no nested result object, already in legacy format
  if (!analysisResult.result) {
    return analysisResult;
  }
  
  const result = analysisResult.result;
  
  // Mirror core fields at top level for UI compatibility
  analysisResult.score = Number(result.score ?? analysisResult.score ?? 50);
  analysisResult.riskLevel = result.riskLevel ?? analysisResult.riskLevel;
  analysisResult.summary = result.summary ?? analysisResult.summary;
  
  // Convert numeric confidence to legacy tier at top level
  if (typeof result.confidence === 'number') {
    analysisResult.confidence = confidenceToTier(result.confidence);
    analysisResult.confidenceLevel = analysisResult.confidence;
  }
  
  // First, sanitize sources (limit to 10) - we need this pool for replacement
  let sanitizedSources: ProSource[] = [];
  if (Array.isArray(result.sources)) {
    sanitizedSources = sanitizeProSources(result.sources, 10);
    result.sources = sanitizedSources;
  }
  
  // Sanitize bestLinks (limit to 4), then validate with live checks and replace dead links
  if (Array.isArray(result.bestLinks)) {
    const sanitizedBest = sanitizeProSources(result.bestLinks, 4);
    
    // Validate live URLs and replace dead ones from sources pool
    const validatedBest = await validateAndReplaceBestLinks(sanitizedBest, sanitizedSources);
    result.bestLinks = validatedBest;
    
    // Ensure all bestLinks exist in sources (add replacements if needed)
    const sourceUrls = new Set(sanitizedSources.map(s => s.url));
    for (const best of validatedBest) {
      if (!sourceUrls.has(best.url)) {
        sanitizedSources.push(best);
      }
    }
    result.sources = sanitizedSources;
  }
  
  // Build legacy corroboration structure from sources
  if (Array.isArray(result.sources) && result.sources.length > 0) {
    const sourcesToProcess = result.sources as ProSource[];
    
    // Categorize sources by stance for legacy corroboration structure
    const corroborated: any[] = [];
    const contradicting: any[] = [];
    const neutral: any[] = [];
    
    for (const src of sourcesToProcess) {
      const legacySource = {
        name: src.title,
        url: src.url,
        snippet: src.whyItMatters,
        trustTier: src.trustTier
      };
      
      if (src.stance === 'corroborating') {
        corroborated.push(legacySource);
      } else if (src.stance === 'contradicting') {
        contradicting.push(legacySource);
      } else {
        neutral.push(legacySource);
      }
    }
    
    // Create/update legacy corroboration structure for backward compat
    if (!analysisResult.corroboration) {
      analysisResult.corroboration = { outcome: 'neutral', sourcesConsulted: sourcesToProcess.length };
    }
    
    analysisResult.corroboration.sources = {
      corroborated,
      contradicting,
      neutral
    };
    
    // Update outcome based on stance distribution
    if (contradicting.length > corroborated.length) {
      analysisResult.corroboration.outcome = 'refuted';
    } else if (corroborated.length > 0) {
      analysisResult.corroboration.outcome = 'corroborated';
    }
  }
  
  return analysisResult;
};

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
      
      // PRO bestLinks - preserve structure, allow translated whyItMatters
      const origBestLinks = originalData.result?.bestLinks;
      const translatedBestLinks = translated.result?.bestLinks;
      
      if (origBestLinks && Array.isArray(origBestLinks)) {
        const processedBestLinks = origBestLinks.map((origLink: any, idx: number) => {
          const translatedLink = translatedBestLinks?.[idx] || {};
          return {
            title: origLink.title,
            publisher: origLink.publisher,
            url: origLink.url,
            trustTier: origLink.trustTier,
            stance: origLink.stance,
            whyItMatters: translatedLink.whyItMatters || origLink.whyItMatters
          };
        });
        
        if (!translated.result) translated.result = {};
        translated.result.bestLinks = processedBestLinks;
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
            stance: origSource.stance,
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
      
      // Build fallback with both legacy and PRO format support
      const fallbackResponse: any = {
        score: 50,
        analysisType: isPro ? 'pro' : 'standard',
        summary: fallbackMsg,
        confidence: 'low',
        confidenceLevel: 'low',
        isRetryFallback: true
      };
      
      if (isPro) {
        // PRO fallback with status/result structure including bestLinks
        fallbackResponse.status = 'ok';
        fallbackResponse.result = {
          score: 50,
          riskLevel: 'medium',
          summary: fallbackMsg,
          confidence: 0.3,
          bestLinks: [],
          sources: []
        };
        fallbackResponse.corroboration = {
          outcome: 'neutral',
          sourcesConsulted: 0,
          sources: { corroborated: [], contradicting: [], neutral: [] }
        };
      } else {
        // Standard fallback with breakdown
        fallbackResponse.breakdown = {
          sources: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" },
          factual: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" },
          tone: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" },
          context: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" },
          transparency: { points: 0, reason: language === 'fr' ? "Analyse indisponible" : "Analysis unavailable" }
        };
      }
      
      return new Response(
        JSON.stringify(fallbackResponse),
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

    // Normalize PRO response to ensure legacy compatibility (includes live URL validation)
    if (isPro) {
      console.log("Normalizing PRO response and validating live URLs...");
      analysisResult = await normalizeProResponse(analysisResult);
    }

    // Ensure score is within bounds (use normalized top-level score)
    analysisResult.score = Math.max(0, Math.min(100, Number(analysisResult.score) || 50));
    analysisResult.analysisType = isPro ? 'pro' : 'standard';

    // Also update nested result.score if present
    if (analysisResult.result) {
      analysisResult.result.score = analysisResult.score;
    }

    // Translate to French if needed (after consistent English analysis)
    if (language === 'fr') {
      console.log("Translating analysis to French...");
      
      // For PRO: temporarily remove result object to prevent translation issues
      // then restore after translation
      let savedResult: any = null;
      if (isPro && analysisResult.result) {
        savedResult = deepClone(analysisResult.result);
        delete analysisResult.result;
      }
      
      analysisResult = await translateAnalysisResult(analysisResult, 'fr', LOVABLE_API_KEY);
      
      // Restore PRO result object (sources URLs must not be translated)
      if (savedResult) {
        analysisResult.result = savedResult;
      }
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
