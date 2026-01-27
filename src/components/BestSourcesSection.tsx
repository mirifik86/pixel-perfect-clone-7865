import { ExternalLink, Shield, BookOpen, Newspaper, Building2 } from 'lucide-react';

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
}

// Helper to extract source details from either string or SourceDetail
const getSourceDetails = (source: string | SourceDetail): SourceDetail | null => {
  if (typeof source === 'object' && source.name && source.url) {
    return source;
  }
  return null;
};

// Helper to get source name (supports both string and object formats)
const getSourceName = (source: string | SourceDetail): string => {
  if (typeof source === 'object') {
    return source.name;
  }
  return source;
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

// Check if URL points to an actual article page (not a hub/homepage)
const isArticleUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    
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

export const BestSourcesSection = ({ sources, language, outcome }: BestSourcesSectionProps) => {
  const t = {
    title: language === 'fr' ? 'Meilleures preuves (PRO)' : 'Best evidence (PRO)',
    open: language === 'fr' ? 'Ouvrir' : 'Open',
    refutedTitle: language === 'fr' ? 'Sources réfutantes (PRO)' : 'Refuting sources (PRO)',
    // Source Quality Gate fallback
    insufficientTitle: language === 'fr' ? 'Qualité des preuves insuffisante' : 'Evidence quality insufficient',
    insufficientSubtitle: language === 'fr' 
      ? "Nous n'avons pas trouvé assez de liens d'articles directs pour cette affirmation. Reformule, ajoute des détails (qui/où/quand) ou relance l'analyse PRO."
      : "We couldn't find enough direct article pages for this claim. Try rephrasing, adding specifics (who/where/when), or rerun PRO.",
  };
  
  // Collect all detailed sources from all categories
  const allDetailedSources: { source: SourceDetail; category: 'corroborated' | 'neutral' | 'contradicting' }[] = [];
  
  // Add contradicting sources first (for refuted claims)
  sources.contradicting?.forEach(s => {
    const details = getSourceDetails(s);
    if (details) {
      allDetailedSources.push({ source: details, category: 'contradicting' });
    }
  });
  
  // Add corroborated sources
  sources.corroborated?.forEach(s => {
    const details = getSourceDetails(s);
    if (details) {
      allDetailedSources.push({ source: details, category: 'corroborated' });
    }
  });
  
  // Add neutral sources (lower priority)
  sources.neutral?.forEach(s => {
    const details = getSourceDetails(s);
    if (details) {
      allDetailedSources.push({ source: details, category: 'neutral' });
    }
  });
  
  // Filter to only sources with valid article URLs (not homepages, not hub pages)
  const validSources = allDetailedSources.filter(({ source }) => {
    // Must pass article URL validation
    if (!isArticleUrl(source.url)) {
      return false;
    }
    // Must have snippet
    if (!source.snippet || source.snippet.length < 10) {
      return false;
    }
    return true;
  });
  
  // Deduplicate by normalized URL (hostname + pathname) - keep only first occurrence
  const seenUrls = new Set<string>();
  const deduplicatedSources = validSources.filter(({ source }) => {
    const urlKey = getNormalizedUrlKey(source.url);
    if (!urlKey || seenUrls.has(urlKey)) {
      return false;
    }
    seenUrls.add(urlKey);
    return true;
  });
  
  // Sort by trust level: official (1) > reference (2) > media (3)
  // Use stable sort to preserve original order within same type
  const getTrustPriority = (source: SourceDetail): number => {
    const { type } = classifySourceType(source);
    if (type === 'official') return 1;
    if (type === 'reference') return 2;
    return 3; // media
  };
  
  const sortedSources = [...deduplicatedSources].sort((a, b) => {
    return getTrustPriority(a.source) - getTrustPriority(b.source);
  });
  
  // Take top 6 sources
  const topSources = sortedSources.slice(0, 6);
  
  const isRefuted = outcome === 'refuted';
  const sectionTitle = isRefuted ? t.refutedTitle : t.title;
  
  // Source Quality Gate: Show fallback if fewer than 2 high-quality sources
  if (topSources.length < 2) {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
            {t.insufficientTitle}
          </h4>
        </div>
        
        {/* Fallback Card */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-amber-50/50 to-slate-50/80 p-5 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.insufficientSubtitle}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-6 pt-5 border-t border-slate-200/80">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isRefuted ? 'bg-red-100' : 'bg-cyan-100'}`}>
          <Shield className={`w-4 h-4 ${isRefuted ? 'text-red-600' : 'text-cyan-600'}`} />
        </div>
        <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
          {sectionTitle}
        </h4>
      </div>
      
      {/* Source Cards */}
      <div className="space-y-3">
        {topSources.map(({ source, category }, idx) => {
          const classification = classifySourceType(source);
          const faviconUrl = getFaviconUrl(source.url);
          
          return (
            <a
              key={`best-source-${idx}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 
                         p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200
                         hover:from-white hover:to-cyan-50/30"
            >
              <div className="flex items-start gap-3">
                {/* Favicon */}
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-slate-200/80 
                                flex items-center justify-center shadow-sm overflow-hidden">
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
                    <span className="font-semibold text-sm text-slate-800 group-hover:text-cyan-700 transition-colors">
                      {source.name}
                    </span>
                    
                    {/* Type Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                                     border ${classification.style}`}>
                      {classification.icon}
                      {language === 'fr' ? classification.labelFr : classification.label}
                    </span>
                    
                    {/* Category Badge for refuted */}
                    {category === 'contradicting' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                                       bg-red-500/10 text-red-700 border border-red-500/25">
                        {language === 'fr' ? 'Réfute' : 'Refutes'}
                      </span>
                    )}
                  </div>
                  
                  {/* Snippet */}
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {source.snippet}
                  </p>
                </div>
                
                {/* Open button */}
                <div className="flex-shrink-0 self-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                   bg-slate-100 text-slate-600 group-hover:bg-cyan-600 group-hover:text-white
                                   transition-all duration-200 shadow-sm">
                    {t.open}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
