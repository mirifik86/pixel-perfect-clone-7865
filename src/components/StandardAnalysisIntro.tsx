import { Sparkles, FileText } from 'lucide-react';
import { type SupportedLanguage } from '@/i18n/config';

interface AnalysisBreakdown {
  tone?: { points: number; reason: string };
  factual?: { points: number; reason: string };
  context?: { points: number; reason: string };
  transparency?: { points: number; reason: string };
  prudence?: { points: number; reason: string };
}

interface StandardAnalysisIntroProps {
  language: SupportedLanguage;
  breakdown?: AnalysisBreakdown;
  summary?: string;
}

// Text characteristics detection
const detectTextCharacteristics = (breakdown: AnalysisBreakdown) => {
  const tonePoints = breakdown.prudence?.points ?? breakdown.tone?.points ?? 0;
  const factualPoints = breakdown.factual?.points ?? 0;
  const contextPoints = breakdown.context?.points ?? 0;
  const transparencyPoints = breakdown.transparency?.points ?? 0;

  return {
    isNeutralTone: tonePoints >= 3,
    isEmotionalTone: tonePoints < 0,
    hasStrongClaims: factualPoints >= 2,
    isVague: contextPoints < 0,
    hasPrecision: contextPoints >= 3,
    lacksTransparency: transparencyPoints < 0,
    isBalanced: tonePoints >= 2 && contextPoints >= 2,
    overallStrength: (tonePoints + factualPoints + contextPoints + transparencyPoints) / 4,
  };
};

const translations = {
  en: {
    title: 'Linguistic Credibility Analysis',
    baseSubtitle: 'This first-level analysis examines how the content is written to detect signals commonly associated with reliable or misleading information.',
    
    // Dynamic summaries based on characteristics
    summaries: {
      neutralBalanced: 'The text displays a measured, informational tone with clear contextual framing. The writing style suggests a structured approach to presenting information.',
      neutralWithClaims: 'The content presents factual-style statements in a largely neutral manner. The language structure indicates an attempt to convey specific information.',
      emotionalAlarmist: 'The writing exhibits emotionally charged language patterns that may influence reader perception. Such stylistic choices are common in persuasive or sensationalized content.',
      vagueGeneralized: 'The text relies heavily on generalizations and lacks specific supporting details. This vagueness makes independent verification more challenging.',
      preciseDetailed: 'The content includes precise-looking details and specific references. While this suggests thoroughness, details alone do not guarantee accuracy.',
      assertiveAbsolute: 'The writing uses assertive, definitive language to present claims. Strong declarations without hedging can indicate confidence or oversimplification.',
      persuasiveOpinion: 'The text shows patterns typical of opinion-driven or persuasive writing. The framing appears designed to guide the reader toward a particular conclusion.',
      mixed: 'The text shows a mix of informational and emphatic elements. Some portions appear balanced while others employ more persuasive techniques.',
    },
    
    dynamicIntro: 'Based on linguistic patterns detected:',
  },
  fr: {
    title: 'Analyse de Crédibilité Linguistique',
    baseSubtitle: 'Cette analyse de premier niveau examine la façon dont le contenu est rédigé pour détecter les signaux communément associés à une information fiable ou trompeuse.',
    
    summaries: {
      neutralBalanced: 'Le texte présente un ton mesuré et informatif avec un cadrage contextuel clair. Le style d\'écriture suggère une approche structurée de présentation de l\'information.',
      neutralWithClaims: 'Le contenu présente des affirmations de style factuel de manière largement neutre. La structure du langage indique une tentative de transmettre des informations spécifiques.',
      emotionalAlarmist: 'L\'écriture présente des modèles de langage émotionnellement chargés qui peuvent influencer la perception du lecteur. Ces choix stylistiques sont courants dans les contenus persuasifs ou sensationnalistes.',
      vagueGeneralized: 'Le texte s\'appuie fortement sur des généralisations et manque de détails de soutien spécifiques. Ce flou rend la vérification indépendante plus difficile.',
      preciseDetailed: 'Le contenu inclut des détails d\'apparence précise et des références spécifiques. Bien que cela suggère de la rigueur, les détails seuls ne garantissent pas l\'exactitude.',
      assertiveAbsolute: 'L\'écriture utilise un langage affirmatif et définitif pour présenter ses affirmations. Des déclarations fortes sans nuance peuvent indiquer de la confiance ou une simplification excessive.',
      persuasiveOpinion: 'Le texte montre des schémas typiques d\'une écriture d\'opinion ou persuasive. Le cadrage semble conçu pour guider le lecteur vers une conclusion particulière.',
      mixed: 'Le texte présente un mélange d\'éléments informatifs et emphatiques. Certaines parties semblent équilibrées tandis que d\'autres emploient des techniques plus persuasives.',
    },
    
    dynamicIntro: 'Selon les modèles linguistiques détectés :',
  },
};

const selectDynamicSummary = (
  characteristics: ReturnType<typeof detectTextCharacteristics>,
  lang: SupportedLanguage
): string => {
  // Fallback to 'en' for languages without specific translations
  const effectiveLang = (lang === 'en' || lang === 'fr') ? lang : 'en';
  const summaries = translations[effectiveLang].summaries;
  
  // Priority-based selection
  if (characteristics.isEmotionalTone) {
    return summaries.emotionalAlarmist;
  }
  if (characteristics.isVague && characteristics.lacksTransparency) {
    return summaries.vagueGeneralized;
  }
  if (characteristics.lacksTransparency && !characteristics.isNeutralTone) {
    return summaries.persuasiveOpinion;
  }
  if (characteristics.hasStrongClaims && !characteristics.hasPrecision) {
    return summaries.assertiveAbsolute;
  }
  if (characteristics.isNeutralTone && characteristics.isBalanced) {
    return summaries.neutralBalanced;
  }
  if (characteristics.hasPrecision) {
    return summaries.preciseDetailed;
  }
  if (characteristics.isNeutralTone && characteristics.hasStrongClaims) {
    return summaries.neutralWithClaims;
  }
  
  return summaries.mixed;
};

export const StandardAnalysisIntro = ({ language, breakdown }: StandardAnalysisIntroProps) => {
  const t = translations[language];
  
  // If no breakdown provided, show the base subtitle
  const hasBreakdown = breakdown && Object.keys(breakdown).length > 0;
  const characteristics = hasBreakdown ? detectTextCharacteristics(breakdown) : null;
  const dynamicSummary = characteristics ? selectDynamicSummary(characteristics, language) : null;

  return (
    <div 
      className="relative overflow-hidden rounded-xl p-5 mb-6"
      style={{
        background: 'linear-gradient(135deg, hsl(200 30% 98%) 0%, hsl(220 25% 96%) 50%, hsl(200 20% 97%) 100%)',
        border: '1px solid hsl(200 30% 88%)',
        boxShadow: '0 4px 20px hsl(200 30% 50% / 0.06), inset 0 1px 0 hsl(0 0% 100% / 0.8)',
      }}
    >
      {/* Subtle decorative element */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, hsl(174 60% 70% / 0.3) 0%, transparent 70%)',
        }}
      />
      
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-3">
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(200 50% 92%) 0%, hsl(174 50% 88%) 100%)',
              boxShadow: '0 2px 6px hsl(200 50% 50% / 0.15)',
            }}
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-slate-800">
            {t.title}
          </h2>
        </div>
        
        {/* Base explanation */}
        <p className="text-sm leading-relaxed text-slate-500 pl-10 mb-3">
          {t.baseSubtitle}
        </p>
        
        {/* Dynamic personalized summary */}
        {dynamicSummary && (
          <div 
            className="ml-10 p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(200 40% 97%) 0%, hsl(180 30% 96%) 100%)',
              border: '1px solid hsl(200 30% 85%)',
            }}
          >
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {t.dynamicIntro}
                </span>
                <p className="text-sm leading-relaxed text-slate-700 mt-1">
                  {dynamicSummary}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
