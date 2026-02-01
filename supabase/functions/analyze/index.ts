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

// ============================================================================
// FEATURE 1: CRITICAL FACT LIBRARY
// Protected internal layer of verified, time-sensitive facts
// ============================================================================

interface CriticalFact {
  subject: string;
  role: string;
  entity: string;
  validFrom?: string; // ISO date
  validUntil?: string; // ISO date or "present"
  source: string;
}

// Critical Facts Library - Current as of 2026
// This is checked BEFORE web verification to detect potential conflicts
const CRITICAL_FACTS_LIBRARY: CriticalFact[] = [
  // Current Heads of State & Government (as of Feb 2026)
  { subject: "Emmanuel Macron", role: "President", entity: "France", validFrom: "2017-05-14", validUntil: "present", source: "Official" },
  { subject: "François Bayrou", role: "Prime Minister", entity: "France", validFrom: "2024-12-13", validUntil: "present", source: "Official" },
  { subject: "Joe Biden", role: "President", entity: "United States", validFrom: "2021-01-20", validUntil: "2025-01-20", source: "Official" },
  { subject: "Donald Trump", role: "President", entity: "United States", validFrom: "2025-01-20", validUntil: "present", source: "Official" },
  { subject: "Keir Starmer", role: "Prime Minister", entity: "United Kingdom", validFrom: "2024-07-05", validUntil: "present", source: "Official" },
  { subject: "King Charles III", role: "Monarch", entity: "United Kingdom", validFrom: "2022-09-08", validUntil: "present", source: "Official" },
  { subject: "Olaf Scholz", role: "Chancellor", entity: "Germany", validFrom: "2021-12-08", validUntil: "present", source: "Official" },
  { subject: "Giorgia Meloni", role: "Prime Minister", entity: "Italy", validFrom: "2022-10-22", validUntil: "present", source: "Official" },
  { subject: "Justin Trudeau", role: "Prime Minister", entity: "Canada", validFrom: "2015-11-04", validUntil: "present", source: "Official" },
  { subject: "Xi Jinping", role: "President", entity: "China", validFrom: "2013-03-14", validUntil: "present", source: "Official" },
  { subject: "Vladimir Putin", role: "President", entity: "Russia", validFrom: "2012-05-07", validUntil: "present", source: "Official" },
  { subject: "Volodymyr Zelenskyy", role: "President", entity: "Ukraine", validFrom: "2019-05-20", validUntil: "present", source: "Official" },
  { subject: "Narendra Modi", role: "Prime Minister", entity: "India", validFrom: "2014-05-26", validUntil: "present", source: "Official" },
  { subject: "Luiz Inácio Lula da Silva", role: "President", entity: "Brazil", validFrom: "2023-01-01", validUntil: "present", source: "Official" },
  { subject: "Fumio Kishida", role: "Prime Minister", entity: "Japan", validFrom: "2021-10-04", validUntil: "2024-10-01", source: "Official" },
  { subject: "Shigeru Ishiba", role: "Prime Minister", entity: "Japan", validFrom: "2024-10-01", validUntil: "present", source: "Official" },
  { subject: "Pope Francis", role: "Pope", entity: "Vatican", validFrom: "2013-03-13", validUntil: "present", source: "Official" },
  
  // International Organization Leaders
  { subject: "António Guterres", role: "Secretary-General", entity: "United Nations", validFrom: "2017-01-01", validUntil: "present", source: "Official" },
  { subject: "Tedros Adhanom Ghebreyesus", role: "Director-General", entity: "WHO", validFrom: "2017-07-01", validUntil: "present", source: "Official" },
  { subject: "Ursula von der Leyen", role: "President", entity: "European Commission", validFrom: "2019-12-01", validUntil: "present", source: "Official" },
  { subject: "Christine Lagarde", role: "President", entity: "European Central Bank", validFrom: "2019-11-01", validUntil: "present", source: "Official" },
  { subject: "Mark Rutte", role: "Secretary General", entity: "NATO", validFrom: "2024-10-01", validUntil: "present", source: "Official" },
  { subject: "Kristalina Georgieva", role: "Managing Director", entity: "IMF", validFrom: "2019-10-01", validUntil: "present", source: "Official" },
];

interface CriticalFactCheckResult {
  hasConflict: boolean;
  conflictDetails: string | null;
  matchedFacts: CriticalFact[];
  requiresEnhancedVerification: boolean;
}

// Check claim against Critical Facts Library
const checkCriticalFacts = (claimText: string): CriticalFactCheckResult => {
  const lowerClaim = claimText.toLowerCase();
  const matchedFacts: CriticalFact[] = [];
  let hasConflict = false;
  let conflictDetails: string | null = null;
  
  for (const fact of CRITICAL_FACTS_LIBRARY) {
    const subjectLower = fact.subject.toLowerCase();
    const roleLower = fact.role.toLowerCase();
    const entityLower = fact.entity.toLowerCase();
    
    // Check if claim mentions this subject
    if (lowerClaim.includes(subjectLower)) {
      matchedFacts.push(fact);
      
      // Check for role conflicts
      // e.g., "Biden is president" when Trump is current president
      const rolePatterns = [
        `${subjectLower} is ${roleLower}`,
        `${subjectLower} is the ${roleLower}`,
        `${subjectLower}, ${roleLower}`,
        `${roleLower} ${subjectLower}`,
      ];
      
      const mentionsRole = rolePatterns.some(p => lowerClaim.includes(p)) ||
        (lowerClaim.includes(subjectLower) && lowerClaim.includes(roleLower));
      
      if (mentionsRole) {
        // Check if the claim is about a past period or current
        const isPastTense = lowerClaim.includes('was ') || lowerClaim.includes('were ') ||
          lowerClaim.includes('former ') || lowerClaim.includes('ex-') ||
          lowerClaim.includes('previously ') || lowerClaim.includes('until ');
        
        // If current tense claim but validUntil is not "present", it's a conflict
        if (!isPastTense && fact.validUntil !== "present") {
          hasConflict = true;
          conflictDetails = `Claim suggests ${fact.subject} is currently ${fact.role} of ${fact.entity}, but this role ended on ${fact.validUntil}`;
        }
      }
    }
    
    // Check for conflicting role claims (someone else claimed as current holder)
    // e.g., "Jean Castex is Prime Minister of France"
    if (lowerClaim.includes(entityLower) && lowerClaim.includes(roleLower)) {
      // Check if a different person is being claimed for this role
      const otherNames = CRITICAL_FACTS_LIBRARY
        .filter(f => f.entity === fact.entity && f.role === fact.role && f.validUntil === "present")
        .map(f => f.subject.toLowerCase());
      
      const claimsCurrentRole = !lowerClaim.includes('was ') && !lowerClaim.includes('former ') &&
        (lowerClaim.includes('is ') || lowerClaim.includes('current '));
      
      if (claimsCurrentRole && !otherNames.some(name => lowerClaim.includes(name))) {
        // Someone other than the actual current holder might be claimed
        matchedFacts.push(fact);
      }
    }
  }
  
  return {
    hasConflict,
    conflictDetails,
    matchedFacts,
    requiresEnhancedVerification: matchedFacts.length > 0 || hasConflict
  };
};

// ============================================================================
// FEATURE 2: DYNAMIC CONFIDENCE SCORING
// Evidence-weighted scoring that adjusts based on source quality
// ============================================================================

interface ConfidenceFactors {
  officialSources: number; // Count of official/institutional sources
  majorNewsSources: number; // Count of major news sources
  totalSources: number;
  sourceAgreement: 'strong' | 'partial' | 'conflicting' | 'none';
  hasRecentConfirmation: boolean; // Sources from current year
  hasContradictions: boolean;
  onlyWeakSources: boolean;
}

interface DynamicConfidenceResult {
  score: number; // 0.00 to 1.00
  level: 'high' | 'medium' | 'low';
  adjustments: string[];
  scoreCap: number | null; // If evidence is weak, cap the trust score
}

const calculateDynamicConfidence = (factors: ConfidenceFactors): DynamicConfidenceResult => {
  let confidence = 0.5; // Base confidence
  const adjustments: string[] = [];
  let scoreCap: number | null = null;
  
  // POSITIVE ADJUSTMENTS
  if (factors.officialSources >= 2) {
    confidence += 0.25;
    adjustments.push("+0.25: Multiple official sources confirm");
  } else if (factors.officialSources >= 1) {
    confidence += 0.15;
    adjustments.push("+0.15: Official source confirms");
  }
  
  if (factors.majorNewsSources >= 2) {
    confidence += 0.15;
    adjustments.push("+0.15: Multiple major news sources confirm");
  } else if (factors.majorNewsSources >= 1) {
    confidence += 0.08;
    adjustments.push("+0.08: Major news source confirms");
  }
  
  if (factors.sourceAgreement === 'strong' && factors.totalSources >= 3) {
    confidence += 0.12;
    adjustments.push("+0.12: Strong source agreement");
  }
  
  if (factors.hasRecentConfirmation) {
    confidence += 0.08;
    adjustments.push("+0.08: Recent (current year) confirmation");
  }
  
  // NEGATIVE ADJUSTMENTS
  if (factors.hasContradictions) {
    confidence -= 0.25;
    adjustments.push("-0.25: Sources contradict each other");
    scoreCap = 55;
  }
  
  if (factors.sourceAgreement === 'conflicting') {
    confidence -= 0.20;
    adjustments.push("-0.20: Conflicting evidence");
    scoreCap = Math.min(scoreCap ?? 100, 50);
  }
  
  if (factors.onlyWeakSources && factors.totalSources > 0) {
    confidence -= 0.15;
    adjustments.push("-0.15: Only weak/indirect sources");
    scoreCap = Math.min(scoreCap ?? 100, 60);
  }
  
  if (factors.totalSources === 0) {
    confidence = 0.15;
    adjustments.push("=0.15: No reliable sources found");
    scoreCap = 40;
  } else if (factors.totalSources === 1) {
    confidence -= 0.10;
    adjustments.push("-0.10: Single source only");
    scoreCap = Math.min(scoreCap ?? 100, 70);
  }
  
  if (!factors.hasRecentConfirmation && factors.totalSources > 0) {
    confidence -= 0.12;
    adjustments.push("-0.12: No recent confirmation for time-sensitive claim");
  }
  
  // Clamp to valid range
  confidence = Math.max(0.05, Math.min(0.98, confidence));
  
  // Determine level
  let level: 'high' | 'medium' | 'low';
  if (confidence >= 0.75) {
    level = 'high';
  } else if (confidence >= 0.45) {
    level = 'medium';
  } else {
    level = 'low';
  }
  
  return { score: confidence, level, adjustments, scoreCap };
};

// ============================================================================
// FEATURE 3: INTELLIGENT DATE INTERPRETATION
// Detect and normalize temporal references in claims
// ============================================================================

interface TemporalContext {
  hasTemporalReference: boolean;
  detectedReferences: string[];
  referenceType: 'current' | 'past' | 'future' | 'specific_year' | 'relative' | 'none';
  targetYear: number | null;
  isTimesSensitive: boolean;
  requiresRecentSources: boolean;
}

const interpretTemporalContext = (claimText: string): TemporalContext => {
  const dateInfo = getCurrentDateInfo();
  const currentYear = dateInfo.year;
  const lowerClaim = claimText.toLowerCase();
  
  const detectedReferences: string[] = [];
  let referenceType: TemporalContext['referenceType'] = 'none';
  let targetYear: number | null = null;
  let isTimeSensitive = false;
  let requiresRecentSources = false;
  
  // Current time references
  const currentPatterns = [
    'currently', 'current', 'today', 'right now', 'at present', 'presently',
    'as of now', 'nowadays', 'these days', 'at this time', 'now'
  ];
  
  for (const pattern of currentPatterns) {
    if (lowerClaim.includes(pattern)) {
      detectedReferences.push(pattern);
      referenceType = 'current';
      targetYear = currentYear;
      isTimeSensitive = true;
      requiresRecentSources = true;
    }
  }
  
  // Past references
  const pastPatterns = [
    'was', 'were', 'used to', 'formerly', 'previously', 'in the past',
    'last year', 'last month', 'ago', 'back in', 'before', 'former'
  ];
  
  for (const pattern of pastPatterns) {
    if (lowerClaim.includes(pattern)) {
      detectedReferences.push(pattern);
      if (referenceType === 'none') {
        referenceType = 'past';
      }
    }
  }
  
  // Future references
  const futurePatterns = [
    'will be', 'will become', 'next year', 'upcoming', 'soon',
    'in the future', 'expected to', 'scheduled to', 'planned to'
  ];
  
  for (const pattern of futurePatterns) {
    if (lowerClaim.includes(pattern)) {
      detectedReferences.push(pattern);
      if (referenceType === 'none') {
        referenceType = 'future';
      }
    }
  }
  
  // Specific year detection
  const yearMatch = lowerClaim.match(/\b(19\d{2}|20\d{2})\b/g);
  if (yearMatch) {
    const years = yearMatch.map(y => parseInt(y));
    detectedReferences.push(...yearMatch);
    
    // Use the most recent year mentioned
    targetYear = Math.max(...years);
    
    if (targetYear === currentYear || targetYear === currentYear - 1) {
      referenceType = 'current';
      requiresRecentSources = true;
    } else if (targetYear > currentYear) {
      referenceType = 'future';
    } else {
      referenceType = 'specific_year';
    }
    
    isTimeSensitive = true;
  }
  
  // Relative time references
  const relativePatterns = [
    { pattern: 'this year', offset: 0 },
    { pattern: 'last year', offset: -1 },
    { pattern: 'next year', offset: 1 },
    { pattern: 'this month', offset: 0 },
    { pattern: 'last month', offset: 0 },
  ];
  
  for (const { pattern, offset } of relativePatterns) {
    if (lowerClaim.includes(pattern)) {
      detectedReferences.push(pattern);
      targetYear = currentYear + offset;
      referenceType = 'relative';
      isTimeSensitive = true;
      if (offset >= 0) {
        requiresRecentSources = true;
      }
    }
  }
  
  // Check for time-sensitive topics that ALWAYS require recent sources
  const timeSensitiveTopics = [
    'president', 'prime minister', 'chancellor', 'leader', 'ceo', 'director',
    'minister', 'secretary', 'chairman', 'monarch', 'king', 'queen',
    'election', 'vote', 'referendum', 'war', 'conflict', 'crisis',
    'pandemic', 'outbreak', 'price', 'rate', 'gdp', 'inflation'
  ];
  
  for (const topic of timeSensitiveTopics) {
    if (lowerClaim.includes(topic)) {
      isTimeSensitive = true;
      if (referenceType === 'none' || referenceType === 'current') {
        requiresRecentSources = true;
      }
      break;
    }
  }
  
  return {
    hasTemporalReference: detectedReferences.length > 0 || isTimeSensitive,
    detectedReferences,
    referenceType,
    targetYear,
    isTimesSensitive: isTimeSensitive,
    requiresRecentSources
  };
};

// ============================================================================
// FEATURE 4: INTELLIGENT CONTRADICTION DETECTOR
// Weighted, time-aware conflict resolution like an expert analyst
// ============================================================================

// Claim target structure for verification
interface ClaimTarget {
  subject: string | null;       // who/what
  predicate: string | null;     // is/was/has/does
  predicateType: 'current_state' | 'past_state' | 'action' | 'attribute' | 'unknown';
  role: string | null;          // office holder, event, statistic, etc.
  timeContext: 'current' | 'past' | 'future' | 'specific' | 'unspecified';
  targetYear: number | null;
}

// Source statement with parsed stance
interface SourceStatement {
  sourceUrl: string;
  trustTier: 'official' | 'major_news' | 'other';
  stance: 'supports' | 'contradicts' | 'unclear';
  timeReference: string | null;  // "as of 2024", "in 2023", etc.
  targetYear: number | null;
  addressesSameTarget: boolean;
}

// Contradiction analysis result
interface ContradictionAnalysis {
  hasContradiction: boolean;
  contradictionType: 'hard' | 'temporal_shift' | 'scope_difference' | 'none';
  contradictionScore: number;    // 0-100, weighted by trust tiers
  conflictDetails: ContradictionDetail[];
  resolution: ContradictionResolution;
  promptInstructions: string;
}

interface ContradictionDetail {
  description: string;
  supportingSources: string[];
  contradictingSources: string[];
  isTemporalConflict: boolean;
  canBeResolved: boolean;
}

interface ContradictionResolution {
  preferredStance: 'supports' | 'contradicts' | 'uncertain';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  recommendedVerdict: 'TRUE' | 'MOSTLY TRUE' | 'MIXED' | 'UNCERTAIN' | 'MOSTLY FALSE' | 'FALSE' | null;
  scoreCap: number | null;
}

// Trust tier weights for contradiction scoring
const TRUST_TIER_WEIGHTS = {
  official: 3.0,
  major_news: 2.0,
  other: 1.0
};

// Calculate weighted contradiction score
const calculateContradictionScore = (
  supportingTiers: string[],
  contradictingTiers: string[]
): number => {
  if (contradictingTiers.length === 0) return 0;
  if (supportingTiers.length === 0) return 100;
  
  let supportWeight = 0;
  let contradictWeight = 0;
  
  for (const tier of supportingTiers) {
    supportWeight += TRUST_TIER_WEIGHTS[tier as keyof typeof TRUST_TIER_WEIGHTS] || 1;
  }
  
  for (const tier of contradictingTiers) {
    contradictWeight += TRUST_TIER_WEIGHTS[tier as keyof typeof TRUST_TIER_WEIGHTS] || 1;
  }
  
  const total = supportWeight + contradictWeight;
  if (total === 0) return 50;
  
  // Score based on how much contradiction outweighs support
  const contradictionRatio = contradictWeight / total;
  
  // Official vs Official contradiction is strongest
  const hasOfficialConflict = 
    supportingTiers.includes('official') && contradictingTiers.includes('official');
  
  const hasMajorNewsConflict = 
    supportingTiers.includes('major_news') && contradictingTiers.includes('major_news');
  
  let score = contradictionRatio * 100;
  
  // Boost score for high-tier conflicts
  if (hasOfficialConflict) {
    score = Math.min(100, score * 1.5);
  } else if (hasMajorNewsConflict) {
    score = Math.min(100, score * 1.25);
  }
  
  return Math.round(score);
};

// Determine if contradiction is temporal (explainable by time difference)
const isTemporalContradiction = (
  supportingYears: (number | null)[],
  contradictingYears: (number | null)[],
  claimTimeContext: 'current' | 'past' | 'future' | 'specific' | 'unspecified'
): boolean => {
  const validSupportYears = supportingYears.filter(y => y !== null) as number[];
  const validContradictYears = contradictingYears.filter(y => y !== null) as number[];
  
  if (validSupportYears.length === 0 || validContradictYears.length === 0) {
    return false;
  }
  
  const avgSupport = validSupportYears.reduce((a, b) => a + b, 0) / validSupportYears.length;
  const avgContradict = validContradictYears.reduce((a, b) => a + b, 0) / validContradictYears.length;
  
  // If there's a year difference and claim is about "current" state
  if (Math.abs(avgSupport - avgContradict) >= 1 && claimTimeContext === 'current') {
    return true;
  }
  
  return false;
};

// Build contradiction detection instructions for the prompt
const buildContradictionDetectorInstructions = (temporalContext: TemporalContext): string => {
  const dateInfo = getCurrentDateInfo();
  
  return `
===== INTELLIGENT CONTRADICTION DETECTOR =====

You MUST apply expert-level contradiction analysis:

STEP 1 - CLAIM TARGET EXTRACTION:
Identify the verification targets in the claim:
- SUBJECT: Who or what is the claim about?
- PREDICATE: What state/action is claimed (is/was/has)?
- TIME CONTEXT: Current, past, future, or specific year?
- ROLE/TYPE: Office holder, event, statistic, etc.?

STEP 2 - SOURCE STATEMENT PARSING:
For each source you find, determine:
- Does it address the SAME subject and predicate?
- What time period does the source refer to?
- Is the source's statement: SUPPORTS / CONTRADICTS / UNCLEAR?
⚠️ Do NOT label "contradiction" if the source addresses a different time period or different aspect.

STEP 3 - WEIGHTED CONTRADICTION SCORING:
Trust tiers have different weights:
- Official (gov, edu, institutions): Weight 3x
- Major News (Reuters, BBC, AP, AFP): Weight 2x
- Other sources: Weight 1x

Contradiction severity:
- Official vs Official disagreement = HIGHEST severity → Verdict UNCERTAIN
- Major News vs Major News = HIGH severity → Reduce confidence
- Other vs Other = MODERATE severity → Note but don't over-penalize

If Official + Major News AGREE: This forms consensus. Prefer this over other sources.

STEP 4 - TIME-AWARE RESOLUTION:
If sources disagree but the disagreement is explained by TIME:
- Older sources say X, newer sources say Y
- This is a "TEMPORAL SHIFT", NOT a hard contradiction
- For "current" claims: ALWAYS prefer the most recent authoritative source
- Example: "Biden is president" - older sources confirm, but newer sources show Trump is current president

Current date: ${dateInfo.formatted}
${temporalContext.requiresRecentSources ? `⚠️ This claim requires ${dateInfo.year} or ${dateInfo.year - 1} sources for verification.` : ''}

STEP 5 - OUTPUT BEHAVIOR:

IF CONTRADICTION SCORE IS HIGH (sources disagree on same target/time):
- Verdict = UNCERTAIN (or FALSE if authoritative sources clearly contradict claim)
- Reduce confidence to LOW or MEDIUM
- Apply score cap: 55 max for conflicting sources, 40 max for official contradiction
- Include in summary: what conflicts, which sources support each side, whether time explains it

IF CONSENSUS IS STRONG (authoritative sources agree):
- Verdict = TRUE or FALSE with HIGH confidence
- No score cap from contradiction logic

IF TEMPORAL SHIFT DETECTED:
- Prefer the most recent source
- Note in summary that the situation has changed over time
- If claim uses "current/now" language but only old sources support it → Verdict = UNCERTAIN or FALSE
`;
};

// Build enhanced context for PRO prompt based on pre-analysis
interface EnhancedVerificationContext {
  criticalFactCheck: CriticalFactCheckResult;
  temporalContext: TemporalContext;
  enhancedModeActive: boolean;
  additionalInstructions: string;
  contradictionInstructions: string;
}

const buildEnhancedContext = (claimText: string): EnhancedVerificationContext => {
  const criticalFactCheck = checkCriticalFacts(claimText);
  const temporalContext = interpretTemporalContext(claimText);
  
  const enhancedModeActive = criticalFactCheck.requiresEnhancedVerification || 
    temporalContext.isTimesSensitive ||
    criticalFactCheck.hasConflict;
  
  // Build contradiction detection instructions
  const contradictionInstructions = buildContradictionDetectorInstructions(temporalContext);
  
  let additionalInstructions = '';
  
  if (criticalFactCheck.hasConflict) {
    additionalInstructions += `\n\n⚠️ CRITICAL FACT CONFLICT DETECTED:\n${criticalFactCheck.conflictDetails}\n`;
    additionalInstructions += `This claim may contradict verified institutional facts. Apply maximum scrutiny.\n`;
    additionalInstructions += `If conflict is confirmed after web verification, verdict MUST be UNCERTAIN or FALSE, score CAPPED at 25.\n`;
  }
  
  if (criticalFactCheck.matchedFacts.length > 0 && !criticalFactCheck.hasConflict) {
    additionalInstructions += `\n\nℹ️ CRITICAL FACTS CONTEXT:\n`;
    for (const fact of criticalFactCheck.matchedFacts) {
      additionalInstructions += `- ${fact.subject} is ${fact.role} of ${fact.entity} (since ${fact.validFrom}, status: ${fact.validUntil})\n`;
    }
    additionalInstructions += `Verify claim against these known facts. Any discrepancy requires UNCERTAIN verdict.\n`;
  }
  
  if (temporalContext.hasTemporalReference) {
    additionalInstructions += `\n\n📅 TEMPORAL CONTEXT DETECTED:\n`;
    additionalInstructions += `- Reference type: ${temporalContext.referenceType}\n`;
    if (temporalContext.targetYear) {
      additionalInstructions += `- Target year: ${temporalContext.targetYear}\n`;
    }
    if (temporalContext.detectedReferences.length > 0) {
      additionalInstructions += `- Time markers found: "${temporalContext.detectedReferences.join('", "')}"\n`;
    }
    if (temporalContext.requiresRecentSources) {
      additionalInstructions += `REQUIRE sources from ${getCurrentDateInfo().year} or ${getCurrentDateInfo().year - 1}. Reject older sources for verification.\n`;
    }
    if (temporalContext.referenceType === 'current' && temporalContext.isTimesSensitive) {
      additionalInstructions += `This is a CURRENT STATUS claim. If no recent sources confirm, reduce confidence to LOW.\n`;
    }
  }
  
  if (enhancedModeActive) {
    additionalInstructions += `\n\n🔒 ENHANCED VERIFICATION MODE ACTIVE\n`;
    additionalInstructions += `Apply stricter source requirements and confidence scoring.\n`;
  }
  
  return {
    criticalFactCheck,
    temporalContext,
    enhancedModeActive,
    additionalInstructions,
    contradictionInstructions
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

// PRO ANALYSIS PROMPT - Advanced Credibility Intelligence Mode
// PRO PROVES the answer with verified evidence and expert reasoning
// Integrates: Critical Fact Library, Dynamic Confidence, Intelligent Date Interpretation
const getProSystemPrompt = (language: string, enhancedContext?: EnhancedVerificationContext) => {
  const isFr = language === 'fr';
  const dateInfo = getCurrentDateInfo();
  
  // Build enhanced instructions if context is provided
  const enhancedInstructions = enhancedContext?.additionalInstructions || '';
  const isEnhancedMode = enhancedContext?.enhancedModeActive || false;
  
  return `You are LeenScore PRO - an advanced credibility intelligence engine operating in ${isEnhancedMode ? 'ENHANCED' : 'STANDARD'} VERIFICATION MODE.

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

===== ENHANCED TEMPORAL VERIFICATION FOR PUBLIC ROLES =====

CRITICAL: When a claim involves a CURRENT PUBLIC ROLE, this is a TIME-SENSITIVE FACTUAL CHECK.
Leadership positions change over time. Static background knowledge is UNRELIABLE for these claims.

PUBLIC ROLE CATEGORIES (HIGH-SENSITIVITY):
- Head of state: president, monarch, prime minister, chancellor
- Government positions: minister, secretary of state, governor, mayor
- International organizations: UN Secretary-General, WHO Director, IMF head
- Corporate leadership: CEO, CFO, chairman of major companies
- Judicial positions: chief justice, attorney general
- Military leadership: commander, general, admiral

===== MANDATORY TEMPORAL VERIFICATION RULES =====

RULE 1 - CURRENT YEAR CONTEXT CHECK:
- The current year is ${dateInfo.year}. Use this as your temporal anchor.
- If a claim states "[Person] IS [role]", you MUST verify this is accurate as of ${dateInfo.year}.
- Do NOT assume your training data is current. Leadership roles change frequently.
- Treat ANY claim about "current" leadership as requiring active verification.

RULE 2 - REJECT STATIC BACKGROUND KNOWLEDGE:
- Do NOT rely on generalized or memorized knowledge for leadership roles.
- Your training data may be outdated for these time-sensitive positions.
- If you cannot find a recent (< 6 months old) authoritative source, state uncertainty explicitly.
- Never confidently assert a leadership role without a dated, verifiable source.

RULE 3 - SOURCE RECENCY REQUIREMENTS:
- REQUIRED: At least one source from ${dateInfo.year} or ${dateInfo.year - 1}
- PREFERRED: Sources dated within the last 6 months
- ACCEPTABLE: Sources from ${dateInfo.year - 1} if no newer source exists
- REJECT: Sources older than 2 years for current role verification

RULE 4 - PRIORITIZE AUTHORITATIVE SOURCES (strict order):
   1. Official government websites (.gov, .gouv, official ministry sites)
   2. International organization sites (un.org, who.int, imf.org, worldbank.org)
   3. Major recognized international news: Reuters, AP, AFP, BBC, CNN, NYT, Le Monde, Der Spiegel
   4. Recently updated reference sources: Wikipedia (check last update date), official company pages

RULE 5 - HEAVILY DOWNGRADE UNRELIABLE SOURCES:
   - Undated sources: -30 credibility points (cannot verify temporal accuracy)
   - Sources older than 2 years: -25 credibility points (likely outdated for roles)
   - Sources older than 1 year: -15 credibility points (may be outdated)
   - Opinion blogs or non-institutional content: -20 credibility points
   - Social media posts without official verification: -25 credibility points

RULE 6 - CONFLICT RESOLUTION:
   - If sources conflict, ALWAYS prefer the most recent AND institutionally authoritative
   - Official government announcement > Major news agency > Encyclopedia > Other
   - A ${dateInfo.year} source from official government outweighs a ${dateInfo.year - 2} source from major media
   - When in doubt, choose recency over authority

RULE 7 - EXPLICIT TEMPORAL MARKERS IN OUTPUT:
   - In your summary, ALWAYS include "as of [month/year]" for role verification
   - Flag if the claim may have been accurate at a previous time but is now outdated
   - Example: "This was accurate until [date], but [new person] assumed the role on [date]."
   - If uncertain: "As of [date], [source] indicates [person] holds this role, but this should be verified."

RULE 8 - SCORING IMPACT FOR LEADERSHIP CLAIMS:
   - Claims verified with ${dateInfo.year} official sources: +15 to score
   - Claims verified with ${dateInfo.year - 1} sources only: +5 to score
   - Claims using outdated information (>1 year): cap score at 45
   - Claims about past roles presented as current: cap score at 35
   - Cannot find recent verification: cap score at 50, add uncertainty note

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
    "verdict": "<TRUE|MOSTLY TRUE|MIXED|UNCERTAIN|MOSTLY FALSE|FALSE>",
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
    "sources": [<up to 10 sources with same structure>],
    "conflictAnalysis": {
      "hasConflict": <boolean>,
      "conflictType": "<hard|temporal_shift|scope_difference|none>",
      "conflictDescription": "<${isFr ? 'Description du conflit détecté entre les sources' : 'Description of detected conflict between sources'}>",
      "resolution": "<${isFr ? 'Comment le conflit a été résolu ou pourquoi il reste incertain' : 'How the conflict was resolved or why it remains uncertain'}>"
    }
  },
  "analysisType": "pro",
  "articleSummary": "<factual summary of what the text claims>",
  "corroboration": {
    "outcome": "<corroborated|neutral|constrained|refuted|conflicting>",
    "sourcesConsulted": <number 1-10>,
    "verificationStrength": "<strong|moderate|limited|insufficient|conflicting>"
  },
  "proDisclaimer": "${isFr ? "Cette évaluation reflète la plausibilité selon les informations disponibles, pas une vérité absolue." : 'This assessment reflects plausibility based on available information, not absolute truth.'}"
}

===== LIST RULES =====

- bestLinks: Max 4 items. Only strongest evidence. Never pad with weak sources.
- sources: Max 10 items across all stances.
- bestLinks must be subset of sources.
- Diversity of publishers preferred.

ALL text in ${isFr ? 'FRENCH' : 'ENGLISH'}.

${enhancedContext?.contradictionInstructions || ''}

${enhancedInstructions ? `===== ENHANCED VERIFICATION CONTEXT (PRE-PROCESSED) =====\n${enhancedInstructions}` : ''}`;
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
    
    // ===== ADVANCED CREDIBILITY INTELLIGENCE PRE-PROCESSING =====
    // Run 3 feature systems BEFORE generating PRO analysis
    let enhancedContext: EnhancedVerificationContext | undefined;
    
    if (isPro) {
      console.log("Running Advanced Credibility Intelligence pre-processing...");
      enhancedContext = buildEnhancedContext(content);
      
      if (enhancedContext.criticalFactCheck.hasConflict) {
        console.log("⚠️ CRITICAL FACT CONFLICT DETECTED:", enhancedContext.criticalFactCheck.conflictDetails);
      }
      if (enhancedContext.temporalContext.hasTemporalReference) {
        console.log("📅 Temporal context:", enhancedContext.temporalContext.referenceType, 
          "Target year:", enhancedContext.temporalContext.targetYear);
      }
      if (enhancedContext.enhancedModeActive) {
        console.log("🔒 Enhanced Verification Mode ACTIVE");
      }
    }
    
    // CRITICAL: Always use English prompts for consistent web corroboration
    // Then translate output to user's language
    const systemPrompt = isPro ? getProSystemPrompt('en', enhancedContext) : getSystemPrompt('en');
    
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
