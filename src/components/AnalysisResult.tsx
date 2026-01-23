import { CheckCircle, XCircle, AlertCircle, Search, Scale, GitBranch, Image, Sparkles, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    // Corroboration - PRO
    extendedVerificationTitle: 'Extended Verification (PRO)',
    corroborationTitle: 'Web Corroboration',
    corroborated: 'Clear Corroboration',
    neutral: 'Neutral Mentions',
    constrained: 'Limited Coverage',
    sourcesConsulted: 'sources consulted',
    corroborationBonus: 'Corroboration Bonus',
    maxBonus: 'max +20 pts',
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
    // Corroboration - Standard
    limitedVerificationTitle: 'Vérification Limitée (Standard)',
    noSourceFound: 'Aucune source de corroboration trouvée.',
    oneSourceFound: '1 source de corroboration trouvée :',
    limitedVerificationNote: 'L\'analyse Standard recherche une seule source. Passez en PRO pour une vérification étendue.',
    // Corroboration - PRO
    extendedVerificationTitle: 'Vérification Étendue (PRO)',
    corroborationTitle: 'Corroboration Web',
    corroborated: 'Corroboration claire',
    neutral: 'Mentions neutres',
    constrained: 'Couverture limitée',
    sourcesConsulted: 'sources consultées',
    corroborationBonus: 'Bonus Corroboration',
    maxBonus: 'max +20 pts',
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

  // Standard signal badges - exclude visual signal when no image
  const standardSignalBadges = [
    { label: t.signalSource, level: getBadgeLevel(data.breakdown.sources?.points ?? 0) },
    { label: t.signalFactual, level: getBadgeLevel(data.breakdown.factual?.points ?? 0) },
    { label: t.signalContext, level: getBadgeLevel(data.breakdown.context?.points ?? 0) },
    { label: t.signalPrudence, level: getBadgeLevel(data.breakdown.prudence?.points ?? data.breakdown.tone?.points ?? 0) },
    // Only include visual signal badge if an image was provided
    ...(hasImage ? [{ label: t.signalVisual, level: getBadgeLevel(data.breakdown.visualCoherence?.points ?? 0) }] : []),
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

      {/* Standard: Limited Verification Section */}
      {!isPro && (
        <div className="analysis-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-slate-500" />
            <h3 className="font-serif text-lg font-semibold text-slate-900">{t.limitedVerificationTitle}</h3>
          </div>
          
          {data.corroboration && data.corroboration.sourcesConsulted > 0 && data.corroboration.sources?.corroborated?.[0] ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">{t.oneSourceFound}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {data.corroboration.sources.corroborated[0]}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  +5 pts
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">{t.noSourceFound}</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">+0 pts</span>
            </div>
          )}
          
          <p className="text-xs text-slate-500 mt-3 italic">{t.limitedVerificationNote}</p>
        </div>
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
                          ? 'PRO vérifie jusqu\'à 10 sources avec scoring progressif : +5, +4, +3, +2, puis +1 par source (max +20 pts).' 
                          : 'PRO checks up to 10 sources with progressive scoring: +5, +4, +3, +2, then +1 per source (max +20 pts).'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {/* Corroboration Bonus Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{t.corroborationBonus}:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-700 border border-cyan-500/30">
                    +{calculateCorroborationBonus(data.corroboration)} pts
                  </span>
                </div>
              </div>

              {/* Microcopy */}
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  <span className="font-semibold text-slate-700">{data.corroboration.sourcesConsulted}</span> {t.sourcesConsulted}
                </span>
                <span className="text-xs text-slate-400">({t.maxBonus})</span>
              </div>

              {/* Source Cards Grid */}
              {data.corroboration.sources && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Corroborated Sources - Official/Major Media/Reference */}
                  {data.corroboration.sources.corroborated?.map((source, idx) => {
                    // Comprehensive domain detection patterns
                    const sourceLower = source.toLowerCase();
                    
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
                            <div className="text-sm font-semibold text-slate-800">{source}</div>
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
                    const sourceLower = source.toLowerCase();
                    
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
                            <div className="text-sm font-semibold text-slate-800">{source}</div>
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
                          <div className="text-sm font-semibold text-slate-800">{source}</div>
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

      {/* PRO Image Signals detailed view - only show when an image was actually provided */}
      {isPro && hasImage && data.imageSignals && (
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
