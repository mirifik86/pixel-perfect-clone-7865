import { CheckCircle, XCircle, AlertCircle, Image } from 'lucide-react';

interface AnalysisBreakdown {
  sources: { points: number; reason: string };
  factual: { points: number; reason: string };
  tone: { points: number; reason: string };
  context: { points: number; reason: string };
  transparency: { points: number; reason: string };
  imageCoherence?: { points: number; reason: string };
}

interface AnalysisData {
  score: number;
  breakdown: AnalysisBreakdown;
  summary: string;
  confidence: 'low' | 'medium' | 'high';
  visualNote?: string;
}

interface AnalysisResultProps {
  data: AnalysisData;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    breakdown: 'Score Breakdown',
    sources: 'Sources & Corroboration',
    factual: 'Factual Consistency',
    tone: 'Tone & Language',
    context: 'Context Clarity',
    transparency: 'Transparency',
    imageCoherence: 'Image Coherence',
    confidence: 'Confidence',
    confidenceLow: 'Low',
    confidenceMedium: 'Medium',
    confidenceHigh: 'High',
    summary: 'Analysis Summary',
    visualNote: 'Visual elements were reviewed for contextual coherence.',
  },
  fr: {
    breakdown: 'Détail du Score',
    sources: 'Sources & Corroboration',
    factual: 'Cohérence Factuelle',
    tone: 'Ton & Langage',
    context: 'Clarté du Contexte',
    transparency: 'Transparence',
    imageCoherence: 'Cohérence Visuelle',
    confidence: 'Niveau de confiance',
    confidenceLow: 'Faible',
    confidenceMedium: 'Moyen',
    confidenceHigh: 'Élevé',
    summary: "Résumé de l'Analyse",
    visualNote: 'Les éléments visuels ont été examinés pour leur cohérence contextuelle.',
  },
};

const getPointsIcon = (points: number, isImageCriteria?: boolean) => {
  if (isImageCriteria) return <Image className="h-4 w-4 text-muted-foreground" />;
  if (points > 0) return <CheckCircle className="h-4 w-4 text-green-400" />;
  if (points < 0) return <XCircle className="h-4 w-4 text-red-400" />;
  return <AlertCircle className="h-4 w-4 text-yellow-400" />;
};

const getPointsColor = (points: number) => {
  if (points > 0) return 'text-green-400';
  if (points < 0) return 'text-red-400';
  return 'text-yellow-400';
};

export const AnalysisResult = ({ data, language }: AnalysisResultProps) => {
  const t = translations[language];

  const criteriaLabels: Record<string, string> = {
    sources: t.sources,
    factual: t.factual,
    tone: t.tone,
    context: t.context,
    transparency: t.transparency,
    imageCoherence: t.imageCoherence,
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

  // Filter out imageCoherence if points are 0 (no visual impact)
  const breakdownKeys = Object.keys(data.breakdown).filter((key) => {
    if (key === 'imageCoherence') {
      const imageData = data.breakdown.imageCoherence;
      return imageData && imageData.points !== 0;
    }
    return true;
  });

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

      {/* Breakdown */}
      <div className="analysis-card">
        <h3 className="mb-4 font-serif text-lg text-foreground">{t.breakdown}</h3>
        <div className="space-y-4">
          {breakdownKeys.map((key) => {
            const item = data.breakdown[key as keyof AnalysisBreakdown];
            if (!item) return null;
            const isImageCriteria = key === 'imageCoherence';
            return (
              <div key={key} className="border-b border-border/30 pb-4 last:border-0 last:pb-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPointsIcon(item.points, isImageCriteria)}
                    <span className="font-medium text-foreground">{criteriaLabels[key]}</span>
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
        
        {/* Visual note - always shown */}
        <div className="mt-4 border-t border-border/30 pt-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <Image className="h-3 w-3" />
            {data.visualNote || t.visualNote}
          </p>
        </div>
      </div>
    </div>
  );
};
