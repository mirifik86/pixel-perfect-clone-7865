import { Globe, Building2, AlertTriangle } from 'lucide-react';
import { type SupportedLanguage } from '@/i18n/config';

interface ProSource {
  stance?: 'corroborating' | 'neutral' | 'contradicting';
  url?: string;
  trustTier?: 'high' | 'medium' | 'low';
}

interface VerificationCoverageProps {
  language: SupportedLanguage;
  sources: ProSource[];
  sourcesConsulted?: number;
}

const translations = {
  en: {
    title: 'Verification Coverage',
    webCoverage: 'Web coverage',
    sourceDiversity: 'Source diversity',
    contradictionCheck: 'Contradiction check',
    extensive: 'Extensive',
    moderate: 'Moderate',
    limited: 'Limited',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    clear: 'Clear',
    mixed: 'Mixed',
    noneFound: 'None found',
  },
  fr: {
    title: 'Couverture de vérification',
    webCoverage: 'Couverture web',
    sourceDiversity: 'Diversité des sources',
    contradictionCheck: 'Vérification des contradictions',
    extensive: 'Étendue',
    moderate: 'Modérée',
    limited: 'Limitée',
    high: 'Élevée',
    medium: 'Moyenne',
    low: 'Faible',
    clear: 'Claire',
    mixed: 'Mixte',
    noneFound: 'Aucune trouvée',
  },
};

// Helper: extract domain from URL
const getDomainFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export const VerificationCoverage = ({ language, sources, sourcesConsulted = 0 }: VerificationCoverageProps) => {
  const t = translations[language] || translations.en;
  
  // Calculate web coverage based on sources found
  const totalSources = Math.max(sources.length, sourcesConsulted);
  const getWebCoverage = (): { level: 'extensive' | 'moderate' | 'limited'; label: string } => {
    if (totalSources >= 6) return { level: 'extensive', label: t.extensive };
    if (totalSources >= 3) return { level: 'moderate', label: t.moderate };
    return { level: 'limited', label: t.limited };
  };
  
  // Calculate source diversity based on unique domains
  const uniqueDomains = new Set(
    sources.filter(s => s.url).map(s => getDomainFromUrl(s.url!))
  );
  const getSourceDiversity = (): { level: 'high' | 'medium' | 'low'; label: string } => {
    if (uniqueDomains.size >= 5) return { level: 'high', label: t.high };
    if (uniqueDomains.size >= 3) return { level: 'medium', label: t.medium };
    return { level: 'low', label: t.low };
  };
  
  // Check for contradictions
  const contradictingSources = sources.filter(s => s.stance === 'contradicting');
  const neutralSources = sources.filter(s => s.stance === 'neutral');
  const getContradictionCheck = (): { level: 'clear' | 'mixed' | 'none'; label: string } => {
    if (contradictingSources.length > 0) return { level: 'clear', label: t.clear };
    if (neutralSources.length > 1) return { level: 'mixed', label: t.mixed };
    return { level: 'none', label: t.noneFound };
  };
  
  const webCoverage = getWebCoverage();
  const sourceDiversity = getSourceDiversity();
  const contradictionCheck = getContradictionCheck();

  // Chip styles based on level
  const chipStyles: Record<string, { bg: string; text: string; border: string }> = {
    extensive: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    limited: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    high: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    low: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    clear: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    mixed: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    none: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  };

  return (
    <div 
      className="analysis-card mb-6"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 20% 98%) 100%)',
        border: '1px solid hsl(220 30% 88%)',
        boxShadow: '0 4px 24px hsl(220 30% 50% / 0.06)',
      }}
    >
      <h3 className="font-serif text-lg font-semibold text-slate-900 mb-4">
        {t.title}
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {/* Web Coverage Chip */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">{t.webCoverage}:</span>
          <span 
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${chipStyles[webCoverage.level].bg} ${chipStyles[webCoverage.level].text} ${chipStyles[webCoverage.level].border}`}
          >
            {webCoverage.label}
          </span>
        </div>
        
        {/* Source Diversity Chip */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">{t.sourceDiversity}:</span>
          <span 
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${chipStyles[sourceDiversity.level].bg} ${chipStyles[sourceDiversity.level].text} ${chipStyles[sourceDiversity.level].border}`}
          >
            {sourceDiversity.label}
          </span>
        </div>
        
        {/* Contradiction Check Chip */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">{t.contradictionCheck}:</span>
          <span 
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${chipStyles[contradictionCheck.level].bg} ${chipStyles[contradictionCheck.level].text} ${chipStyles[contradictionCheck.level].border}`}
          >
            {contradictionCheck.label}
          </span>
        </div>
      </div>
    </div>
  );
};
