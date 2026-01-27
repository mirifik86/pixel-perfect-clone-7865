import { CheckCircle, XCircle, AlertCircle, Search, Scale, GitBranch, Image, Sparkles, Info, Shield } from 'lucide-react';
import { SignalMiniGauge } from './SignalMiniGauge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BestSourcesSection } from './BestSourcesSection';
import { StandardAnalysisBadge } from './StandardAnalysisBadge';
import { StandardAnalysisIntro } from './StandardAnalysisIntro';
import { CommunicationSignals } from './CommunicationSignals';
import { UpgradeBridge } from './UpgradeBridge';

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

interface SourceDetail {
  name: string;
  url: string;
  snippet: string;
}

interface CorroborationSources {
  corroborated?: (string | SourceDetail)[];
  neutral?: (string | SourceDetail)[];
  constrained?: (string | SourceDetail)[];
  contradicting?: (string | SourceDetail)[];
}

// Helper to get source name from either string or SourceDetail
const getSourceName = (source: string | SourceDetail): string => {
  if (typeof source === 'object' && source !== null && 'name' in source) {
    return source.name || '';
  }
  return String(source);
};

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
  hasImage?: boolean;
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
    // Corroboration - Standard
    limitedVerificationTitle: 'Limited Verification (Standard)',
    noSourceFound: 'No corroborating source found.',
    oneSourceFound: '1 corroborating source found:',
    limitedVerificationNote: 'Standard analysis checks for one corroborating source. Upgrade to PRO for extended verification.',
    // Standard - Neutral corroboration messaging (never show "failed" signals)
    standardCorroborationNotIncluded: 'External source corroboration is not included in Standard analysis.',
    standardUpgradeToPro: 'Upgrade to PRO for multi-source verification.',
    standardSourcesNotEvaluated: 'Not evaluated in Standard analysis.',
    standardProUnlocks: 'PRO unlocks multi-source corroboration.',
    // Corroboration - PRO
    extendedVerificationTitle: 'Extended Verification (PRO)',
    corroborationTitle: 'Web Corroboration',
    corroborated: 'Clear Corroboration',
    neutral: 'Neutral Mentions',
    constrained: 'Limited Coverage',
    sourcesConsulted: 'sources consulted',
    corroborationBonus: 'Corroboration',
    corroborationStrong: 'Strong',
    corroborationModerate: 'Moderate',
    corroborationLimited: 'Limited',
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
    // Standard micro-diagnostic status badges
    statusHighConfidence: 'High confidence',
    statusModerateConfidence: 'Moderate confidence',
    statusLimitedConfidence: 'Limited confidence',
    statusNotEvaluated: 'Not evaluated (Standard)',
    // Standard signal explanations
    explainSourcesNotEvaluated: 'External multi-source corroboration is available in PRO.',
    explainFactualHigh: 'Claims appear internally consistent with no obvious contradictions.',
    explainFactualModerate: 'Some claims could benefit from additional verification.',
    explainFactualLimited: 'Multiple assertions lack clear supporting context.',
    explainContextHigh: 'The context is clear and situationally appropriate.',
    explainContextModerate: 'Context is partially established but some details are vague.',
    explainContextLimited: 'Key contextual elements are missing or unclear.',
    explainToneHigh: 'Language is measured, professional, and avoids sensationalism.',
    explainToneModerate: 'Language is generally appropriate with some emphatic elements.',
    explainToneLimited: 'Language shows emotional or promotional patterns.',
    explainVisualHigh: 'Visual elements appear authentic and contextually aligned.',
    explainVisualModerate: 'Visual elements show partial coherence with the content.',
    explainVisualLimited: 'Visual signals raise questions about authenticity or context.',
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
    // Corroboration - Standard
    limitedVerificationTitle: 'Vérification Limitée (Standard)',
    noSourceFound: 'Aucune source de corroboration trouvée.',
    oneSourceFound: '1 source de corroboration trouvée :',
    limitedVerificationNote: 'L\'analyse Standard recherche une seule source. Passez en PRO pour une vérification étendue.',
    // Standard - Neutral corroboration messaging (never show "failed" signals)
    standardCorroborationNotIncluded: 'La corroboration par sources externes n\'est pas incluse dans l\'analyse Standard.',
    standardUpgradeToPro: 'Passez en PRO pour une vérification multi-sources.',
    standardSourcesNotEvaluated: 'Non évalué dans l\'analyse Standard.',
    standardProUnlocks: 'PRO débloque la corroboration multi-sources.',
    // Corroboration - PRO
    extendedVerificationTitle: 'Vérification Étendue (PRO)',
    corroborationTitle: 'Corroboration Web',
    corroborated: 'Corroboration claire',
    neutral: 'Mentions neutres',
    constrained: 'Couverture limitée',
    sourcesConsulted: 'sources consultées',
    corroborationBonus: 'Corroboration',
    corroborationStrong: 'Forte',
    corroborationModerate: 'Modérée',
    corroborationLimited: 'Limitée',
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
    // Standard micro-diagnostic status badges
    statusHighConfidence: 'Confiance élevée',
    statusModerateConfidence: 'Confiance modérée',
    statusLimitedConfidence: 'Confiance limitée',
    statusNotEvaluated: 'Non évalué (Standard)',
    // Standard signal explanations
    explainSourcesNotEvaluated: 'La corroboration multi-sources externe est disponible en PRO.',
    explainFactualHigh: 'Les affirmations semblent cohérentes sans contradictions apparentes.',
    explainFactualModerate: 'Certaines affirmations bénéficieraient d\'une vérification complémentaire.',
    explainFactualLimited: 'Plusieurs assertions manquent de contexte de soutien clair.',
    explainContextHigh: 'Le contexte est clair et approprié à la situation.',
    explainContextModerate: 'Le contexte est partiellement établi mais certains détails sont vagues.',
    explainContextLimited: 'Des éléments contextuels clés sont manquants ou peu clairs.',
    explainToneHigh: 'Le langage est mesuré, professionnel et évite le sensationnalisme.',
    explainToneModerate: 'Le langage est généralement approprié avec quelques éléments emphatiques.',
    explainToneLimited: 'Le langage montre des schémas émotionnels ou promotionnels.',
    explainVisualHigh: 'Les éléments visuels semblent authentiques et contextuellement alignés.',
    explainVisualModerate: 'Les éléments visuels montrent une cohérence partielle avec le contenu.',
    explainVisualLimited: 'Les signaux visuels soulèvent des questions sur l\'authenticité ou le contexte.',
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
  return 'text-slate-500'; // Neutral = slate, never red for 0
};

// Get image signals impact color (never red for 0/neutral)
const getImageImpactColor = (impact: number) => {
  if (impact > 0) return 'text-emerald-600';
  if (impact < 0) return 'text-red-600';
  return 'text-slate-500'; // Neutral signals = slate
};

// Get image signals impact background
const getImageImpactBg = (impact: number) => {
  if (impact > 0) return 'bg-emerald-50 border-emerald-200';
  if (impact < 0) return 'bg-red-50 border-red-200';
  return 'bg-slate-50 border-slate-200'; // Neutral = slate
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

// Calculate progressive corroboration bonus for PRO analysis
// Source 1: +5, Source 2: +4, Source 3: +3, Source 4: +2, Sources 5-10: +1 each
// Maximum: 5+4+3+2+1+1+1+1+1+1 = 20 points
const calculateCorroborationBonus = (corroboration: Corroboration): number => {
  const sourceCount = Math.min(
    (corroboration.sources?.corroborated?.length || 0) +
    (corroboration.sources?.neutral?.length || 0),
    10
  );
  
  if (sourceCount === 0) return 0;
  
  const pointsPerSource = [5, 4, 3, 2, 1, 1, 1, 1, 1, 1];
  let bonus = 0;
  for (let i = 0; i < sourceCount; i++) {
    bonus += pointsPerSource[i];
  }
  return bonus;
};

export const AnalysisResult = ({ data, language, articleSummary, hasImage = false }: AnalysisResultProps) => {
  const t = translations[language];
  const isPro = data.analysisType === 'pro';

  // CRITICAL: Determine if we have REAL corroborating sources
  // Only count as corroborated if at least one actual source exists
  const hasRealCorroboration = Boolean(
    data.corroboration?.sources?.corroborated?.length && 
    data.corroboration.sources.corroborated.length > 0
  );
  
  // Calculate the REAL sources points based on actual corroboration
  // For Standard: +5 if source found, 0 otherwise
  // For PRO: use progressive bonus
  const realSourcesPoints = isPro 
    ? (data.corroboration ? calculateCorroborationBonus(data.corroboration) : 0)
    : (hasRealCorroboration ? 5 : 0);

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

  // Helper function to get confidence status from points
  const getConfidenceStatus = (points: number, key: string) => {
    // Sources always show "Not evaluated" in Standard when no corroboration
    if (key === 'sources' && !hasRealCorroboration) {
      return { 
        status: 'notEvaluated', 
        label: t.statusNotEvaluated, 
        confidence: 0,
        explanation: t.explainSourcesNotEvaluated 
      };
    }
    
    if (points >= 3) {
      return { 
        status: 'high', 
        label: t.statusHighConfidence, 
        confidence: 85,
        explanation: key === 'factual' ? t.explainFactualHigh 
          : key === 'context' ? t.explainContextHigh 
          : key === 'tone' || key === 'prudence' ? t.explainToneHigh 
          : key === 'visualCoherence' ? t.explainVisualHigh
          : key === 'sources' ? t.explainSourcesNotEvaluated
          : ''
      };
    }
    if (points >= 0) {
      return { 
        status: 'moderate', 
        label: t.statusModerateConfidence, 
        confidence: 55,
        explanation: key === 'factual' ? t.explainFactualModerate 
          : key === 'context' ? t.explainContextModerate 
          : key === 'tone' || key === 'prudence' ? t.explainToneModerate 
          : key === 'visualCoherence' ? t.explainVisualModerate
          : key === 'sources' ? t.explainSourcesNotEvaluated
          : ''
      };
    }
    return { 
      status: 'limited', 
      label: t.statusLimitedConfidence, 
      confidence: 25,
      explanation: key === 'factual' ? t.explainFactualLimited 
        : key === 'context' ? t.explainContextLimited 
        : key === 'tone' || key === 'prudence' ? t.explainToneLimited 
        : key === 'visualCoherence' ? t.explainVisualLimited
        : key === 'sources' ? t.explainSourcesNotEvaluated
        : ''
    };
  };

  // Status badge styles
  const statusBadgeStyles: Record<string, string> = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    limited: 'bg-slate-100 text-slate-600 border-slate-200',
    notEvaluated: 'bg-slate-50 text-slate-400 border-slate-200',
  };

  // Standard signal data with micro-diagnostics
  const standardSignalData = [
    { key: 'sources', label: t.signalSource, points: realSourcesPoints },
    { key: 'factual', label: t.signalFactual, points: data.breakdown.factual?.points ?? 0 },
    { key: 'context', label: t.signalContext, points: data.breakdown.context?.points ?? 0 },
    { key: 'tone', label: t.signalPrudence, points: data.breakdown.prudence?.points ?? data.breakdown.tone?.points ?? 0 },
    // Only include visual signal if an image was provided
    ...(hasImage ? [{ key: 'visualCoherence', label: t.signalVisual, points: data.breakdown.visualCoherence?.points ?? 0 }] : []),
  ];

  // PRO signal badges with LucideIcon type - exclude image signal when no image
  const proSignalBadges: Array<{ label: string; level: number; icon: typeof Scale }> = [
    { label: t.signalGravity, level: getBadgeLevel(data.breakdown.claimGravity?.points ?? 0), icon: Scale },
    { label: t.signalCoherence, level: getBadgeLevel(data.breakdown.contextualCoherence?.points ?? 0), icon: GitBranch },
    { label: t.signalWeb, level: getBadgeLevel(data.breakdown.webCorroboration?.points ?? 0), icon: Search },
    // Only include image signal badge if an image was provided
    ...(hasImage ? [{ label: t.signalImage, level: getBadgeLevel(data.breakdown.imageCoherence?.points ?? 0), icon: Image }] : []),
  ];

  // Get keys for breakdown display
  const standardKeys = Object.keys(data.breakdown).filter((key) => standardCriteriaLabels[key] !== undefined);
  // Exclude imageCoherence from PRO breakdown when no image is provided
  const proKeysBase = ['claimGravity', 'contextualCoherence', 'webCorroboration'];
  const proKeys = [...proKeysBase, ...(hasImage ? ['imageCoherence'] : [])].filter(
    (key) => data.breakdown[key as keyof AnalysisBreakdown] !== undefined
  );

  return (
    <div className="container-content w-full animate-fade-in" style={{ marginTop: 'var(--space-8)' }}>
      {/* PRO badge indicator - Premium visual */}
      {isPro && (
        <div className="mb-6 flex justify-center">
          <div 
            className="group relative flex items-center gap-3 rounded-full px-6 py-2.5 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(220 25% 12%) 0%, hsl(240 20% 8%) 100%)',
              border: '1px solid hsl(200 80% 55% / 0.4)',
              boxShadow: '0 0 30px hsl(200 80% 55% / 0.2), 0 0 60px hsl(280 60% 55% / 0.15), inset 0 1px 0 hsl(200 80% 70% / 0.15)',
            }}
          >
            {/* Animated shine sweep */}
            <div 
              className="absolute inset-0 opacity-60"
              style={{
                background: 'linear-gradient(105deg, transparent 20%, hsl(200 80% 70% / 0.1) 40%, hsl(280 60% 70% / 0.15) 50%, transparent 80%)',
                animation: 'pro-badge-shine 3s ease-in-out infinite',
              }}
            />
            
            {/* Outer glow ring */}
            <div 
              className="absolute -inset-0.5 -z-10 rounded-full"
              style={{
                background: 'linear-gradient(135deg, hsl(200 80% 55% / 0.3) 0%, hsl(280 60% 55% / 0.3) 100%)',
                filter: 'blur(6px)',
                animation: 'pro-badge-pulse 2.5s ease-in-out infinite',
              }}
            />
            
            {/* Sparkles icon with glow */}
            <div className="relative">
              <Sparkles 
                className="h-5 w-5"
                style={{
                  color: 'hsl(45 100% 70%)',
                  filter: 'drop-shadow(0 0 6px hsl(45 100% 60% / 0.8))',
                  animation: 'pro-sparkle 2s ease-in-out infinite',
                }}
              />
            </div>
            
            {/* PRO text with premium gradient */}
            <span 
              className="relative text-base font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, hsl(45 100% 75%) 0%, hsl(35 100% 65%) 30%, hsl(200 80% 70%) 70%, hsl(280 60% 75%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px hsl(45 100% 60% / 0.5)',
              }}
            >
              PRO ANALYSIS
            </span>
            
            {/* Premium verified badge */}
            <div 
              className="flex items-center justify-center rounded-full"
              style={{
                width: '20px',
                height: '20px',
                background: 'linear-gradient(135deg, hsl(45 100% 55%) 0%, hsl(35 100% 50%) 100%)',
                boxShadow: '0 0 10px hsl(45 100% 55% / 0.6)',
              }}
            >
              <CheckCircle className="h-3.5 w-3.5 text-slate-900" strokeWidth={3} />
            </div>
          </div>
        </div>
      )}

      {/* STANDARD: Badge near the score gauge */}
      {!isPro && (
        <div className="mb-6 flex justify-center">
          <StandardAnalysisBadge language={language} />
        </div>
      )}

      {/* STANDARD: New warm intro section */}
      {!isPro && (
        <StandardAnalysisIntro language={language} />
      )}

      {/* Standard: Summary card with confidence badge */}
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

      {/* STANDARD: Detected Communication Signals */}
      {!isPro && (
        <CommunicationSignals language={language} breakdown={data.breakdown} />
      )}

      {/* Standard: Updated Verification Section - Neutral messaging */}
      {!isPro && (
        <div className="analysis-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-slate-500" />
            <h3 className="font-serif text-lg font-semibold text-slate-900">
              {language === 'fr' ? 'Vérification des Sources' : 'Source Verification'}
            </h3>
          </div>
          
          {/* Always show neutral messaging for Standard - no "failed" or negative indicators */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {language === 'fr' 
                ? 'L\'analyse Standard se concentre sur les signaux linguistiques et structurels du texte lui-même. La vérification externe des sources et le recoupement sont inclus dans l\'analyse PRO.'
                : 'Standard analysis focuses on linguistic and structural signals within the text itself. External source verification and cross-checking are included in PRO analysis.'}
            </p>
          </div>
        </div>
      )}

      {/* STANDARD: Upgrade Bridge - soft upsell */}
      {!isPro && (
        <UpgradeBridge language={language} />
      )}

      {/* PRO: Unified Explanation + Corroboration Card */}
      {isPro && (data.summary || data.corroboration) && (
        <div 
          className="analysis-card mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(200 20% 98%) 100%)',
            border: '1px solid hsl(200 40% 88%)',
            boxShadow: '0 4px 24px hsl(200 40% 50% / 0.08), 0 1px 3px hsl(0 0% 0% / 0.05)',
          }}
        >
          {/* Explication PRO Section */}
          {data.summary && (
            <div className="pb-5">
              <h3 className="font-serif text-lg font-semibold text-slate-900 mb-3">
                {t.proExplanation}
              </h3>
              <p className="text-sm font-medium leading-relaxed text-slate-700">
                {data.summary}
              </p>
            </div>
          )}
          
          {/* Elegant separator */}
          {data.summary && data.corroboration && (
            <div className="relative py-4">
              <div 
                className="absolute inset-x-0 top-1/2 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsl(200 40% 85%) 20%, hsl(200 40% 85%) 80%, transparent 100%)',
                }}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3">
                <div 
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, hsl(200 60% 55%) 0%, hsl(174 60% 50%) 100%)',
                    boxShadow: '0 0 8px hsl(200 60% 55% / 0.5)',
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Corroboration Web Section - Extended Verification (PRO) */}
          {data.corroboration && (
            <div className="pt-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-600" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l7 4v6c0 5-3.5 9.7-7 10-3.5-.3-7-5-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <h3 className="font-serif text-lg font-semibold text-slate-900">{t.extendedVerificationTitle}</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          <Info className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px] text-center">
                        <p className="text-xs">{language === 'fr' 
                          ? 'PRO vérifie jusqu\'à 10 sources provenant de médias majeurs, références et sources officielles.' 
                          : 'PRO checks up to 10 sources from major media, references, and official sources.'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {/* Corroboration Strength Badge */}
                {(() => {
                  const bonus = calculateCorroborationBonus(data.corroboration);
                  const strength = bonus >= 10 ? 'strong' : bonus >= 5 ? 'moderate' : 'limited';
                  const strengthLabel = strength === 'strong' ? t.corroborationStrong 
                    : strength === 'moderate' ? t.corroborationModerate 
                    : t.corroborationLimited;
                  const strengthStyle = strength === 'strong' 
                    ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                    : strength === 'moderate'
                      ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                      : 'bg-slate-100 text-slate-600 border-slate-300';
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{t.corroborationBonus}:</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${strengthStyle}`}>
                        {strengthLabel}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Microcopy */}
              <div className="mb-4 flex items-center text-sm">
                <span className="text-slate-500">
                  <span className="font-semibold text-slate-700">{data.corroboration.sourcesConsulted}</span> {t.sourcesConsulted}
                </span>
              </div>

              {/* Source Cards Grid */}
              {data.corroboration.sources && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Corroborated Sources - Official/Major Media/Reference */}
                  {data.corroboration.sources.corroborated?.map((source, idx) => {
                    // Comprehensive domain detection patterns
                    const sourceName = getSourceName(source);
                    const sourceLower = sourceName.toLowerCase();
                    
                    // Official Sources: Government, institutional archives, official bodies
                    const officialPatterns = /\.(gov|gouv|gob|govt)\b|\.gov\.|government|official|ministry|ministère|department|département|senate|sénat|congress|parlement|parliament|white\s*house|élysée|downing|bundesregierung|archives?\s*(national|federal)|national\s*archives|library\s*of\s*congress|europarl|europa\.eu|who\.int|un\.org|unesco|interpol|fbi|cia|nsa|cdc|fda|epa|nasa|esa|nih|state\.gov|justice\.gov|treasury|défense|defense\.gov|bundesamt|préfecture|mairie|city\s*hall|municipal|conseil|court\s*(supreme|constitutional)|tribunal|homeland|immigration/i.test(sourceLower);
                    
                    // Major Media: International news agencies, major newspapers, broadcast networks
                    const majorMediaPatterns = /reuters|associated\s*press|\bap\s*news|agence\s*france|afp|bloomberg|bbc|cnn|nbc|abc\s*news|cbs\s*news|fox\s*news|msnbc|npr|pbs|c-span|new\s*york\s*times|nyt|washington\s*post|wall\s*street\s*journal|wsj|los\s*angeles\s*times|usa\s*today|chicago\s*tribune|boston\s*globe|the\s*guardian|daily\s*telegraph|the\s*times|independent|financial\s*times|economist|le\s*monde|le\s*figaro|libération|l'express|la\s*croix|der\s*spiegel|zeit|süddeutsche|faz|frankfurter|bild|el\s*país|la\s*vanguardia|corriere|la\s*repubblica|stampa|asahi|yomiuri|mainichi|nikkei|al\s*jazeera|haaretz|times\s*of\s*india|hindu|straits\s*times|south\s*china|globe\s*and\s*mail|toronto\s*star|sydney\s*morning|abc\s*australia|sky\s*news|euronews|france24|dw\.com|radio\s*france|france\s*info|rtbf|politico|axios|vox|huffpost|huffington|buzzfeed\s*news|vice\s*news|propublica|intercept|atlantic|newyorker|new\s*yorker|time\s*magazine|\btime\.com/i.test(sourceLower);
                    
                    // Reference: Encyclopedias, academic sources, dictionaries
                    const referencePatterns = /britannica|encyclopedia|encyclopédie|encyclopaedia|wikipedia|wikimedia|wiktionary|oxford|cambridge|merriam|webster|larousse|robert|duden|treccani|scholarpedia|stanford\s*encyclopedia|plato\.stanford|jstor|pubmed|ncbi|nature\.com|science\.org|sciencedirect|springer|wiley|elsevier|academic|scholarly|peer\s*review|arxiv|ssrn|researchgate|google\s*scholar|worldcat|library|bibliothèque|snopes|factcheck|politifact|full\s*fact|les\s*décodeurs|checknews|hoaxbuster/i.test(sourceLower);
                    
                    let badgeLabel = language === 'fr' ? 'Source officielle' : 'Official Source';
                    let badgeStyle = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
                    
                    if (majorMediaPatterns) {
                      badgeLabel = language === 'fr' ? 'Média majeur' : 'Major Media';
                      badgeStyle = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
                    } else if (referencePatterns) {
                      badgeLabel = language === 'fr' ? 'Référence' : 'Reference';
                      badgeStyle = 'bg-violet-500/10 text-violet-600 border-violet-500/20';
                    } else if (!officialPatterns) {
                      // Default to Major Media for unrecognized corroborated sources
                      badgeLabel = language === 'fr' ? 'Média majeur' : 'Major Media';
                      badgeStyle = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
                    }
                    
                    return (
                      <div
                        key={`corr-${idx}`}
                        className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 
                                   p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{sourceName}</div>
                            <div className="text-xs text-slate-400">{t.sourceGroupCorroborated}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide border whitespace-nowrap ${badgeStyle}`}>
                          {badgeLabel}
                        </span>
                      </div>
                    );
                  })}

                  {/* Neutral Sources - Reference type */}
                  {data.corroboration.sources.neutral?.map((source, idx) => {
                    const sourceName = getSourceName(source);
                    const sourceLower = sourceName.toLowerCase();
                    
                    // Reference: Encyclopedias, academic sources, dictionaries, fact-checkers
                    const isReference = /britannica|encyclopedia|encyclopédie|encyclopaedia|wikipedia|wikimedia|wiktionary|oxford|cambridge|merriam|webster|larousse|robert|duden|treccani|scholarpedia|stanford\s*encyclopedia|plato\.stanford|jstor|pubmed|ncbi|nature\.com|science\.org|sciencedirect|springer|wiley|elsevier|academic|scholarly|peer\s*review|arxiv|ssrn|researchgate|google\s*scholar|worldcat|library|bibliothèque|snopes|factcheck|politifact|full\s*fact|les\s*décodeurs|checknews|hoaxbuster/i.test(sourceLower);
                    
                    // Major Media patterns for neutral sources
                    const isMajorMedia = /reuters|associated\s*press|\bap\s*news|afp|bloomberg|bbc|cnn|nbc|abc\s*news|cbs|fox\s*news|msnbc|npr|pbs|new\s*york\s*times|nyt|washington\s*post|wsj|guardian|telegraph|times|independent|financial\s*times|economist|le\s*monde|figaro|spiegel|al\s*jazeera|politico|axios|vox|huffpost|atlantic|newyorker|time\.com/i.test(sourceLower);
                    
                    let badgeLabel = language === 'fr' ? 'Contexte' : 'Context';
                    let badgeStyle = 'bg-slate-500/10 text-slate-600 border-slate-500/20';
                    
                    if (isReference) {
                      badgeLabel = language === 'fr' ? 'Référence' : 'Reference';
                      badgeStyle = 'bg-violet-500/10 text-violet-600 border-violet-500/20';
                    } else if (isMajorMedia) {
                      badgeLabel = language === 'fr' ? 'Média majeur' : 'Major Media';
                      badgeStyle = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
                    }
                    
                    return (
                      <div
                        key={`neut-${idx}`}
                        className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 
                                   p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{sourceName}</div>
                            <div className="text-xs text-slate-400">{t.sourceGroupNeutral}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide border whitespace-nowrap ${badgeStyle}`}>
                          {badgeLabel}
                        </span>
                      </div>
                    );
                  })}

                  {/* Constrained Sources - Context type */}
                  {data.corroboration.sources.constrained?.map((source, idx) => (
                    <div
                      key={`const-${idx}`}
                      className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 
                                 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{getSourceName(source)}</div>
                          <div className="text-xs text-slate-400">{t.sourceGroupConstrained}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium tracking-wide border whitespace-nowrap
                                       bg-slate-500/10 text-slate-600 border-slate-500/20">
                        {language === 'fr' ? 'Contexte' : 'Context'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Best Sources Section - Clickable evidence links */}
              {data.corroboration.sources && (
                <>
                  {/* PRO: Show contradicting sources FIRST in dedicated section */}
                  {isPro && data.corroboration.sources.contradicting && data.corroboration.sources.contradicting.length > 0 && (
                    <BestSourcesSection 
                      sources={data.corroboration.sources}
                      language={language}
                      outcome="refuted"
                      mode="contradictingOnly"
                      claim={articleSummary ?? data.summary ?? ""}
                    />
                  )}
                  
                  {/* Show corroborating/neutral sources (or all for Standard) */}
                  <BestSourcesSection 
                    sources={data.corroboration.sources}
                    language={language}
                    outcome={data.corroboration.outcome}
                    mode={isPro ? "supportingOnly" : "all"}
                    claim={articleSummary ?? data.summary ?? ""}
                  />
                </>
              )}
            </div>
          )}
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

      {/* Signal badges - PRO uses compact badges, Standard uses micro-diagnostics */}
      <div className="analysis-card mb-6">
        <h3 className="mb-4 font-serif text-lg font-semibold text-slate-900">
          {isPro ? t.proSignalsTitle : t.signalsTitle}
        </h3>
        
        {isPro ? (
          /* PRO: Compact badge row */
          <div className="flex flex-wrap gap-2">
            {proSignalBadges.map((signal, index) => {
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
            })}
          </div>
        ) : (
          /* Standard: Micro-diagnostic cards with mini gauges */
          <div className="space-y-3">
            {standardSignalData.map((signal, index) => {
              const confidence = getConfidenceStatus(signal.points, signal.key);
              const isNotEvaluated = confidence.status === 'notEvaluated';
              
              return (
                <div 
                  key={index} 
                  className="rounded-lg border p-3 transition-all"
                  style={{
                    background: isNotEvaluated 
                      ? 'hsl(220 15% 97%)' 
                      : 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(200 15% 98%) 100%)',
                    borderColor: isNotEvaluated ? 'hsl(220 15% 90%)' : 'hsl(200 30% 90%)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Mini Gauge */}
                    <SignalMiniGauge 
                      confidence={confidence.confidence} 
                      notEvaluated={isNotEvaluated}
                      size={28}
                    />
                    
                    <div className="flex-1 min-w-0">
                      {/* Signal name + Status badge row */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-slate-800 text-sm">{signal.label}</span>
                        <span 
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeStyles[confidence.status]}`}
                        >
                          {confidence.label}
                        </span>
                      </div>
                      
                      {/* Explanation text */}
                      <p className={`text-xs leading-relaxed ${isNotEvaluated ? 'text-slate-400' : 'text-slate-600'}`}>
                        {confidence.explanation}
                        {isNotEvaluated && signal.key === 'sources' && (
                          <span className="text-cyan-600 font-medium ml-1">
                            {language === 'fr' ? 'Disponible en PRO.' : 'Available in PRO.'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Breakdown - PRO only (Standard uses the micro-diagnostic cards above) */}
      {isPro && (
        <div className="analysis-card">
          <h3 className="mb-4 font-serif text-lg font-semibold text-slate-900">
            {t.proBreakdown}
          </h3>
          <div className="space-y-4">
            {proKeys.map((key) => {
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
                    {(() => {
                      const level = item.points >= 3 ? 'high' : item.points >= 0 ? 'moderate' : 'limited';
                      const levelLabel = level === 'high' 
                        ? (language === 'fr' ? 'Élevé' : 'Strong')
                        : level === 'moderate'
                          ? (language === 'fr' ? 'Modéré' : 'Moderate')
                          : (language === 'fr' ? 'Limité' : 'Limited');
                      const levelStyle = level === 'high' 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : level === 'moderate'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-red-100 text-red-700 border-red-200';
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${levelStyle}`}>
                          {levelLabel}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="ml-8 text-sm font-medium text-slate-600">{item.reason}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRO Image Signals detailed view - only show when an image was actually provided */}
      {isPro && hasImage && data.imageSignals && (() => {
        const impact = data.imageSignals.scoring?.totalImpact ?? 0;
        const cappedImpact = Math.min(Math.max(impact, -10), 3); // Cap positive at +3
        
        // Determine status level
        const isPositive = cappedImpact > 0;
        const isNegative = cappedImpact < 0;
        const isNeutral = cappedImpact === 0;
        
        // Visual relevance classification based on coherence
        const coherenceClass = data.imageSignals.coherence?.classification?.toLowerCase() || '';
        const getVisualRelevance = () => {
          if (coherenceClass.includes('high') || coherenceClass.includes('strong') || 
              coherenceClass.includes('élevé') || coherenceClass.includes('fort')) {
            return { level: 'high', label: language === 'fr' ? 'Pertinence élevée' : 'High relevance', color: 'bg-emerald-100 text-emerald-700' };
          }
          if (coherenceClass.includes('low') || coherenceClass.includes('weak') || 
              coherenceClass.includes('faible') || coherenceClass.includes('none') ||
              coherenceClass.includes('aucun') || coherenceClass.includes('unrelated')) {
            return { level: 'none', label: language === 'fr' ? 'Aucune pertinence visuelle' : 'No visual relevance', color: 'bg-red-100 text-red-700' };
          }
          return { level: 'partial', label: language === 'fr' ? 'Pertinence partielle' : 'Partial relevance', color: 'bg-amber-100 text-amber-700' };
        };
        
        const visualRelevance = getVisualRelevance();
        
        // Expert status labels
        const statusLabel = isNegative 
          ? (language === 'fr' ? 'Incohérence détectée' : 'Incoherence detected')
          : isPositive 
            ? (language === 'fr' ? 'Cohérence confirmée' : 'Coherence confirmed')
            : (language === 'fr' ? 'Neutre' : 'Neutral');
        
        // Impact display text - use qualitative labels instead of points
        const impactDisplayText = isNeutral
          ? (language === 'fr' ? 'Neutre' : 'Neutral')
          : isPositive
            ? (language === 'fr' ? 'Renforcement mineur' : 'Minor reinforcement')
            : (language === 'fr' ? 'Impact négatif' : 'Negative impact');
        
        // Generate expert visual summary based on coherence explanation
        const getExpertSummary = () => {
          const explanation = data.imageSignals.coherence?.explanation;
          if (explanation) return explanation;
          
          if (visualRelevance.level === 'high') {
            return language === 'fr' 
              ? 'L\'image fournie présente une cohérence visuelle avec le contenu analysé. Les éléments visuels soutiennent le contexte de l\'affirmation.'
              : 'The provided image shows visual coherence with the analyzed content. Visual elements support the claim context.';
          }
          if (visualRelevance.level === 'none') {
            return language === 'fr'
              ? 'L\'image fournie ne présente pas de lien visuel direct avec l\'affirmation. Le contenu visuel ne soutient pas et ne contredit pas le texte.'
              : 'The provided image shows no direct visual connection to the claim. Visual content neither supports nor contradicts the text.';
          }
          return language === 'fr'
            ? 'L\'image fournie présente un lien partiel avec le contenu. Certains éléments visuels peuvent être pertinents mais sans confirmation claire.'
            : 'The provided image shows a partial connection to the content. Some visual elements may be relevant but without clear confirmation.';
        };
        
        return (
          <div className="analysis-card mt-6">
            {/* Header with clear image acknowledgment */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-cyan-600" />
                <h3 className="font-serif text-lg font-semibold text-slate-900">
                  {language === 'fr' ? 'Analyse Visuelle Expert' : 'Expert Visual Analysis'}
                </h3>
              </div>
              {/* Status badge */}
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                isNegative ? 'bg-red-100 text-red-700' :
                isPositive ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {statusLabel}
              </span>
            </div>
            
            {/* Image presence acknowledgment - ALWAYS visible */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-cyan-50 border border-cyan-200/60 px-3 py-2">
              <CheckCircle className="h-4 w-4 text-cyan-600 flex-shrink-0" />
              <span className="text-sm font-medium text-cyan-800">
                {language === 'fr' ? 'Image fournie et analysée' : 'Image provided and analyzed'}
              </span>
            </div>
            
            <div className="space-y-3">
              {/* A) IMAGE PRESENCE - Always confirmed */}
              {/* Already shown above in cyan banner */}
              
              {/* B) VISUAL RELEVANCE TO CLAIM - Mandatory evaluation */}
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 border border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {language === 'fr' ? 'Pertinence visuelle' : 'Visual Relevance to Claim'}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${visualRelevance.color}`}>
                    {visualRelevance.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {visualRelevance.level === 'high' 
                    ? (language === 'fr' 
                        ? 'L\'image soutient visuellement le contenu de l\'affirmation.'
                        : 'The image visually supports the claim content.')
                    : visualRelevance.level === 'none'
                      ? (language === 'fr'
                          ? 'L\'image n\'a pas de rapport visuel avec l\'affirmation.'
                          : 'The image has no visual connection to the claim.')
                      : (language === 'fr'
                          ? 'L\'image présente un lien partiel avec le contenu.'
                          : 'The image shows a partial connection to the content.')}
                </p>
              </div>
              
              {/* C) CONTEXTUAL COHERENCE - Alignment evaluation */}
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 border border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {language === 'fr' ? 'Cohérence contextuelle' : 'Contextual Coherence'}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isNegative ? 'bg-red-100 text-red-700' :
                    isPositive ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {isNegative 
                      ? (language === 'fr' ? 'Incohérent' : 'Incoherent')
                      : isPositive 
                        ? (language === 'fr' ? 'Cohérent' : 'Coherent')
                        : (language === 'fr' ? 'Neutre' : 'Neutral')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isNegative
                    ? (language === 'fr'
                        ? 'Le contenu visuel ne correspond pas au sujet de l\'affirmation.'
                        : 'The image content does not match the subject of the claim.')
                    : isPositive
                      ? (language === 'fr'
                          ? 'Alignement confirmé entre le contenu visuel et l\'affirmation.'
                          : 'Confirmed alignment between visual content and the claim.')
                      : (language === 'fr'
                          ? 'Aucune contradiction visuelle détectée, mais sans confirmation forte.'
                          : 'No visual contradiction detected, but without strong confirmation.')}
                </p>
              </div>
              
              {/* D) EXPERT VISUAL SUMMARY - Clear sentence */}
              <div className="rounded-lg bg-cyan-50/50 border border-cyan-200/40 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-cyan-800 mb-1">
                      {language === 'fr' ? 'Synthèse Expert' : 'Expert Summary'}
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {getExpertSummary()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expert checklist - what was verified */}
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 border border-slate-200/60">
                <p className="text-xs font-semibold text-slate-600 mb-2.5">
                  {language === 'fr' ? 'Signaux vérifiés :' : 'Signals verified:'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Image consistency */}
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${isNegative ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    <span className="text-xs text-slate-600">
                      {language === 'fr' ? 'Intégrité image' : 'Image integrity'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {isNegative ? (language === 'fr' ? 'Suspect' : 'Suspect') : (language === 'fr' ? 'Normal' : 'Normal')}
                    </span>
                  </div>
                  
                  {/* Manipulation artifacts */}
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      data.imageSignals.scoring && data.imageSignals.scoring.totalImpact < -3 ? 'bg-red-400' : 'bg-emerald-400'
                    }`} />
                    <span className="text-xs text-slate-600">
                      {language === 'fr' ? 'Artefacts' : 'Artifacts'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {data.imageSignals.scoring && data.imageSignals.scoring.totalImpact < -3 
                        ? (language === 'fr' ? 'Détectés' : 'Detected')
                        : (language === 'fr' ? 'Aucun' : 'None')}
                    </span>
                  </div>
                  
                  {/* Visual context alignment */}
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      visualRelevance.level === 'high' ? 'bg-emerald-400' 
                        : visualRelevance.level === 'none' ? 'bg-red-400'
                        : 'bg-amber-400'
                    }`} />
                    <span className="text-xs text-slate-600">
                      {language === 'fr' ? 'Contexte visuel' : 'Visual context'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {visualRelevance.level === 'high' 
                        ? (language === 'fr' ? 'Aligné' : 'Aligned')
                        : visualRelevance.level === 'none'
                          ? (language === 'fr' ? 'Non lié' : 'Unrelated')
                          : (language === 'fr' ? 'Partiel' : 'Partial')}
                    </span>
                  </div>
                  
                  {/* Source metadata */}
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="text-xs text-slate-600">
                      {language === 'fr' ? 'Métadonnées' : 'Metadata'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {language === 'fr' ? 'Non concluant' : 'Inconclusive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Origin - if available */}
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

              {/* SCORE IMPACT - Controlled display */}
              <div className={`rounded-lg border p-3 ${getImageImpactBg(cappedImpact)}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {language === 'fr' ? 'Impact sur le score' : 'Score Impact'}
                  </span>
                  <span className={`font-mono text-sm font-bold ${getImageImpactColor(cappedImpact)}`}>
                    {impactDisplayText}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isNeutral 
                    ? (language === 'fr' 
                        ? 'Image analysée sans anomalie critique. L\'absence de signaux négatifs est neutre.'
                        : 'Image analyzed with no critical anomalies. Absence of negative signals is neutral.')
                    : isPositive
                      ? (language === 'fr'
                          ? 'L\'analyse visuelle montre une forte cohérence avec l\'affirmation. Cela renforce légèrement la crédibilité.'
                          : 'Visual analysis shows strong coherence with the claim. This slightly reinforces credibility.')
                      : (language === 'fr'
                          ? 'Incohérence visuelle détectée. L\'image contredit ou ne correspond pas au contenu de l\'affirmation.'
                          : 'Visual incoherence detected. The image contradicts or does not match the claim content.')}
                </p>
                {isPositive && (
                  <p className="text-[10px] text-emerald-600/70 mt-1.5 italic">
                    {language === 'fr' 
                      ? 'L\'image fournit un renforcement mineur. Les signaux visuels ne peuvent pas surpasser la corroboration web.'
                      : 'The image provides minor reinforcement. Visual signals cannot outweigh web corroboration.'}
                  </p>
                )}
                {isNegative && (
                  <p className="text-[10px] text-red-600/70 mt-1.5 italic">
                    {language === 'fr' 
                      ? 'Impact négatif détecté. Cependant, l\'image seule ne peut pas invalider une affirmation.'
                      : 'Negative impact detected. However, the image alone cannot invalidate a claim.'}
                  </p>
                )}
              </div>

              {/* Expert disclaimer */}
              <p className="text-[10px] italic text-slate-400">
                {data.imageSignals.disclaimer || (language === 'fr'
                  ? 'L\'analyse d\'image est un signal de soutien, pas une preuve. Elle ne remplace pas la vérification des sources.'
                  : 'Image analysis is a supporting signal, not proof. It does not replace source verification.')}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
