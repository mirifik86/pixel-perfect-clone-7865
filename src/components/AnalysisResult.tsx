import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AnalysisBreakdown {
  // Core criteria
  sources: { points: number; reason: string };
  factual: { points: number; reason: string };
  tone: { points: number; reason: string };
  context: { points: number; reason: string };
  transparency: { points: number; reason: string };
  // Extended credibility signals
  freshness?: { points: number; reason: string };
  prudence?: { points: number; reason: string };
  density?: { points: number; reason: string };
  attribution?: { points: number; reason: string };
  visualCoherence?: { points: number; reason: string };
  // Legacy (for Pro analysis)
  imageCoherence?: { points: number; reason: string };
}

interface ImageSignals {
  origin?: {
    classification: string;
    confidence: string;
    indicators: string[];
  };
  metadata?: {
    exifPresence: string;
    dateConsistency: string;
    softwareIndicators: string[];
  };
  coherence?: {
    classification: string;
    explanation: string;
  };
  scoring?: {
    imageAsProof: number;
    aiWithClaims: number;
    metadataIssues: number;
    contextualSeverity?: number;
    severityConditionsMet?: string[];
    totalImpact: number;
    reasoning: string;
  };
  disclaimer?: string;
}

interface AnalysisData {
  score: number;
  analysisType?: 'standard' | 'pro';
  breakdown: AnalysisBreakdown;
  summary: string;
  confidence: 'low' | 'medium' | 'high';
  visualNote?: string;
  imageSignals?: ImageSignals;
  proNote?: string;
}

interface AnalysisResultProps {
  data: AnalysisData;
  language: 'en' | 'fr';
  isProUnlocked?: boolean;
}

const translations = {
  en: {
    breakdown: 'Score Breakdown',
    // Core criteria
    sources: 'Sources & Corroboration',
    factual: 'Factual Consistency',
    tone: 'Tone & Language',
    context: 'Context Clarity',
    transparency: 'Transparency',
    // UI
    confidence: 'Confidence',
    confidenceLow: 'Low',
    confidenceMedium: 'Medium',
    confidenceHigh: 'High',
    summary: 'Analysis Summary',
    // Credibility signals badges
    signalsTitle: 'Credibility signals reviewed',
    signalSource: 'Source reliability',
    signalFactual: 'Factual coherence',
    signalContext: 'Context clarity',
    signalPrudence: 'Language prudence',
    signalVisual: 'Visual coherence',
  },
  fr: {
    breakdown: 'Détail du Score',
    // Core criteria
    sources: 'Sources & Corroboration',
    factual: 'Cohérence Factuelle',
    tone: 'Ton & Langage',
    context: 'Clarté du Contexte',
    transparency: 'Transparence',
    // UI
    confidence: 'Niveau de confiance',
    confidenceLow: 'Faible',
    confidenceMedium: 'Moyen',
    confidenceHigh: 'Élevé',
    summary: "Résumé de l'Analyse",
    // Credibility signals badges
    signalsTitle: 'Signaux de crédibilité évalués',
    signalSource: 'Fiabilité des sources',
    signalFactual: 'Cohérence factuelle',
    signalContext: 'Clarté du contexte',
    signalPrudence: 'Prudence du langage',
    signalVisual: 'Cohérence visuelle',
  },
};

const getPointsIcon = (points: number) => {
  if (points > 0) return <CheckCircle className="h-4 w-4 text-green-400" />;
  if (points < 0) return <XCircle className="h-4 w-4 text-red-400" />;
  return <AlertCircle className="h-4 w-4 text-yellow-400" />;
};

const getPointsColor = (points: number) => {
  if (points > 0) return 'text-green-400';
  if (points < 0) return 'text-red-400';
  return 'text-yellow-400';
};

// Map points to badge level (1-5 scale matching gauge segments)
// Returns: 1=Red, 2=Orange, 3=Yellow, 4=Teal, 5=Leen Blue
const getBadgeLevel = (points: number): number => {
  if (points <= -4) return 1; // Very weak - Red
  if (points <= -2) return 2; // Limited - Orange
  if (points <= 1) return 3;  // Moderate - Yellow
  if (points <= 3) return 4;  // Good - Teal
  return 5;                   // Strong - Leen Blue
};

// Badge colors matching score gauge segments exactly
const badgeStyles: Record<number, string> = {
  1: 'bg-[hsl(0_72%_51%)]/20 border-[hsl(0_72%_51%)]/40', // Red - Very weak
  2: 'bg-[hsl(25_95%_53%)]/20 border-[hsl(25_95%_53%)]/40', // Orange - Limited
  3: 'bg-[hsl(48_96%_53%)]/20 border-[hsl(48_96%_53%)]/40', // Yellow - Moderate
  4: 'bg-[hsl(160_60%_45%)]/20 border-[hsl(160_60%_45%)]/40', // Teal - Good
  5: 'bg-[hsl(174_65%_52%)]/20 border-[hsl(174_65%_52%)]/40', // Leen Blue - Strong
};

const badgeDotStyles: Record<number, string> = {
  1: 'bg-[hsl(0_72%_51%)]', // Red
  2: 'bg-[hsl(25_95%_53%)]', // Orange
  3: 'bg-[hsl(48_96%_53%)]', // Yellow
  4: 'bg-[hsl(160_60%_45%)]', // Teal
  5: 'bg-[hsl(174_65%_52%)]', // Leen Blue
};

export const AnalysisResult = ({ data, language, isProUnlocked = false }: AnalysisResultProps) => {
  const t = translations[language];

  // Core criteria labels
  const coreCriteriaLabels: Record<string, string> = {
    sources: t.sources,
    factual: t.factual,
    tone: t.tone,
    context: t.context,
    transparency: t.transparency,
  };

  const confidenceLabels = {
    low: t.confidenceLow,
    medium: t.confidenceMedium,
    high: t.confidenceHigh,
  };

  const confidenceColors = {
    low: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-green-500/20 text-green-400',
  };

  // Get core criteria keys
  const coreKeys = Object.keys(data.breakdown).filter((key) => 
    coreCriteriaLabels[key] !== undefined
  );

  // Compute badge data for 5 fixed signals
  const signalBadges = [
    { 
      label: t.signalSource, 
      level: getBadgeLevel(data.breakdown.sources?.points ?? 0) 
    },
    { 
      label: t.signalFactual, 
      level: getBadgeLevel(data.breakdown.factual?.points ?? 0) 
    },
    { 
      label: t.signalContext, 
      level: getBadgeLevel(data.breakdown.context?.points ?? 0) 
    },
    { 
      label: t.signalPrudence, 
      level: getBadgeLevel(data.breakdown.prudence?.points ?? data.breakdown.tone?.points ?? 0) 
    },
    { 
      label: t.signalVisual, 
      level: getBadgeLevel(data.breakdown.visualCoherence?.points ?? 0) 
    },
  ];

  return (
    <div className="mt-8 w-full max-w-2xl animate-fade-in">
      {/* Summary card */}
      <div className="analysis-card mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-white">{t.summary}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${confidenceColors[data.confidence]}`}>
            {t.confidence}: {confidenceLabels[data.confidence]}
          </span>
        </div>
        <p className="font-medium leading-relaxed text-foreground/90">{data.summary}</p>
      </div>

      {/* Credibility Signals Badges - Visual overview */}
      <div className="analysis-card mb-6">
        <h3 className="mb-4 font-serif text-lg font-semibold text-white">{t.signalsTitle}</h3>
        <div className="flex flex-wrap gap-2">
          {signalBadges.map((signal, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${badgeStyles[signal.level]}`}
            >
              <span className={`h-2 w-2 rounded-full ${badgeDotStyles[signal.level]}`} />
              <span className="text-xs font-semibold text-white">{signal.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown - Core criteria with details */}
      <div className="analysis-card">
        <h3 className="mb-4 font-serif text-lg font-semibold text-white">{t.breakdown}</h3>
        <div className="space-y-4">
          {coreKeys.map((key) => {
            const item = data.breakdown[key as keyof AnalysisBreakdown];
            if (!item) return null;
            return (
              <div key={key} className="border-b border-border/30 pb-4 last:border-0 last:pb-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPointsIcon(item.points)}
                    <span className="font-semibold text-white">{coreCriteriaLabels[key]}</span>
                  </div>
                  <span className={`font-mono text-sm font-semibold ${getPointsColor(item.points)}`}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </span>
                </div>
                <p className="ml-6 text-sm font-medium text-foreground/80">{item.reason}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
