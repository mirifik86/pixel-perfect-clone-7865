import { useState, useEffect, useMemo, useCallback } from 'react';
import { ExternalLink, Shield, BookOpen, Newspaper, Building2, Copy, Check, Filter, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ===== INTERFACES =====

// Legacy source format (from corroboration.sources)
interface LegacySourceDetail {
  name: string;
  url: string;
  snippet: string;
  trustTier?: 'high' | 'medium' | 'low';
}

// New PRO source format (from result.bestLinks / result.sources)
interface NewProSource {
  title: string;
  publisher: string;
  url: string;
  trustTier: 'high' | 'medium' | 'low';
  stance: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters: string;
}

// Normalized source format (internal use)
interface NormalizedSource {
  title: string;
  publisher?: string;
  url: string;
  trustTier?: 'high' | 'medium' | 'low';
  stance?: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters: string;
}

interface BestSourcesSectionProps {
  // Legacy format
  sources?: {
    corroborated?: (string | LegacySourceDetail | NewProSource)[];
    neutral?: (string | LegacySourceDetail | NewProSource)[];
    constrained?: (string | LegacySourceDetail | NewProSource)[];
    contradicting?: (string | LegacySourceDetail | NewProSource)[];
  };
  // New PRO format
  bestLinks?: NewProSource[];
  allSources?: NewProSource[];
  language: 'en' | 'fr';
  outcome?: string;
  claim?: string;
  mode?: 'contradictingOnly' | 'supportingOnly' | 'all';
}

// ===== HELPERS =====

const getDomainFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};

const derivePublisher = (url: string): string | undefined => {
  const domain = getDomainFromUrl(url);
  if (!domain) return undefined;
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const main = parts[parts.length - 2];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return undefined;
};

const inferTrustTier = (name: string, url: string): 'high' | 'medium' | 'low' => {
  const combined = (name + ' ' + url).toLowerCase();
  const highTrustPatterns = /\.(gov|gouv|edu|int)\b|wikipedia|britannica|reuters|associated\s*press|afp|bbc|cnn|new\s*york\s*times|washington\s*post|wall\s*street|nature\.com|science\.org|pubmed|who\.int|un\.org|nasa|nih|cdc|fda/i;
  if (highTrustPatterns.test(combined)) return 'high';
  const majorMediaPatterns = /guardian|telegraph|le\s*monde|figaro|economist|bloomberg|politico|npr|pbs|time\.com|forbes|wired/i;
  if (majorMediaPatterns.test(combined)) return 'medium';
  return 'medium';
};

// Normalize any source format to NormalizedSource
const normalizeSource = (
  source: string | LegacySourceDetail | NewProSource,
  inferredStance?: 'corroborating' | 'neutral' | 'contradicting'
): NormalizedSource | null => {
  if (typeof source === 'string' || !source) return null;

  // New PRO format: has title + whyItMatters + stance
  if ('title' in source && 'whyItMatters' in source) {
    const proSource = source as NewProSource;
    if (!proSource.url) return null;
    return {
      title: proSource.title || getDomainFromUrl(proSource.url),
      publisher: proSource.publisher || derivePublisher(proSource.url),
      url: proSource.url,
      trustTier: proSource.trustTier,
      stance: proSource.stance,
      whyItMatters: proSource.whyItMatters || '',
    };
  }

  // Legacy format: has name + snippet
  if ('name' in source && 'url' in source) {
    const legacySource = source as LegacySourceDetail;
    if (!legacySource.url) return null;
    return {
      title: legacySource.name || getDomainFromUrl(legacySource.url),
      publisher: derivePublisher(legacySource.url),
      url: legacySource.url,
      trustTier: legacySource.trustTier || inferTrustTier(legacySource.name, legacySource.url),
      stance: inferredStance,
      whyItMatters: legacySource.snippet || '',
    };
  }

  return null;
};

// Hub paths to reject
const HUB_PATHS = new Set([
  '/news', '/world', '/politics', '/business', '/sport', '/sports',
  '/entertainment', '/health', '/science', '/tech', '/technology',
  '/video', '/videos', '/live', '/latest', '/breaking', '/search',
  '/tag', '/tags', '/topic', '/topics', '/category', '/categories',
  '/hub', '/section', '/sections'
]);

const TRUSTED_DOMAINS = new Set([
  'nps.gov', 'si.edu', 'nationalzoo.si.edu', 'australian.museum',
  'britannica.com', 'wikipedia.org', 'en.wikipedia.org', 'fr.wikipedia.org',
  'aspca.org', 'petmd.com', 'vcahospitals.com', 'cdc.gov', 'nih.gov',
  'nasa.gov', 'who.int', 'nature.com', 'sciencedirect.com', 'pubmed.ncbi.nlm.nih.gov',
]);

const isTrustedDomain = (hostname: string): boolean => {
  const normalizedHost = hostname.replace(/^www\./, '').toLowerCase();
  if (TRUSTED_DOMAINS.has(normalizedHost)) return true;
  for (const trusted of TRUSTED_DOMAINS) {
    if (normalizedHost.endsWith(`.${trusted}`)) return true;
  }
  if (normalizedHost.endsWith('.gov') || normalizedHost.endsWith('.edu')) return true;
  return false;
};

const isArticleUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const pathname = parsed.pathname.toLowerCase();
    
    if (isTrustedDomain(hostname)) {
      return pathname !== '/' && pathname !== '';
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
    return hasLongSlug;
  } catch {
    return false;
  }
};

const isBadUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true;
  const lowered = url.toLowerCase();
  const badPatterns = ['404', 'not-found', 'page-not-found', 'notfound', '/error', 'redirect=0', 'webcache', 'amp/s'];
  return badPatterns.some(pattern => lowered.includes(pattern));
};

const isTooGeneralWikipedia = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.includes('wikipedia.org')) return false;
    const pathname = parsed.pathname.toLowerCase().replace(/\/$/, '');
    const TOO_GENERAL = new Set(['/wiki/animal', '/wiki/animals', '/wiki/insect', '/wiki/mammal', '/wiki/reptile', '/wiki/bird', '/wiki/fish', '/wiki/plant', '/wiki/human']);
    return TOO_GENERAL.has(pathname);
  } catch {
    return false;
  }
};

const isValidSource = (source: NormalizedSource): boolean => {
  if (!source.url || isBadUrl(source.url)) return false;
  if (isTooGeneralWikipedia(source.url)) return false;
  if (!source.whyItMatters || source.whyItMatters.length < 10) return false;
  const domain = getDomainFromUrl(source.url);
  if (!isTrustedDomain(domain) && !isArticleUrl(source.url)) return false;
  return true;
};

const TRUST_TIER_PRIORITY: Record<string, number> = { high: 0, medium: 1, low: 2 };

const deduplicateByDomain = (sources: NormalizedSource[]): NormalizedSource[] => {
  const byDomain = new Map<string, NormalizedSource>();
  for (const src of sources) {
    const domain = getDomainFromUrl(src.url);
    if (!domain) continue;
    const existing = byDomain.get(domain);
    if (!existing) {
      byDomain.set(domain, src);
      continue;
    }
    const existingTier = TRUST_TIER_PRIORITY[existing.trustTier || 'medium'] ?? 1;
    const newTier = TRUST_TIER_PRIORITY[src.trustTier || 'medium'] ?? 1;
    if (newTier < existingTier || (newTier === existingTier && src.whyItMatters.length > existing.whyItMatters.length)) {
      byDomain.set(domain, src);
    }
  }
  return Array.from(byDomain.values());
};

const sortByTrustTier = (sources: NormalizedSource[]): NormalizedSource[] => {
  return [...sources].sort((a, b) => {
    const tierA = TRUST_TIER_PRIORITY[a.trustTier || 'medium'] ?? 1;
    const tierB = TRUST_TIER_PRIORITY[b.trustTier || 'medium'] ?? 1;
    if (tierA !== tierB) return tierA - tierB;
    return b.whyItMatters.length - a.whyItMatters.length;
  });
};

// ===== CLASSIFICATION & BADGES =====

const classifySourceType = (source: NormalizedSource): { type: 'official' | 'reference' | 'media'; label: string; labelFr: string; icon: React.ReactNode; style: string } => {
  const combined = `${source.title} ${source.url} ${source.publisher || ''}`.toLowerCase();
  
  const officialPatterns = /\.(gov|gouv)\b|government|official|ministry|white\s*house|europa\.eu|who\.int|un\.org|fbi|cdc|fda|nasa|nih/i;
  const referencePatterns = /britannica|encyclopedia|wikipedia|oxford|cambridge|merriam|jstor|pubmed|ncbi|nature\.com|science\.org|snopes|factcheck|politifact/i;
  
  if (officialPatterns.test(combined)) {
    return { type: 'official', label: 'Official', labelFr: 'Officiel', icon: <Building2 className="w-3.5 h-3.5" />, style: 'bg-blue-500/10 text-blue-700 border-blue-500/25' };
  }
  if (referencePatterns.test(combined)) {
    return { type: 'reference', label: 'Reference', labelFr: 'Référence', icon: <BookOpen className="w-3.5 h-3.5" />, style: 'bg-violet-500/10 text-violet-700 border-violet-500/25' };
  }
  return { type: 'media', label: 'Major Media', labelFr: 'Média majeur', icon: <Newspaper className="w-3.5 h-3.5" />, style: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25' };
};

const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

const trustTierBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const stanceBadgeStyles: Record<string, { bg: string; text: string; border: string; labelEn: string; labelFr: string }> = {
  corroborating: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', labelEn: 'Corroborating', labelFr: 'Corrobore' },
  neutral: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', labelEn: 'Neutral', labelFr: 'Neutre' },
  contradicting: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', labelEn: 'Contradicts', labelFr: 'Contredit' },
};

// ===== SOURCE CARD COMPONENT =====

const SourceCard = ({ 
  source, 
  idx, 
  language, 
  isVerified = false,
  isPrimary = true
}: { 
  source: NormalizedSource; 
  idx: number; 
  language: 'en' | 'fr'; 
  isVerified?: boolean;
  isPrimary?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const classification = classifySourceType(source);
  const faviconUrl = getFaviconUrl(source.url);
  const isContradicting = source.stance === 'contradicting';
  const openLabel = language === 'fr' ? 'Ouvrir' : 'Open';
  
  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(source.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };
  
  const trustTierLabels: Record<string, { en: string; fr: string }> = {
    high: { en: 'High Trust', fr: 'Haute confiance' },
    medium: { en: 'Medium Trust', fr: 'Confiance moyenne' },
    low: { en: 'Low Trust', fr: 'Faible confiance' },
  };
  
  return (
    <a
      key={`source-${idx}`}
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
                 ${isContradicting 
                   ? 'border-red-200 bg-gradient-to-br from-white to-red-50/50 hover:border-red-300' 
                   : isPrimary
                     ? 'border-slate-200 bg-gradient-to-br from-white to-slate-50/80 hover:border-slate-300 hover:to-cyan-50/30'
                     : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                 }`}
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-white border flex items-center justify-center shadow-sm overflow-hidden
                        ${isContradicting ? 'border-red-200/80' : 'border-slate-200/80'}`}>
          {faviconUrl ? (
            <img src={faviconUrl} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <ExternalLink className="w-4 h-4 text-slate-400" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* Title */}
            <span className={`font-semibold text-sm transition-colors
                            ${isContradicting ? 'text-slate-800 group-hover:text-red-700' : 'text-slate-800 group-hover:text-cyan-700'}`}>
              {source.title}
            </span>
            
            {/* Trust Tier Badge */}
            {source.trustTier && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
                               ${trustTierBadgeStyles[source.trustTier].bg} 
                               ${trustTierBadgeStyles[source.trustTier].text} 
                               ${trustTierBadgeStyles[source.trustTier].border}`}>
                {language === 'fr' ? trustTierLabels[source.trustTier].fr : trustTierLabels[source.trustTier].en}
              </span>
            )}
            
            {/* Stance Badge */}
            {source.stance && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
                               ${stanceBadgeStyles[source.stance].bg} 
                               ${stanceBadgeStyles[source.stance].text} 
                               ${stanceBadgeStyles[source.stance].border}`}>
                {language === 'fr' ? stanceBadgeStyles[source.stance].labelFr : stanceBadgeStyles[source.stance].labelEn}
              </span>
            )}
            
            {/* Type Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${classification.style}`}>
              {classification.icon}
              {language === 'fr' ? classification.labelFr : classification.label}
            </span>
            
            {/* Verified Badge */}
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'fr' ? 'Vérifié' : 'Verified'}
              </span>
            )}
          </div>
          
          {/* Publisher */}
          {source.publisher && (
            <p className="text-xs text-slate-500 mb-1">{source.publisher}</p>
          )}
          
          {/* Why It Matters */}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{source.whyItMatters}</p>
        </div>
        
        {/* Action buttons */}
        <div className="flex-shrink-0 self-center flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                       ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
            title={language === 'fr' ? 'Copier le lien' : 'Copy link'}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all duration-200
                           ${isContradicting 
                             ? 'bg-slate-100 text-slate-600 group-hover:bg-red-600 group-hover:text-white' 
                             : 'bg-slate-100 text-slate-600 group-hover:bg-cyan-600 group-hover:text-white'}`}>
            {openLabel}
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

// ===== FILTER STATS INDICATOR =====

const FilterStatsIndicator = ({ displayed, total, language }: { displayed: number; total: number; language: 'en' | 'fr' }) => {
  if (total === 0 || displayed === total) return null;
  const filtered = total - displayed;
  const label = language === 'fr' 
    ? `${displayed} sur ${total} (${filtered} filtrée${filtered > 1 ? 's' : ''})`
    : `${displayed} of ${total} shown (${filtered} filtered)`;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200/80">
      <Filter className="w-3 h-3" />
      {label}
    </span>
  );
};

// ===== MAIN COMPONENT =====

const MAX_BEST_LINKS = 4;
const MAX_ALL_SOURCES = 10;

export const BestSourcesSection = ({ sources, bestLinks, allSources, language, outcome, claim, mode = 'all' }: BestSourcesSectionProps) => {
  const [showAllSources, setShowAllSources] = useState(false);
  const [verifiedUrls, setVerifiedUrls] = useState<Set<string>>(new Set());
  const [invalidUrls, setInvalidUrls] = useState<Set<string>>(new Set());
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  const t = {
    bestEvidence: language === 'fr' ? 'Meilleures preuves' : 'Best Evidence',
    showAll: language === 'fr' ? 'Voir toutes les sources (jusqu\'à 10)' : 'Show all sources (up to 10)',
    hideAll: language === 'fr' ? 'Masquer les sources supplémentaires' : 'Hide additional sources',
    noCorroboration: language === 'fr' 
      ? 'Aucune corroboration externe forte n\'a été trouvée pour cette affirmation.'
      : 'No strong external corroboration was found for this claim.',
    verifying: language === 'fr' ? 'Vérification des liens…' : 'Verifying links…',
    open: language === 'fr' ? 'Ouvrir' : 'Open',
  };
  
  // ===== NORMALIZE ALL SOURCES =====
  const { normalizedBestLinks, normalizedAllSources, totalConsulted } = useMemo(() => {
    let best: NormalizedSource[] = [];
    let all: NormalizedSource[] = [];
    let consulted = 0;
    
    // New PRO format: use bestLinks and allSources directly
    if (bestLinks && bestLinks.length > 0) {
      best = bestLinks
        .map(src => normalizeSource(src))
        .filter((s): s is NormalizedSource => s !== null && isValidSource(s));
      consulted += bestLinks.length;
    }
    
    if (allSources && allSources.length > 0) {
      all = allSources
        .map(src => normalizeSource(src))
        .filter((s): s is NormalizedSource => s !== null && isValidSource(s));
      consulted += allSources.length;
    }
    
    // Legacy format: normalize from grouped sources
    if ((!bestLinks || bestLinks.length === 0) && sources) {
      const fromCorroborated = (sources.corroborated || [])
        .map(s => normalizeSource(s, 'corroborating'))
        .filter((s): s is NormalizedSource => s !== null);
      
      const fromNeutral = (sources.neutral || [])
        .map(s => normalizeSource(s, 'neutral'))
        .filter((s): s is NormalizedSource => s !== null);
      
      const fromContradicting = (sources.contradicting || [])
        .map(s => normalizeSource(s, 'contradicting'))
        .filter((s): s is NormalizedSource => s !== null);
      
      all = [...fromCorroborated, ...fromNeutral, ...fromContradicting];
      consulted = all.length;
      
      // Filter valid sources
      all = all.filter(isValidSource);
    }
    
    // Dedup by domain
    best = deduplicateByDomain(best);
    all = deduplicateByDomain(all);
    
    // Sort by trust tier
    best = sortByTrustTier(best);
    all = sortByTrustTier(all);
    
    // If no bestLinks but have allSources, take top 4 as best
    if (best.length === 0 && all.length > 0) {
      best = all.slice(0, MAX_BEST_LINKS);
    }
    
    // Enforce limits
    best = best.slice(0, MAX_BEST_LINKS);
    all = all.slice(0, MAX_ALL_SOURCES);
    
    return { normalizedBestLinks: best, normalizedAllSources: all, totalConsulted: consulted };
  }, [bestLinks, allSources, sources]);
  
  // Get additional sources (in allSources but not in bestLinks)
  const additionalSources = useMemo(() => {
    const bestUrls = new Set(normalizedBestLinks.map(s => s.url));
    return normalizedAllSources.filter(s => !bestUrls.has(s.url));
  }, [normalizedBestLinks, normalizedAllSources]);
  
  // Separate by stance for mode filtering
  const { supportingSources, contradictingSources } = useMemo(() => {
    const supporting = normalizedBestLinks.filter(s => s.stance !== 'contradicting');
    const contradicting = normalizedBestLinks.filter(s => s.stance === 'contradicting');
    return { supportingSources: supporting, contradictingSources: contradicting };
  }, [normalizedBestLinks]);
  
  // URL verification
  const candidateUrls = useMemo(() => {
    return [...normalizedBestLinks, ...additionalSources].map(s => ({ url: s.url, name: s.title, snippet: s.whyItMatters }));
  }, [normalizedBestLinks, additionalSources]);
  
  const verifyUrls = useCallback(async () => {
    if (candidateUrls.length === 0 || verificationComplete) return;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-urls', { body: { urls: candidateUrls } });
      
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
  const filterVerified = useCallback((sources: NormalizedSource[]): NormalizedSource[] => {
    if (!verificationComplete) return sources;
    return sources.filter(s => !invalidUrls.has(s.url));
  }, [invalidUrls, verificationComplete]);
  
  const finalBestLinks = filterVerified(normalizedBestLinks);
  const finalAdditionalSources = filterVerified(additionalSources);
  const finalSupporting = filterVerified(supportingSources);
  const finalContradicting = filterVerified(contradictingSources);
  
  // ===== RENDER =====
  
  if (isVerifying) {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
          <span className="text-sm text-slate-600">{t.verifying}</span>
        </div>
      </div>
    );
  }
  
  // MODE: contradictingOnly
  if (mode === 'contradictingOnly') {
    if (finalContradicting.length === 0) return null;
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-600" />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
              {language === 'fr' ? 'Sources réfutantes' : 'Refuting Sources'}
            </h4>
          </div>
          <FilterStatsIndicator displayed={finalContradicting.length} total={contradictingSources.length} language={language} />
        </div>
        <div className="space-y-3">
          {finalContradicting.map((source, idx) => (
            <SourceCard key={`contra-${idx}`} source={source} idx={idx} language={language} isVerified={verifiedUrls.has(source.url)} />
          ))}
        </div>
      </div>
    );
  }
  
  // MODE: supportingOnly
  if (mode === 'supportingOnly') {
    if (finalSupporting.length === 0) return null;
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-600" />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">{t.bestEvidence}</h4>
          </div>
          <FilterStatsIndicator displayed={finalSupporting.length} total={supportingSources.length} language={language} />
        </div>
        <div className="space-y-3">
          {finalSupporting.map((source, idx) => (
            <SourceCard key={`support-${idx}`} source={source} idx={idx} language={language} isVerified={verifiedUrls.has(source.url)} />
          ))}
        </div>
      </div>
    );
  }
  
  // MODE: all (default)
  if (finalBestLinks.length === 0) {
    if (totalConsulted > 0) {
      // Sources were consulted but none passed filters
      return (
        <div className="mt-6 pt-5 border-t border-slate-200/80">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/50 to-slate-50/80 p-5 shadow-sm">
            <p className="text-sm text-slate-600 leading-relaxed">{t.noCorroboration}</p>
          </div>
        </div>
      );
    }
    return null;
  }
  
  return (
    <div className="mt-6 pt-5 border-t border-slate-200/80">
      {/* Best Links Section */}
      <div className="flex items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-cyan-600" />
          </div>
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">{t.bestEvidence}</h4>
        </div>
        <FilterStatsIndicator displayed={finalBestLinks.length} total={normalizedBestLinks.length} language={language} />
      </div>
      
      <div className="space-y-3">
        {finalBestLinks.map((source, idx) => (
          <SourceCard key={`best-${idx}`} source={source} idx={idx} language={language} isVerified={verifiedUrls.has(source.url)} isPrimary={true} />
        ))}
      </div>
      
      {/* Expand to show all sources */}
      {finalAdditionalSources.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAllSources(!showAllSources)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors duration-200"
          >
            {showAllSources ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {t.hideAll}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {t.showAll}
              </>
            )}
          </button>
          
          {showAllSources && (
            <div className="mt-4 space-y-2.5">
              {finalAdditionalSources.map((source, idx) => (
                <SourceCard key={`additional-${idx}`} source={source} idx={idx} language={language} isVerified={verifiedUrls.has(source.url)} isPrimary={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
