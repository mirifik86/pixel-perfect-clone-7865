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

// Language configuration for all 8 supported languages
const LANGUAGE_CONFIG: Record<string, { name: string; nativeName: string; riskLevels: { low: string; moderate: string; high: string }; standardDisclaimer: string; notEvaluated: string }> = {
  en: {
    name: 'ENGLISH',
    nativeName: 'English',
    riskLevels: { low: 'Low Risk', moderate: 'Moderate Risk', high: 'High Risk' },
    standardDisclaimer: 'This is a limited Standard analysis. A deeper investigation with source corroboration and detailed reasoning is available in PRO.',
    notEvaluated: 'Not evaluated in Standard analysis'
  },
  fr: {
    name: 'FRENCH',
    nativeName: 'Français',
    riskLevels: { low: 'Risque Faible', moderate: 'Risque Modéré', high: 'Risque Élevé' },
    standardDisclaimer: 'Ceci est une analyse Standard limitée. Une investigation approfondie avec corroboration des sources et raisonnement détaillé est disponible en PRO.',
    notEvaluated: 'Non évalué en analyse Standard'
  },
  es: {
    name: 'SPANISH',
    nativeName: 'Español',
    riskLevels: { low: 'Riesgo Bajo', moderate: 'Riesgo Moderado', high: 'Riesgo Alto' },
    standardDisclaimer: 'Este es un análisis Estándar limitado. Una investigación más profunda con corroboración de fuentes y razonamiento detallado está disponible en PRO.',
    notEvaluated: 'No evaluado en análisis Estándar'
  },
  de: {
    name: 'GERMAN',
    nativeName: 'Deutsch',
    riskLevels: { low: 'Niedriges Risiko', moderate: 'Mittleres Risiko', high: 'Hohes Risiko' },
    standardDisclaimer: 'Dies ist eine begrenzte Standardanalyse. Eine tiefere Untersuchung mit Quellenbestätigung und detaillierter Begründung ist in PRO verfügbar.',
    notEvaluated: 'In der Standardanalyse nicht bewertet'
  },
  pt: {
    name: 'PORTUGUESE',
    nativeName: 'Português',
    riskLevels: { low: 'Risco Baixo', moderate: 'Risco Moderado', high: 'Risco Alto' },
    standardDisclaimer: 'Esta é uma análise Padrão limitada. Uma investigação mais profunda com corroboração de fontes e raciocínio detalhado está disponível no PRO.',
    notEvaluated: 'Não avaliado na análise Padrão'
  },
  it: {
    name: 'ITALIAN',
    nativeName: 'Italiano',
    riskLevels: { low: 'Rischio Basso', moderate: 'Rischio Moderato', high: 'Rischio Alto' },
    standardDisclaimer: 'Questa è un\'analisi Standard limitata. Un\'indagine più approfondita con corroborazione delle fonti e ragionamento dettagliato è disponibile in PRO.',
    notEvaluated: 'Non valutato nell\'analisi Standard'
  },
  ja: {
    name: 'JAPANESE',
    nativeName: '日本語',
    riskLevels: { low: '低リスク', moderate: '中リスク', high: '高リスク' },
    standardDisclaimer: 'これは限定的なスタンダード分析です。ソースの裏付けと詳細な推論を含むより深い調査はPROで利用できます。',
    notEvaluated: 'スタンダード分析では評価されていません'
  },
  ko: {
    name: 'KOREAN',
    nativeName: '한국어',
    riskLevels: { low: '낮은 위험', moderate: '중간 위험', high: '높은 위험' },
    standardDisclaimer: '이것은 제한된 표준 분석입니다. 출처 확인 및 상세한 추론을 포함한 심층 조사는 PRO에서 이용 가능합니다.',
    notEvaluated: '표준 분석에서 평가되지 않음'
  }
};

const getLanguageConfig = (language: string) => {
  return LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en'];
};

// Standard Analysis Engine – LeenScore Standard Scan
// Advanced credibility diagnostic using semantic signal analysis
const getSystemPrompt = (language: string) => {
  const lang = getLanguageConfig(language);
  const dateInfo = getCurrentDateInfo();
  
  return `[LANGUAGE: ${lang.name}] You are LeenScore Standard Scan.

Your role is to provide an intelligent credibility diagnostic by analyzing semantic signals in the text.

⚠️ MANDATORY OUTPUT LANGUAGE: ${lang.name} (${lang.nativeName})
You MUST write ALL text fields (summary, reasons, articleSummary, breakdown reasons) in ${lang.name}.
Do NOT use English unless the language is English. This is non-negotiable.

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

===== SEMANTIC ANALYSIS LAYERS (INTERNAL ONLY) =====

You MUST evaluate the text through these 4 semantic lenses:

LAYER 1: CLAIM DETECTION
- Detect verifiable claims: specific events, numbers/statistics, named people/organizations/places, dates
- Concrete, clearly-phrased claims = positive signal (+3 to +8)
- Vague assertions without specifics = neutral to slightly negative (-2 to +2)
- No detectable claims (pure opinion/commentary) = neutral (0)

LAYER 2: SENSATIONALISM & EMOTIONAL MANIPULATION DETECTION
Look for these red flag patterns:
- ALL CAPS emphasis for emotional effect
- Urgent share phrases: "share before deleted", "they don't want you to know", "wake up", "spread this"
- Fear/outrage language: "shocking", "BREAKING", "you won't believe", "exposed"
- Conspiracy framing: "mainstream media won't tell you", "hidden truth"
- Extreme emotional appeals with no factual grounding
Scoring:
- No sensationalism detected = neutral (+0)
- Mild emotional language = slight negative (-3 to -5)
- Moderate sensationalism = negative (-8 to -12)
- Heavy manipulation patterns = strong negative (-15 to -20)

LAYER 3: INTERNAL LOGICAL CONSISTENCY
- Are statements internally coherent and non-contradictory?
- Is cause-effect reasoning sound?
- Do conclusions follow from stated premises?
Scoring:
- Strong internal logic, coherent arguments = positive (+5 to +10)
- Generally consistent with minor gaps = neutral (+0 to +4)
- Some contradictions or logical gaps = negative (-5 to -10)
- Major contradictions or incoherent reasoning = strong negative (-10 to -15)

LAYER 4: EVIDENCE-ORIENTED STRUCTURE
- Are claims explained with reasoning or context?
- Is the tone neutral and factual vs. emotionally charged?
- Is information presented in a structured, organized way?
Scoring:
- Well-structured, explanatory, neutral presentation = positive (+5 to +10)
- Reasonably organized, mostly neutral = neutral (+0 to +5)
- Disorganized or emotionally charged = negative (-5 to -10)
- Completely unstructured rant = strong negative (-10 to -15)

===== INTERNAL SCORING MODEL (INVISIBLE TO USER) =====

BASE: 50 points

CRITICAL: Scoring must NOT depend on text length. A 10-word claim and a 500-word article should be evaluated equally based on their semantic signals.

WEIGHTED LAYER AGGREGATION:

1. CLAIM DETECTION (20% weight)
   - Adjustment: -5 to +10 points

2. SENSATIONALISM DETECTION (30% weight) — HIGHEST WEIGHT
   - This is the most important red flag detector
   - Adjustment: -20 to +0 points (only negative or neutral)

3. INTERNAL LOGICAL CONSISTENCY (25% weight)
   - Adjustment: -15 to +10 points

4. EVIDENCE-ORIENTED STRUCTURE (25% weight)
   - Adjustment: -15 to +10 points

AGGREGATE SCORING:
- Sum all weighted adjustments to BASE (50)
- Apply bounds: minimum 5, maximum 98
- NEVER return 0 or 100

SPECIAL CASES:
- If SENSATIONALISM score is -15 or lower, cap final score at 45 regardless of other signals
- If text contains multiple manipulation patterns, apply cumulative penalties

CONFIDENCE CALCULATION (internal, output as decimal):
- High confidence (0.80-1.00): Clear signals, consistent text, unambiguous characteristics
- Medium confidence (0.50-0.79): Mixed signals, some ambiguity
- Low confidence (0.00-0.49): Unclear text, conflicting signals, insufficient data

RISK CLASSIFICATION:
- 70-100: ${lang.riskLevels.low}
- 40-69: ${lang.riskLevels.moderate}
- 0-39: ${lang.riskLevels.high}

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
    "<reason 1 in ${lang.name} - describe a specific semantic signal detected>",
    "<reason 2 in ${lang.name} - describe another relevant signal or pattern>",
    "<reason 3 in ${lang.name} - describe the overall credibility implication>"
  ],
  "breakdown": {
    "sources": {"points": 0, "reason": "${lang.notEvaluated}"},
    "factual": {"points": <number -10 to +10>, "reason": "<observation in ${lang.name} about claim types and verifiability>"},
    "prudence": {"points": <number -20 to +0>, "reason": "<observation in ${lang.name} about sensationalism/manipulation patterns>"},
    "context": {"points": <number -15 to +10>, "reason": "<observation in ${lang.name} about evidence structure and presentation>"},
    "transparency": {"points": <number -15 to +10>, "reason": "<observation in ${lang.name} about internal logical consistency>"}
  },
  "semanticSignals": {
    "claimsDetected": <boolean>,
    "claimTypes": ["<specific_event|statistic|named_entity|date|none>"],
    "sensationalismLevel": "<none|mild|moderate|high>",
    "manipulationPatterns": ["<pattern1>", "<pattern2>"],
    "logicalCoherence": "<strong|moderate|weak|incoherent>",
    "evidenceStructure": "<well_structured|moderate|poor|absent>"
  },
  "summary": "<25-50 words in ${lang.name} focusing on the semantic signals detected and what they indicate about credibility>",
  "articleSummary": "<factual summary in ${lang.name} of submitted content - what claims are made>",
  "confidence": <number 0.00-1.00>,
  "confidenceLevel": "<low|medium|high>",
  "disclaimer": "${lang.standardDisclaimer}"
}

REASON WRITING GUIDELINES:
- Each reason should reference a specific signal (e.g., "Contains urgent share language typical of viral misinformation")
- Avoid generic reasons; tie directly to detected patterns
- First reason: Most impactful signal (positive or negative)
- Second reason: Secondary pattern or balancing observation
- Third reason: Overall credibility implication

MANDATORY: ALL text output must be in ${lang.name}. This includes reasons, summary, articleSummary, and breakdown reasons.`
};

// PRO ANALYSIS PROMPT - Credibility Intelligence Engine with Web Corroboration
const getProSystemPrompt = (language: string) => {
  const lang = getLanguageConfig(language);
  const dateInfo = getCurrentDateInfo();
  
  // Localized PRO disclaimers
  const proDisclaimers: Record<string, { imageDisclaimer: string; proDisclaimer: string; summaryHint: string; whyHint: string }> = {
    en: {
      imageDisclaimer: 'These signals are contextual indicators. They do not determine truthfulness.',
      proDisclaimer: 'This assessment reflects plausibility based on available information, not absolute truth.',
      summaryHint: 'Concise, calm credibility verdict written for a general audience.',
      whyHint: 'One short sentence explaining relevance.'
    },
    fr: {
      imageDisclaimer: 'Ces signaux sont des indicateurs contextuels. Ils ne déterminent pas la véracité.',
      proDisclaimer: 'Cette évaluation reflète la plausibilité selon les informations disponibles, pas une vérité absolue.',
      summaryHint: 'Verdict de crédibilité concis et calme, rédigé pour un public général.',
      whyHint: 'Une phrase courte expliquant la pertinence.'
    },
    es: {
      imageDisclaimer: 'Estas señales son indicadores contextuales. No determinan la veracidad.',
      proDisclaimer: 'Esta evaluación refleja la plausibilidad según la información disponible, no la verdad absoluta.',
      summaryHint: 'Veredicto de credibilidad conciso y calmado, escrito para una audiencia general.',
      whyHint: 'Una frase corta explicando la relevancia.'
    },
    de: {
      imageDisclaimer: 'Diese Signale sind kontextuelle Indikatoren. Sie bestimmen nicht die Wahrhaftigkeit.',
      proDisclaimer: 'Diese Bewertung spiegelt die Plausibilität basierend auf verfügbaren Informationen wider, nicht die absolute Wahrheit.',
      summaryHint: 'Prägnantes, ruhiges Glaubwürdigkeitsurteil für ein allgemeines Publikum.',
      whyHint: 'Ein kurzer Satz, der die Relevanz erklärt.'
    },
    pt: {
      imageDisclaimer: 'Esses sinais são indicadores contextuais. Eles não determinam a veracidade.',
      proDisclaimer: 'Esta avaliação reflete a plausibilidade com base nas informações disponíveis, não a verdade absoluta.',
      summaryHint: 'Veredicto de credibilidade conciso e calmo, escrito para um público geral.',
      whyHint: 'Uma frase curta explicando a relevância.'
    },
    it: {
      imageDisclaimer: 'Questi segnali sono indicatori contestuali. Non determinano la veridicità.',
      proDisclaimer: 'Questa valutazione riflette la plausibilità in base alle informazioni disponibili, non la verità assoluta.',
      summaryHint: 'Verdetto di credibilità conciso e calmo, scritto per un pubblico generale.',
      whyHint: 'Una frase breve che spiega la rilevanza.'
    },
    ja: {
      imageDisclaimer: 'これらのシグナルは文脈的な指標です。真実性を決定するものではありません。',
      proDisclaimer: 'この評価は利用可能な情報に基づく妥当性を反映しており、絶対的な真実ではありません。',
      summaryHint: '一般読者向けの簡潔で落ち着いた信頼性判定。',
      whyHint: '関連性を説明する短い一文。'
    },
    ko: {
      imageDisclaimer: '이러한 신호는 맥락적 지표입니다. 진실성을 결정하지 않습니다.',
      proDisclaimer: '이 평가는 이용 가능한 정보를 기반으로 한 타당성을 반영하며, 절대적 진실이 아닙니다.',
      summaryHint: '일반 독자를 위한 간결하고 차분한 신뢰성 판정.',
      whyHint: '관련성을 설명하는 짧은 문장.'
    }
  };
  
  const pd = proDisclaimers[language] || proDisclaimers['en'];
  
  return `You are a credibility intelligence engine with web corroboration (PRO).

GOAL:
- Perform deeper multi-source corroboration.
- Provide up to 10 sources total, categorized as corroborating / neutral / contradicting.
- Keep the UI premium: only 4 clickable "best links" should be surfaced for the user.

CRITICAL LANGUAGE INSTRUCTION: You MUST respond ENTIRELY in ${lang.name} (${lang.nativeName}).
Every word of your response must be in ${lang.name}. No exceptions. No mixing languages.

CURRENT DATE: ${dateInfo.formatted} (${dateInfo.year})

===== CRITICAL PRINCIPLES =====

- All scoring mechanics and sub-scores are strictly INTERNAL and must remain invisible.
- Never mention models, algorithms, or how scoring is computed.
- Speak calmly and authoritatively for a general audience.

===== SCORING (INTERNAL ONLY - NEVER EXPOSE) =====

Evaluate credibility internally based on:
- Logical consistency of the content
- Nature of claims (factual vs opinion/speculation)
- Real-world plausibility
- Web corroboration strength

BASE: 50 points
Apply internal adjustments based on coherence, corroboration, and claim gravity.
FINAL RANGE: 5 to 98 (NEVER return 0 or 100)

RISK CLASSIFICATION:
- 70-100: low
- 40-69: medium
- 0-39: high

===== DEEP LINK RULES (STRICT) =====

1) Only include DEEP LINKS that go directly to a specific article or official page (no homepage, section, tag, or search pages).
2) Do not invent links. If strong corroboration is unavailable, return fewer sources (even zero).
3) Prefer reputable publishers and primary/official sources when possible.
4) Avoid duplicates and near-duplicates; do not repeat the same article.
5) Never include more than one source from the same domain.

===== TRUST TIERS =====

- "high": Official/government sources, major institutions, authoritative encyclopedias
- "medium": Reputable secondary sources, established media outlets
- "low": Less established sources, opinion-based, or uncertain provenance

===== STANCE CATEGORIES =====

- "corroborating": Source supports or confirms the claim
- "neutral": Source provides context without strong support or contradiction
- "contradicting": Source refutes or challenges the claim

===== SUMMARY STYLE (CRITICAL — ADVANCED FRAMEWORK) =====

GLOBAL RULES:
- Maximum 3 sentences.
- Calm, neutral, authoritative tone.
- No technical language.
- No moral judgment.
- No speculation.

UNIVERSAL STRUCTURE (applies to ALL claims: false, half-true, or true):

1) Sentence 1 — QUALIFICATION:
   Clearly qualify the nature of the claim using one of these categories:
   - "false" or "unsupported"
   - "misleading" or "half-true"
   - "factually accurate but incomplete"
   - "factually accurate"
   For vulgar/insulting claims: qualify as "unsupported and appears to be an insult rather than a verifiable assertion."

2) Sentence 2 — FACTUAL ANCHOR:
   Present a concrete, verifiable fact that directly supports, limits, or contradicts the claim.
   - Use names, dates, or widely documented context when relevant.
   - All facts must be undisputed and widely documented.
   - Avoid "There is no evidence…" alone — instead provide context.

3) Sentence 3 — INTELLIGENT CONTEXT (optional but preferred):
   Add clarifying context that improves understanding WITHOUT changing the subject:
   - time frame limitations
   - scope clarifications
   - missing nuance
   - common misunderstandings
   If only two sentences are sufficient, stop at two.

STYLE GUIDANCE:
- Prefer: "While the claim is partially accurate, it omits…"
- Prefer: "The statement is factually correct, but often misunderstood because…"
- Prefer: "This claim conflates two separate facts…"
- Avoid: Simple dismissals without factual anchoring.

CONSTRAINTS:
- Never over-explain.
- Never introduce tangential information.
- Only include facts that are directly relevant and widely documented.

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
    "summary": "<${pd.summaryHint} - MUST BE IN ${lang.name}>",
    "confidence": <number 0.00-1.00>,
    "bestLinks": [
      {
        "title": "<Best article/page title in ${lang.name}>",
        "publisher": "<Organization or site name - keep original>",
        "url": "<https://... direct deep link>",
        "trustTier": "<high|medium|low>",
        "stance": "<corroborating|neutral|contradicting>",
        "whyItMatters": "<${pd.whyHint} - MUST BE IN ${lang.name}>"
      }
    ],
    "sources": [
      {
        "title": "<Article or page title in ${lang.name}>",
        "publisher": "<Organization or site name - keep original>",
        "url": "<https://... direct deep link>",
        "trustTier": "<high|medium|low>",
        "stance": "<corroborating|neutral|contradicting>",
        "whyItMatters": "<${pd.whyHint} - MUST BE IN ${lang.name}>"
      }
    ]
  },
  "analysisType": "pro",
  "articleSummary": "<factual summary of the submitted content - MUST BE IN ${lang.name}>",
  "corroboration": {
    "outcome": "<corroborated|neutral|constrained|refuted>",
    "sourcesConsulted": <number 1-10>
  },
  "imageSignals": {
    "origin": {
      "classification": "<real_photo|illustration_composite|probable_ai_generated|undetermined>",
      "confidence": "<low|medium|high>",
      "indicators": ["<observed indicators in ${lang.name}>"]
    },
    "coherence": {
      "classification": "<illustrative|demonstrative|potentially_misleading>",
      "explanation": "<brief explanation in ${lang.name}>"
    },
    "disclaimer": "${pd.imageDisclaimer}"
  },
  "proDisclaimer": "${pd.proDisclaimer}"
}

LIST RULES:
- bestLinks: include at most 4 items, chosen as the strongest and most relevant deep links.
- sources: include up to 10 items total across all stances (corroborating/neutral/contradicting).
- Ensure bestLinks are a subset of sources (same URLs).
- Prefer diversity of publishers in bestLinks (avoid same-domain repetition there).

IMPORTANT: Return ONLY valid JSON. Do not include breakdown, points, weights, or internal reasoning in the output.

MANDATORY: ALL text output must be in ${lang.name} (${lang.nativeName}). This includes summary, articleSummary, whyItMatters, and all explanatory text.`;
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

// Check if URL is a valid deep article link (not homepage/section)
const isValidDeepLink = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    
    // Reject if too short (likely homepage)
    if (pathname === '/' || pathname.length < 5) {
      return false;
    }
    
    // Hub/section patterns to reject
    const HUB_PATHS = [
      '/news', '/politics', '/world', '/business', '/sports', '/entertainment',
      '/opinion', '/lifestyle', '/technology', '/science', '/health', '/travel',
      '/search', '/video', '/live', '/tag/', '/category/', '/topic/', '/section/',
      '/author/', '/archive/', '/index', '/home'
    ];
    
    for (const hub of HUB_PATHS) {
      if (pathname === hub || pathname === hub + '/') {
        return false;
      }
    }
    
    // Trusted domains can pass with shorter paths
    const domain = getDomainFromUrl(url);
    const TRUSTED_DOMAINS = [
      'wikipedia.org', 'britannica.com', 'who.int', 'cdc.gov', 'nih.gov',
      'nasa.gov', 'nature.com', 'sciencedirect.com', 'pubmed.ncbi.nlm.nih.gov'
    ];
    
    const isTrusted = TRUSTED_DOMAINS.some(d => domain.includes(d)) ||
      domain.endsWith('.gov') || domain.endsWith('.edu');
    
    if (isTrusted && pathname.length > 3) {
      return true;
    }
    
    // For non-trusted, require article-like patterns
    const hasArticlePattern = 
      pathname.includes('/article') ||
      pathname.includes('/story') ||
      pathname.includes('/news/') ||
      /\/\d{4}\/\d{2}\//.test(pathname) || // Date pattern
      pathname.split('/').some(seg => seg.length > 20 && seg.includes('-')); // Long slug
    
    return hasArticlePattern || pathname.split('/').filter(Boolean).length >= 2;
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
