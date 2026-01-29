import { CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { type SupportedLanguage } from '@/i18n/config';
import { getTranslation } from '@/i18n/translations';

interface ProSource {
  stance?: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters?: string;
  title?: string;
}

interface ProHighlightsProps {
  language: SupportedLanguage;
  sources: ProSource[];
}

export const ProHighlights = ({ language, sources }: ProHighlightsProps) => {
  // Use i18n system for translations
  const t = (key: string) => getTranslation(language, key);
  
  // Extract sources by stance
  const corroborating = sources.filter(s => s.stance === 'corroborating');
  const neutral = sources.filter(s => s.stance === 'neutral');
  const contradicting = sources.filter(s => s.stance === 'contradicting');
  
  // Get the best sentence for each category (prefer whyItMatters, fallback to title snippet)
  const getHighlightSentence = (sourceList: ProSource[]): string | null => {
    if (sourceList.length === 0) return null;
    
    // Find the source with the longest/most informative whyItMatters
    const best = sourceList.reduce((prev, curr) => {
      const prevLen = prev.whyItMatters?.length || 0;
      const currLen = curr.whyItMatters?.length || 0;
      return currLen > prevLen ? curr : prev;
    }, sourceList[0]);
    
    return best.whyItMatters || best.title || null;
  };
  
  const confirmedText = getHighlightSentence(corroborating) || t('proHighlights.noConfirmation');
  const uncertainText = getHighlightSentence(neutral) || t('proHighlights.noUncertainty');
  const contradictedText = getHighlightSentence(contradicting) || t('proHighlights.noContradiction');
  
  const hasConfirmation = corroborating.length > 0;
  const hasUncertainty = neutral.length > 0;
  const hasContradiction = contradicting.length > 0;

  return (
    <div 
      className="analysis-card mb-6"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(260 20% 98%) 100%)',
        border: '1px solid hsl(260 30% 88%)',
        boxShadow: '0 4px 24px hsl(260 30% 50% / 0.06)',
      }}
    >
      <h3 className="font-serif text-lg font-semibold text-slate-900 mb-4">
        {t('proHighlights.title')}
      </h3>
      
      <div className="space-y-3">
        {/* Confirmed */}
        <div className="flex items-start gap-3">
          <div 
            className={`flex-shrink-0 mt-0.5 rounded-full p-1.5 ${
              hasConfirmation 
                ? 'bg-emerald-100' 
                : 'bg-slate-100'
            }`}
          >
            <CheckCircle 
              className={`h-4 w-4 ${
                hasConfirmation 
                  ? 'text-emerald-600' 
                  : 'text-slate-400'
              }`} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
              hasConfirmation ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              {t('proHighlights.confirmed')}
            </p>
            <p className={`text-sm leading-relaxed ${
              hasConfirmation ? 'text-slate-700' : 'text-slate-500 italic'
            }`}>
              {confirmedText}
            </p>
          </div>
        </div>
        
        {/* Uncertain */}
        <div className="flex items-start gap-3">
          <div 
            className={`flex-shrink-0 mt-0.5 rounded-full p-1.5 ${
              hasUncertainty 
                ? 'bg-amber-100' 
                : 'bg-slate-100'
            }`}
          >
            <HelpCircle 
              className={`h-4 w-4 ${
                hasUncertainty 
                  ? 'text-amber-600' 
                  : 'text-slate-400'
              }`} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
              hasUncertainty ? 'text-amber-700' : 'text-slate-500'
            }`}>
              {t('proHighlights.uncertain')}
            </p>
            <p className={`text-sm leading-relaxed ${
              hasUncertainty ? 'text-slate-700' : 'text-slate-500 italic'
            }`}>
              {uncertainText}
            </p>
          </div>
        </div>
        
        {/* Contradicted */}
        <div className="flex items-start gap-3">
          <div 
            className={`flex-shrink-0 mt-0.5 rounded-full p-1.5 ${
              hasContradiction 
                ? 'bg-red-100' 
                : 'bg-slate-100'
            }`}
          >
            <XCircle 
              className={`h-4 w-4 ${
                hasContradiction 
                  ? 'text-red-600' 
                  : 'text-slate-400'
              }`} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
              hasContradiction ? 'text-red-700' : 'text-slate-500'
            }`}>
              {t('proHighlights.contradicted')}
            </p>
            <p className={`text-sm leading-relaxed ${
              hasContradiction ? 'text-slate-700' : 'text-slate-500 italic'
            }`}>
              {contradictedText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
