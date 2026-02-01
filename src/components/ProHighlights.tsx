import { CheckCircle, HelpCircle, XCircle, AlertCircle } from 'lucide-react';
import { SupportedLanguage } from '@/i18n/config';

interface ProSource {
  stance?: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters?: string;
  title?: string;
}

interface ProHighlightsProps {
  language: SupportedLanguage;
  sources: ProSource[];
}

const translations: Record<string, {
  title: string;
  confirmedLabel: string;
  uncertainLabel: string;
  contradictedLabel: string;
  limitedLabel: string;
  noConfirmation: string;
  noUncertainty: string;
  noContradiction: string;
  limitedVerification: string;
}> = {
  en: {
    title: 'PRO Highlights',
    confirmedLabel: 'Confirmed',
    uncertainLabel: 'Uncertain',
    contradictedLabel: 'Contradicted',
    limitedLabel: 'Limited Evaluation',
    noConfirmation: 'No strong external confirmation found.',
    noUncertainty: 'No significant uncertainty identified.',
    noContradiction: 'No notable contradictions found.',
    limitedVerification: 'Verification limited due to lack of reliable web sources.',
  },
  fr: {
    title: 'Points clés PRO',
    confirmedLabel: 'Confirmé',
    uncertainLabel: 'Incertain',
    contradictedLabel: 'Contredit',
    limitedLabel: 'Évaluation limitée',
    noConfirmation: 'Aucune confirmation externe forte trouvée.',
    noUncertainty: 'Aucune incertitude significative identifiée.',
    noContradiction: 'Aucune contradiction notable trouvée.',
    limitedVerification: 'Vérification limitée en raison d\'un manque de sources web fiables.',
  },
  es: {
    title: 'Puntos clave PRO',
    confirmedLabel: 'Confirmado',
    uncertainLabel: 'Incierto',
    contradictedLabel: 'Contradicho',
    limitedLabel: 'Evaluación limitada',
    noConfirmation: 'No se encontró confirmación externa sólida.',
    noUncertainty: 'No se identificó incertidumbre significativa.',
    noContradiction: 'No se encontraron contradicciones notables.',
    limitedVerification: 'Verificación limitada debido a la falta de fuentes web fiables.',
  },
  de: {
    title: 'PRO Highlights',
    confirmedLabel: 'Bestätigt',
    uncertainLabel: 'Unsicher',
    contradictedLabel: 'Widersprochen',
    limitedLabel: 'Begrenzte Bewertung',
    noConfirmation: 'Keine starke externe Bestätigung gefunden.',
    noUncertainty: 'Keine signifikante Unsicherheit identifiziert.',
    noContradiction: 'Keine nennenswerten Widersprüche gefunden.',
    limitedVerification: 'Überprüfung aufgrund fehlender zuverlässiger Webquellen eingeschränkt.',
  },
  pt: {
    title: 'Pontos-chave PRO',
    confirmedLabel: 'Confirmado',
    uncertainLabel: 'Incerto',
    contradictedLabel: 'Contradito',
    limitedLabel: 'Avaliação limitada',
    noConfirmation: 'Nenhuma confirmação externa forte encontrada.',
    noUncertainty: 'Nenhuma incerteza significativa identificada.',
    noContradiction: 'Nenhuma contradição notável encontrada.',
    limitedVerification: 'Verificação limitada devido à falta de fontes web confiáveis.',
  },
  it: {
    title: 'Punti chiave PRO',
    confirmedLabel: 'Confermato',
    uncertainLabel: 'Incerto',
    contradictedLabel: 'Contraddetto',
    limitedLabel: 'Valutazione limitata',
    noConfirmation: 'Nessuna forte conferma esterna trovata.',
    noUncertainty: 'Nessuna incertezza significativa identificata.',
    noContradiction: 'Nessuna contraddizione notevole trovata.',
    limitedVerification: 'Verifica limitata a causa della mancanza di fonti web affidabili.',
  },
  ja: {
    title: 'PROハイライト',
    confirmedLabel: '確認済み',
    uncertainLabel: '不確定',
    contradictedLabel: '矛盾',
    limitedLabel: '限定評価',
    noConfirmation: '強力な外部確認は見つかりませんでした。',
    noUncertainty: '重大な不確実性は特定されませんでした。',
    noContradiction: '顕著な矛盾は見つかりませんでした。',
    limitedVerification: '信頼できるWebソースがないため、検証が制限されています。',
  },
  ko: {
    title: 'PRO 핵심 사항',
    confirmedLabel: '확인됨',
    uncertainLabel: '불확실',
    contradictedLabel: '반박됨',
    limitedLabel: '제한된 평가',
    noConfirmation: '강력한 외부 확인을 찾을 수 없습니다.',
    noUncertainty: '중요한 불확실성이 확인되지 않았습니다.',
    noContradiction: '주목할만한 모순이 발견되지 않았습니다.',
    limitedVerification: '신뢰할 수 있는 웹 소스가 부족하여 검증이 제한됩니다.',
  },
};

export const ProHighlights = ({ language, sources }: ProHighlightsProps) => {
  const t = translations[language] || translations.en;
  
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
  
  const hasConfirmation = corroborating.length > 0;
  const hasUncertainty = neutral.length > 0;
  const hasContradiction = contradicting.length > 0;
  
  // Check if this is a limited evaluation (no strong sources)
  const isLimitedEvaluation = !hasConfirmation && !hasContradiction;
  
  const confirmedText = getHighlightSentence(corroborating) || t.noConfirmation;
  const uncertainText = getHighlightSentence(neutral) || t.noUncertainty;
  const contradictedText = getHighlightSentence(contradicting) || t.noContradiction;

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
        {t.title}
      </h3>
      
      <div className="space-y-3">
        {/* Limited Evaluation notice - shown when no strong sources exist */}
        {isLimitedEvaluation && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 rounded-full p-1.5 bg-slate-100">
              <AlertCircle className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-slate-600">
                {t.limitedLabel}
              </p>
              <p className="text-sm leading-relaxed text-slate-500 italic">
                {t.limitedVerification}
              </p>
            </div>
          </div>
        )}
        
        {/* Confirmed - only show if has confirmation */}
        {hasConfirmation && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 rounded-full p-1.5 bg-emerald-100">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-emerald-700">
                {t.confirmedLabel}
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {confirmedText}
              </p>
            </div>
          </div>
        )}
        
        {/* Uncertain - only show if there are conflicting sources */}
        {hasConfirmation && hasContradiction && hasUncertainty && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 rounded-full p-1.5 bg-amber-100">
              <HelpCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-amber-700">
                {t.uncertainLabel}
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {uncertainText}
              </p>
            </div>
          </div>
        )}
        
        {/* Contradicted - only show if has contradiction */}
        {hasContradiction && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 rounded-full p-1.5 bg-red-100">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-red-700">
                {t.contradictedLabel}
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                {contradictedText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};