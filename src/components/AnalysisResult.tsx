import { CheckCircle, XCircle, AlertCircle, Image } from 'lucide-react';

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
  isProUnlocked?: boolean; // Controls visibility of advanced image analysis
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
    // Extended signals
    freshness: 'Content Freshness',
    prudence: 'Language Prudence',
    density: 'Factual Density',
    attribution: 'Attribution Clarity',
    visualCoherence: 'Visual Alignment',
    // Legacy
    imageCoherence: 'Image Coherence',
    // UI
    confidence: 'Confidence',
    confidenceLow: 'Low',
    confidenceMedium: 'Medium',
    confidenceHigh: 'High',
    summary: 'Analysis Summary',
    extendedSignals: 'Credibility Signals',
  },
  fr: {
    breakdown: 'Détail du Score',
    // Core criteria
    sources: 'Sources & Corroboration',
    factual: 'Cohérence Factuelle',
    tone: 'Ton & Langage',
    context: 'Clarté du Contexte',
    transparency: 'Transparence',
    // Extended signals
    freshness: 'Fraîcheur du Contenu',
    prudence: 'Prudence du Langage',
    density: 'Densité Factuelle',
    attribution: 'Clarté des Attributions',
    visualCoherence: 'Cohérence Visuelle',
    // Legacy
    imageCoherence: 'Cohérence Image',
    // UI
    confidence: 'Niveau de confiance',
    confidenceLow: 'Faible',
    confidenceMedium: 'Moyen',
    confidenceHigh: 'Élevé',
    summary: "Résumé de l'Analyse",
    extendedSignals: 'Signaux de Crédibilité',
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

  // Extended signal labels
  const extendedSignalLabels: Record<string, string> = {
    freshness: t.freshness,
    prudence: t.prudence,
    density: t.density,
    attribution: t.attribution,
    visualCoherence: t.visualCoherence,
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

  // Separate core criteria from extended signals
  const coreKeys = Object.keys(data.breakdown).filter((key) => 
    coreCriteriaLabels[key] !== undefined
  );

  const extendedKeys = Object.keys(data.breakdown).filter((key) => 
    extendedSignalLabels[key] !== undefined && data.breakdown[key as keyof AnalysisBreakdown]
  );

  return (
    <div className="mt-8 w-full max-w-2xl animate-fade-in">
      {/* Summary card */}
      <div className="analysis-card mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-foreground">{t.summary}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${confidenceColors[data.confidence]}`}>
            {t.confidence}: {confidenceLabels[data.confidence]}
          </span>
        </div>
        <p className="text-muted-foreground">{data.summary}</p>
      </div>

      {/* Breakdown - Core criteria */}
      <div className="analysis-card">
        <h3 className="mb-4 font-serif text-lg text-foreground">{t.breakdown}</h3>
        <div className="space-y-4">
          {coreKeys.map((key) => {
            const item = data.breakdown[key as keyof AnalysisBreakdown];
            if (!item) return null;
            return (
              <div key={key} className="border-b border-border/30 pb-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPointsIcon(item.points)}
                    <span className="font-medium text-foreground">{coreCriteriaLabels[key]}</span>
                  </div>
                  <span className={`font-mono text-sm font-semibold ${getPointsColor(item.points)}`}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </span>
                </div>
                <p className="ml-6 text-sm text-muted-foreground">{item.reason}</p>
              </div>
            );
          })}
        </div>

        {/* Extended Credibility Signals - displayed separately */}
        {extendedKeys.length > 0 && (
          <div className="mt-6 border-t border-border/30 pt-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Image className="h-4 w-4" />
              {t.extendedSignals}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {extendedKeys.map((key) => {
                const item = data.breakdown[key as keyof AnalysisBreakdown];
                if (!item) return null;
                return (
                  <div 
                    key={key} 
                    className="rounded-lg border border-border/20 bg-background/30 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground/90">
                        {extendedSignalLabels[key]}
                      </span>
                      <span className={`font-mono text-xs font-semibold ${getPointsColor(item.points)}`}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/80 line-clamp-2">{item.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
