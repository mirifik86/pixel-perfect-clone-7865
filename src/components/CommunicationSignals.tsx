import { MessageSquare, AlertTriangle, Target, Users, Link2, Shield, Zap, Eye, FileQuestion, Scale } from 'lucide-react';
import { type SupportedLanguage } from '@/i18n/config';

interface CommunicationSignalsProps {
  language: SupportedLanguage;
  breakdown: {
    tone?: { points: number; reason: string };
    factual?: { points: number; reason: string };
    context?: { points: number; reason: string };
    transparency?: { points: number; reason: string };
    prudence?: { points: number; reason: string };
  };
}

// Signal definitions with dynamic detection
interface SignalDefinition {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  condition: (breakdown: CommunicationSignalsProps['breakdown']) => boolean;
  getLevel: (breakdown: CommunicationSignalsProps['breakdown']) => 'high' | 'moderate' | 'low';
}

const translations = {
  en: {
    title: 'Detected Communication Signals',
    intro: 'Here are key signals identified from the structure and formulation of the text.',
    
    signals: {
      neutralTone: {
        label: 'Neutral Informational Tone',
        levels: {
          high: 'Clearly neutral',
          moderate: 'Mostly neutral',
          low: 'Not applicable',
        },
      },
      emotionalTone: {
        label: 'Emotionally Charged Wording',
        levels: {
          high: 'Not detected',
          moderate: 'Some emphasis',
          low: 'Strongly present',
        },
      },
      assertiveClaims: {
        label: 'Assertive or Absolute Claims',
        levels: {
          high: 'Hedged appropriately',
          moderate: 'Some strong assertions',
          low: 'Definitive statements',
        },
      },
      sourceMentions: {
        label: 'Source Attribution',
        levels: {
          high: 'Named sources',
          moderate: 'Partial attribution',
          low: 'Unattributed claims',
        },
      },
      generalizations: {
        label: 'Use of Generalizations',
        levels: {
          high: 'Minimal generalizing',
          moderate: 'Some generalizations',
          low: 'Heavy reliance on generalities',
        },
      },
      precisionDetails: {
        label: 'Precision of Details',
        levels: {
          high: 'Specific and precise',
          moderate: 'Moderately detailed',
          low: 'Vague or imprecise',
        },
      },
      persuasivePhrasing: {
        label: 'Persuasive or Opinion-Driven',
        levels: {
          high: 'Factual framing',
          moderate: 'Some persuasive elements',
          low: 'Clearly persuasive',
        },
      },
      internalCoherence: {
        label: 'Internal Coherence',
        levels: {
          high: 'Logically consistent',
          moderate: 'Generally coherent',
          low: 'Some inconsistencies',
        },
      },
    },
  },
  fr: {
    title: 'Signaux de Communication Détectés',
    intro: 'Voici les signaux clés identifiés à partir de la structure et de la formulation du texte.',
    
    signals: {
      neutralTone: {
        label: 'Ton Informatif Neutre',
        levels: {
          high: 'Clairement neutre',
          moderate: 'Principalement neutre',
          low: 'Non applicable',
        },
      },
      emotionalTone: {
        label: 'Formulation Émotionnellement Chargée',
        levels: {
          high: 'Non détectée',
          moderate: 'Quelques emphases',
          low: 'Fortement présente',
        },
      },
      assertiveClaims: {
        label: 'Affirmations Assertives ou Absolues',
        levels: {
          high: 'Nuances appropriées',
          moderate: 'Quelques assertions fortes',
          low: 'Déclarations définitives',
        },
      },
      sourceMentions: {
        label: 'Attribution des Sources',
        levels: {
          high: 'Sources nommées',
          moderate: 'Attribution partielle',
          low: 'Affirmations non attribuées',
        },
      },
      generalizations: {
        label: 'Utilisation de Généralisations',
        levels: {
          high: 'Généralisations minimales',
          moderate: 'Quelques généralisations',
          low: 'Forte dépendance aux généralités',
        },
      },
      precisionDetails: {
        label: 'Précision des Détails',
        levels: {
          high: 'Spécifique et précis',
          moderate: 'Modérément détaillé',
          low: 'Vague ou imprécis',
        },
      },
      persuasivePhrasing: {
        label: 'Persuasif ou Orienté Opinion',
        levels: {
          high: 'Cadrage factuel',
          moderate: 'Quelques éléments persuasifs',
          low: 'Clairement persuasif',
        },
      },
      internalCoherence: {
        label: 'Cohérence Interne',
        levels: {
          high: 'Logiquement cohérent',
          moderate: 'Généralement cohérent',
          low: 'Quelques incohérences',
        },
      },
    },
  },
};

// Signal icons mapping
const signalIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  neutralTone: Shield,
  emotionalTone: Zap,
  assertiveClaims: Target,
  sourceMentions: Users,
  generalizations: FileQuestion,
  precisionDetails: Eye,
  persuasivePhrasing: MessageSquare,
  internalCoherence: Link2,
};

// Dynamic signal detection logic
const detectSignals = (breakdown: CommunicationSignalsProps['breakdown']) => {
  const tonePoints = breakdown.prudence?.points ?? breakdown.tone?.points ?? 0;
  const factualPoints = breakdown.factual?.points ?? 0;
  const contextPoints = breakdown.context?.points ?? 0;
  const transparencyPoints = breakdown.transparency?.points ?? 0;

  const signals: Array<{
    key: string;
    level: 'high' | 'moderate' | 'low';
    relevance: number; // Higher = more relevant to show
  }> = [];

  // Neutral tone - show if tone is positive
  if (tonePoints >= 2) {
    signals.push({
      key: 'neutralTone',
      level: tonePoints >= 4 ? 'high' : 'moderate',
      relevance: tonePoints >= 3 ? 8 : 5,
    });
  }

  // Emotional tone - show if tone is negative or emphatic
  if (tonePoints < 2) {
    signals.push({
      key: 'emotionalTone',
      level: tonePoints < 0 ? 'low' : 'moderate',
      relevance: tonePoints < 0 ? 9 : 6,
    });
  }

  // Assertive claims - based on factual + tone combination
  const isAssertive = factualPoints >= 2 && tonePoints < 3;
  if (isAssertive || factualPoints >= 3) {
    signals.push({
      key: 'assertiveClaims',
      level: isAssertive && tonePoints < 1 ? 'low' : factualPoints >= 3 ? 'high' : 'moderate',
      relevance: 7,
    });
  }

  // Source mentions - based on transparency
  signals.push({
    key: 'sourceMentions',
    level: transparencyPoints >= 3 ? 'high' : transparencyPoints >= 0 ? 'moderate' : 'low',
    relevance: Math.abs(transparencyPoints) >= 2 ? 8 : 4,
  });

  // Generalizations - inverse of context clarity
  if (contextPoints < 2) {
    signals.push({
      key: 'generalizations',
      level: contextPoints < 0 ? 'low' : 'moderate',
      relevance: contextPoints < 0 ? 8 : 5,
    });
  }

  // Precision of details - based on context
  if (contextPoints >= 1) {
    signals.push({
      key: 'precisionDetails',
      level: contextPoints >= 4 ? 'high' : contextPoints >= 2 ? 'moderate' : 'low',
      relevance: contextPoints >= 3 ? 7 : 4,
    });
  }

  // Persuasive phrasing - combination of low tone and low transparency
  const isPersuasive = tonePoints < 1 && transparencyPoints < 2;
  if (isPersuasive) {
    signals.push({
      key: 'persuasivePhrasing',
      level: tonePoints < 0 && transparencyPoints < 0 ? 'low' : 'moderate',
      relevance: 8,
    });
  } else if (tonePoints >= 3 && transparencyPoints >= 2) {
    signals.push({
      key: 'persuasivePhrasing',
      level: 'high',
      relevance: 5,
    });
  }

  // Internal coherence - average of factual and context
  const coherenceScore = (factualPoints + contextPoints) / 2;
  signals.push({
    key: 'internalCoherence',
    level: coherenceScore >= 2.5 ? 'high' : coherenceScore >= 0 ? 'moderate' : 'low',
    relevance: Math.abs(coherenceScore) >= 2 ? 6 : 3,
  });

  // Sort by relevance and take top 3-5
  signals.sort((a, b) => b.relevance - a.relevance);
  
  // Determine how many to show: 3 for simple, 5 for complex texts
  const complexity = Math.abs(tonePoints) + Math.abs(factualPoints) + Math.abs(contextPoints) + Math.abs(transparencyPoints);
  const signalCount = complexity > 8 ? 5 : complexity > 4 ? 4 : 3;
  
  return signals.slice(0, signalCount);
};

const getLevelStyle = (level: 'high' | 'moderate' | 'low') => {
  switch (level) {
    case 'high':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
      };
    case 'moderate':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
      };
    case 'low':
      return {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-600',
        dot: 'bg-slate-400',
      };
  }
};

export const CommunicationSignals = ({ language, breakdown }: CommunicationSignalsProps) => {
  const t = translations[language];
  
  // Dynamically detect which signals to show
  const detectedSignals = detectSignals(breakdown);

  return (
    <div className="analysis-card mb-6">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-semibold text-slate-900 mb-2">
          {t.title}
        </h3>
        <p className="text-sm text-slate-500">
          {t.intro}
        </p>
      </div>

      <div className="space-y-2.5">
        {detectedSignals.map((signal) => {
          const style = getLevelStyle(signal.level);
          const signalConfig = t.signals[signal.key as keyof typeof t.signals];
          const IconComponent = signalIcons[signal.key] || MessageSquare;

          return (
            <div
              key={signal.key}
              className={`flex items-center justify-between rounded-lg px-4 py-3 border transition-all ${style.bg} ${style.border}`}
            >
              <div className="flex items-center gap-3">
                <div className={`${style.text}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {signalConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className={`text-sm font-semibold ${style.text}`}>
                  {signalConfig.levels[signal.level]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
