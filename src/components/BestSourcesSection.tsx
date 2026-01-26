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

// Extract root domain from URL for deduplication
const getRootDomain = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. prefix and get root domain
    const parts = hostname.replace(/^www\./, '').split('.');
    // Handle domains like bbc.co.uk, gov.uk
    if (parts.length >= 2) {
      const tld = parts.slice(-2).join('.');
      if (['co.uk', 'com.au', 'org.uk', 'gov.uk', 'ac.uk', 'net.au'].includes(tld)) {
        return parts.slice(-3).join('.');
      }
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return '';
  }
};

export const BestSourcesSection = ({ sources, language, outcome }: BestSourcesSectionProps) => {
  const t = {
    title: language === 'fr' ? 'Meilleures preuves (PRO)' : 'Best evidence (PRO)',
    open: language === 'fr' ? 'Ouvrir' : 'Open',
    refutedTitle: language === 'fr' ? 'Sources réfutantes (PRO)' : 'Refuting sources (PRO)',
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
  
  // Filter to only sources with valid URLs (not homepages, not category pages)
  const validSources = allDetailedSources.filter(({ source }) => {
    try {
      const url = new URL(source.url);
      // Reject if it's just a homepage (path is / or empty)
      if (url.pathname === '/' || url.pathname === '') {
        return false;
      }
      // Must have snippet
      if (!source.snippet || source.snippet.length < 10) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });
  
  // Deduplicate by root domain - keep only the first (most relevant) source per domain
  const seenDomains = new Set<string>();
  const deduplicatedSources = validSources.filter(({ source }) => {
    const domain = getRootDomain(source.url);
    if (!domain || seenDomains.has(domain)) {
      return false;
    }
    seenDomains.add(domain);
    return true;
  });
  
  // Take top 6 sources
  const topSources = deduplicatedSources.slice(0, 6);
  
  if (topSources.length === 0) {
    return null;
  }
  
  const isRefuted = outcome === 'refuted';
  const sectionTitle = isRefuted ? t.refutedTitle : t.title;
  
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
