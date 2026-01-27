import { useState } from 'react';
import { ExternalLink, Shield, BookOpen, Newspaper, Building2, Copy, Check, Filter } from 'lucide-react';

interface SourceDetail {
  name: string;
  url: string;
  snippet: string;
}

interface BestSourcesSectionProps {
  sources: {
    corroborated?: (string | SourceDetail)[];
    neutral?: (string | SourceDetail)[];
    constrained?: (string | SourceDetail)[];
    contradicting?: (string | SourceDetail)[];
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
    .map(word => word.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '')) // Remove punctuation
    .filter(word => word.length > 4);
};

// Check if source is topically relevant to the claim
const isTopicallyRelevant = (source: SourceDetail, keyTerms: string[]): boolean => {
  if (keyTerms.length === 0) return true; // No key terms = no filter
  
  const nameLower = source.name.toLowerCase();
  const snippetLower = source.snippet.toLowerCase();
  const combined = `${nameLower} ${snippetLower}`;
  
  return keyTerms.some(term => combined.includes(term));
};

// Helper to extract source details from either string or SourceDetail
const getSourceDetails = (source: string | SourceDetail): SourceDetail | null => {
  if (typeof source === 'object' && source.name && source.url) {
    return source;
  }
  return null;
};

// Classify source type based on name/url patterns
const classifySourceType = (source: SourceDetail): { type: 'official' | 'reference' | 'media'; label: string; labelFr: string; icon: React.ReactNode; style: string } => {
  const nameLower = source.name.toLowerCase();
  const urlLower = source.url.toLowerCase();
  const combined = `${nameLower} ${urlLower}`;
  
  // Official Sources: Government, institutional archives, official bodies
  const officialPatterns = /\.(gov|gouv|gob|govt)\b|\.gov\.|government|official|ministry|ministère|department|white\s*house|élysée|europa\.eu|who\.int|un\.org|unesco|fbi|cdc|fda|nasa|esa|nih|state\.gov|justice\.gov|treasury|defense\.gov/i;
  
  // Reference: Encyclopedias, academic sources, fact-checkers
  const referencePatterns = /britannica|encyclopedia|encyclopédie|wikipedia|oxford|cambridge|merriam|webster|larousse|scholarpedia|stanford\s*encyclopedia|jstor|pubmed|ncbi|nature\.com|science\.org|sciencedirect|springer|snopes|factcheck|politifact/i;
  
  if (officialPatterns.test(combined)) {
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
  
  // Default to media
  return {
    type: 'media',
    label: 'Major Media',
    labelFr: 'Média majeur',
    icon: <Newspaper className="w-3.5 h-3.5" />,
    style: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25'
  };
};

// Detect contextual badge for contradicting sources based on snippet keywords
const getContradictingContextBadge = (snippet: string, language: 'en' | 'fr'): { label: string; icon?: React.ReactNode } | null => {
  const snippetLower = snippet.toLowerCase();
  
  // Scientific classification keywords
  const classificationKeywords = ['mammal', 'mammalia', 'vertebrate', 'invertebrate', 'chordata', 'animalia', 'plantae'];
  if (classificationKeywords.some(kw => snippetLower.includes(kw))) {
    return {
      label: language === 'fr' ? 'Classification scientifique' : 'Scientific classification'
    };
  }
  
  // Taxonomic evidence keywords
  const taxonomyKeywords = ['species', 'genus', 'family', 'class', 'order', 'phylum', 'kingdom', 'taxonomy', 'taxonomic', 'espèce', 'genre', 'famille', 'classe', 'ordre', 'phylum', 'taxonomie'];
  if (taxonomyKeywords.some(kw => snippetLower.includes(kw))) {
    return {
      label: language === 'fr' ? 'Preuve taxonomique' : 'Taxonomic evidence'
    };
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

// Hub/section paths to reject (too generic, not article pages)
const HUB_PATHS = new Set([
  '/news', '/world', '/politics', '/business', '/sport', '/sports',
  '/entertainment', '/health', '/science', '/tech', '/technology',
  '/video', '/videos', '/live', '/latest', '/breaking', '/search',
  '/tag', '/tags', '/topic', '/topics', '/category', '/categories',
  '/hub', '/section', '/sections'
]);

// Trusted domains that bypass strict article URL validation
// These are authoritative sources that may use non-standard URL structures
const TRUSTED_DOMAINS = new Set([
  // Government & Museums
  'nps.gov',
  'si.edu',
  'nationalzoo.si.edu',
  'australian.museum',
  // Reference & Encyclopedias
  'britannica.com',
  'wikipedia.org',
  'en.wikipedia.org',
  'fr.wikipedia.org',
  'de.wikipedia.org',
  'es.wikipedia.org',
  // Pet & Animal authorities
  'aspca.org',
  'petmd.com',
  'vcahospitals.com',
  // Science & Health
  'cdc.gov',
  'nih.gov',
  'nasa.gov',
  'who.int',
  'nature.com',
  'sciencedirect.com',
  'pubmed.ncbi.nlm.nih.gov',
]);

// Check if hostname is a trusted domain (exact match or ends with .gov/.edu)
const isTrustedDomain = (hostname: string): boolean => {
  const normalizedHost = hostname.replace(/^www\./, '').toLowerCase();
  
  // Check exact match in trusted domains set
  if (TRUSTED_DOMAINS.has(normalizedHost)) {
    return true;
  }
  
  // Check if it's a subdomain of a trusted domain
  for (const trusted of TRUSTED_DOMAINS) {
    if (normalizedHost.endsWith(`.${trusted}`)) {
      return true;
    }
  }
  
  // Accept all .gov and .edu domains
  if (normalizedHost.endsWith('.gov') || normalizedHost.endsWith('.edu')) {
    return true;
  }
  
  return false;
};

// Check if URL points to an actual article page (not a hub/homepage)
// Returns true for article-like URLs OR trusted domains (which bypass strict checks)
const isArticleUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const pathname = parsed.pathname.toLowerCase();
    
    // Trusted domains bypass the strict article URL check
    // (but still reject pure homepages)
    if (isTrustedDomain(hostname)) {
      // Still reject pure homepage
      if (pathname === '/' || pathname === '') {
        return false;
      }
      // Accept any path from trusted domains
      return true;
    }
    
    // Reject homepage or empty path
    if (pathname === '/' || pathname === '') {
      return false;
    }
    
    // Reject known hub/section paths
    const normalizedPath = pathname.replace(/\/$/, ''); // remove trailing slash
    if (HUB_PATHS.has(normalizedPath)) {
      return false;
    }
    
    // Get path segments (filter out empty strings)
    const segments = pathname.split('/').filter(s => s.length > 0);
    
    // Reject if too shallow (only 1 segment like /news or /world)
    if (segments.length <= 1) {
      return false;
    }
    
    // Accept if contains /article or /articles
    if (pathname.includes('/article') || pathname.includes('/articles')) {
      return true;
    }
    
    // Accept if contains date pattern (e.g., /2024/01/27 or -2024- or 2024-01-27)
    const datePattern = /\/\d{4}\/\d{1,2}\/\d{1,2}|-\d{4}-|\d{4}-\d{2}-\d{2}/;
    if (datePattern.test(pathname)) {
      return true;
    }
    
    // Accept if >= 3 segments OR has a long slug segment (>= 20 chars or contains hyphen)
    if (segments.length >= 3) {
      return true;
    }
    
    // Check for long slug segment (indicates specific article)
    const hasLongSlug = segments.some(seg => seg.length >= 20 || seg.includes('-'));
    if (hasLongSlug) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

// Check if URL contains dead-link patterns
const isBadUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true;
  
  const lowered = url.toLowerCase();
  const badPatterns = [
    '404', 'not-found', 'page-not-found', 'notfound',
    '/error', 'redirect=0', 'webcache', 'amp/s'
  ];
  
  return badPatterns.some(pattern => lowered.includes(pattern));
};

// Too-general Wikipedia pages (overly broad, not useful)
const TOO_GENERAL_WIKI_PATHS = new Set([
  '/wiki/animal',
  '/wiki/animals',
  '/wiki/insect',
  '/wiki/insects',
  '/wiki/mammal',
  '/wiki/mammals',
  '/wiki/reptile',
  '/wiki/reptiles',
  '/wiki/bird',
  '/wiki/birds',
  '/wiki/fish',
  '/wiki/plant',
  '/wiki/plants',
  '/wiki/human',
  '/wiki/humans',
]);

// Check if URL is a too-general Wikipedia page
const isTooGeneralWikipedia = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Only check Wikipedia domains
    if (!hostname.includes('wikipedia.org')) return false;
    
    const pathname = parsed.pathname.toLowerCase().replace(/\/$/, '');
    return TOO_GENERAL_WIKI_PATHS.has(pathname);
  } catch {
    return false;
  }
};

// Get normalized URL key for deduplication (hostname + pathname, no query/hash)
const getNormalizedUrlKey = (url: string): string => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const pathname = parsed.pathname.toLowerCase().replace(/\/$/, ''); // normalize trailing slash
    return `${hostname}${pathname}`;
  } catch {
    return '';
  }
};

// Helper function for trust level priority
const getTrustPriority = (source: SourceDetail): number => {
  const { type } = classifySourceType(source);
  if (type === 'official') return 1;
  if (type === 'reference') return 2;
  return 3; // media
};

// Source card component using anchor-based navigation for Safari COOP compatibility
const SourceCard = ({ 
  source, 
  idx, 
  isCounterClaim, 
  language, 
  openLabel 
}: { 
  source: SourceDetail; 
  idx: number; 
  isCounterClaim: boolean; 
  language: 'en' | 'fr'; 
  openLabel: string;
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
    }).catch(() => {
      // Fallback: do nothing if clipboard fails
    });
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
            {/* Source Name */}
            <span className={`font-semibold text-sm transition-colors
                            ${isCounterClaim ? 'text-slate-800 group-hover:text-red-700' : 'text-slate-800 group-hover:text-cyan-700'}`}>
              {source.name}
            </span>
            
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
          </div>
          
          {/* Snippet */}
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
          
          {/* Open button - styled as span since parent is anchor */}
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
  source: SourceDetail;
  category?: 'corroborated' | 'neutral';
}

// Pass A (strict): article URL + snippet + dedupe + topical relevance + quality filters
const filterStrictPass = (
  sources: FilteredSource[],
  claimKeyTerms: string[],
  seenUrls: Set<string>
): FilteredSource[] => {
  return sources.filter(({ source }) => {
    if (!source.snippet || source.snippet.length < 10) return false;
    if (isBadUrl(source.url)) return false;
    if (isTooGeneralWikipedia(source.url)) return false;
    if (!isArticleUrl(source.url)) return false;
    if (!isTopicallyRelevant(source, claimKeyTerms)) return false;
    
    const urlKey = getNormalizedUrlKey(source.url);
    if (!urlKey || seenUrls.has(urlKey)) return false;
    seenUrls.add(urlKey);
    return true;
  });
};

// Pass B (relaxed): article URL + snippet + dedupe + quality filters, NO topical relevance
const filterRelaxedPass = (
  sources: FilteredSource[],
  seenUrls: Set<string>
): FilteredSource[] => {
  return sources.filter(({ source }) => {
    if (!source.snippet || source.snippet.length < 10) return false;
    if (isBadUrl(source.url)) return false;
    if (isTooGeneralWikipedia(source.url)) return false;
    if (!isArticleUrl(source.url)) return false;
    
    const urlKey = getNormalizedUrlKey(source.url);
    if (!urlKey || seenUrls.has(urlKey)) return false;
    seenUrls.add(urlKey);
    return true;
  });
};

// Pass C (ultra-relaxed): valid URL + snippet + dedupe + quality filters
// No article URL check, no topical relevance - maximum recovery
const filterUltraRelaxedPass = (
  sources: FilteredSource[],
  seenUrls: Set<string>
): FilteredSource[] => {
  return sources.filter(({ source }) => {
    // Must have snippet of minimum length
    if (!source.snippet || source.snippet.length < 10) return false;
    
    // Quality filters still apply
    if (isBadUrl(source.url)) return false;
    if (isTooGeneralWikipedia(source.url)) return false;
    
    // Must have valid URL (just check it parses)
    try {
      const parsed = new URL(source.url);
      // Reject only pure homepages
      if (parsed.pathname === '/' || parsed.pathname === '') return false;
    } catch {
      return false;
    }
    
    // Dedupe
    const urlKey = getNormalizedUrlKey(source.url);
    if (!urlKey || seenUrls.has(urlKey)) return false;
    seenUrls.add(urlKey);
    return true;
  });
};

// Sort by trust level and cap
const sortAndCap = (sources: FilteredSource[], max: number): FilteredSource[] => {
  return [...sources]
    .sort((a, b) => getTrustPriority(a.source) - getTrustPriority(b.source))
    .slice(0, max);
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

export const BestSourcesSection = ({ sources, language, outcome, claim, mode = 'all' }: BestSourcesSectionProps) => {
  // State for 2-pass filtering: when true, use relaxed Pass B
  const [showUnfiltered, setShowUnfiltered] = useState(false);
  
  // Extract key terms from claim for relevance filtering
  const claimKeyTerms = extractKeyTerms(claim || '');
  
  const t = {
    title: language === 'fr' ? 'Meilleures preuves (PRO)' : 'Best evidence (PRO)',
    open: language === 'fr' ? 'Ouvrir' : 'Open',
    refutedTitle: language === 'fr' ? 'Sources réfutantes (PRO)' : 'Refuting sources (PRO)',
    // Counter-claim detection section
    counterClaimTitle: language === 'fr' 
      ? 'Sources crédibles affirmant l\'inverse' 
      : 'Credible sources stating the opposite',
    counterClaimExplanation: language === 'fr'
      ? 'Plusieurs sources faisant autorité affirment clairement l\'inverse de cette affirmation, indiquant un consensus scientifique ou factuel fort en opposition.'
      : 'Multiple authoritative sources clearly state the opposite of this claim, indicating strong scientific or factual consensus against it.',
    // Sources found but filtered fallback (Pass A failed, Pass B/C have sources)
    sourcesFilteredTitle: language === 'fr' ? 'Sources trouvées, mais non affichées' : 'Sources found, but hidden',
    sourcesFilteredSubtitle: language === 'fr'
      ? "Des sources ont été consultées, mais elles n'ont pas passé nos filtres de pertinence. Vous pouvez reformuler ou afficher les sources quand même."
      : "Sources were consulted, but they didn't pass our relevance filters. You can rephrase or show them anyway.",
    showAnyway: language === 'fr' ? 'Afficher quand même' : 'Show anyway',
    // Ultra fallback when even relaxed pass fails but sources were consulted
    sourcesUnusableTitle: language === 'fr' ? 'Sources consultées mais non affichables' : 'Sources consulted but not displayable',
    sourcesUnusableSubtitle: language === 'fr'
      ? "Des sources ont été consultées mais les liens étaient inutilisables (morts ou trop généraux)."
      : "Sources were consulted but links were not usable (dead or too general).",
    retryLabel: language === 'fr' ? 'Relancer la recherche PRO' : 'Retry PRO search',
  };
  
  // ===== COUNT ALL CONSULTED SOURCES =====
  const consultedCount = 
    (sources.corroborated?.length ?? 0) + 
    (sources.neutral?.length ?? 0) + 
    (sources.contradicting?.length ?? 0);
  
  // ===== PREPARE RAW SOURCE ARRAYS =====
  
  // Supporting sources (corroborated + neutral)
  const allSupportingSources: FilteredSource[] = [];
  sources.corroborated?.forEach(s => {
    const details = getSourceDetails(s);
    if (details) {
      allSupportingSources.push({ source: details, category: 'corroborated' });
    }
  });
  sources.neutral?.forEach(s => {
    const details = getSourceDetails(s);
    if (details) {
      allSupportingSources.push({ source: details, category: 'neutral' });
    }
  });
  
  // Contradicting sources
  const allContradictingSources: FilteredSource[] = [];
  sources.contradicting?.forEach(s => {
    const details = getSourceDetails(s);
    if (details) {
      allContradictingSources.push({ source: details });
    }
  });
  
  // ===== 3-PASS FILTERING =====
  
  // --- SUPPORTING SOURCES ---
  // Pass A: Strict (article URL + snippet + dedupe + topical relevance)
  const supportingSeenUrlsStrict = new Set<string>();
  const strictSupportingSources = filterStrictPass(allSupportingSources, claimKeyTerms, supportingSeenUrlsStrict);
  const sortedStrictSupporting = sortAndCap(strictSupportingSources, 6);
  
  // Pass B: Relaxed (article URL + snippet + dedupe, NO topical relevance)
  const supportingSeenUrlsRelaxed = new Set<string>();
  const relaxedSupportingSources = filterRelaxedPass(allSupportingSources, supportingSeenUrlsRelaxed);
  const sortedRelaxedSupporting = sortAndCap(relaxedSupportingSources, 6);
  
  // Pass C: Ultra-relaxed (valid URL + snippet + dedupe only)
  const supportingSeenUrlsUltra = new Set<string>();
  const ultraSupportingSources = filterUltraRelaxedPass(allSupportingSources, supportingSeenUrlsUltra);
  const sortedUltraSupporting = sortAndCap(ultraSupportingSources, 6);
  
  // Determine which pass to use for supporting sources
  const passASupporting = sortedStrictSupporting;
  const passBSupporting = sortedRelaxedSupporting;
  const passCSupporting = sortedUltraSupporting;
  
  // Final supporting sources based on state
  let finalSupportingSources: FilteredSource[];
  if (showUnfiltered) {
    // User clicked "Show anyway" - use best available: prefer B, fallback to C
    finalSupportingSources = passBSupporting.length > 0 ? passBSupporting : passCSupporting;
  } else {
    // Use strict pass
    finalSupportingSources = passASupporting;
  }
  
  // Check if we need fallback UI
  const supportingStrictFailed = passASupporting.length < 2;
  const supportingHasRelaxed = passBSupporting.length >= 1 || passCSupporting.length >= 1;
  const supportingNeedsFallback = supportingStrictFailed && supportingHasRelaxed;
  const supportingAllPassesFailed = passASupporting.length === 0 && passBSupporting.length === 0 && passCSupporting.length === 0;
  
  // --- CONTRADICTING SOURCES ---
  // Pass A: Strict
  const contradictingSeenUrlsStrict = new Set<string>();
  const strictContradictingSources = filterStrictPass(allContradictingSources, claimKeyTerms, contradictingSeenUrlsStrict);
  const sortedStrictContradicting = sortAndCap(strictContradictingSources, 6);
  
  // Pass B: Relaxed
  const contradictingSeenUrlsRelaxed = new Set<string>();
  const relaxedContradictingSources = filterRelaxedPass(allContradictingSources, contradictingSeenUrlsRelaxed);
  const sortedRelaxedContradicting = sortAndCap(relaxedContradictingSources, 6);
  
  // Pass C: Ultra-relaxed
  const contradictingSeenUrlsUltra = new Set<string>();
  const ultraContradictingSources = filterUltraRelaxedPass(allContradictingSources, contradictingSeenUrlsUltra);
  const sortedUltraContradicting = sortAndCap(ultraContradictingSources, 6);
  
  const passAContradicting = sortedStrictContradicting;
  const passBContradicting = sortedRelaxedContradicting;
  const passCContradicting = sortedUltraContradicting;
  
  // Final contradicting sources based on state
  let finalContradictingSources: FilteredSource[];
  if (showUnfiltered) {
    finalContradictingSources = passBContradicting.length > 0 ? passBContradicting : passCContradicting;
  } else {
    finalContradictingSources = passAContradicting;
  }
  
  const contradictingStrictFailed = passAContradicting.length === 0;
  const contradictingHasRelaxed = passBContradicting.length >= 1 || passCContradicting.length >= 1;
  const contradictingNeedsFallback = contradictingStrictFailed && contradictingHasRelaxed;
  
  const hasCounterClaims = finalContradictingSources.length > 0;
  const isRefuted = outcome === 'refuted';
  const sectionTitle = isRefuted ? t.refutedTitle : t.title;
  
  // ===== MODE: contradictingOnly =====
  if (mode === 'contradictingOnly') {
    // Show fallback if strict failed but relaxed has sources
    const showContradictingFallback = !showUnfiltered && contradictingNeedsFallback;
    
    // If no contradicting sources at all (even ultra-relaxed), render nothing
    if (!hasCounterClaims && !showContradictingFallback) {
      return null;
    }
    
    // Show fallback card if strict failed but relaxed/ultra has sources
    if (showContradictingFallback) {
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
    
    const displayTitle = isRefuted ? t.refutedTitle : t.counterClaimTitle;
    const contradictingTotal = allContradictingSources.length;
    
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        {/* Section Header */}
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
            total={contradictingTotal} 
            language={language} 
          />
        </div>
        
        {/* Explanation text */}
        <p className="text-sm text-slate-600 leading-relaxed mb-4 pl-10">
          {t.counterClaimExplanation}
        </p>
        
        {/* Contradicting Source Cards */}
        <div className="space-y-3">
          {finalContradictingSources.map(({ source }, idx) => (
            <SourceCard 
              key={`contra-${idx}`}
              source={source} 
              idx={idx} 
              isCounterClaim={true} 
              language={language} 
              openLabel={t.open} 
            />
          ))}
        </div>
      </div>
    );
  }
  
  // ===== MODE: supportingOnly =====
  if (mode === 'supportingOnly') {
    // Check if we need fallback
    const showSupportingFallback = !showUnfiltered && supportingNeedsFallback;
    
    // ALL passes failed completely AND sources were consulted = show unusable message
    if (supportingAllPassesFailed && consultedCount > 0) {
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
    
    // Strict pass found < 2, but relaxed/ultra has sources - show "Sources found but hidden"
    if (showSupportingFallback) {
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
    
    // Show sources if we have any (from strict pass or after clicking "Show anyway")
    if (finalSupportingSources.length > 0) {
      const supportingTotal = allSupportingSources.length;
      
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
              total={supportingTotal} 
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
              />
            ))}
          </div>
        </div>
      );
    }
    
    // No sources to display and consultedCount === 0
    return null;
  }
  
  // ===== MODE: all (default) =====
  
  // Check if we need to show fallback for either category
  const needsSupportingFallback = !showUnfiltered && supportingNeedsFallback;
  const needsContradictingFallback = !showUnfiltered && contradictingNeedsFallback;
  const needsAnyFallback = needsSupportingFallback || needsContradictingFallback;
  
  // All passes failed completely for supporting (and no counter-claims)
  const allPassesFailed = supportingAllPassesFailed && !hasCounterClaims;
  
  // Show "Sources consulted but not displayable" only if ALL passes completely fail AND sources were consulted
  if (allPassesFailed && consultedCount > 0 && !needsContradictingFallback) {
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
  
  // Show "Sources found but hidden" if strict pass failed but relaxed/ultra has sources
  if (needsAnyFallback && !hasCounterClaims && finalSupportingSources.length < 2) {
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
  
  // Normal rendering with sources
  return (
    <div className="mt-6 pt-5 border-t border-slate-200/80">
      {/* Counter-Claim Detection Section - shown ABOVE regular evidence */}
      {hasCounterClaims && (
        <div className="mb-6">
          {/* Counter-Claim Header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
              {t.counterClaimTitle}
            </h4>
          </div>
          
          {/* Explanation text */}
          <p className="text-sm text-slate-600 leading-relaxed mb-4 pl-10">
            {t.counterClaimExplanation}
          </p>
          
          {/* Counter-Claim Source Cards */}
          <div className="space-y-3">
            {finalContradictingSources.map(({ source }, idx) => (
              <SourceCard 
                key={`counter-${idx}`}
                source={source} 
                idx={idx} 
                isCounterClaim={true} 
                language={language} 
                openLabel={t.open} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Regular Evidence Section */}
      {finalSupportingSources.length >= 2 && (
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
              />
            ))}
          </div>
        </>
      )}
      
      {/* Show relaxed supporting sources if user clicked "Show anyway" but we have < 2 strict */}
      {showUnfiltered && finalSupportingSources.length > 0 && finalSupportingSources.length < 2 && (
        <>
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isRefuted ? 'bg-red-100' : 'bg-cyan-100'}`}>
              <Shield className={`w-4 h-4 ${isRefuted ? 'text-red-600' : 'text-cyan-600'}`} />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
              {sectionTitle}
            </h4>
          </div>
          
          <div className="space-y-3">
            {finalSupportingSources.map(({ source }, idx) => (
              <SourceCard 
                key={`relaxed-${idx}`}
                source={source} 
                idx={idx} 
                isCounterClaim={false} 
                language={language} 
                openLabel={t.open} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
