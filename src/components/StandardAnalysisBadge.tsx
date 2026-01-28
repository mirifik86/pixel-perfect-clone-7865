import { Shield, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type SupportedLanguage } from '@/i18n/config';
import { getTranslationWithFallback } from '@/i18n/fallback';

interface StandardAnalysisBadgeProps {
  language: SupportedLanguage;
}

const translations = {
  en: {
    badge: 'Standard AI Analysis',
    tooltip: 'Linguistic credibility signals only — no external fact-checking included.',
  },
  fr: {
    badge: 'Analyse IA Standard',
    tooltip: 'Signaux de crédibilité linguistique uniquement — aucune vérification externe des faits incluse.',
  },
};

export const StandardAnalysisBadge = ({ language }: StandardAnalysisBadgeProps) => {
  const t = getTranslationWithFallback(translations, language);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 cursor-help transition-all hover:shadow-md"
            style={{
              background: 'linear-gradient(135deg, hsl(200 25% 96%) 0%, hsl(220 20% 94%) 100%)',
              border: '1px solid hsl(200 30% 85%)',
              boxShadow: '0 2px 8px hsl(200 30% 50% / 0.08)',
            }}
          >
            <Shield className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-600 tracking-wide">
              {t.badge}
            </span>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-[280px] text-center bg-slate-900 text-white border-slate-700"
        >
          <p className="text-xs">{t.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
