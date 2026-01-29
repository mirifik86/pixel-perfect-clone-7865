import { Globe, Building2, AlertTriangle } from 'lucide-react';
import { type SupportedLanguage } from '@/i18n/config';
import { getTranslation } from '@/i18n/translations';

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
  // Use i18n system for translations
  const t = (key: string) => getTranslation(language, key);
  
  // Calculate web coverage based on sources found
  const totalSources = Math.max(sources.length, sourcesConsulted);
  const getWebCoverage = (): { level: 'extensive' | 'moderate' | 'limited'; labelKey: string } => {
    if (totalSources >= 6) return { level: 'extensive', labelKey: 'verificationCoverage.extensive' };
    if (totalSources >= 3) return { level: 'moderate', labelKey: 'verificationCoverage.moderate' };
    return { level: 'limited', labelKey: 'verificationCoverage.limited' };
  };
  
  // Calculate source diversity based on unique domains
  const uniqueDomains = new Set(
    sources.filter(s => s.url).map(s => getDomainFromUrl(s.url!))
  );
  const getSourceDiversity = (): { level: 'high' | 'medium' | 'low'; labelKey: string } => {
    if (uniqueDomains.size >= 5) return { level: 'high', labelKey: 'verificationCoverage.high' };
    if (uniqueDomains.size >= 3) return { level: 'medium', labelKey: 'verificationCoverage.medium' };
    return { level: 'low', labelKey: 'verificationCoverage.low' };
  };
  
  // Check for contradictions
  const contradictingSources = sources.filter(s => s.stance === 'contradicting');
  const neutralSources = sources.filter(s => s.stance === 'neutral');
  const getContradictionCheck = (): { level: 'clear' | 'mixed' | 'none'; labelKey: string } => {
    if (contradictingSources.length > 0) return { level: 'clear', labelKey: 'verificationCoverage.clear' };
    if (neutralSources.length > 1) return { level: 'mixed', labelKey: 'verificationCoverage.mixed' };
    return { level: 'none', labelKey: 'verificationCoverage.noneFound' };
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
        {t('verificationCoverage.title')}
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {/* Web Coverage Chip */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">{t('verificationCoverage.webCoverage')}:</span>
          <span 
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${chipStyles[webCoverage.level].bg} ${chipStyles[webCoverage.level].text} ${chipStyles[webCoverage.level].border}`}
          >
            {t(webCoverage.labelKey)}
          </span>
        </div>
        
        {/* Source Diversity Chip */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">{t('verificationCoverage.sourceDiversity')}:</span>
          <span 
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${chipStyles[sourceDiversity.level].bg} ${chipStyles[sourceDiversity.level].text} ${chipStyles[sourceDiversity.level].border}`}
          >
            {t(sourceDiversity.labelKey)}
          </span>
        </div>
        
        {/* Contradiction Check Chip */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600">{t('verificationCoverage.contradictionCheck')}:</span>
          <span 
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${chipStyles[contradictionCheck.level].bg} ${chipStyles[contradictionCheck.level].text} ${chipStyles[contradictionCheck.level].border}`}
          >
            {t(contradictionCheck.labelKey)}
          </span>
        </div>
      </div>
    </div>
  );
};
