import { MessageSquare, AlertTriangle, Target, Users, Link2 } from 'lucide-react';

interface CommunicationSignalsProps {
  language: 'en' | 'fr';
  breakdown: {
    tone?: { points: number; reason: string };
    factual?: { points: number; reason: string };
    context?: { points: number; reason: string };
    transparency?: { points: number; reason: string };
    prudence?: { points: number; reason: string };
  };
}

const translations = {
  en: {
    title: 'Detected Communication Signals',
    intro: 'Here are key signals identified from the structure and formulation of the text.',
    signals: {
      tone: {
        label: 'Message Tone',
        levels: {
          high: 'Neutral',
          moderate: 'Emphatic',
          low: 'Emotional/Alarmist',
        },
      },
      factual: {
        label: 'Factual Claims',
        levels: {
          high: 'Present & Consistent',
          moderate: 'Present',
          low: 'Vague/Absent',
        },
      },
      precision: {
        label: 'Level of Precision',
        levels: {
          high: 'High',
          moderate: 'Moderate',
          low: 'Vague',
        },
      },
      sources: {
        label: 'Source Attribution',
        levels: {
          high: 'Named Sources',
          moderate: 'Partial Attribution',
          low: 'Generalizations',
        },
      },
      coherence: {
        label: 'Internal Coherence',
        levels: {
          high: 'High',
          moderate: 'Moderate',
          low: 'Low',
        },
      },
    },
  },
  fr: {
    title: 'Signaux de Communication Détectés',
    intro: 'Voici les signaux clés identifiés à partir de la structure et de la formulation du texte.',
    signals: {
      tone: {
        label: 'Ton du message',
        levels: {
          high: 'Neutre',
          moderate: 'Emphatique',
          low: 'Émotionnel/Alarmiste',
        },
      },
      factual: {
        label: 'Affirmations factuelles',
        levels: {
          high: 'Présentes & Cohérentes',
          moderate: 'Présentes',
          low: 'Vagues/Absentes',
        },
      },
      precision: {
        label: 'Niveau de précision',
        levels: {
          high: 'Élevé',
          moderate: 'Modéré',
          low: 'Vague',
        },
      },
      sources: {
        label: 'Attribution des sources',
        levels: {
          high: 'Sources nommées',
          moderate: 'Attribution partielle',
          low: 'Généralisations',
        },
      },
      coherence: {
        label: 'Cohérence interne',
        levels: {
          high: 'Élevée',
          moderate: 'Modérée',
          low: 'Faible',
        },
      },
    },
  },
};

const getLevel = (points: number): 'high' | 'moderate' | 'low' => {
  if (points >= 3) return 'high';
  if (points >= 0) return 'moderate';
  return 'low';
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

const SignalIcon = ({ type }: { type: string }) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'tone':
      return <MessageSquare className={iconClass} />;
    case 'factual':
      return <Target className={iconClass} />;
    case 'precision':
      return <AlertTriangle className={iconClass} />;
    case 'sources':
      return <Users className={iconClass} />;
    case 'coherence':
      return <Link2 className={iconClass} />;
    default:
      return <MessageSquare className={iconClass} />;
  }
};

export const CommunicationSignals = ({ language, breakdown }: CommunicationSignalsProps) => {
  const t = translations[language];

  // Build signal data from breakdown
  const signals = [
    {
      key: 'tone',
      points: breakdown.prudence?.points ?? breakdown.tone?.points ?? 0,
    },
    {
      key: 'factual',
      points: breakdown.factual?.points ?? 0,
    },
    {
      key: 'precision',
      points: breakdown.context?.points ?? 0,
    },
    {
      key: 'sources',
      points: breakdown.transparency?.points ?? 0,
    },
    {
      key: 'coherence',
      points: Math.round(((breakdown.factual?.points ?? 0) + (breakdown.context?.points ?? 0)) / 2),
    },
  ];

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
        {signals.map((signal) => {
          const level = getLevel(signal.points);
          const style = getLevelStyle(level);
          const signalConfig = t.signals[signal.key as keyof typeof t.signals];

          return (
            <div
              key={signal.key}
              className={`flex items-center justify-between rounded-lg px-4 py-3 border transition-all ${style.bg} ${style.border}`}
            >
              <div className="flex items-center gap-3">
                <div className={`${style.text}`}>
                  <SignalIcon type={signal.key} />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {signalConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className={`text-sm font-semibold ${style.text}`}>
                  {signalConfig.levels[level]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
