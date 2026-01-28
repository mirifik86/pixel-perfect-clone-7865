import { useState } from 'react';
import { CheckCircle, AlertCircle, Image, Sparkles, Info, Shield, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { SignalMiniGauge } from './SignalMiniGauge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StandardAnalysisBadge } from './StandardAnalysisBadge';
import { StandardAnalysisIntro } from './StandardAnalysisIntro';
import { CommunicationSignals } from './CommunicationSignals';
import { UpgradeBridge } from './UpgradeBridge';
import { LinguisticDisclaimer } from './LinguisticDisclaimer';
import { ProHighlights } from './ProHighlights';
import { VerificationCoverage } from './VerificationCoverage';
import { type SupportedLanguage } from '@/i18n/config';
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
  // PRO-specific breakdown (kept for legacy compatibility but hidden in UI)
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

interface Corroboration {
  outcome: string;
  sourcesConsulted: number;
  sourceTypes: string[];
  summary: string;
  sources?: CorroborationSources;
}

// New PRO source format from analyze edge function
interface NewProSource {
  title: string;
  publisher: string;
  url: string;
  trustTier: 'high' | 'medium' | 'low';
  stance?: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters: string;
}

// Result wrapper from new format
interface ResultWrapper {
  score?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  summary?: string;
  confidence?: number;
  bestLinks?: NewProSource[];
  sources?: NewProSource[];
}

// Normalized evidence source for rendering
interface EvidenceSource {
  title: string;
  publisher: string;
  url: string;
  trustTier: 'high' | 'medium' | 'low';
  stance?: 'corroborating' | 'neutral' | 'contradicting';
  whyItMatters: string;
}

interface AnalysisData {
  score: number;
  analysisType?: 'standard' | 'pro';
  breakdown?: AnalysisBreakdown;
  summary: string;
  confidence: 'low' | 'medium' | 'high';
  visualNote?: string;
  imageSignals?: ImageSignals;
  corroboration?: Corroboration;
  proDisclaimer?: string;
  // New format: result wrapper
  result?: ResultWrapper;
}

interface AnalysisResultProps {
  data: AnalysisData;
  language: SupportedLanguage;
  isProUnlocked?: boolean;
  articleSummary?: string;
  hasImage?: boolean;
}

const translations = {
  en: {
    summary: 'Summary',
    confidence: 'Confidence',
    confidenceLow: 'Low',
    confidenceMedium: 'Medium',
    confidenceHigh: 'High',
    // Standard signals
    signalsTitle: 'Credibility signals reviewed',
    signalSource: 'Source reliability',
    signalFactual: 'Factual coherence',
    signalContext: 'Context clarity',
    signalPrudence: 'Language prudence',
    signalVisual: 'Visual coherence',
    // Status badges
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
    // PRO
    proExplanation: 'PRO Explanation',
    bestEvidence: 'Best Evidence',
    noCorroboration: 'No strong external corroboration was found for this claim.',
    trustHigh: 'High',
    trustMedium: 'Medium',
    trustLow: 'Low',
    openSource: 'Open',
    showAllSources: 'Show all sources',
    hideAllSources: 'Hide additional sources',
    // Image signals
    expertVisualAnalysis: 'Expert Visual Analysis',
    imageProvided: 'Image provided and analyzed',
    visualRelevance: 'Visual Relevance to Claim',
    contextualCoherence: 'Contextual Coherence',
    expertSummary: 'Expert Summary',
    signalsVerified: 'Signals verified:',
    imageIntegrity: 'Image integrity',
    artifacts: 'Artifacts',
    visualContext: 'Visual context',
    metadata: 'Metadata',
    probableOrigin: 'Probable origin',
    scoreImpact: 'Score Impact',
    neutral: 'Neutral',
    minorReinforcement: 'Minor reinforcement',
    negativeImpact: 'Negative impact',
    incoherenceDetected: 'Incoherence detected',
    coherenceConfirmed: 'Coherence confirmed',
    highRelevance: 'High relevance',
    partialRelevance: 'Partial relevance',
    noRelevance: 'No visual relevance',
    coherent: 'Coherent',
    incoherent: 'Incoherent',
    aligned: 'Aligned',
    unrelated: 'Unrelated',
    partial: 'Partial',
    normal: 'Normal',
    suspect: 'Suspect',
    detected: 'Detected',
    none: 'None',
    inconclusive: 'Inconclusive',
    // Image explanations
    imageSupportsContent: 'The image visually supports the claim content.',
    imagePartialConnection: 'The image shows a partial connection to the content.',
    imageNoConnection: 'The image has no visual connection to the claim.',
    coherenceAligned: 'Confirmed alignment between visual content and the claim.',
    coherenceNoContradiction: 'No visual contradiction detected, but without strong confirmation.',
    coherenceNotMatch: 'The image content does not match the subject of the claim.',
    neutralImpactExplain: 'Image analyzed with no critical anomalies. Absence of negative signals is neutral.',
    positiveImpactExplain: 'Visual analysis shows strong coherence with the claim. This slightly reinforces credibility.',
    negativeImpactExplain: 'Visual incoherence detected. The image contradicts or does not match the claim content.',
    positiveNote: 'The image provides minor reinforcement. Visual signals cannot outweigh web corroboration.',
    negativeNote: 'Negative impact detected. However, the image alone cannot invalidate a claim.',
    imageDisclaimer: 'Image analysis is a supporting signal, not proof. It does not replace source verification.',
    defaultExpertSummaryHigh: 'The provided image shows visual coherence with the analyzed content. Visual elements support the claim context.',
    defaultExpertSummaryNone: 'The provided image shows no direct visual connection to the claim. Visual content neither supports nor contradicts the text.',
    defaultExpertSummaryPartial: 'The provided image shows a partial connection to the content. Some visual elements may be relevant but without clear confirmation.',
  },
  fr: {
    summary: 'Résumé',
    confidence: 'Niveau de confiance',
    confidenceLow: 'Faible',
    confidenceMedium: 'Moyen',
    confidenceHigh: 'Élevé',
    // Standard signals
    signalsTitle: 'Signaux de crédibilité évalués',
    signalSource: 'Fiabilité des sources',
    signalFactual: 'Cohérence factuelle',
    signalContext: 'Clarté du contexte',
    signalPrudence: 'Prudence du langage',
    signalVisual: 'Cohérence visuelle',
    // Status badges
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
    // PRO
    proExplanation: 'Explication PRO',
    bestEvidence: 'Meilleures preuves',
    noCorroboration: 'Aucune corroboration externe forte n\'a été trouvée pour cette affirmation.',
    trustHigh: 'Élevée',
    trustMedium: 'Moyenne',
    trustLow: 'Faible',
    openSource: 'Ouvrir',
    showAllSources: 'Voir toutes les sources',
    hideAllSources: 'Masquer les sources supplémentaires',
    // Image signals
    expertVisualAnalysis: 'Analyse Visuelle Expert',
    imageProvided: 'Image fournie et analysée',
    visualRelevance: 'Pertinence visuelle',
    contextualCoherence: 'Cohérence contextuelle',
    expertSummary: 'Synthèse Expert',
    signalsVerified: 'Signaux vérifiés :',
    imageIntegrity: 'Intégrité image',
    artifacts: 'Artefacts',
    visualContext: 'Contexte visuel',
    metadata: 'Métadonnées',
    probableOrigin: 'Origine probable',
    scoreImpact: 'Impact sur le score',
    neutral: 'Neutre',
    minorReinforcement: 'Renforcement mineur',
    negativeImpact: 'Impact négatif',
    incoherenceDetected: 'Incohérence détectée',
    coherenceConfirmed: 'Cohérence confirmée',
    highRelevance: 'Pertinence élevée',
    partialRelevance: 'Pertinence partielle',
    noRelevance: 'Aucune pertinence visuelle',
    coherent: 'Cohérent',
    incoherent: 'Incohérent',
    aligned: 'Aligné',
    unrelated: 'Non lié',
    partial: 'Partiel',
    normal: 'Normal',
    suspect: 'Suspect',
    detected: 'Détectés',
    none: 'Aucun',
    inconclusive: 'Non concluant',
    // Image explanations
    imageSupportsContent: 'L\'image soutient visuellement le contenu de l\'affirmation.',
    imagePartialConnection: 'L\'image présente un lien partiel avec le contenu.',
    imageNoConnection: 'L\'image n\'a pas de rapport visuel avec l\'affirmation.',
    coherenceAligned: 'Alignement confirmé entre le contenu visuel et l\'affirmation.',
    coherenceNoContradiction: 'Aucune contradiction visuelle détectée, mais sans confirmation forte.',
    coherenceNotMatch: 'Le contenu visuel ne correspond pas au sujet de l\'affirmation.',
    neutralImpactExplain: 'Image analysée sans anomalie critique. L\'absence de signaux négatifs est neutre.',
    positiveImpactExplain: 'L\'analyse visuelle montre une forte cohérence avec l\'affirmation. Cela renforce légèrement la crédibilité.',
    negativeImpactExplain: 'Incohérence visuelle détectée. L\'image contredit ou ne correspond pas au contenu de l\'affirmation.',
    positiveNote: 'L\'image fournit un renforcement mineur. Les signaux visuels ne peuvent pas surpasser la corroboration web.',
    negativeNote: 'Impact négatif détecté. Cependant, l\'image seule ne peut pas invalider une affirmation.',
    imageDisclaimer: 'L\'analyse d\'image est un signal de soutien, pas une preuve. Elle ne remplace pas la vérification des sources.',
    defaultExpertSummaryHigh: 'L\'image fournie présente une cohérence visuelle avec le contenu analysé. Les éléments visuels soutiennent le contexte de l\'affirmation.',
    defaultExpertSummaryNone: 'L\'image fournie ne présente pas de lien visuel direct avec l\'affirmation. Le contenu visuel ne soutient pas et ne contredit pas le texte.',
    defaultExpertSummaryPartial: 'L\'image fournie présente un lien partiel avec le contenu. Certains éléments visuels peuvent être pertinents mais sans confirmation claire.',
  },
};

// Helper: extract domain from URL
const getDomainFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

// Helper: derive publisher from domain or source name
const derivePublisher = (name: string, url: string): string => {
  // If name looks like a proper publisher name, use it
  if (name && name.length > 3 && !name.includes('http')) {
    return name;
  }
  // Otherwise derive from domain
  const domain = getDomainFromUrl(url);
  return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
};

// Helper: infer trust tier from source name/domain patterns
const inferTrustTier = (name: string, url: string): 'high' | 'medium' | 'low' => {
  const combined = (name + ' ' + url).toLowerCase();
  
  // High trust: government, major institutions, top-tier media
  const highTrustPatterns = /\.(gov|gouv|edu|int)\b|wikipedia|britannica|reuters|associated\s*press|afp|bbc|cnn|new\s*york\s*times|washington\s*post|wall\s*street|nature\.com|science\.org|pubmed|who\.int|un\.org|nasa|nih|cdc|fda/i;
  if (highTrustPatterns.test(combined)) {
    return 'high';
  }
  
  // Major media patterns
  const majorMediaPatterns = /guardian|telegraph|le\s*monde|figaro|economist|bloomberg|politico|npr|pbs|time\.com|forbes|wired/i;
  if (majorMediaPatterns.test(combined)) {
    return 'medium';
  }
  
  return 'medium'; // Default to medium for unknown sources
};

// Helper: get source name from legacy format
const getSourceName = (source: string | SourceDetail): string => {
  if (typeof source === 'object' && source !== null && 'name' in source) {
    return source.name || '';
  }
  return String(source);
};

// Helper: get source URL from legacy format  
const getSourceUrl = (source: string | SourceDetail): string => {
  if (typeof source === 'object' && source !== null && 'url' in source) {
    return source.url || '';
  }
  return '';
};

// Helper: get source snippet from legacy format
const getSourceSnippet = (source: string | SourceDetail): string => {
  if (typeof source === 'object' && source !== null && 'snippet' in source) {
    return source.snippet || '';
  }
  return '';
};

// Normalize sources from both new and legacy formats into unified EvidenceSource[]
const normalizeEvidenceSources = (data: AnalysisData, language: SupportedLanguage, maxCount?: number): EvidenceSource[] => {
  const sources: EvidenceSource[] = [];
  
  // Priority 1: New format with bestLinks (data.result.bestLinks)
  if (data.result?.bestLinks && Array.isArray(data.result.bestLinks)) {
    for (const src of data.result.bestLinks) {
      if (src.url) {
        sources.push({
          title: src.title || derivePublisher(src.title || '', src.url),
          publisher: src.publisher || derivePublisher('', src.url),
          url: src.url,
          trustTier: src.trustTier || 'medium',
          stance: src.stance,
          whyItMatters: src.whyItMatters || (language === 'fr' 
            ? 'Source consultée pour corroboration.' 
            : 'Source consulted for corroboration.'),
        });
      }
    }
  }
  
  // Priority 2: New format with sources only (data.result.sources)
  if (sources.length === 0 && data.result?.sources && Array.isArray(data.result.sources)) {
    for (const src of data.result.sources) {
      if (src.url) {
        sources.push({
          title: src.title || derivePublisher(src.title || '', src.url),
          publisher: src.publisher || derivePublisher('', src.url),
          url: src.url,
          trustTier: src.trustTier || 'medium',
          stance: src.stance,
          whyItMatters: src.whyItMatters || (language === 'fr' 
            ? 'Source consultée pour corroboration.' 
            : 'Source consulted for corroboration.'),
        });
      }
    }
  }
  
  // Priority 3: Legacy format (data.corroboration.sources)
  if (sources.length === 0 && data.corroboration?.sources) {
    const legacySources = data.corroboration.sources;
    
    // Combine all source types from legacy format
    const allLegacy = [
      ...(legacySources.corroborated || []),
      ...(legacySources.neutral || []),
    ];
    
    for (const src of allLegacy) {
      const name = getSourceName(src);
      const url = getSourceUrl(src);
      const snippet = getSourceSnippet(src);
      
      if (url) {
        sources.push({
          title: name || derivePublisher(name, url),
          publisher: derivePublisher(name, url),
          url,
          trustTier: inferTrustTier(name, url),
          stance: 'corroborating',
          whyItMatters: snippet || (language === 'fr' 
            ? 'Source consultée pour corroboration.' 
            : 'Source consulted for corroboration.'),
        });
      }
    }
  }
  
  // Deduplicate by domain, keeping highest trust tier
  const tierOrder = { high: 0, medium: 1, low: 2 };
  const byDomain = new Map<string, EvidenceSource>();
  
  for (const src of sources) {
    const domain = getDomainFromUrl(src.url);
    const existing = byDomain.get(domain);
    
    if (!existing || tierOrder[src.trustTier] < tierOrder[existing.trustTier]) {
      byDomain.set(domain, src);
    }
  }
  
  // Sort by trust tier (high first) and optionally limit
  const sorted = Array.from(byDomain.values())
    .sort((a, b) => tierOrder[a.trustTier] - tierOrder[b.trustTier]);
    
  return maxCount ? sorted.slice(0, maxCount) : sorted;
};

// Get ALL sources for PRO (up to 10) - combines bestLinks + sources
const getAllProSources = (data: AnalysisData, language: SupportedLanguage): EvidenceSource[] => {
  const allSources: EvidenceSource[] = [];
  const seenUrls = new Set<string>();
  
  // Add bestLinks first (they're the priority)
  if (data.result?.bestLinks && Array.isArray(data.result.bestLinks)) {
    for (const src of data.result.bestLinks) {
      if (src.url && !seenUrls.has(src.url)) {
        seenUrls.add(src.url);
        allSources.push({
          title: src.title || derivePublisher(src.title || '', src.url),
          publisher: src.publisher || derivePublisher('', src.url),
          url: src.url,
          trustTier: src.trustTier || 'medium',
          stance: src.stance,
          whyItMatters: src.whyItMatters || (language === 'fr' 
            ? 'Source consultée pour corroboration.' 
            : 'Source consulted for corroboration.'),
        });
      }
    }
  }
  
  // Add remaining sources
  if (data.result?.sources && Array.isArray(data.result.sources)) {
    for (const src of data.result.sources) {
      if (src.url && !seenUrls.has(src.url)) {
        seenUrls.add(src.url);
        allSources.push({
          title: src.title || derivePublisher(src.title || '', src.url),
          publisher: src.publisher || derivePublisher('', src.url),
          url: src.url,
          trustTier: src.trustTier || 'medium',
          stance: src.stance,
          whyItMatters: src.whyItMatters || (language === 'fr' 
            ? 'Source consultée pour corroboration.' 
            : 'Source consulted for corroboration.'),
        });
      }
    }
  }
  
  return allSources.slice(0, 10);
};

// Trust tier badge styles
const trustTierStyles: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

// Stance badge styles
const stanceBadgeStyles: Record<string, { bg: string; text: string; border: string; labelEn: string; labelFr: string }> = {
  corroborating: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', labelEn: 'Corroborating', labelFr: 'Corrobore' },
  neutral: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', labelEn: 'Neutral', labelFr: 'Neutre' },
  contradicting: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', labelEn: 'Contradicts', labelFr: 'Contredit' },
};

// Get image signals impact color (never red for 0/neutral)
const getImageImpactColor = (impact: number) => {
  if (impact > 0) return 'text-emerald-600';
  if (impact < 0) return 'text-red-600';
  return 'text-slate-500';
};

// Get image signals impact background
const getImageImpactBg = (impact: number) => {
  if (impact > 0) return 'bg-emerald-50 border-emerald-200';
  if (impact < 0) return 'bg-red-50 border-red-200';
  return 'bg-slate-50 border-slate-200';
};

export const AnalysisResult = ({ data, language, articleSummary, hasImage = false }: AnalysisResultProps) => {
  // Fallback to English for unsupported languages in translations
  const t = translations[language] || translations.en;
  const isPro = data.analysisType === 'pro';
  const [showAllSources, setShowAllSources] = useState(false);
  
  // Safe breakdown accessor - PRO responses may not have breakdown
  const breakdown: AnalysisBreakdown = data.breakdown ?? {};
  
  // Normalize evidence sources from both formats
  // bestLinks: max 4 for primary display
  const evidenceSources = isPro ? normalizeEvidenceSources(data, language, 4) : [];
  // allSources: up to 10 for expandable view
  const allProSources = isPro ? getAllProSources(data, language) : [];
  // Additional sources beyond the bestLinks
  const additionalSources = allProSources.slice(evidenceSources.length);
  const hasAdditionalSources = additionalSources.length > 0;

  // Get summary - prefer result.summary for new format
  const summaryText = data.result?.summary || articleSummary || data.summary;

  // Confidence for standard
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

  // Standard signal data
  const standardSignalData = [
    { key: 'sources', label: t.signalSource, points: 0 }, // Always 0 for standard - sources not evaluated
    { key: 'factual', label: t.signalFactual, points: breakdown.factual?.points ?? 0 },
    { key: 'context', label: t.signalContext, points: breakdown.context?.points ?? 0 },
    { key: 'tone', label: t.signalPrudence, points: breakdown.prudence?.points ?? breakdown.tone?.points ?? 0 },
    ...(hasImage ? [{ key: 'visualCoherence', label: t.signalVisual, points: breakdown.visualCoherence?.points ?? 0 }] : []),
  ];

  // Helper function to get confidence status from points
  const getConfidenceStatus = (points: number, key: string) => {
    if (key === 'sources') {
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

      {/* STANDARD: New warm intro section with dynamic summary */}
      {!isPro && (
        <StandardAnalysisIntro language={language} breakdown={breakdown} />
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
        <CommunicationSignals language={language} breakdown={breakdown} />
      )}

      {/* Standard: Source Verification Section */}
      {!isPro && (
        <div className="analysis-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-slate-500" />
            <h3 className="font-serif text-lg font-semibold text-slate-900">
              {language === 'fr' ? 'Vérification des Sources' : 'Source Verification'}
            </h3>
          </div>
          
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {language === 'fr' 
                ? 'L\'analyse Standard se concentre sur les signaux linguistiques et structurels du texte lui-même. La vérification externe des sources et le recoupement sont inclus dans l\'analyse PRO.'
                : 'Standard analysis focuses on linguistic and structural signals within the text itself. External source verification and cross-checking are included in PRO analysis.'}
            </p>
          </div>
        </div>
      )}

      {/* STANDARD: Linguistic Disclaimer before upgrade */}
      {!isPro && (
        <LinguisticDisclaimer language={language} />
      )}

      {/* STANDARD: Upgrade Bridge - soft upsell */}
      {!isPro && (
        <UpgradeBridge language={language} />
      )}

      {/* PRO: Calm Summary Section */}
      {isPro && summaryText && (
        <div 
          className="analysis-card mb-6"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(200 20% 98%) 100%)',
            border: '1px solid hsl(200 40% 88%)',
            boxShadow: '0 4px 24px hsl(200 40% 50% / 0.08), 0 1px 3px hsl(0 0% 0% / 0.05)',
          }}
        >
          <h3 className="font-serif text-lg font-semibold text-slate-900 mb-3">
            {t.proExplanation}
          </h3>
          <p className="text-sm font-medium leading-relaxed text-slate-700">
            {summaryText}
          </p>
        </div>
      )}

      {/* PRO: PRO Highlights Section */}
      {isPro && (
        <ProHighlights language={language} sources={allProSources} />
      )}

      {/* PRO: Verification Coverage Section */}
      {isPro && (
        <VerificationCoverage 
          language={language} 
          sources={allProSources} 
          sourcesConsulted={data.corroboration?.sourcesConsulted}
        />
      )}

      {/* PRO: Best Evidence Section - Premium Deep Links */}
      {isPro && (
        <div 
          className="analysis-card mb-6"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(174 30% 97%) 100%)',
            border: '1px solid hsl(174 40% 85%)',
            boxShadow: '0 4px 24px hsl(174 40% 50% / 0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-teal-600" />
            <h3 className="font-serif text-lg font-semibold text-slate-900">
              {t.bestEvidence}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-center">
                  <p className="text-xs">{language === 'fr' 
                    ? 'Sources directes vérifiées par l\'analyse PRO. Chaque lien mène à la page spécifique contenant les preuves.' 
                    : 'Direct sources verified by PRO analysis. Each link leads to the specific page containing the evidence.'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {evidenceSources.length > 0 ? (
            <div className="space-y-3">
              {/* Primary bestLinks (max 4) */}
              {evidenceSources.map((source, idx) => {
                const tierStyle = trustTierStyles[source.trustTier];
                const tierLabel = source.trustTier === 'high' ? t.trustHigh 
                  : source.trustTier === 'medium' ? t.trustMedium 
                  : t.trustLow;
                
                return (
                  <div 
                    key={idx}
                    className="rounded-xl border bg-white p-4 transition-all hover:shadow-md"
                    style={{
                      borderColor: 'hsl(200 30% 88%)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {/* Trust tier badge */}
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              source.trustTier === 'high' ? 'bg-emerald-500' 
                              : source.trustTier === 'medium' ? 'bg-amber-500' 
                              : 'bg-slate-400'
                            }`} />
                            {tierLabel}
                          </span>
                          
                          {/* Stance badge */}
                          {source.stance && stanceBadgeStyles[source.stance] && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${stanceBadgeStyles[source.stance].bg} ${stanceBadgeStyles[source.stance].text} ${stanceBadgeStyles[source.stance].border}`}>
                              {language === 'fr' ? stanceBadgeStyles[source.stance].labelFr : stanceBadgeStyles[source.stance].labelEn}
                            </span>
                          )}
                        </div>
                        
                        {/* Title - clickable */}
                        <a 
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm font-semibold text-slate-800 hover:text-teal-700 transition-colors line-clamp-2"
                        >
                          {source.title}
                        </a>
                        
                        {/* Publisher */}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {source.publisher}
                        </p>
                        
                        {/* Why it matters */}
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {source.whyItMatters}
                        </p>
                      </div>
                      
                      {/* Open button */}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{
                          background: 'linear-gradient(135deg, hsl(174 60% 45%) 0%, hsl(200 60% 45%) 100%)',
                          boxShadow: '0 2px 8px hsl(174 60% 45% / 0.3)',
                        }}
                      >
                        {t.openSource}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
              
              {/* Expandable additional sources */}
              {hasAdditionalSources && (
                <>
                  <button
                    onClick={() => setShowAllSources(!showAllSources)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors"
                  >
                    {showAllSources ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        {t.hideAllSources}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        {t.showAllSources} ({additionalSources.length})
                      </>
                    )}
                  </button>
                  
                  {/* Additional sources - lighter visual hierarchy */}
                  {showAllSources && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {additionalSources.map((source, idx) => (
                        <div 
                          key={idx}
                          className="rounded-lg border bg-slate-50/50 p-3 transition-all hover:bg-white"
                          style={{
                            borderColor: 'hsl(200 20% 90%)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {/* Compact badges */}
                              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                {source.stance && stanceBadgeStyles[source.stance] && (
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${stanceBadgeStyles[source.stance].bg} ${stanceBadgeStyles[source.stance].text} ${stanceBadgeStyles[source.stance].border}`}>
                                    {language === 'fr' ? stanceBadgeStyles[source.stance].labelFr : stanceBadgeStyles[source.stance].labelEn}
                                  </span>
                                )}
                              </div>
                              
                              {/* Title */}
                              <a 
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs font-semibold text-slate-700 hover:text-teal-600 transition-colors line-clamp-1"
                              >
                                {source.title}
                              </a>
                              
                              {/* Publisher */}
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {source.publisher}
                              </p>
                            </div>
                            
                            {/* Compact open button */}
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-all"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* No sources - calm neutral message */
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t.noCorroboration}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standard: Signal cards with micro-diagnostics */}
      {!isPro && (
        <div className="analysis-card mb-6">
          <h3 className="mb-4 font-serif text-lg font-semibold text-slate-900">
            {t.signalsTitle}
          </h3>
          
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
        </div>
      )}

      {/* PRO Image Signals detailed view - only show when an image was actually provided */}
      {isPro && hasImage && data.imageSignals && (() => {
        const impact = data.imageSignals.scoring?.totalImpact ?? 0;
        const cappedImpact = Math.min(Math.max(impact, -10), 3);
        
        const isPositive = cappedImpact > 0;
        const isNegative = cappedImpact < 0;
        const isNeutral = cappedImpact === 0;
        
        const coherenceClass = data.imageSignals.coherence?.classification?.toLowerCase() || '';
        const getVisualRelevance = () => {
          if (coherenceClass.includes('high') || coherenceClass.includes('strong') || 
              coherenceClass.includes('élevé') || coherenceClass.includes('fort')) {
            return { level: 'high', label: t.highRelevance, color: 'bg-emerald-100 text-emerald-700' };
          }
          if (coherenceClass.includes('low') || coherenceClass.includes('weak') || 
              coherenceClass.includes('faible') || coherenceClass.includes('none') ||
              coherenceClass.includes('aucun') || coherenceClass.includes('unrelated')) {
            return { level: 'none', label: t.noRelevance, color: 'bg-red-100 text-red-700' };
          }
          return { level: 'partial', label: t.partialRelevance, color: 'bg-amber-100 text-amber-700' };
        };
        
        const visualRelevance = getVisualRelevance();
        
        const statusLabel = isNegative ? t.incoherenceDetected
          : isPositive ? t.coherenceConfirmed
          : t.neutral;
        
        const impactDisplayText = isNeutral ? t.neutral
          : isPositive ? t.minorReinforcement
          : t.negativeImpact;
        
        const getExpertSummary = () => {
          const explanation = data.imageSignals?.coherence?.explanation;
          if (explanation) return explanation;
          
          if (visualRelevance.level === 'high') return t.defaultExpertSummaryHigh;
          if (visualRelevance.level === 'none') return t.defaultExpertSummaryNone;
          return t.defaultExpertSummaryPartial;
        };
        
        return (
          <div className="analysis-card mt-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-cyan-600" />
                <h3 className="font-serif text-lg font-semibold text-slate-900">
                  {t.expertVisualAnalysis}
                </h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                isNegative ? 'bg-red-100 text-red-700' :
                isPositive ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {statusLabel}
              </span>
            </div>
            
            {/* Image presence acknowledgment */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-cyan-50 border border-cyan-200/60 px-3 py-2">
              <CheckCircle className="h-4 w-4 text-cyan-600 flex-shrink-0" />
              <span className="text-sm font-medium text-cyan-800">
                {t.imageProvided}
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Visual Relevance */}
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 border border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{t.visualRelevance}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${visualRelevance.color}`}>
                    {visualRelevance.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {visualRelevance.level === 'high' ? t.imageSupportsContent
                    : visualRelevance.level === 'none' ? t.imageNoConnection
                    : t.imagePartialConnection}
                </p>
              </div>
              
              {/* Contextual Coherence */}
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 border border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{t.contextualCoherence}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isNegative ? 'bg-red-100 text-red-700' :
                    isPositive ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {isNegative ? t.incoherent : isPositive ? t.coherent : t.neutral}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isNegative ? t.coherenceNotMatch
                    : isPositive ? t.coherenceAligned
                    : t.coherenceNoContradiction}
                </p>
              </div>
              
              {/* Expert Summary */}
              <div className="rounded-lg bg-cyan-50/50 border border-cyan-200/40 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-cyan-800 mb-1">{t.expertSummary}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{getExpertSummary()}</p>
                  </div>
                </div>
              </div>

              {/* Verified signals checklist */}
              <div className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 border border-slate-200/60">
                <p className="text-xs font-semibold text-slate-600 mb-2.5">{t.signalsVerified}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${isNegative ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    <span className="text-xs text-slate-600">{t.imageIntegrity}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {isNegative ? t.suspect : t.normal}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      data.imageSignals.scoring && data.imageSignals.scoring.totalImpact < -3 ? 'bg-red-400' : 'bg-emerald-400'
                    }`} />
                    <span className="text-xs text-slate-600">{t.artifacts}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {data.imageSignals.scoring && data.imageSignals.scoring.totalImpact < -3 ? t.detected : t.none}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      visualRelevance.level === 'high' ? 'bg-emerald-400' 
                        : visualRelevance.level === 'none' ? 'bg-red-400'
                        : 'bg-amber-400'
                    }`} />
                    <span className="text-xs text-slate-600">{t.visualContext}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {visualRelevance.level === 'high' ? t.aligned
                        : visualRelevance.level === 'none' ? t.unrelated
                        : t.partial}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="text-xs text-slate-600">{t.metadata}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{t.inconclusive}</span>
                  </div>
                </div>
              </div>

              {/* Origin */}
              {data.imageSignals.origin && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{t.probableOrigin}</span>
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

              {/* Score Impact */}
              <div className={`rounded-lg border p-3 ${getImageImpactBg(cappedImpact)}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{t.scoreImpact}</span>
                  <span className={`font-mono text-sm font-bold ${getImageImpactColor(cappedImpact)}`}>
                    {impactDisplayText}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isNeutral ? t.neutralImpactExplain
                    : isPositive ? t.positiveImpactExplain
                    : t.negativeImpactExplain}
                </p>
                {isPositive && (
                  <p className="text-[10px] text-emerald-600/70 mt-1.5 italic">{t.positiveNote}</p>
                )}
                {isNegative && (
                  <p className="text-[10px] text-red-600/70 mt-1.5 italic">{t.negativeNote}</p>
                )}
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] italic text-slate-400">
                {data.imageSignals.disclaimer || t.imageDisclaimer}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
