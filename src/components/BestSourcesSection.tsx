import { useState, useEffect, useMemo, useCallback } from 'react';
import { ExternalLink, Shield, CheckCircle2, Loader2, ChevronDown, ChevronUp, Info, Search, Globe, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ===== INTERFACES =====

interface LegacySourceDetail {
  name: string;
  url: string;
  snippet: string;
  trustTier?: 'high' | 'medium' | 'low';
}

interface NewProSource {
  title: string;
  publisher: string;
  url: string;
  trustTier: 'high' | 'medium' | 'low';
  stance: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters: string;
  articleUrl?: string;
  canonicalUrl?: string;
}

interface NormalizedSource {
  title: string;
  publisher?: string;
  url: string;
  trustTier: 'high' | 'medium' | 'low';
  stance: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters: string;
}

interface BestSourcesSectionProps {
  sources?: {
    corroborated?: (string | LegacySourceDetail | NewProSource)[];
    neutral?: (string | LegacySourceDetail | NewProSource)[];
    constrained?: (string | LegacySourceDetail | NewProSource)[];
    contradicting?: (string | LegacySourceDetail | NewProSource)[];
  };
  bestLinks?: NewProSource[];
  allSources?: NewProSource[];
  language: 'en' | 'fr';
  outcome?: string;
  claim?: string;
  mode?: 'contradictingOnly' | 'supportingOnly' | 'all';
}

// ===== URL UTILITIES =====

const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};

const cleanUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    let path = parsed.pathname.replace(/\/$/, '');
    if (path === '') path = '/';
    return `${parsed.origin}${path}${parsed.search}`;
  } catch {
    return url;
  }
};

const normalizeForDedup = (url: string): string => {
  try {
    const cleaned = cleanUrl(url);
    const parsed = new URL(cleaned);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const path = parsed.pathname.replace(/\/$/, '');
    return `${host}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
};

// Hub paths that are too generic
const GENERIC_PATHS = new Set([
  '/news', '/world', '/politics', '/business', '/sport', '/sports',
  '/entertainment', '/health', '/science', '/tech', '/technology',
  '/video', '/videos', '/live', '/latest', '/breaking', '/search',
  '/tag', '/tags', '/topic', '/topics', '/category', '/categories',
  '/hub', '/section', '/sections', '/home', '/about', '/contact'
]);

// Trusted domains that get more lenient filtering
const TRUSTED_DOMAINS = new Set([
  'wikipedia.org', 'britannica.com', 'cdc.gov', 'nih.gov', 'nasa.gov',
  'who.int', 'nature.com', 'sciencedirect.com', 'bbc.com', 'reuters.com',
  'apnews.com', 'nytimes.com', 'theguardian.com', 'washingtonpost.com',
  'lemonde.fr', 'lefigaro.fr', 'pubmed.ncbi.nlm.nih.gov'
]);

const isTrustedDomain = (hostname: string): boolean => {
  const h = hostname.replace(/^www\./, '').toLowerCase();
  if (TRUSTED_DOMAINS.has(h)) return true;
  for (const trusted of TRUSTED_DOMAINS) {
    if (h.endsWith(`.${trusted}`)) return true;
  }
  return h.endsWith('.gov') || h.endsWith('.edu') || h.endsWith('.gouv.fr');
};

// Check if URL is a valid article (not homepage or generic section)
const isValidArticleUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/$/, '').toLowerCase();
    
    // Reject homepage
    if (pathname === '' || pathname === '/') return false;
    
    // Reject generic hub paths
    if (GENERIC_PATHS.has(pathname)) return false;
    
    const segments = pathname.split('/').filter(s => s.length > 0);
    
    // Trusted domains: just need a path
    if (isTrustedDomain(parsed.hostname)) {
      return segments.length >= 1;
    }
    
    // Single short segment = likely section page
    if (segments.length === 1 && segments[0].length < 12) return false;
    
    // Article indicators
    if (pathname.includes('/article') || pathname.includes('/articles')) return true;
    
    // Date pattern in URL (common for news articles)
    const datePattern = /\/\d{4}\/\d{1,2}\/\d{1,2}|-\d{4}-|\d{4}-\d{2}-\d{2}/;
    if (datePattern.test(pathname)) return true;
    
    // Multiple segments or long slug
    if (segments.length >= 2) return true;
    if (segments.some(seg => seg.length >= 25 || (seg.includes('-') && seg.length >= 15))) return true;
    
    return false;
  } catch {
    return false;
  }
};

// Get best URL from source (prefer articleUrl > canonicalUrl > url)
const getBestUrl = (source: { url: string; articleUrl?: string; canonicalUrl?: string }): string | null => {
  const candidates = [
    source.articleUrl,
    source.canonicalUrl,
    source.url,
  ].filter((u): u is string => !!u && u.trim() !== '');
  
  for (const candidate of candidates) {
    const cleaned = cleanUrl(candidate);
    if (isValidArticleUrl(cleaned)) return cleaned;
  }
  
  return null; // No valid article URL found
};

const derivePublisher = (url: string): string => {
  const domain = getDomainFromUrl(url);
  if (!domain) return 'Source';
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const main = parts[parts.length - 2];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return domain;
};

// ===== TRUST TIER =====

const inferTrustTier = (name: string, url: string, existingTier?: 'high' | 'medium' | 'low'): 'high' | 'medium' | 'low' => {
  if (existingTier) return existingTier;
  
  const combined = (name + ' ' + url).toLowerCase();
  const highPatterns = /\.(gov|gouv|edu|int)\b|wikipedia|britannica|reuters|associated\s*press|afp|bbc|cnn|new\s*york\s*times|washington\s*post|nature\.com|science\.org|pubmed|who\.int|un\.org|nasa|nih|cdc|fda/i;
  if (highPatterns.test(combined)) return 'high';
  
  const mediumPatterns = /guardian|telegraph|le\s*monde|figaro|economist|bloomberg|politico|npr|pbs|time\.com|forbes|wired|huffpost|vice|vox/i;
  if (mediumPatterns.test(combined)) return 'medium';
  
  return 'low';
};

// ===== NORMALIZATION =====

const normalizeSource = (
  source: string | LegacySourceDetail | NewProSource,
  defaultStance: 'corroborating' | 'neutral' | 'contradicting' = 'neutral'
): NormalizedSource | null => {
  if (typeof source === 'string' || !source) return null;

  // New PRO format
  if ('title' in source && 'whyItMatters' in source) {
    const proSource = source as NewProSource;
    const bestUrl = getBestUrl(proSource);
    if (!bestUrl) return null; // Reject if no valid article URL
    
    return {
      title: proSource.title || derivePublisher(bestUrl),
      publisher: proSource.publisher || derivePublisher(bestUrl),
      url: bestUrl,
      trustTier: inferTrustTier(proSource.title, bestUrl, proSource.trustTier),
      stance: proSource.stance || defaultStance,
      whyItMatters: proSource.whyItMatters || '',
    };
  }

  // Legacy format
  if ('name' in source && 'url' in source) {
    const legacySource = source as LegacySourceDetail & { articleUrl?: string; canonicalUrl?: string };
    const bestUrl = getBestUrl(legacySource);
    if (!bestUrl) return null;
    
    return {
      title: legacySource.name || derivePublisher(bestUrl),
      publisher: derivePublisher(bestUrl),
      url: bestUrl,
      trustTier: inferTrustTier(legacySource.name, bestUrl, legacySource.trustTier),
      stance: defaultStance,
      whyItMatters: legacySource.snippet || '',
    };
  }

  return null;
};

// ===== DEDUPLICATION & RANKING =====

const TIER_PRIORITY: Record<string, number> = { high: 0, medium: 1, low: 2 };
const STANCE_PRIORITY: Record<string, number> = { corroborating: 0, contradicting: 1, neutral: 2 };

const deduplicateAndRank = (sources: NormalizedSource[]): NormalizedSource[] => {
  // Deduplicate by normalized URL
  const byUrl = new Map<string, NormalizedSource>();
  
  for (const src of sources) {
    const key = normalizeForDedup(src.url);
    const existing = byUrl.get(key);
    
    if (!existing) {
      byUrl.set(key, src);
      continue;
    }
    
    // Keep higher trust tier
    const existingTier = TIER_PRIORITY[existing.trustTier];
    const newTier = TIER_PRIORITY[src.trustTier];
    if (newTier < existingTier) {
      byUrl.set(key, src);
    } else if (newTier === existingTier && src.whyItMatters.length > existing.whyItMatters.length) {
      byUrl.set(key, src);
    }
  }
  
  // Sort by trust tier, then stance, then snippet length
  return Array.from(byUrl.values()).sort((a, b) => {
    const tierDiff = TIER_PRIORITY[a.trustTier] - TIER_PRIORITY[b.trustTier];
    if (tierDiff !== 0) return tierDiff;
    
    const stanceDiff = STANCE_PRIORITY[a.stance] - STANCE_PRIORITY[b.stance];
    if (stanceDiff !== 0) return stanceDiff;
    
    return b.whyItMatters.length - a.whyItMatters.length;
  });
};

// ===== UI STYLES =====

const trustTierStyles: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const stanceStyles: Record<string, { bg: string; text: string; border: string }> = {
  corroborating: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  neutral: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  contradicting: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

// ===== SOURCE CARD =====

const SourceCard = ({ 
  source, 
  language, 
  isVerified = false,
  isSingleSource = false
}: { 
  source: NormalizedSource; 
  language: 'en' | 'fr'; 
  isVerified?: boolean;
  isSingleSource?: boolean;
}) => {
  const faviconUrl = getFaviconUrl(source.url);
  const isContradicting = source.stance === 'contradicting';
  
  const labels = {
    open: language === 'fr' ? 'Ouvrir' : 'Open',
    verified: language === 'fr' ? 'Vérifié' : 'Verified',
    mainSource: language === 'fr' ? 'Source principale' : 'Primary Source',
    trustTier: {
      high: { en: 'High', fr: 'Élevée' },
      medium: { en: 'Medium', fr: 'Moyenne' },
      low: { en: 'Low', fr: 'Faible' },
    },
    stance: {
      corroborating: { en: 'Corroborates', fr: 'Corrobore' },
      neutral: { en: 'Neutral', fr: 'Neutre' },
      contradicting: { en: 'Contradicts', fr: 'Contredit' },
    },
    trustTooltip: {
      high: { en: 'Official, institutional, or recognized reference.', fr: 'Source officielle, institutionnelle ou de référence.' },
      medium: { en: 'Recognized media or reliable secondary source.', fr: 'Média reconnu ou source secondaire fiable.' },
      low: { en: 'Indirect source, interpret with caution.', fr: 'Source indirecte, à interpréter avec prudence.' },
    },
  };
  
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
                 ${isContradicting 
                   ? 'border-red-200 bg-gradient-to-br from-white to-red-50/50 hover:border-red-300' 
                   : 'border-slate-200 bg-gradient-to-br from-white to-slate-50/80 hover:border-slate-300 hover:to-cyan-50/30'
                 }`}
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-white border flex items-center justify-center shadow-sm overflow-hidden
                        ${isContradicting ? 'border-red-200/80' : 'border-slate-200/80'}`}>
          {faviconUrl ? (
            <img src={faviconUrl} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <Globe className="w-4 h-4 text-slate-400" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* Single source badge */}
            {isSingleSource && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200">
                <Sparkles className="w-3 h-3" />
                {labels.mainSource}
              </span>
            )}
            
            {/* Title */}
            <span className={`font-semibold text-sm transition-colors
                            ${isContradicting ? 'text-slate-800 group-hover:text-red-700' : 'text-slate-800 group-hover:text-cyan-700'}`}>
              {source.title}
            </span>
            
            {/* Trust Tier Badge */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border cursor-help
                                   ${trustTierStyles[source.trustTier].bg} 
                                   ${trustTierStyles[source.trustTier].text} 
                                   ${trustTierStyles[source.trustTier].border}`}>
                    {language === 'fr' ? labels.trustTier[source.trustTier].fr : labels.trustTier[source.trustTier].en}
                    <Info className="w-3 h-3 opacity-60" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  <p>{language === 'fr' ? labels.trustTooltip[source.trustTier].fr : labels.trustTooltip[source.trustTier].en}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Stance badge (for single source or contradicting) */}
            {(isSingleSource || isContradicting) && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                               ${stanceStyles[source.stance].bg} 
                               ${stanceStyles[source.stance].text} 
                               ${stanceStyles[source.stance].border}`}>
                {language === 'fr' ? labels.stance[source.stance].fr : labels.stance[source.stance].en}
              </span>
            )}
            
            {/* Verified Badge */}
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 className="w-3 h-3" />
                {labels.verified}
              </span>
            )}
          </div>
          
          {/* Publisher */}
          <p className="text-xs text-slate-500 mb-1">{source.publisher}</p>
          
          {/* Excerpt */}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{source.whyItMatters}</p>
        </div>
        
        {/* Open button */}
        <div className="flex-shrink-0 self-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all duration-200
                           ${isContradicting 
                             ? 'bg-slate-100 text-slate-600 group-hover:bg-red-600 group-hover:text-white' 
                             : 'bg-cyan-50 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white'}`}>
            {labels.open}
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

// ===== FALLBACK CARD (when 0 sources) =====

const WebSearchFallbackCard = ({ claim, language }: { claim?: string; language: 'en' | 'fr' }) => {
  const labels = {
    title: language === 'fr' ? 'Meilleure piste de vérification' : 'Best Verification Path',
    description: language === 'fr' 
      ? 'Aucune source directe de haute qualité n\'a été identifiée. Lancez une recherche manuelle pour approfondir.' 
      : 'No high-quality direct sources were identified. Launch a manual search to investigate further.',
    button: language === 'fr' ? 'Rechercher sur le web' : 'Search the web',
  };
  
  // Build search query from claim
  const searchQuery = claim 
    ? encodeURIComponent(claim.slice(0, 150))
    : encodeURIComponent(language === 'fr' ? 'vérification des faits' : 'fact check');
  const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
  
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/80 to-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
          <Search className="w-5 h-5 text-cyan-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 mb-1">{labels.title}</h4>
          <p className="text-sm text-slate-600 mb-3">{labels.description}</p>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors shadow-sm"
          >
            <Globe className="w-4 h-4" />
            {labels.button}
          </a>
        </div>
      </div>
    </div>
  );
};

// ===== LIMITED SOURCES NOTE =====

const LimitedSourcesNote = ({ count, language }: { count: number; language: 'en' | 'fr' }) => {
  if (count >= 3) return null;
  const label = language === 'fr' 
    ? 'Sources directes limitées pour ce sujet.'
    : 'Limited direct sources for this topic.';
  return (
    <p className="text-xs text-slate-500 italic mt-3 text-center">{label}</p>
  );
};

// ===== MAIN COMPONENT =====

const MAX_SOURCES = 5;

export const BestSourcesSection = ({ sources, bestLinks, allSources, language, outcome, claim, mode = 'all' }: BestSourcesSectionProps) => {
  const [showAllSources, setShowAllSources] = useState(false);
  const [verifiedUrls, setVerifiedUrls] = useState<Set<string>>(new Set());
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  const t = {
    corroborationSources: language === 'fr' ? 'Sources de corroboration' : 'Corroboration Sources',
    refutingSources: language === 'fr' ? 'Sources réfutantes' : 'Refuting Sources',
    showAll: language === 'fr' ? 'Voir toutes les sources' : 'Show all sources',
    hideAll: language === 'fr' ? 'Masquer' : 'Hide',
    verifying: language === 'fr' ? 'Vérification des liens…' : 'Verifying links…',
  };
  
  // ===== PIPELINE: Collect, filter, dedupe, rank =====
  const { validSources, supportingSources, contradictingSources } = useMemo(() => {
    let candidates: NormalizedSource[] = [];
    
    // New PRO format
    if (bestLinks && bestLinks.length > 0) {
      const normalized = bestLinks.map(src => normalizeSource(src)).filter((s): s is NormalizedSource => s !== null);
      candidates.push(...normalized);
    }
    
    if (allSources && allSources.length > 0) {
      const normalized = allSources.map(src => normalizeSource(src)).filter((s): s is NormalizedSource => s !== null);
      candidates.push(...normalized);
    }
    
    // Legacy format
    if (candidates.length === 0 && sources) {
      const fromCorroborated = (sources.corroborated || [])
        .map(s => normalizeSource(s, 'corroborating'))
        .filter((s): s is NormalizedSource => s !== null);
      
      const fromNeutral = (sources.neutral || [])
        .map(s => normalizeSource(s, 'neutral'))
        .filter((s): s is NormalizedSource => s !== null);
      
      const fromContradicting = (sources.contradicting || [])
        .map(s => normalizeSource(s, 'contradicting'))
        .filter((s): s is NormalizedSource => s !== null);
      
      candidates = [...fromCorroborated, ...fromNeutral, ...fromContradicting];
    }
    
    // Deduplicate and rank
    const ranked = deduplicateAndRank(candidates);
    
    // Separate by stance
    const supporting = ranked.filter(s => s.stance !== 'contradicting');
    const contradicting = ranked.filter(s => s.stance === 'contradicting');
    
    return { 
      validSources: ranked.slice(0, 10), // Keep max 10 candidates
      supportingSources: supporting,
      contradictingSources: contradicting 
    };
  }, [bestLinks, allSources, sources]);
  
  // URLs to verify
  const urlsToVerify = useMemo(() => {
    return validSources.map(s => ({ url: s.url, name: s.title, snippet: s.whyItMatters }));
  }, [validSources]);
  
  // Verify URLs (filter out 404s)
  const verifyUrls = useCallback(async () => {
    if (urlsToVerify.length === 0 || verificationComplete) return;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-urls', { body: { urls: urlsToVerify } });
      
      if (error) {
        // On error, assume all valid
        setVerifiedUrls(new Set(urlsToVerify.map(u => u.url)));
      } else if (data?.results) {
        const valid = new Set<string>();
        data.results.forEach((r: { originalUrl: string; isValid: boolean }) => {
          if (r.isValid) valid.add(r.originalUrl);
        });
        setVerifiedUrls(valid);
      }
    } catch {
      setVerifiedUrls(new Set(urlsToVerify.map(u => u.url)));
    } finally {
      setIsVerifying(false);
      setVerificationComplete(true);
    }
  }, [urlsToVerify, verificationComplete]);
  
  useEffect(() => {
    verifyUrls();
  }, [verifyUrls]);
  
  // Final filtered sources (only verified URLs)
  const { finalSources, finalSupporting, finalContradicting } = useMemo(() => {
    if (!verificationComplete) {
      return { finalSources: [], finalSupporting: [], finalContradicting: [] };
    }
    
    // Keep only verified sources
    const verified = validSources.filter(s => verifiedUrls.has(s.url));
    const supporting = supportingSources.filter(s => verifiedUrls.has(s.url));
    const contradicting = contradictingSources.filter(s => verifiedUrls.has(s.url));
    
    return {
      finalSources: verified.slice(0, MAX_SOURCES),
      finalSupporting: supporting.slice(0, MAX_SOURCES),
      finalContradicting: contradicting.slice(0, MAX_SOURCES),
    };
  }, [validSources, supportingSources, contradictingSources, verifiedUrls, verificationComplete]);
  
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
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-600" />
          </div>
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
            {t.refutingSources}
          </h4>
        </div>
        <div className="space-y-3">
          {finalContradicting.map((source, idx) => (
            <SourceCard 
              key={`contra-${idx}`} 
              source={source} 
              language={language} 
              isVerified={true}
              isSingleSource={finalContradicting.length === 1}
            />
          ))}
        </div>
        <LimitedSourcesNote count={finalContradicting.length} language={language} />
      </div>
    );
  }
  
  // MODE: supportingOnly
  if (mode === 'supportingOnly') {
    if (finalSupporting.length === 0) return null;
    
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-cyan-600" />
          </div>
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
            {t.corroborationSources}
          </h4>
        </div>
        <div className="space-y-3">
          {finalSupporting.map((source, idx) => (
            <SourceCard 
              key={`support-${idx}`} 
              source={source} 
              language={language} 
              isVerified={true}
              isSingleSource={finalSupporting.length === 1}
            />
          ))}
        </div>
        <LimitedSourcesNote count={finalSupporting.length} language={language} />
      </div>
    );
  }
  
  // MODE: all (default)
  
  // 0 sources → show fallback card
  if (finalSources.length === 0) {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-cyan-600" />
          </div>
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
            {t.corroborationSources}
          </h4>
        </div>
        <WebSearchFallbackCard claim={claim} language={language} />
      </div>
    );
  }
  
  // Determine display count
  const displayCount = finalSources.length >= 3 ? Math.min(finalSources.length, 3) : finalSources.length;
  const displayedSources = showAllSources ? finalSources : finalSources.slice(0, displayCount);
  const hasMore = finalSources.length > displayCount;
  
  return (
    <div className="mt-6 pt-5 border-t border-slate-200/80">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
          <Shield className="w-4 h-4 text-cyan-600" />
        </div>
        <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
          {t.corroborationSources}
        </h4>
      </div>
      
      <div className="space-y-3">
        {displayedSources.map((source, idx) => (
          <SourceCard 
            key={`source-${idx}`} 
            source={source} 
            language={language} 
            isVerified={true}
            isSingleSource={finalSources.length === 1}
          />
        ))}
      </div>
      
      <LimitedSourcesNote count={finalSources.length} language={language} />
      
      {/* Show more toggle */}
      {hasMore && (
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
                {t.showAll} ({finalSources.length - displayCount})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
