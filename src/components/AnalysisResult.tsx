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
  if (points > 0) return <CheckCircle className="h-4 w-4 text-emerald-600" />;
  if (points < 0) return <XCircle className="h-4 w-4 text-red-600" />;
  return <AlertCircle className="h-4 w-4 text-amber-600" />;
};

const getPointsColor = (points: number) => {
  if (points > 0) return 'text-emerald-600';
  if (points < 0) return 'text-red-600';
  return 'text-amber-600';
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

// Badge styles: light solid backgrounds, darker borders, no transparency
const badgeStyles: Record<number, string> = {
  1: 'bg-red-100 border-red-300', // Red - Very weak
  2: 'bg-orange-100 border-orange-300', // Orange - Limited
  3: 'bg-amber-100 border-amber-300', // Yellow - Moderate
  4: 'bg-teal-100 border-teal-300', // Teal - Good
  5: 'bg-cyan-100 border-cyan-300', // Leen Blue - Strong
};

// Badge dot colors - saturated and visible
const badgeDotStyles: Record<number, string> = {
  1: 'bg-red-500', // Red
  2: 'bg-orange-500', // Orange
  3: 'bg-amber-500', // Yellow
  4: 'bg-teal-500', // Teal
  5: 'bg-cyan-500', // Leen Blue
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

  // Confidence badge colors - solid backgrounds with dark readable text
  const confidenceColors = {
    low: 'bg-red-100 text-red-800 border border-red-200',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200',
    high: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
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
          <h3 className="font-serif text-lg font-semibold text-slate-900">{t.summary}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${confidenceColors[data.confidence]}`}>
            {t.confidence}: {confidenceLabels[data.confidence]}
          </span>
        </div>
        <p className="text-base font-medium leading-relaxed text-slate-700">{data.summary}</p>
      </div>

      {/* Credibility Signals Badges - Visual overview */}
      <div className="analysis-card mb-6">
        <h3 className="mb-4 font-serif text-lg font-semibold text-slate-900">{t.signalsTitle}</h3>
        <div className="flex flex-wrap gap-2">
          {signalBadges.map((signal, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${badgeStyles[signal.level]}`}
            >
              <span className={`h-2 w-2 rounded-full ${badgeDotStyles[signal.level]}`} />
              <span className="text-xs font-semibold text-slate-800">{signal.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown - Core criteria with details */}
      <div className="analysis-card">
        <h3 className="mb-4 font-serif text-lg font-semibold text-slate-900">{t.breakdown}</h3>
        <div className="space-y-4">
          {coreKeys.map((key) => {
            const item = data.breakdown[key as keyof AnalysisBreakdown];
            if (!item) return null;
            return (
              <div key={key} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPointsIcon(item.points)}
                    <span className="font-semibold text-slate-800">{coreCriteriaLabels[key]}</span>
                  </div>
                  <span className={`font-mono text-sm font-bold ${getPointsColor(item.points)}`}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </span>
                </div>
                <p className="ml-6 text-sm font-medium text-slate-600">{item.reason}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
