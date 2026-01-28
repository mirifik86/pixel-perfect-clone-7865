import { useState, useEffect, useMemo, useCallback } from 'react';
import { ExternalLink, Shield, BookOpen, Newspaper, Building2, Copy, Check, Filter, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Legacy source format
interface LegacySourceDetail {
  name: string;
  url: string;
  snippet: string;
}

// New PRO source format from analyze edge function
interface NewProSource {
  title: string;
  publisher: string;
  url: string;
  trustTier: 'high' | 'medium' | 'low';
  whyItMatters: string;
}

// Normalized source format (internal use)
interface NormalizedSource {
  name: string;
  publisher?: string;
  url: string;
  snippet: string;
  trustTier?: 'high' | 'medium' | 'low';
}

interface BestSourcesSectionProps {
  sources: {
    corroborated?: (string | LegacySourceDetail | NewProSource)[];
    neutral?: (string | LegacySourceDetail | NewProSource)[];
    constrained?: (string | LegacySourceDetail | NewProSource)[];
    contradicting?: (string | LegacySourceDetail | NewProSource)[];
  };
  language: 'en' | 'fr';
  outcome?: string;
  claim?: string;
  /** 
   * Mode controls which sources to display:
   * - "contradictingOnly": Only show contradicting sources
   * - "supportingOnly": Only show corroborated + neutral sources
   * - "all": Show all sources (default behavior)
   */
  mode?: 'contradictingOnly' | 'supportingOnly' | 'all';
}

// Extract key terms from claim (words longer than 4 letters)
const extractKeyTerms = (text: string): string[] => {
  if (!text) return [];
  const words = text.toLowerCase().split(/\s+/);
  return words
    .map(word => word.replace(/[^a-zA-ZÀ-ÿ0-9]/g, ''))
    .filter(word => word.length > 4);
};

// Check if source is topically relevant to the claim
const isTopicallyRelevant = (source: NormalizedSource, keyTerms: string[]): boolean => {
  if (keyTerms.length === 0) return true;
  
  const nameLower = source.name.toLowerCase();
  const snippetLower = source.snippet.toLowerCase();
  const publisherLower = (source.publisher || '').toLowerCase();
  const combined = `${nameLower} ${snippetLower} ${publisherLower}`;
  
  return keyTerms.some(term => combined.includes(term));
};

// Get domain from URL (without www)
const getDomainFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};

// Helper to normalize source from any format to NormalizedSource
const getSourceDetails = (source: string | LegacySourceDetail | NewProSource): NormalizedSource | null => {
  if (typeof source === 'string') {
    return null; // String-only sources can't be normalized
  }
  
  if (!source || typeof source !== 'object') {
    return null;
  }
  
  // New PRO format: has title + whyItMatters
  if ('title' in source && 'whyItMatters' in source) {
    const proSource = source as NewProSource;
    if (!proSource.url) return null;
    
    return {
      name: proSource.title || getDomainFromUrl(proSource.url),
      publisher: proSource.publisher || undefined,
      url: proSource.url,
      snippet: proSource.whyItMatters || '',
      trustTier: proSource.trustTier || undefined,
    };
  }
  
  // Legacy format: has name + snippet
  if ('name' in source && 'url' in source) {
    const legacySource = source as LegacySourceDetail;
    if (!legacySource.url) return null;
    
    // Infer trust tier from patterns
    const inferredTier = inferTrustTier(legacySource.name, legacySource.url);
    
    return {
      name: legacySource.name || getDomainFromUrl(legacySource.url),
      publisher: derivePublisher(legacySource.name, legacySource.url),
      url: legacySource.url,
      snippet: legacySource.snippet || '',
      trustTier: inferredTier,
    };
  }
  
  return null;
};

// Derive publisher from domain
const derivePublisher = (name: string, url: string): string | undefined => {
  const domain = getDomainFromUrl(url);
  if (!domain) return undefined;
  
  // Clean domain to publisher name
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const main = parts[parts.length - 2];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return undefined;
};

// Infer trust tier from source name/domain patterns
const inferTrustTier = (name: string, url: string): 'high' | 'medium' | 'low' => {
  const combined = (name + ' ' + url).toLowerCase();
  
  // High trust: government, major institutions, top-tier media
  const highTrustPatterns = /\.(gov|gouv|edu|int)\b|wikipedia|britannica|reuters|associated\s*press|afp|bbc|cnn|new\s*york\s*times|washington\s*post|wall\s*street|nature\.com|science\.org|pubmed|who\.int|un\.org|nasa|nih|cdc|fda/i;
  if (highTrustPatterns.test(combined)) {
    return 'high';
  }
  
  // Major media patterns
  const majorMediaPatterns = /guardian|telegraph|le\s*monde|figaro|economist|bloomberg|politico|npr|pbs|time\.com|forbes|wired/i;
  if (majorMediaPatterns.test(combined)) {
    return 'medium';
  }
  
  return 'medium';
};

// Classify source type based on name/url/publisher patterns
const classifySourceType = (source: NormalizedSource): { type: 'official' | 'reference' | 'media'; label: string; labelFr: string; icon: React.ReactNode; style: string } => {
  const nameLower = source.name.toLowerCase();
  const urlLower = source.url.toLowerCase();
  const publisherLower = (source.publisher || '').toLowerCase();
  const combined = `${nameLower} ${urlLower} ${publisherLower}`;
  
  // Use trustTier to boost classification if available
  const trustTier = source.trustTier;
  
  // Official Sources: Government, institutional archives, official bodies
  const officialPatterns = /\.(gov|gouv|gob|govt)\b|\.gov\.|government|official|ministry|ministère|department|white\s*house|élysée|europa\.eu|who\.int|un\.org|unesco|fbi|cdc|fda|nasa|esa|nih|state\.gov|justice\.gov|treasury|defense\.gov/i;
  
  // Reference: Encyclopedias, academic sources, fact-checkers
  const referencePatterns = /britannica|encyclopedia|encyclopédie|wikipedia|oxford|cambridge|merriam|webster|larousse|scholarpedia|stanford\s*encyclopedia|jstor|pubmed|ncbi|nature\.com|science\.org|sciencedirect|springer|snopes|factcheck|politifact/i;
  
  if (officialPatterns.test(combined) || (trustTier === 'high' && officialPatterns.test(combined))) {
    return {
      type: 'official',
      label: 'Official',
      labelFr: 'Officiel',
      icon: <Building2 className="w-3.5 h-3.5" />,
      style: 'bg-blue-500/10 text-blue-700 border-blue-500/25'
    };
  }
  
  if (referencePatterns.test(combined)) {
    return {
      type: 'reference',
      label: 'Reference',
      labelFr: 'Référence',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      style: 'bg-violet-500/10 text-violet-700 border-violet-500/25'
    };
  }
  
  return {
    type: 'media',
    label: 'Major Media',
    labelFr: 'Média majeur',
    icon: <Newspaper className="w-3.5 h-3.5" />,
    style: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25'
  };
};

// Detect contextual badge for contradicting sources based on snippet keywords
const getContradictingContextBadge = (snippet: string, language: 'en' | 'fr'): { label: string } | null => {
  const snippetLower = snippet.toLowerCase();
  
  const classificationKeywords = ['mammal', 'mammalia', 'vertebrate', 'invertebrate', 'chordata', 'animalia', 'plantae'];
  if (classificationKeywords.some(kw => snippetLower.includes(kw))) {
    return { label: language === 'fr' ? 'Classification scientifique' : 'Scientific classification' };
  }
  
  const taxonomyKeywords = ['species', 'genus', 'family', 'class', 'order', 'phylum', 'kingdom', 'taxonomy', 'taxonomic'];
  if (taxonomyKeywords.some(kw => snippetLower.includes(kw))) {
    return { label: language === 'fr' ? 'Preuve taxonomique' : 'Taxonomic evidence' };
  }
  
  return null;
};

// Get favicon URL for a domain
const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

// Hub/section paths to reject
const HUB_PATHS = new Set([
  '/news', '/world', '/politics', '/business', '/sport', '/sports',
  '/entertainment', '/health', '/science', '/tech', '/technology',
  '/video', '/videos', '/live', '/latest', '/breaking', '/search',
  '/tag', '/tags', '/topic', '/topics', '/category', '/categories',
  '/hub', '/section', '/sections'
]);

// Trusted domains that bypass strict article URL validation
const TRUSTED_DOMAINS = new Set([
  'nps.gov', 'si.edu', 'nationalzoo.si.edu', 'australian.museum',
  'britannica.com', 'wikipedia.org', 'en.wikipedia.org', 'fr.wikipedia.org',
  'de.wikipedia.org', 'es.wikipedia.org', 'aspca.org', 'petmd.com',
  'vcahospitals.com', 'cdc.gov', 'nih.gov', 'nasa.gov', 'who.int',
  'nature.com', 'sciencedirect.com', 'pubmed.ncbi.nlm.nih.gov',
]);

// Check if hostname is a trusted domain
const isTrustedDomain = (hostname: string): boolean => {
  const normalizedHost = hostname.replace(/^www\./, '').toLowerCase();
  
  if (TRUSTED_DOMAINS.has(normalizedHost)) return true;
  
  for (const trusted of TRUSTED_DOMAINS) {
    if (normalizedHost.endsWith(`.${trusted}`)) return true;
  }
  
  if (normalizedHost.endsWith('.gov') || normalizedHost.endsWith('.edu')) return true;
  
  return false;
};

// Check if URL points to an actual article page
const isArticleUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const pathname = parsed.pathname.toLowerCase();
    
    if (isTrustedDomain(hostname)) {
      if (pathname === '/' || pathname === '') return false;
      return true;
    }
    
    if (pathname === '/' || pathname === '') return false;
    
    const normalizedPath = pathname.replace(/\/$/, '');
    if (HUB_PATHS.has(normalizedPath)) return false;
    
    const segments = pathname.split('/').filter(s => s.length > 0);
    if (segments.length <= 1) return false;
    
    if (pathname.includes('/article') || pathname.includes('/articles')) return true;
    
    const datePattern = /\/\d{4}\/\d{1,2}\/\d{1,2}|-\d{4}-|\d{4}-\d{2}-\d{2}/;
    if (datePattern.test(pathname)) return true;
    
    if (segments.length >= 3) return true;
    
    const hasLongSlug = segments.some(seg => seg.length >= 20 || seg.includes('-'));
    if (hasLongSlug) return true;
    
    return false;
  } catch {
    return false;
  }
};

// Check if URL contains dead-link patterns
const isBadUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true;
  
  const lowered = url.toLowerCase();
  const badPatterns = ['404', 'not-found', 'page-not-found', 'notfound', '/error', 'redirect=0', 'webcache', 'amp/s'];
  
  return badPatterns.some(pattern => lowered.includes(pattern));
};

// Too-general Wikipedia pages
const TOO_GENERAL_WIKI_PATHS = new Set([
  '/wiki/animal', '/wiki/animals', '/wiki/insect', '/wiki/insects',
  '/wiki/mammal', '/wiki/mammals', '/wiki/reptile', '/wiki/reptiles',
  '/wiki/bird', '/wiki/birds', '/wiki/fish', '/wiki/plant', '/wiki/plants',
  '/wiki/human', '/wiki/humans',
]);

const isTooGeneralWikipedia = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.includes('wikipedia.org')) return false;
    const pathname = parsed.pathname.toLowerCase().replace(/\/$/, '');
    return TOO_GENERAL_WIKI_PATHS.has(pathname);
  } catch {
    return false;
  }
};

// Trust tier priority for sorting/dedup
const TRUST_TIER_PRIORITY: Record<string, number> = { high: 0, medium: 1, low: 2 };

const getTrustTierPriority = (tier?: string): number => {
  return TRUST_TIER_PRIORITY[tier || 'medium'] ?? 1;
};

// Get trust priority from classification type
const getTypePriority = (source: NormalizedSource): number => {
  const { type } = classifySourceType(source);
  if (type === 'official') return 1;
  if (type === 'reference') return 2;
  return 3;
};

// Trust tier badge styles
const trustTierBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

// Source card component
const SourceCard = ({ 
  source, 
  idx, 
  isCounterClaim, 
  language, 
  openLabel,
  isVerified = false
}: { 
  source: NormalizedSource; 
  idx: number; 
  isCounterClaim: boolean; 
  language: 'en' | 'fr'; 
  openLabel: string;
  isVerified?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const classification = classifySourceType(source);
  const faviconUrl = getFaviconUrl(source.url);
  
  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(source.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };
  
  // Trust tier label
  const trustTierLabels: Record<string, { en: string; fr: string }> = {
    high: { en: 'High Trust', fr: 'Haute confiance' },
    medium: { en: 'Medium Trust', fr: 'Confiance moyenne' },
    low: { en: 'Low Trust', fr: 'Faible confiance' },
  };
  
  return (
    <a
      key={`${isCounterClaim ? 'counter' : 'best'}-source-${idx}`}
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
                 ${isCounterClaim 
                   ? 'border-red-200 bg-gradient-to-br from-white to-red-50/50 hover:border-red-300 hover:to-red-50/80' 
                   : 'border-slate-200 bg-gradient-to-br from-white to-slate-50/80 hover:border-slate-300 hover:from-white hover:to-cyan-50/30'
                 }`}
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-white border flex items-center justify-center shadow-sm overflow-hidden
                        ${isCounterClaim ? 'border-red-200/80' : 'border-slate-200/80'}`}>
          {faviconUrl ? (
            <img 
              src={faviconUrl} 
              alt="" 
              className="w-5 h-5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <ExternalLink className="w-4 h-4 text-slate-400" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* Source Name - clickable */}
            <span className={`font-semibold text-sm transition-colors
                            ${isCounterClaim ? 'text-slate-800 group-hover:text-red-700' : 'text-slate-800 group-hover:text-cyan-700'}`}>
              {source.name}
            </span>
            
            {/* Trust Tier Badge (if available) */}
            {source.trustTier && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
                               ${trustTierBadgeStyles[source.trustTier].bg} 
                               ${trustTierBadgeStyles[source.trustTier].text} 
                               ${trustTierBadgeStyles[source.trustTier].border}`}>
                {language === 'fr' 
                  ? trustTierLabels[source.trustTier].fr 
                  : trustTierLabels[source.trustTier].en}
              </span>
            )}
            
            {/* Type Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                             border ${classification.style}`}>
              {classification.icon}
              {language === 'fr' ? classification.labelFr : classification.label}
            </span>
            
            {/* Counter-claim indicator badge */}
            {isCounterClaim && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                               bg-red-500/15 text-red-700 border border-red-500/30">
                {language === 'fr' ? 'Contredit' : 'Contradicts'}
              </span>
            )}
            
            {/* Contextual academic badge for contradicting sources */}
            {isCounterClaim && (() => {
              const contextBadge = getContradictingContextBadge(source.snippet, language);
              if (!contextBadge) return null;
              return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                                 bg-slate-100 text-slate-600 border border-slate-200">
                  <BookOpen className="w-3 h-3" />
                  {contextBadge.label}
                </span>
              );
            })()}
            
            {/* Verified link badge */}
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                               bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'fr' ? 'Lien vérifié' : 'Verified link'}
              </span>
            )}
          </div>
          
          {/* Publisher (secondary line) */}
          {source.publisher && (
            <p className="text-xs text-slate-500 mb-1">
              {source.publisher}
            </p>
          )}
          
          {/* Snippet / whyItMatters */}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {source.snippet}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex-shrink-0 self-center flex items-center gap-2">
          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium
                       transition-all duration-200
                       ${copied 
                         ? 'bg-emerald-100 text-emerald-700' 
                         : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                       }`}
            title={language === 'fr' ? 'Copier le lien' : 'Copy link'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Copié' : 'Copied'}</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          
          {/* Open button */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                           shadow-sm transition-all duration-200
                           ${isCounterClaim 
                             ? 'bg-slate-100 text-slate-600 group-hover:bg-red-600 group-hover:text-white' 
                             : 'bg-slate-100 text-slate-600 group-hover:bg-cyan-600 group-hover:text-white'
                           }`}>
            {openLabel}
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

// ===== FILTERING HELPERS =====

interface FilteredSource {
  source: NormalizedSource;
  category?: 'corroborated' | 'neutral';
}

// Deduplicate by DOMAIN, preferring higher trust tier, then longer snippet
const deduplicateByDomain = (sources: FilteredSource[]): FilteredSource[] => {
  const byDomain = new Map<string, FilteredSource>();
  
  for (const item of sources) {
    const domain = getDomainFromUrl(item.source.url);
    if (!domain) continue;
    
    const existing = byDomain.get(domain);
    if (!existing) {
      byDomain.set(domain, item);
      continue;
    }
    
    // Prefer higher trust tier
    const existingTier = getTrustTierPriority(existing.source.trustTier);
    const newTier = getTrustTierPriority(item.source.trustTier);
    
    if (newTier < existingTier) {
      byDomain.set(domain, item);
      continue;
    }
    
    // Same tier: prefer longer snippet
    if (newTier === existingTier && item.source.snippet.length > existing.source.snippet.length) {
      byDomain.set(domain, item);
    }
  }
  
  return Array.from(byDomain.values());
};

// Apply quality filters + article URL check
const applyQualityFilters = (sources: FilteredSource[], claimKeyTerms: string[], strict: boolean): FilteredSource[] => {
  return sources.filter(({ source }) => {
    // Must have snippet of minimum length
    if (!source.snippet || source.snippet.length < 10) return false;
    
    // Quality filters
    if (isBadUrl(source.url)) return false;
    if (isTooGeneralWikipedia(source.url)) return false;
    
    // Article URL check (strict mode only for non-trusted domains)
    if (strict) {
      const domain = getDomainFromUrl(source.url);
      if (!isTrustedDomain(domain) && !isArticleUrl(source.url)) {
        return false;
      }
    }
    
    // Topical relevance (only in strict mode)
    if (strict && !isTopicallyRelevant(source, claimKeyTerms)) {
      return false;
    }
    
    return true;
  });
};

// Sort by trust tier then type priority
const sortByTrust = (sources: FilteredSource[]): FilteredSource[] => {
  return [...sources].sort((a, b) => {
    // First by trust tier
    const tierDiff = getTrustTierPriority(a.source.trustTier) - getTrustTierPriority(b.source.trustTier);
    if (tierDiff !== 0) return tierDiff;
    
    // Then by type priority
    return getTypePriority(a.source) - getTypePriority(b.source);
  });
};

// Filter stats indicator component
const FilterStatsIndicator = ({ 
  displayed, 
  total, 
  language 
}: { 
  displayed: number; 
  total: number; 
  language: 'en' | 'fr'; 
}) => {
  if (total === 0 || displayed === total) return null;
  
  const filtered = total - displayed;
  const label = language === 'fr' 
    ? `${displayed} affichée${displayed > 1 ? 's' : ''} sur ${total} (${filtered} filtrée${filtered > 1 ? 's' : ''})`
    : `${displayed} of ${total} shown (${filtered} filtered)`;
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
                     bg-slate-100 text-slate-500 border border-slate-200/80">
      <Filter className="w-3 h-3" />
      {label}
    </span>
  );
};

// Max sources to display
const MAX_SUPPORTING_SOURCES = 3;
const MAX_CONTRADICTING_SOURCES = 3;

export const BestSourcesSection = ({ sources, language, outcome, claim, mode = 'all' }: BestSourcesSectionProps) => {
  const [showUnfiltered, setShowUnfiltered] = useState(false);
  const [verifiedUrls, setVerifiedUrls] = useState<Set<string>>(new Set());
  const [invalidUrls, setInvalidUrls] = useState<Set<string>>(new Set());
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  const claimKeyTerms = extractKeyTerms(claim || '');
  
  const t = {
    title: language === 'fr' ? 'Meilleures preuves (PRO)' : 'Best evidence (PRO)',
    open: language === 'fr' ? 'Ouvrir' : 'Open',
    refutedTitle: language === 'fr' ? 'Sources réfutantes (PRO)' : 'Refuting sources (PRO)',
    counterClaimTitle: language === 'fr' 
      ? 'Sources crédibles affirmant l\'inverse' 
      : 'Credible sources stating the opposite',
    counterClaimExplanation: language === 'fr'
      ? 'Plusieurs sources faisant autorité affirment clairement l\'inverse de cette affirmation.'
      : 'Multiple authoritative sources clearly state the opposite of this claim.',
    sourcesFilteredTitle: language === 'fr' ? 'Sources trouvées, mais non affichées' : 'Sources found, but hidden',
    sourcesFilteredSubtitle: language === 'fr'
      ? "Des sources ont été consultées, mais elles n'ont pas passé nos filtres de pertinence."
      : "Sources were consulted, but they didn't pass our relevance filters.",
    showAnyway: language === 'fr' ? 'Afficher quand même' : 'Show anyway',
    sourcesUnusableTitle: language === 'fr' ? 'Sources consultées mais non affichables' : 'Sources consulted but not displayable',
    sourcesUnusableSubtitle: language === 'fr'
      ? "Des sources ont été consultées mais les liens étaient inutilisables."
      : "Sources were consulted but links were not usable.",
    retryLabel: language === 'fr' ? 'Relancer la recherche PRO' : 'Retry PRO search',
    verifyingLinks: language === 'fr' ? 'Vérification des liens…' : 'Verifying links…',
  };
  
  // ===== NORMALIZE ALL SOURCES =====
  const allSupportingSources: FilteredSource[] = useMemo(() => {
    const result: FilteredSource[] = [];
    sources.corroborated?.forEach(s => {
      const details = getSourceDetails(s);
      if (details) result.push({ source: details, category: 'corroborated' });
    });
    sources.neutral?.forEach(s => {
      const details = getSourceDetails(s);
      if (details) result.push({ source: details, category: 'neutral' });
    });
    return result;
  }, [sources.corroborated, sources.neutral]);
  
  const allContradictingSources: FilteredSource[] = useMemo(() => {
    const result: FilteredSource[] = [];
    sources.contradicting?.forEach(s => {
      const details = getSourceDetails(s);
      if (details) result.push({ source: details });
    });
    return result;
  }, [sources.contradicting]);
  
  const consultedCount = allSupportingSources.length + allContradictingSources.length;
  
  // URLs for verification (only final candidates after filtering)
  const candidateUrls = useMemo(() => {
    // Dedup first, then filter, to reduce verification load
    const dedupedSupporting = deduplicateByDomain(allSupportingSources);
    const dedupedContradicting = deduplicateByDomain(allContradictingSources);
    
    const urls: { url: string; name: string; snippet: string }[] = [];
    [...dedupedSupporting, ...dedupedContradicting].forEach(({ source }) => {
      urls.push({ url: source.url, name: source.name, snippet: source.snippet });
    });
    return urls;
  }, [allSupportingSources, allContradictingSources]);
  
  // URL verification
  const verifyUrls = useCallback(async () => {
    if (candidateUrls.length === 0 || verificationComplete) return;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-urls', {
        body: { urls: candidateUrls }
      });
      
      if (error) {
        setVerifiedUrls(new Set(candidateUrls.map(u => u.url)));
      } else if (data?.results) {
        const valid = new Set<string>();
        const invalid = new Set<string>();
        
        data.results.forEach((r: { originalUrl: string; isValid: boolean }) => {
          if (r.isValid) valid.add(r.originalUrl);
          else invalid.add(r.originalUrl);
        });
        
        setVerifiedUrls(valid);
        setInvalidUrls(invalid);
      }
    } catch {
      setVerifiedUrls(new Set(candidateUrls.map(u => u.url)));
    } finally {
      setIsVerifying(false);
      setVerificationComplete(true);
    }
  }, [candidateUrls, verificationComplete]);
  
  useEffect(() => {
    verifyUrls();
  }, [verifyUrls]);
  
  // Filter out invalid URLs
  const filterVerified = useCallback((sources: FilteredSource[]): FilteredSource[] => {
    if (!verificationComplete) return sources;
    return sources.filter(({ source }) => !invalidUrls.has(source.url));
  }, [invalidUrls, verificationComplete]);
  
  // ===== PROCESSING PIPELINE =====
  // 1. Dedup by domain
  // 2. Apply quality filters (strict or relaxed)
  // 3. Remove invalid URLs
  // 4. Sort by trust
  // 5. Cap to max
  
  const processedSupportingStrict = useMemo(() => {
    const deduped = deduplicateByDomain(allSupportingSources);
    const filtered = applyQualityFilters(deduped, claimKeyTerms, true);
    const verified = filterVerified(filtered);
    const sorted = sortByTrust(verified);
    return sorted.slice(0, MAX_SUPPORTING_SOURCES);
  }, [allSupportingSources, claimKeyTerms, filterVerified]);
  
  const processedSupportingRelaxed = useMemo(() => {
    const deduped = deduplicateByDomain(allSupportingSources);
    const filtered = applyQualityFilters(deduped, claimKeyTerms, false);
    const verified = filterVerified(filtered);
    const sorted = sortByTrust(verified);
    return sorted.slice(0, MAX_SUPPORTING_SOURCES);
  }, [allSupportingSources, claimKeyTerms, filterVerified]);
  
  const processedContradictingStrict = useMemo(() => {
    const deduped = deduplicateByDomain(allContradictingSources);
    const filtered = applyQualityFilters(deduped, claimKeyTerms, true);
    const verified = filterVerified(filtered);
    const sorted = sortByTrust(verified);
    return sorted.slice(0, MAX_CONTRADICTING_SOURCES);
  }, [allContradictingSources, claimKeyTerms, filterVerified]);
  
  const processedContradictingRelaxed = useMemo(() => {
    const deduped = deduplicateByDomain(allContradictingSources);
    const filtered = applyQualityFilters(deduped, claimKeyTerms, false);
    const verified = filterVerified(filtered);
    const sorted = sortByTrust(verified);
    return sorted.slice(0, MAX_CONTRADICTING_SOURCES);
  }, [allContradictingSources, claimKeyTerms, filterVerified]);
  
  // Final sources based on state
  const finalSupportingSources = showUnfiltered ? processedSupportingRelaxed : processedSupportingStrict;
  const finalContradictingSources = showUnfiltered ? processedContradictingRelaxed : processedContradictingStrict;
  
  // Fallback logic
  const supportingStrictFailed = processedSupportingStrict.length < 2;
  const supportingHasRelaxed = processedSupportingRelaxed.length >= 1;
  const supportingNeedsFallback = supportingStrictFailed && supportingHasRelaxed;
  const supportingAllFailed = processedSupportingStrict.length === 0 && processedSupportingRelaxed.length === 0;
  
  const hasCounterClaims = finalContradictingSources.length > 0;
  const isRefuted = outcome === 'refuted';
  const sectionTitle = isRefuted ? t.refutedTitle : t.title;
  
  // ===== RENDER =====
  
  // Loading state
  if (isVerifying) {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
          <span className="text-sm text-slate-600">{t.verifyingLinks}</span>
        </div>
      </div>
    );
  }
  
  // MODE: contradictingOnly
  if (mode === 'contradictingOnly') {
    if (finalContradictingSources.length === 0) return null;
    
    const displayTitle = isRefuted ? t.refutedTitle : t.counterClaimTitle;
    
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
              {displayTitle}
            </h4>
          </div>
          <FilterStatsIndicator 
            displayed={finalContradictingSources.length} 
            total={allContradictingSources.length} 
            language={language} 
          />
        </div>
        
        <p className="text-sm text-slate-600 leading-relaxed mb-4 pl-10">
          {t.counterClaimExplanation}
        </p>
        
        <div className="space-y-3">
          {finalContradictingSources.map(({ source }, idx) => (
            <SourceCard 
              key={`contra-${idx}`}
              source={source} 
              idx={idx} 
              isCounterClaim={true} 
              language={language} 
              openLabel={t.open}
              isVerified={verifiedUrls.has(source.url)}
            />
          ))}
        </div>
      </div>
    );
  }
  
  // MODE: supportingOnly
  if (mode === 'supportingOnly') {
    // All failed + sources were consulted
    if (supportingAllFailed && consultedCount > 0) {
      return (
        <div className="mt-6 pt-5 border-t border-slate-200/80">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-500" />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
              {t.sourcesUnusableTitle}
            </h4>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/50 to-slate-50/80 p-5 shadow-sm">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {t.sourcesUnusableSubtitle}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors duration-200"
            >
              {t.retryLabel}
            </button>
          </div>
        </div>
      );
    }
    
    // Show fallback if strict failed but relaxed has sources
    if (!showUnfiltered && supportingNeedsFallback) {
      return (
        <div className="mt-6 pt-5 border-t border-slate-200/80">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
              {t.sourcesFilteredTitle}
            </h4>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50/50 to-slate-50/80 p-5 shadow-sm">
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.sourcesFilteredSubtitle}
            </p>
            <button
              onClick={() => setShowUnfiltered(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200"
            >
              {t.showAnyway}
            </button>
          </div>
        </div>
      );
    }
    
    if (finalSupportingSources.length > 0) {
      return (
        <div className="mt-6 pt-5 border-t border-slate-200/80">
          <div className="flex items-center justify-between gap-2.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isRefuted ? 'bg-red-100' : 'bg-cyan-100'}`}>
                <Shield className={`w-4 h-4 ${isRefuted ? 'text-red-600' : 'text-cyan-600'}`} />
              </div>
              <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
                {sectionTitle}
              </h4>
            </div>
            <FilterStatsIndicator 
              displayed={finalSupportingSources.length} 
              total={allSupportingSources.length} 
              language={language} 
            />
          </div>
          
          <div className="space-y-3">
            {finalSupportingSources.map(({ source }, idx) => (
              <SourceCard 
                key={`support-${idx}`}
                source={source} 
                idx={idx} 
                isCounterClaim={false} 
                language={language} 
                openLabel={t.open}
                isVerified={verifiedUrls.has(source.url)}
              />
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  }
  
  // MODE: all (default)
  const needsFallback = !showUnfiltered && supportingNeedsFallback && !hasCounterClaims;
  
  if (supportingAllFailed && !hasCounterClaims && consultedCount > 0) {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-slate-500" />
          </div>
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
            {t.sourcesUnusableTitle}
          </h4>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/50 to-slate-50/80 p-5 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {t.sourcesUnusableSubtitle}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-colors duration-200"
          >
            {t.retryLabel}
          </button>
        </div>
      </div>
    );
  }
  
  if (needsFallback) {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
            {t.sourcesFilteredTitle}
          </h4>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50/50 to-slate-50/80 p-5 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.sourcesFilteredSubtitle}
          </p>
          <button
            onClick={() => setShowUnfiltered(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200"
          >
            {t.showAnyway}
          </button>
        </div>
      </div>
    );
  }
  
  // Normal rendering
  return (
    <div className="mt-6 pt-5 border-t border-slate-200/80">
      {/* Counter-Claims Section */}
      {hasCounterClaims && (
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
              {t.counterClaimTitle}
            </h4>
          </div>
          
          <p className="text-sm text-slate-600 leading-relaxed mb-4 pl-10">
            {t.counterClaimExplanation}
          </p>
          
          <div className="space-y-3">
            {finalContradictingSources.map(({ source }, idx) => (
              <SourceCard 
                key={`counter-${idx}`}
                source={source} 
                idx={idx} 
                isCounterClaim={true} 
                language={language} 
                openLabel={t.open}
                isVerified={verifiedUrls.has(source.url)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Supporting Sources Section */}
      {finalSupportingSources.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-2.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isRefuted ? 'bg-red-100' : 'bg-cyan-100'}`}>
                <Shield className={`w-4 h-4 ${isRefuted ? 'text-red-600' : 'text-cyan-600'}`} />
              </div>
              <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
                {sectionTitle}
              </h4>
            </div>
            <FilterStatsIndicator 
              displayed={finalSupportingSources.length} 
              total={allSupportingSources.length} 
              language={language} 
            />
          </div>
          
          <div className="space-y-3">
            {finalSupportingSources.map(({ source }, idx) => (
              <SourceCard 
                key={`best-${idx}`}
                source={source} 
                idx={idx} 
                isCounterClaim={false} 
                language={language} 
                openLabel={t.open}
                isVerified={verifiedUrls.has(source.url)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
