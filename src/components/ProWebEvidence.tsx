import { useState } from 'react';
import { Globe, CheckCircle, XCircle, HelpCircle, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface SourceItem {
  title?: string;
  url: string;
  domain?: string;
  credibility?: number;
  stance?: string;
  snippet?: string;
}

interface SourcesBuckets {
  corroborate?: SourceItem[];
  contradict?: SourceItem[];
  neutral?: SourceItem[];
}

interface KeyPoints {
  confirmed: number;
  uncertain: number;
  contradicted: number;
}

interface ProWebEvidenceProps {
  sourcesBuckets?: SourcesBuckets;
  keyPoints?: KeyPoints;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'Web Evidence',
    confirmed: 'Confirmed',
    contradicted: 'Contradicted',
    neutral: 'Neutral',
    showMore: 'Show more',
    showLess: 'Show less',
    noSources: 'No sources in this category',
    credibility: 'Credibility',
    noEvidenceTitle: 'Limited Web Evidence',
    noEvidenceMessage: 'No reliable web evidence could be identified for this analysis.',
    unavailableTitle: 'Web Evidence Unavailable',
    unavailableMessage: 'Web evidence was not provided for this analysis.',
  },
  fr: {
    title: 'Preuves web',
    confirmed: 'Confirmé',
    contradicted: 'Contredit',
    neutral: 'Neutre',
    showMore: 'Voir plus',
    showLess: 'Voir moins',
    noSources: 'Aucune source dans cette catégorie',
    credibility: 'Crédibilité',
    noEvidenceTitle: 'Preuves web limitées',
    noEvidenceMessage: 'Aucune preuve web fiable n\'a pu être identifiée pour cette analyse.',
    unavailableTitle: 'Preuves web indisponibles',
    unavailableMessage: 'Les preuves web n\'ont pas été fournies pour cette analyse.',
  },
};

const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const SourceCard = ({ 
  source, 
  language 
}: { 
  source: SourceItem; 
  language: 'en' | 'fr';
}) => {
  const t = translations[language];
  const domain = source.domain || getDomainFromUrl(source.url);
  const credibilityPercent = source.credibility 
    ? Math.round(source.credibility * 100) 
    : null;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 group-hover:text-cyan-700 transition-colors line-clamp-1">
            {source.title || domain}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{domain}</p>
          {source.snippet && (
            <p className="text-xs text-slate-600 mt-1.5 line-clamp-1">{source.snippet}</p>
          )}
          {credibilityPercent !== null && (
            <p className="text-[10px] text-slate-400 mt-1">
              {t.credibility}: {credibilityPercent}%
            </p>
          )}
        </div>
        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 flex-shrink-0 mt-0.5" />
      </div>
    </a>
  );
};

const BucketSection = ({ 
  title, 
  icon: Icon, 
  sources, 
  language,
  accentColor,
  bgColor,
  borderColor,
}: { 
  title: string; 
  icon: typeof CheckCircle;
  sources: SourceItem[];
  language: 'en' | 'fr';
  accentColor: string;
  bgColor: string;
  borderColor: string;
}) => {
  const t = translations[language];
  const [expanded, setExpanded] = useState(false);
  
  const visibleSources = expanded ? sources.slice(0, 6) : sources.slice(0, 3);
  const hasMore = sources.length > 3;

  return (
    <div 
      className="rounded-xl border p-4"
      style={{
        background: bgColor,
        borderColor: borderColor,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4.5 w-4.5" style={{ color: accentColor }} />
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <span 
          className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ 
            background: `${accentColor}15`,
            color: accentColor,
          }}
        >
          {sources.length}
        </span>
      </div>
      
      {sources.length > 0 ? (
        <div className="space-y-2">
          {visibleSources.map((source, idx) => (
            <SourceCard key={idx} source={source} language={language} />
          ))}
          
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  {t.showLess}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  {t.showMore} ({sources.length - 3})
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">{t.noSources}</p>
      )}
    </div>
  );
};

export const ProWebEvidence = ({ sourcesBuckets, keyPoints, language }: ProWebEvidenceProps) => {
  const t = translations[language];
  
  if (!sourcesBuckets) return null;
  
  const corroborate = sourcesBuckets.corroborate || [];
  const contradict = sourcesBuckets.contradict || [];
  const neutral = sourcesBuckets.neutral || [];
  
  // Check if all buckets are empty
  const hasAnySources = corroborate.length > 0 || contradict.length > 0 || neutral.length > 0;

  // STRICT IA11 BINDING: decide which empty-state to show only from IA11 counters
  const confirmedCount = keyPoints?.confirmed ?? 0;
  const uncertainCount = keyPoints?.uncertain ?? 0;
  const contradictedCount = keyPoints?.contradicted ?? 0;
  const isLimitedFromIA11 = confirmedCount === 0 && uncertainCount === 0 && contradictedCount === 0;

  return (
    <div 
      className="analysis-card mb-6"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(200 20% 98%) 100%)',
        border: '1px solid hsl(200 30% 88%)',
        boxShadow: '0 4px 24px hsl(200 30% 50% / 0.06)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(200 60% 50%) 0%, hsl(220 60% 45%) 100%)',
            boxShadow: '0 2px 8px hsl(200 60% 50% / 0.3)',
          }}
        >
          <Globe className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="font-serif text-lg font-semibold text-slate-900">
          {t.title}
        </h3>
      </div>
      
      {hasAnySources ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <BucketSection
            title={t.confirmed}
            icon={CheckCircle}
            sources={corroborate}
            language={language}
            accentColor="hsl(145 55% 42%)"
            bgColor="hsl(145 30% 97%)"
            borderColor="hsl(145 35% 85%)"
          />
          <BucketSection
            title={t.contradicted}
            icon={XCircle}
            sources={contradict}
            language={language}
            accentColor="hsl(0 65% 50%)"
            bgColor="hsl(0 30% 98%)"
            borderColor="hsl(0 35% 88%)"
          />
          <BucketSection
            title={t.neutral}
            icon={HelpCircle}
            sources={neutral}
            language={language}
            accentColor="hsl(220 15% 50%)"
            bgColor="hsl(220 15% 97%)"
            borderColor="hsl(220 15% 88%)"
          />
        </div>
      ) : (
        /* Empty buckets: distinguish LIMITED (0/0/0) vs UNAVAILABLE (non-zero counters but no sources provided) */
        <div 
          className="rounded-xl border p-5 flex items-center gap-4"
          style={{
            background: 'hsl(220 15% 97%)',
            borderColor: 'hsl(220 15% 88%)',
          }}
        >
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
            style={{
              background: 'hsl(220 15% 85%)',
            }}
          >
            <AlertCircle className="h-5 w-5" style={{ color: 'hsl(220 15% 50%)' }} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              {isLimitedFromIA11 ? t.noEvidenceTitle : t.unavailableTitle}
            </p>
            <p className="text-xs text-slate-500">
              {isLimitedFromIA11 ? t.noEvidenceMessage : t.unavailableMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};