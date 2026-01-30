import { useState, useEffect, useMemo, useCallback } from 'react';
import { ExternalLink, Shield, BookOpen, Newspaper, Building2, Filter, CheckCircle2, Loader2, ChevronDown, ChevronUp, Info, Search, AlertCircle } from 'lucide-react';
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
  originalUrl: string;
  fallbackUrls: string[];
  trustTier?: 'high' | 'medium' | 'low';
  stance?: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters: string;
  isGenericUrl?: boolean;
  isUnavailable?: boolean;
  searchQuery?: string;
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

// ===== URL HELPERS =====

const getDomainFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};

// Remove tracking params from URL
const cleanTrackingParams = (url: string): string => {
  try {
    const parsed = new URL(url);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    // Remove trailing slash from path
    let path = parsed.pathname.replace(/\/$/, '');
    if (path === '') path = '/';
    return `${parsed.origin}${path}${parsed.search}`;
  } catch {
    return url;
  }
};

const normalizeUrlForDedup = (url: string): string => {
  try {
    const cleaned = cleanTrackingParams(url);
    const parsed = new URL(cleaned);
    const normalizedHost = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const normalizedPath = parsed.pathname.replace(/\/$/, '');
    return `${normalizedHost}${normalizedPath}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
};

// Hub paths that indicate generic section pages
const HUB_PATHS = new Set([
  '/news', '/world', '/politics', '/business', '/sport', '/sports',
  '/entertainment', '/health', '/science', '/tech', '/technology',
  '/video', '/videos', '/live', '/latest', '/breaking', '/search',
  '/tag', '/tags', '/topic', '/topics', '/category', '/categories',
  '/hub', '/section', '/sections', '/home', '/about', '/contact'
]);

const TRUSTED_DOMAINS = new Set([
  'nps.gov', 'si.edu', 'nationalzoo.si.edu', 'australian.museum',
  'britannica.com', 'wikipedia.org', 'en.wikipedia.org', 'fr.wikipedia.org',
  'aspca.org', 'petmd.com', 'vcahospitals.com', 'cdc.gov', 'nih.gov',
  'nasa.gov', 'who.int', 'nature.com', 'sciencedirect.com', 'pubmed.ncbi.nlm.nih.gov',
  'bbc.com', 'reuters.com', 'apnews.com', 'nytimes.com', 'theguardian.com'
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

const isHomepageOrGenericUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/$/, '');
    
    // Homepage or root
    if (pathname === '' || pathname === '/') return true;
    
    // Known hub/section paths
    const pathLower = pathname.toLowerCase();
    if (HUB_PATHS.has(pathLower)) return true;
    
    // Very short path with single segment and length < 10 (e.g., /news, /about)
    const segments = pathname.split('/').filter(s => s.length > 0);
    if (segments.length === 1 && segments[0].length < 10 && !isTrustedDomain(parsed.hostname)) {
      return true;
    }
    
    return false;
  } catch {
    return true;
  }
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

// Get best available URL with fallbacks
const getBestUrlWithFallbacks = (source: { url: string; articleUrl?: string; canonicalUrl?: string }): { 
  url: string; 
  isGeneric: boolean; 
  fallbackUrls: string[] 
} => {
  const fallbacks: string[] = [];
  
  // Collect all possible URLs in priority order
  const candidates = [
    source.articleUrl,
    source.canonicalUrl,
    source.url,
    cleanTrackingParams(source.url)
  ].filter((u): u is string => !!u && u.trim() !== '');
  
  // Find the first non-generic URL
  for (const candidate of candidates) {
    if (!isHomepageOrGenericUrl(candidate) && !isBadUrl(candidate)) {
      // Add remaining candidates as fallbacks
      const remaining = candidates.filter(c => c !== candidate && c !== cleanTrackingParams(candidate));
      return { url: candidate, isGeneric: false, fallbackUrls: remaining };
    }
    fallbacks.push(candidate);
  }
  
  // All are generic, return the first one with fallbacks
  return { 
    url: candidates[0] || source.url || '', 
    isGeneric: true, 
    fallbackUrls: candidates.slice(1) 
  };
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

// ===== TRUST TIER LOGIC =====

const inferTrustTierFromScore = (score?: number): 'high' | 'medium' | 'low' | null => {
  if (score === undefined || score === null) return null;
  if (score >= 80) return 'high';
  if (score >= 55) return 'medium';
  return 'low';
};

const inferTrustTier = (name: string, url: string, score?: number): 'high' | 'medium' | 'low' => {
  const fromScore = inferTrustTierFromScore(score);
  if (fromScore) return fromScore;
  
  const combined = (name + ' ' + url).toLowerCase();
  const highTrustPatterns = /\.(gov|gouv|edu|int)\b|wikipedia|britannica|reuters|associated\s*press|afp|bbc|cnn|new\s*york\s*times|washington\s*post|wall\s*street|nature\.com|science\.org|pubmed|who\.int|un\.org|nasa|nih|cdc|fda/i;
  if (highTrustPatterns.test(combined)) return 'high';
  const majorMediaPatterns = /guardian|telegraph|le\s*monde|figaro|economist|bloomberg|politico|npr|pbs|time\.com|forbes|wired/i;
  if (majorMediaPatterns.test(combined)) return 'medium';
  return 'low';
};

// ===== NORMALIZATION =====

const normalizeSource = (
  source: string | LegacySourceDetail | NewProSource,
  inferredStance?: 'corroborating' | 'neutral' | 'contradicting'
): NormalizedSource | null => {
  if (typeof source === 'string' || !source) return null;

  // New PRO format
  if ('title' in source && 'whyItMatters' in source) {
    const proSource = source as NewProSource & { score?: number };
    if (!proSource.url) return null;
    
    const { url: bestUrl, isGeneric, fallbackUrls } = getBestUrlWithFallbacks(proSource);
    const domain = getDomainFromUrl(bestUrl);
    
    return {
      title: proSource.title || domain,
      publisher: proSource.publisher || derivePublisher(bestUrl),
      url: bestUrl,
      originalUrl: proSource.url,
      fallbackUrls,
      trustTier: proSource.trustTier || inferTrustTier(proSource.title, bestUrl, proSource.score),
      stance: proSource.stance,
      whyItMatters: proSource.whyItMatters || '',
      isGenericUrl: isGeneric,
      searchQuery: `"${proSource.title}" site:${domain}`,
    };
  }

  // Legacy format
  if ('name' in source && 'url' in source) {
    const legacySource = source as LegacySourceDetail & { articleUrl?: string; canonicalUrl?: string; score?: number };
    if (!legacySource.url) return null;
    
    const { url: bestUrl, isGeneric, fallbackUrls } = getBestUrlWithFallbacks(legacySource);
    const domain = getDomainFromUrl(bestUrl);
    
    return {
      title: legacySource.name || domain,
      publisher: derivePublisher(bestUrl),
      url: bestUrl,
      originalUrl: legacySource.url,
      fallbackUrls,
      trustTier: legacySource.trustTier || inferTrustTier(legacySource.name, bestUrl, legacySource.score),
      stance: inferredStance,
      whyItMatters: legacySource.snippet || '',
      isGenericUrl: isGeneric,
      searchQuery: `"${legacySource.name}" site:${domain}`,
    };
  }

  return null;
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

const deduplicateSources = (sources: NormalizedSource[]): NormalizedSource[] => {
  const byNormalizedUrl = new Map<string, NormalizedSource>();
  
  for (const src of sources) {
    const normalizedUrl = normalizeUrlForDedup(src.url);
    if (!normalizedUrl) continue;
    
    const existing = byNormalizedUrl.get(normalizedUrl);
    if (!existing) {
      byNormalizedUrl.set(normalizedUrl, src);
      continue;
    }
    
    // Prefer non-generic URLs
    if (existing.isGenericUrl && !src.isGenericUrl) {
      byNormalizedUrl.set(normalizedUrl, src);
      continue;
    }
    if (!existing.isGenericUrl && src.isGenericUrl) continue;
    
    // Prefer higher trust tier
    const existingTier = TRUST_TIER_PRIORITY[existing.trustTier || 'low'] ?? 2;
    const newTier = TRUST_TIER_PRIORITY[src.trustTier || 'low'] ?? 2;
    if (newTier < existingTier || (newTier === existingTier && src.whyItMatters.length > existing.whyItMatters.length)) {
      byNormalizedUrl.set(normalizedUrl, src);
    }
  }
  
  return Array.from(byNormalizedUrl.values());
};

const sortByTrustTier = (sources: NormalizedSource[]): NormalizedSource[] => {
  return [...sources].sort((a, b) => {
    const tierA = TRUST_TIER_PRIORITY[a.trustTier || 'medium'] ?? 1;
    const tierB = TRUST_TIER_PRIORITY[b.trustTier || 'medium'] ?? 1;
    if (tierA !== tierB) return tierA - tierB;
    return b.whyItMatters.length - a.whyItMatters.length;
  });
};

// ===== BADGE STYLES =====

const trustTierBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
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
  const faviconUrl = getFaviconUrl(source.url);
  const isContradicting = source.stance === 'contradicting';
  const isGeneric = source.isGenericUrl;
  const isUnavailable = source.isUnavailable;
  
  const trustTierLabels: Record<string, { en: string; fr: string }> = {
    high: { en: 'High', fr: 'Élevée' },
    medium: { en: 'Medium', fr: 'Moyenne' },
    low: { en: 'Low', fr: 'Faible' },
  };
  
  const trustTierTooltips: Record<string, { en: string; fr: string }> = {
    high: { 
      en: 'Official, institutional, or recognized reference source.', 
      fr: 'Source officielle, institutionnelle ou média de référence reconnu.' 
    },
    medium: { 
      en: 'Recognized media or reliable secondary analysis, but not official.', 
      fr: 'Média reconnu ou analyse secondaire fiable, mais non officielle.' 
    },
    low: { 
      en: 'Indirect or contextual source, interpret with caution.', 
      fr: 'Source indirecte ou contextuelle, à interpréter avec prudence.' 
    },
  };
  
  const labels = {
    open: language === 'fr' ? 'Ouvrir' : 'Open',
    unavailable: language === 'fr' ? 'Source indisponible (lien expiré)' : 'Source unavailable (link expired)',
    genericLink: language === 'fr' ? 'Lien trop général (article introuvable)' : 'Link too general (article not found)',
    searchArticle: language === 'fr' ? 'Rechercher l\'article' : 'Search for article',
    verified: language === 'fr' ? 'Vérifié' : 'Verified',
  };
  
  // Build search URL for fallback action
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(source.searchQuery || source.title)}`;
  
  // Unavailable source card (404/expired)
  if (isUnavailable) {
    return (
      <div
        key={`source-${idx}`}
        className={`block rounded-xl border p-4 shadow-sm
                   ${isPrimary
                     ? 'border-slate-200 bg-gradient-to-br from-white to-slate-50/80'
                     : 'border-slate-100 bg-slate-50/50'
                   } opacity-75`}
      >
        <div className="flex items-start gap-3">
          {/* Favicon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-sm overflow-hidden opacity-50">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" className="w-5 h-5 object-contain grayscale" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <ExternalLink className="w-4 h-4 text-slate-400" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-semibold text-sm text-slate-500">{source.title}</span>
              
              {source.trustTier && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border opacity-60
                                 ${trustTierBadgeStyles[source.trustTier].bg} 
                                 ${trustTierBadgeStyles[source.trustTier].text} 
                                 ${trustTierBadgeStyles[source.trustTier].border}`}>
                  {language === 'fr' ? trustTierLabels[source.trustTier].fr : trustTierLabels[source.trustTier].en}
                </span>
              )}
            </div>
            
            {source.publisher && (
              <p className="text-xs text-slate-400 mb-1">{source.publisher}</p>
            )}
            
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{source.whyItMatters}</p>
            
            {/* Unavailable notice with search fallback */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
                {labels.unavailable}
              </span>
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Search className="w-3 h-3" />
                {labels.searchArticle}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Generic URL card (no article link)
  if (isGeneric) {
    return (
      <div
        key={`source-${idx}`}
        className={`block rounded-xl border p-4 shadow-sm
                   ${isPrimary
                     ? 'border-slate-200 bg-gradient-to-br from-white to-slate-50/80'
                     : 'border-slate-100 bg-slate-50/50'
                   }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-sm overflow-hidden opacity-60">
            {faviconUrl ? (
              <img src={faviconUrl} alt="" className="w-5 h-5 object-contain grayscale" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <ExternalLink className="w-4 h-4 text-slate-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-semibold text-sm text-slate-700">{source.title}</span>
              
              {source.trustTier && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border cursor-help
                                       ${trustTierBadgeStyles[source.trustTier].bg} 
                                       ${trustTierBadgeStyles[source.trustTier].text} 
                                       ${trustTierBadgeStyles[source.trustTier].border}`}>
                        {language === 'fr' ? trustTierLabels[source.trustTier].fr : trustTierLabels[source.trustTier].en}
                        <Info className="w-3 h-3 opacity-60" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p>{language === 'fr' ? trustTierTooltips[source.trustTier].fr : trustTierTooltips[source.trustTier].en}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {source.publisher && (
              <p className="text-xs text-slate-500 mb-1">{source.publisher}</p>
            )}
            
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{source.whyItMatters}</p>
            
            {/* Generic link note with search fallback */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-amber-600 italic">{labels.genericLink}</span>
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Search className="w-3 h-3" />
                {labels.searchArticle}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Normal clickable card
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
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-white border flex items-center justify-center shadow-sm overflow-hidden
                        ${isContradicting ? 'border-red-200/80' : 'border-slate-200/80'}`}>
          {faviconUrl ? (
            <img src={faviconUrl} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <ExternalLink className="w-4 h-4 text-slate-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`font-semibold text-sm transition-colors
                            ${isContradicting ? 'text-slate-800 group-hover:text-red-700' : 'text-slate-800 group-hover:text-cyan-700'}`}>
              {source.title}
            </span>
            
            {source.trustTier && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border cursor-help
                                     ${trustTierBadgeStyles[source.trustTier].bg} 
                                     ${trustTierBadgeStyles[source.trustTier].text} 
                                     ${trustTierBadgeStyles[source.trustTier].border}`}>
                      {language === 'fr' ? trustTierLabels[source.trustTier].fr : trustTierLabels[source.trustTier].en}
                      <Info className="w-3 h-3 opacity-60" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    <p>{language === 'fr' ? trustTierTooltips[source.trustTier].fr : trustTierTooltips[source.trustTier].en}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <CheckCircle2 className="w-3 h-3" />
                {labels.verified}
              </span>
            )}
          </div>
          
          {source.publisher && (
            <p className="text-xs text-slate-500 mb-1">{source.publisher}</p>
          )}
          
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{source.whyItMatters}</p>
        </div>
        
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

// ===== FILTER STATS =====

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
  const [unavailableUrls, setUnavailableUrls] = useState<Set<string>>(new Set());
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  const t = {
    corroborationSources: language === 'fr' ? 'Sources de corroboration' : 'Corroboration Sources',
    showAll: language === 'fr' ? 'Voir toutes les sources' : 'Show all sources',
    hideAll: language === 'fr' ? 'Masquer les sources' : 'Hide sources',
    noDirectSources: language === 'fr' 
      ? 'Aucune source directe disponible. Relance une vérification ou reformule la demande.'
      : 'No direct sources available. Retry verification or rephrase your request.',
    verifying: language === 'fr' ? 'Vérification des liens…' : 'Verifying links…',
    refutingSources: language === 'fr' ? 'Sources réfutantes' : 'Refuting Sources',
  };
  
  // ===== NORMALIZE ALL SOURCES =====
  const { normalizedBestLinks, normalizedAllSources, totalConsulted } = useMemo(() => {
    let best: NormalizedSource[] = [];
    let all: NormalizedSource[] = [];
    let consulted = 0;
    
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
    
    // Legacy format
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
      all = all.filter(isValidSource);
    }
    
    best = deduplicateSources(best);
    all = deduplicateSources(all);
    best = sortByTrustTier(best);
    all = sortByTrustTier(all);
    
    if (best.length === 0 && all.length > 0) {
      best = all.slice(0, MAX_BEST_LINKS);
    }
    
    best = best.slice(0, MAX_BEST_LINKS);
    all = all.slice(0, MAX_ALL_SOURCES);
    
    return { normalizedBestLinks: best, normalizedAllSources: all, totalConsulted: consulted };
  }, [bestLinks, allSources, sources]);
  
  const additionalSources = useMemo(() => {
    const bestUrls = new Set(normalizedBestLinks.map(s => s.url));
    return normalizedAllSources.filter(s => !bestUrls.has(s.url));
  }, [normalizedBestLinks, normalizedAllSources]);
  
  const allCandidateSources = useMemo(() => {
    return [...normalizedBestLinks, ...additionalSources];
  }, [normalizedBestLinks, additionalSources]);
  
  const candidateUrls = useMemo(() => {
    return allCandidateSources.map(s => ({ url: s.url, name: s.title, snippet: s.whyItMatters }));
  }, [allCandidateSources]);
  
  // URL verification with 404 detection
  const verifyUrls = useCallback(async () => {
    if (candidateUrls.length === 0 || verificationComplete) return;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-urls', { body: { urls: candidateUrls } });
      
      if (error) {
        // On error, assume all valid
        setVerifiedUrls(new Set(candidateUrls.map(u => u.url)));
      } else if (data?.results) {
        const valid = new Set<string>();
        const unavailable = new Set<string>();
        data.results.forEach((r: { originalUrl: string; isValid: boolean; status?: number }) => {
          if (r.isValid) {
            valid.add(r.originalUrl);
          } else {
            unavailable.add(r.originalUrl);
          }
        });
        setVerifiedUrls(valid);
        setUnavailableUrls(unavailable);
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
  
  // Build final source lists with unavailable marking
  const { finalBestLinks, finalAdditionalSources, finalSupporting, finalContradicting } = useMemo(() => {
    if (!verificationComplete) {
      return { 
        finalBestLinks: [], 
        finalAdditionalSources: [], 
        finalSupporting: [], 
        finalContradicting: [] 
      };
    }
    
    // Mark unavailable sources
    const markAvailability = (sources: NormalizedSource[]): NormalizedSource[] => {
      return sources.map(s => ({
        ...s,
        isUnavailable: unavailableUrls.has(s.url)
      }));
    };
    
    // Get valid sources that aren't unavailable
    const validSources = allCandidateSources.filter(s => !unavailableUrls.has(s.url) && !s.isGenericUrl);
    const unavailableBestLinks = normalizedBestLinks.filter(s => unavailableUrls.has(s.url) || s.isGenericUrl);
    const validBestLinks = normalizedBestLinks.filter(s => !unavailableUrls.has(s.url) && !s.isGenericUrl);
    
    // Find replacements for unavailable best links
    const bestLinkUrls = new Set(normalizedBestLinks.map(s => s.url));
    const replacementPool = validSources.filter(s => !bestLinkUrls.has(s.url));
    
    const finalBest: NormalizedSource[] = [...validBestLinks];
    let replacementIndex = 0;
    
    for (let i = 0; i < unavailableBestLinks.length && replacementIndex < replacementPool.length; i++) {
      finalBest.push(replacementPool[replacementIndex]);
      replacementIndex++;
    }
    
    // Also include unavailable sources at the end (with isUnavailable flag) so user can search
    const unavailableMarked = markAvailability(unavailableBestLinks);
    const sortedFinalBest = [...sortByTrustTier(finalBest).slice(0, MAX_BEST_LINKS), ...unavailableMarked.slice(0, Math.max(0, MAX_BEST_LINKS - finalBest.length))];
    
    const finalBestUrls = new Set(sortedFinalBest.map(s => s.url));
    const finalAdditional = markAvailability(
      allCandidateSources.filter(s => !finalBestUrls.has(s.url))
    );
    
    const supporting = sortedFinalBest.filter(s => s.stance !== 'contradicting');
    const contradicting = sortedFinalBest.filter(s => s.stance === 'contradicting');
    
    return { 
      finalBestLinks: sortedFinalBest, 
      finalAdditionalSources: finalAdditional, 
      finalSupporting: supporting, 
      finalContradicting: contradicting 
    };
  }, [allCandidateSources, normalizedBestLinks, unavailableUrls, verificationComplete]);
  
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
              {t.refutingSources}
            </h4>
          </div>
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
            <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">{t.corroborationSources}</h4>
          </div>
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
  // Check if we have any usable sources (including unavailable ones that can be searched)
  const hasAnySources = finalBestLinks.length > 0 || finalAdditionalSources.length > 0;
  
  if (!hasAnySources) {
    if (totalConsulted > 0) {
      return (
        <div className="mt-6 pt-5 border-t border-slate-200/80">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/50 to-slate-50/80 p-5 shadow-sm">
            <p className="text-sm text-slate-600 leading-relaxed">{t.noDirectSources}</p>
          </div>
        </div>
      );
    }
    return null;
  }
  
  return (
    <div className="mt-6 pt-5 border-t border-slate-200/80">
      <div className="flex items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-cyan-600" />
          </div>
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">{t.corroborationSources}</h4>
        </div>
        <FilterStatsIndicator displayed={finalBestLinks.filter(s => !s.isUnavailable && !s.isGenericUrl).length} total={normalizedBestLinks.length} language={language} />
      </div>
      
      <div className="space-y-3">
        {finalBestLinks.map((source, idx) => (
          <SourceCard key={`best-${idx}`} source={source} idx={idx} language={language} isVerified={verifiedUrls.has(source.url)} isPrimary={true} />
        ))}
      </div>
      
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
