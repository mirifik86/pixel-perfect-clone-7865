import { CheckCircle, XCircle, AlertCircle, Search, Scale, GitBranch, Image, Sparkles } from 'lucide-react';

interface AnalysisBreakdown {
  // Core criteria (Standard)
  sources?: { points: number; reason: string };
  factual?: { points: number; reason: string };
  tone?: { points: number; reason: string };
  context?: { points: number; reason: string };
  transparency?: { points: number; reason: string };
  // Extended credibility signals
  freshness?: { points: number; reason: string };
  prudence?: { points: number; reason: string };
  density?: { points: number; reason: string };
  attribution?: { points: number; reason: string };
  visualCoherence?: { points: number; reason: string };
  // PRO-specific breakdown
  claimGravity?: { points: number; weight: string; reason: string };
  contextualCoherence?: { points: number; weight: string; reason: string };
  webCorroboration?: { points: number; weight: string; reason: string };
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

interface CorroborationSources {
  corroborated?: string[];
  neutral?: string[];
  constrained?: string[];
}

interface Corroboration {
  outcome: string;
  sourcesConsulted: number;
  sourceTypes: string[];
  summary: string;
  sources?: CorroborationSources;
}

interface AnalysisData {
  score: number;
  analysisType?: 'standard' | 'pro';
  breakdown: AnalysisBreakdown;
  summary: string;
  confidence: 'low' | 'medium' | 'high';
  visualNote?: string;
  imageSignals?: ImageSignals;
  corroboration?: Corroboration;
  proDisclaimer?: string;
}

interface AnalysisResultProps {
  data: AnalysisData;
  language: 'en' | 'fr';
  isProUnlocked?: boolean;
  articleSummary?: string;
}

const translations = {
  en: {
    breakdown: 'Score Breakdown',
    proBreakdown: 'Pro Analysis Breakdown',
    proExplanation: 'PRO Explanation',
    // Core criteria
    sources: 'Sources & Corroboration',
    factual: 'Factual Consistency',
    tone: 'Tone & Language',
    context: 'Context Clarity',
    transparency: 'Transparency',
    // PRO criteria
    claimGravity: 'Claim Gravity',
    contextualCoherence: 'Contextual Coherence',
    webCorroboration: 'Web Corroboration',
    imageCoherence: 'Image Signals',
    // Corroboration
    corroborationTitle: 'Web Corroboration',
    corroborated: 'Clear Corroboration',
    neutral: 'Neutral Mentions',
    constrained: 'Limited Coverage',
    sourcesConsulted: 'sources consulted',
    // Source group labels
    sourceGroupCorroborated: 'Clear corroboration',
    sourceGroupNeutral: 'Neutral or contextual mentions',
    sourceGroupConstrained: 'Limited or constrained coverage',
    // UI
    confidence: 'Confidence',
    confidenceLow: 'Low',
    confidenceMedium: 'Medium',
    confidenceHigh: 'High',
    summary: 'Summary',
    plausibilityScore: 'Plausibility Score (PRO Analysis)',
    // Credibility signals badges
    signalsTitle: 'Credibility signals reviewed',
    proSignalsTitle: 'Pro signals evaluated',
    signalSource: 'Source reliability',
    signalFactual: 'Factual coherence',
    signalContext: 'Context clarity',
    signalPrudence: 'Language prudence',
    signalVisual: 'Visual coherence',
    // PRO signals
    signalGravity: 'Claim gravity',
    signalCoherence: 'Coherence',
    signalWeb: 'Web corroboration',
    signalImage: 'Image signals',
  },
  fr: {
    breakdown: 'Détail du Score',
    proBreakdown: 'Détail Analyse Pro',
    proExplanation: 'Explication PRO',
    // Core criteria
    sources: 'Sources & Corroboration',
    factual: 'Cohérence Factuelle',
    tone: 'Ton & Langage',
    context: 'Clarté du Contexte',
    transparency: 'Transparence',
    // PRO criteria
    claimGravity: 'Gravité de l\'affirmation',
    contextualCoherence: 'Cohérence Contextuelle',
    webCorroboration: 'Corroboration Web',
    imageCoherence: 'Signaux Image',
    // Corroboration
    corroborationTitle: 'Corroboration Web',
    corroborated: 'Corroboration claire',
    neutral: 'Mentions neutres',
    constrained: 'Couverture limitée',
    sourcesConsulted: 'sources consultées',
    // Source group labels
    sourceGroupCorroborated: 'Corroboration claire',
    sourceGroupNeutral: 'Mentions neutres ou contextuelles',
    sourceGroupConstrained: 'Couverture limitée ou contrainte',
    // UI
    confidence: 'Niveau de confiance',
    confidenceLow: 'Faible',
    confidenceMedium: 'Moyen',
    confidenceHigh: 'Élevé',
    summary: 'Résumé',
    plausibilityScore: 'Score de Plausibilité (Analyse PRO)',
    // Credibility signals badges
    signalsTitle: 'Signaux de crédibilité évalués',
    proSignalsTitle: 'Signaux Pro évalués',
    signalSource: 'Fiabilité des sources',
    signalFactual: 'Cohérence factuelle',
    signalContext: 'Clarté du contexte',
    signalPrudence: 'Prudence du langage',
    signalVisual: 'Cohérence visuelle',
    // PRO signals
    signalGravity: 'Gravité',
    signalCoherence: 'Cohérence',
    signalWeb: 'Corroboration web',
    signalImage: 'Signaux image',
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

const getBadgeLevel = (points: number): number => {
  if (points <= -4) return 1;
  if (points <= -2) return 2;
  if (points <= 1) return 3;
  if (points <= 3) return 4;
  return 5;
};

const badgeStyles: Record<number, string> = {
  1: 'bg-red-100 border-red-300',
  2: 'bg-orange-100 border-orange-300',
  3: 'bg-amber-100 border-amber-300',
  4: 'bg-teal-100 border-teal-300',
  5: 'bg-cyan-100 border-cyan-300',
};

const badgeDotStyles: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-amber-500',
  4: 'bg-teal-500',
  5: 'bg-cyan-500',
};

// Corroboration outcome styles
const corroborationStyles: Record<string, { bg: string; text: string; dot: string }> = {
  corroborated: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  neutral: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', dot: 'bg-amber-500' },
  constrained: { bg: 'bg-red-100 border-red-300', text: 'text-red-800', dot: 'bg-red-500' },
};

export const AnalysisResult = ({ data, language, articleSummary }: AnalysisResultProps) => {
  const t = translations[language];
  const isPro = data.analysisType === 'pro';

  // Standard criteria labels
  const standardCriteriaLabels: Record<string, string> = {
    sources: t.sources,
    factual: t.factual,
    tone: t.tone,
    context: t.context,
    transparency: t.transparency,
  };

  // PRO criteria labels
  const proCriteriaLabels: Record<string, string> = {
    claimGravity: t.claimGravity,
    contextualCoherence: t.contextualCoherence,
    webCorroboration: t.webCorroboration,
    imageCoherence: t.imageCoherence,
  };

  // PRO criteria icons
  const proCriteriaIcons: Record<string, React.ReactNode> = {
    claimGravity: <Scale className="h-4 w-4" />,
    contextualCoherence: <GitBranch className="h-4 w-4" />,
    webCorroboration: <Search className="h-4 w-4" />,
    imageCoherence: <Image className="h-4 w-4" />,
  };

  const confidenceLabels = {
    low: t.confidenceLow,
    medium: t.confidenceMedium,
    high: t.confidenceHigh,
  };

  const confidenceColors = {
    low: 'bg-red-100 text-red-800 border border-red-200',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200',
    high: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  };

  const corroborationLabels: Record<string, string> = {
    corroborated: t.corroborated,
    neutral: t.neutral,
    constrained: t.constrained,
  };

  // Standard signal badges
  const standardSignalBadges = [
    { label: t.signalSource, level: getBadgeLevel(data.breakdown.sources?.points ?? 0) },
    { label: t.signalFactual, level: getBadgeLevel(data.breakdown.factual?.points ?? 0) },
    { label: t.signalContext, level: getBadgeLevel(data.breakdown.context?.points ?? 0) },
    { label: t.signalPrudence, level: getBadgeLevel(data.breakdown.prudence?.points ?? data.breakdown.tone?.points ?? 0) },
    { label: t.signalVisual, level: getBadgeLevel(data.breakdown.visualCoherence?.points ?? 0) },
  ];

  // PRO signal badges with LucideIcon type
  const proSignalBadges: Array<{ label: string; level: number; icon: typeof Scale }> = [
    { label: t.signalGravity, level: getBadgeLevel(data.breakdown.claimGravity?.points ?? 0), icon: Scale },
    { label: t.signalCoherence, level: getBadgeLevel(data.breakdown.contextualCoherence?.points ?? 0), icon: GitBranch },
    { label: t.signalWeb, level: getBadgeLevel(data.breakdown.webCorroboration?.points ?? 0), icon: Search },
    { label: t.signalImage, level: getBadgeLevel(data.breakdown.imageCoherence?.points ?? 0), icon: Image },
  ];

  // Get keys for breakdown display
  const standardKeys = Object.keys(data.breakdown).filter((key) => standardCriteriaLabels[key] !== undefined);
  const proKeys = ['claimGravity', 'contextualCoherence', 'webCorroboration', 'imageCoherence'].filter(
    (key) => data.breakdown[key as keyof AnalysisBreakdown] !== undefined
  );

  return (
    <div className="mt-8 w-full max-w-2xl animate-fade-in">
      {/* PRO badge indicator */}
      {isPro && (
        <div className="mb-4 flex justify-center">
          <div 
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: 'linear-gradient(135deg, hsl(200 80% 50% / 0.15) 0%, hsl(280 60% 55% / 0.15) 100%)',
              border: '1px solid hsl(200 80% 55% / 0.3)',
            }}
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span 
              className="text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, hsl(200 80% 65%) 0%, hsl(280 60% 70%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Pro Analysis
            </span>
          </div>
        </div>
      )}


      {/* Standard: Summary card */}
      {!isPro && (
        <div className="analysis-card mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-slate-900">{t.summary}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${confidenceColors[data.confidence]}`}>
              {t.confidence}: {confidenceLabels[data.confidence]}
            </span>
          </div>
          <p className="text-base font-medium leading-relaxed text-slate-700">
            {articleSummary || data.summary}
          </p>
        </div>
      )}

      {/* PRO: Web Corroboration Card with Grouped Sources */}
      {isPro && data.corroboration && (
        <div 
          className="analysis-card mb-6"
          style={{
            background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(200 30% 98%) 100%)',
            border: '1px solid hsl(200 40% 90%)',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-cyan-600" />
              <h3 className="font-serif text-lg font-semibold text-slate-900">{t.corroborationTitle}</h3>
            </div>
            <div 
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${corroborationStyles[data.corroboration.outcome]?.bg}`}
            >
              <span className={`h-2 w-2 rounded-full ${corroborationStyles[data.corroboration.outcome]?.dot}`} />
              <span className={`text-xs font-bold ${corroborationStyles[data.corroboration.outcome]?.text}`}>
                {corroborationLabels[data.corroboration.outcome]}
              </span>
            </div>
          </div>
          
          {/* Grouped Sources by Signal Type */}
          {data.corroboration.sources && (
            <div className="space-y-3 mb-4">
              {/* Clear Corroboration Sources */}
              {data.corroboration.sources.corroborated && data.corroboration.sources.corroborated.length > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-800">{t.sourceGroupCorroborated}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.corroboration.sources.corroborated.map((source, idx) => (
                      <span 
                        key={idx}
                        className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Neutral Sources */}
              {data.corroboration.sources.neutral && data.corroboration.sources.neutral.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-amber-800">{t.sourceGroupNeutral}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.corroboration.sources.neutral.map((source, idx) => (
                      <span 
                        key={idx}
                        className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Constrained Sources */}
              {data.corroboration.sources.constrained && data.corroboration.sources.constrained.length > 0 && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold text-red-800">{t.sourceGroupConstrained}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.corroboration.sources.constrained.map((source, idx) => (
                      <span 
                        key={idx}
                        className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-700">{data.corroboration.sourcesConsulted}</span>
              {t.sourcesConsulted}
            </span>
          </div>
        </div>
      )}

      {/* PRO: Plausibility Score (moved from top) */}
      {isPro && (
        <div className="analysis-card mb-6">
          <h3 className="font-serif text-lg font-semibold text-slate-900 text-center mb-2">
            {t.plausibilityScore}
          </h3>
          <p className="text-base font-medium leading-relaxed text-slate-700">
            {articleSummary || data.summary}
          </p>
        </div>
      )}

      {/* PRO: Disclaimer */}
      {isPro && data.proDisclaimer && (
        <div 
          className="mb-6 rounded-lg p-3 text-center"
          style={{
            background: 'hsl(220 20% 95%)',
            border: '1px solid hsl(220 20% 88%)',
          }}
        >
          <p className="text-xs text-slate-600 italic">
            {data.proDisclaimer}
          </p>
        </div>
      )}

      {/* Signal badges */}
      <div className="analysis-card mb-6">
        <h3 className="mb-4 font-serif text-lg font-semibold text-slate-900">
          {isPro ? t.proSignalsTitle : t.signalsTitle}
        </h3>
        <div className="flex flex-wrap gap-2">
          {isPro ? (
            proSignalBadges.map((signal, index) => {
              const IconComponent = signal.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${badgeStyles[signal.level]}`}
                >
                  <IconComponent className="h-3 w-3 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-800">{signal.label}</span>
                </div>
              );
            })
          ) : (
            standardSignalBadges.map((signal, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${badgeStyles[signal.level]}`}
              >
                <span className={`h-2 w-2 rounded-full ${badgeDotStyles[signal.level]}`} />
                <span className="text-xs font-semibold text-slate-800">{signal.label}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Breakdown - different for PRO vs Standard */}
      <div className="analysis-card">
        <h3 className="mb-4 font-serif text-lg font-semibold text-slate-900">
          {isPro ? t.proBreakdown : t.breakdown}
        </h3>
        <div className="space-y-4">
          {isPro ? (
            // PRO breakdown with weights
            proKeys.map((key) => {
              const item = data.breakdown[key as keyof AnalysisBreakdown] as { points: number; weight?: string; reason: string } | undefined;
              if (!item) return null;
              const Icon = proCriteriaIcons[key];
              return (
                <div key={key} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-600">
                        {Icon}
                      </span>
                      <span className="font-semibold text-slate-800">{proCriteriaLabels[key]}</span>
                      {item.weight && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                          {item.weight}
                        </span>
                      )}
                    </div>
                    <span className={`font-mono text-sm font-bold ${getPointsColor(item.points)}`}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </span>
                  </div>
                  <p className="ml-8 text-sm font-medium text-slate-600">{item.reason}</p>
                </div>
              );
            })
          ) : (
            // Standard breakdown
            standardKeys.map((key) => {
              const item = data.breakdown[key as keyof AnalysisBreakdown];
              if (!item) return null;
              return (
                <div key={key} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPointsIcon(item.points)}
                      <span className="font-semibold text-slate-800">{standardCriteriaLabels[key]}</span>
                    </div>
                    <span className={`font-mono text-sm font-bold ${getPointsColor(item.points)}`}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </span>
                  </div>
                  <p className="ml-6 text-sm font-medium text-slate-600">{item.reason}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PRO Image Signals detailed view */}
      {isPro && data.imageSignals && (
        <div className="analysis-card mt-6">
          <div className="mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-cyan-600" />
            <h3 className="font-serif text-lg font-semibold text-slate-900">
              {language === 'fr' ? 'Analyse des Signaux Image' : 'Image Signal Analysis'}
            </h3>
          </div>
          
          <div className="space-y-3">
            {/* Origin */}
            {data.imageSignals.origin && (
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {language === 'fr' ? 'Origine probable' : 'Probable origin'}
                  </span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {data.imageSignals.origin.classification}
                  </span>
                </div>
                {data.imageSignals.origin.indicators && data.imageSignals.origin.indicators.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {data.imageSignals.origin.indicators.map((indicator, idx) => (
                      <span key={idx} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {indicator}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Coherence */}
            {data.imageSignals.coherence && (
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {language === 'fr' ? 'Cohérence visuelle' : 'Visual coherence'}
                  </span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {data.imageSignals.coherence.classification}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{data.imageSignals.coherence.explanation}</p>
              </div>
            )}

            {/* Scoring impact */}
            {data.imageSignals.scoring && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {language === 'fr' ? 'Impact sur le score' : 'Score impact'}
                  </span>
                  <span className={`font-mono text-sm font-bold ${getPointsColor(data.imageSignals.scoring.totalImpact)}`}>
                    {data.imageSignals.scoring.totalImpact}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{data.imageSignals.scoring.reasoning}</p>
              </div>
            )}

            {/* Disclaimer */}
            {data.imageSignals.disclaimer && (
              <p className="text-[10px] italic text-slate-400">{data.imageSignals.disclaimer}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
