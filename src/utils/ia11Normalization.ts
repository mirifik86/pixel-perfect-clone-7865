/**
 * IA11 Response Normalization & Consistency Guard
 * 
 * CRITICAL: IA11 is the SINGLE SOURCE OF TRUTH.
 * This module provides:
 * 1. Safe normalization of IA11 fields with fallback defaults
 * 2. Consistency guard that prevents impossible UI states
 * 
 * RULES:
 * - If sources are missing (0), counters MUST be 0/0/0
 * - If sources are missing (0), status MUST be "limited"
 * - "uncertain" status is ONLY shown when IA11 explicitly returns uncertainCount > 0
 */

export interface IA11SourceItem {
  title?: string;
  url: string;
  domain?: string;
  credibility?: number;
  stance?: string;
  snippet?: string;
}

export interface IA11SourcesBuckets {
  corroborate?: IA11SourceItem[];
  contradict?: IA11SourceItem[];
  neutral?: IA11SourceItem[];
}

export interface IA11KeyPoints {
  confirmed: number;
  uncertain: number;
  contradicted: number;
}

export interface IA11WebInfo {
  used?: boolean;
  error?: string | null;
}

export interface IA11ResultWrapper {
  score?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  summary?: string;
  confidence?: number;
  reasons?: string[];
  verifiedFacts?: string[];
  corrections?: string[];
  sourcesBuckets?: IA11SourcesBuckets;
  keyPoints?: IA11KeyPoints;
  bestLinks?: unknown[];
  sources?: IA11SourceItem[];
  web?: IA11WebInfo;
}

export interface IA11Meta {
  engine?: string;
  requestId?: string;
  tookMs?: number;
  version?: string;
}

export interface IA11RawResponse {
  result?: IA11ResultWrapper;
  meta?: IA11Meta;
  // Legacy fields that might exist at root level
  score?: number;
  summary?: string;
  reasons?: string[];
  confirmedCount?: number;
  uncertainCount?: number;
  contradictedCount?: number;
}

export type ProDisplayStatus = 'confirmed' | 'contradicted' | 'uncertain' | 'limited';

export type WebEvidenceState = 'buckets' | 'neutral' | 'unavailable';

export interface NormalizedIA11Data {
  // Raw data preserved for debug
  raw: IA11RawResponse;
  
  // Normalized sources
  sources: {
    corroborate: IA11SourceItem[];
    contradict: IA11SourceItem[];
    neutral: IA11SourceItem[];
    /** Fallback sources when buckets are empty */
    fallback: IA11SourceItem[];
    total: number;
  };
  
  // Web evidence display state
  webEvidenceState: WebEvidenceState;
  
  // Normalized counters (after consistency guard)
  counters: {
    confirmed: number;
    uncertain: number;
    contradicted: number;
  };
  
  // Derived status (after consistency guard)
  status: ProDisplayStatus;
  
  // Badge text (French only per requirements)
  badgeText: string;
  
  // Web evidence card text (French only per requirements)
  webProofCard: {
    title: string;
    text: string;
  };
  
  // Other normalized fields
  verifiedFacts: string[];
  corrections: string[];
  summary: string;
  reasons: string[];
  meta: IA11Meta;
}

/**
 * French translations for PRO status messages
 */
const FR_TRANSLATIONS = {
  // Badge text by status
  badge: {
    confirmed: 'Confirmé par des sources fiables',
    contradicted: 'Contredit par des sources fiables',
    uncertain: 'Conclusions contradictoires entre sources',
    limited: 'Vérification limitée disponible',
  },
  // Web proof card
  webProof: {
    buckets: {
      title: 'Preuves web',
      text: '',
    },
    neutral: {
      title: 'Preuves web trouvées (neutres)',
      text: '',
    },
    unavailable: {
      title: 'Preuves web indisponibles',
      text: 'Aucune preuve web fiable n\'a pu être identifiée pour cette analyse.',
    },
  },
};

/**
 * English translations for PRO status messages
 */
const EN_TRANSLATIONS = {
  // Badge text by status
  badge: {
    confirmed: 'Confirmed by credible sources',
    contradicted: 'Contradicted by credible sources',
    uncertain: 'Conflicting source conclusions',
    limited: 'Limited verification available',
  },
  // Web proof card
  webProof: {
    buckets: {
      title: 'Web Evidence',
      text: '',
    },
    neutral: {
      title: 'Web evidence found (neutral)',
      text: '',
    },
    unavailable: {
      title: 'Web Evidence Unavailable',
      text: 'No reliable web evidence could be identified for this analysis.',
    },
  },
};

/**
 * Get translations based on language
 */
function getTranslations(language: 'en' | 'fr') {
  return language === 'fr' ? FR_TRANSLATIONS : EN_TRANSLATIONS;
}

/**
 * Determine web evidence display state based on available data
 */
function determineWebEvidenceState(
  buckets: IA11SourcesBuckets,
  fallbackSources: IA11SourceItem[],
  webInfo?: IA11WebInfo
): WebEvidenceState {
  const hasCorroborate = (buckets.corroborate?.length ?? 0) > 0;
  const hasContradict = (buckets.contradict?.length ?? 0) > 0;
  const hasFallbackSources = fallbackSources.length > 0;
  
  // If corroborate or contradict buckets have items, show buckets view
  if (hasCorroborate || hasContradict) {
    return 'buckets';
  }
  
  // If buckets are empty but fallback sources exist, show neutral view
  if (hasFallbackSources) {
    return 'neutral';
  }
  
  // Only show unavailable when sources are empty AND (web.used is false OR web.error exists)
  const webNotUsedOrError = webInfo?.used === false || webInfo?.error != null;
  if (fallbackSources.length === 0 && webNotUsedOrError) {
    return 'unavailable';
  }
  
  // Default to unavailable if no sources at all
  return 'unavailable';
}

/**
 * Count total sources across all buckets
 */
function countTotalSources(buckets: IA11SourcesBuckets, fallbackSources: IA11SourceItem[]): number {
  const corroborate = buckets.corroborate?.length ?? 0;
  const contradict = buckets.contradict?.length ?? 0;
  const neutral = buckets.neutral?.length ?? 0;
  const fallback = fallbackSources.length;
  return corroborate + contradict + neutral + fallback;
}

/**
 * Extract counters from IA11 response with multiple fallback paths
 * Handles both nested (result.keyPoints) and flat (result.confirmedCount) structures
 */
function extractCounters(raw: IA11RawResponse): IA11KeyPoints {
  // Priority 1: Nested keyPoints object
  if (raw.result?.keyPoints) {
    return {
      confirmed: raw.result.keyPoints.confirmed ?? 0,
      uncertain: raw.result.keyPoints.uncertain ?? 0,
      contradicted: raw.result.keyPoints.contradicted ?? 0,
    };
  }
  
  // Priority 2: Flat fields in result (legacy format)
  const result = raw.result as Record<string, unknown> | undefined;
  if (result) {
    const confirmedCount = (result.confirmedCount as number) ?? (result.counters as Record<string, number>)?.confirmedCount ?? 0;
    const uncertainCount = (result.uncertainCount as number) ?? (result.counters as Record<string, number>)?.uncertainCount ?? 0;
    const contradictedCount = (result.contradictedCount as number) ?? (result.counters as Record<string, number>)?.contradictedCount ?? 0;
    
    return {
      confirmed: confirmedCount,
      uncertain: uncertainCount,
      contradicted: contradictedCount,
    };
  }
  
  // Priority 3: Root-level fields (very legacy)
  return {
    confirmed: raw.confirmedCount ?? 0,
    uncertain: raw.uncertainCount ?? 0,
    contradicted: raw.contradictedCount ?? 0,
  };
}

/**
 * CONSISTENCY GUARD: Derive status ONLY from counters
 * Priority: contradicted > confirmed > uncertain > limited
 */
function deriveStatusFromCounters(counters: IA11KeyPoints): ProDisplayStatus {
  if (counters.contradicted > 0) return 'contradicted';
  if (counters.confirmed > 0) return 'confirmed';
  if (counters.uncertain > 0) return 'uncertain';
  return 'limited';
}

/**
 * Main normalization function with consistency guard
 * 
 * CRITICAL RULES:
 * 1. If total sources = 0, force counters to 0/0/0 and status to 'limited'
 * 2. Never infer uncertain from missing sources
 * 3. Status is derived ONLY from counters
 */
export function normalizeIA11Response(
  raw: IA11RawResponse,
  language: 'en' | 'fr' = 'fr'
): NormalizedIA11Data {
  const t = getTranslations(language);
  
  // Extract source buckets
  const sourcesBuckets = raw.result?.sourcesBuckets ?? {
    corroborate: [],
    contradict: [],
    neutral: [],
  };
  
  // Extract fallback sources (result.sources array)
  const fallbackSources: IA11SourceItem[] = raw.result?.sources ?? [];
  
  // Determine web evidence display state
  const webEvidenceState = determineWebEvidenceState(
    sourcesBuckets,
    fallbackSources,
    raw.result?.web
  );
  
  const sources = {
    corroborate: sourcesBuckets.corroborate ?? [],
    contradict: sourcesBuckets.contradict ?? [],
    neutral: sourcesBuckets.neutral ?? [],
    fallback: fallbackSources,
    total: countTotalSources(sourcesBuckets, fallbackSources),
  };
  
  // Extract raw counters from IA11
  let counters = extractCounters(raw);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONSISTENCY GUARD: If no sources exist, force 0/0/0 counters
  // ═══════════════════════════════════════════════════════════════════════════
  if (sources.total === 0) {
    counters = {
      confirmed: 0,
      uncertain: 0,
      contradicted: 0,
    };
  }
  
  // Derive status from (possibly corrected) counters
  const status = deriveStatusFromCounters(counters);
  
  // Get badge text based on status
  const badgeText = t.badge[status];
  
  // Get web proof card text based on web evidence state
  const webProofCard = t.webProof[webEvidenceState];
  
  // Extract other fields
  const verifiedFacts = raw.result?.verifiedFacts ?? [];
  const corrections = raw.result?.corrections ?? [];
  const summary = raw.result?.summary ?? raw.summary ?? '';
  const reasons = raw.result?.reasons ?? raw.reasons ?? [];
  const meta: IA11Meta = raw.meta ?? {};
  
  return {
    raw,
    sources,
    webEvidenceState,
    counters,
    status,
    badgeText,
    webProofCard,
    verifiedFacts,
    corrections,
    summary,
    reasons,
    meta,
  };
}

/**
 * Type guard to check if we have normalized data
 */
export function isNormalizedIA11Data(data: unknown): data is NormalizedIA11Data {
  return (
    typeof data === 'object' &&
    data !== null &&
    'raw' in data &&
    'counters' in data &&
    'status' in data
  );
}
