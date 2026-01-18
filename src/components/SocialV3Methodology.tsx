import { 
  Eye, 
  Volume2,
  Shield,
  Radar as RadarIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SocialV3MethodologyProps {
  language: 'en' | 'fr';
  transparency?: {
    mode: string;
    combined_text_length?: number;
    extracted_text_length?: number; // backward compatibility
    text_sources?: string[];
    detected_links_count: number;
    visual_present?: boolean;
    platform: string;
    signals_applied?: number;
    dynamic_base?: number;
    layer_weights?: {
      access: number;
      language: number;
      evidence: number;
      technical: number;
    };
  };
  subScores?: {
    content_access?: number;
    language_quality?: number;
    evidence_strength?: number;
    technical_risk?: number;
  };
  layerAnalysis?: {
    access_context?: { score: number; signals: string[] };
    language_quality?: { score: number; signals: string[] };
    evidence_strength?: { score: number; signals: string[] };
    technical_risk?: { score: number; signals: string[] };
  };
}

const translations = {
  en: {
    title: 'Social URL v4 Methodology',
    subtitle: 'Layered Synthesis Credibility Scoring',
    textLength: 'Text Length',
    linksDetected: 'Links Detected',
    visualPresent: 'Visual Present',
    textSources: 'Text Sources',
    yes: 'Yes',
    no: 'No',
    chars: 'chars',
    // Layer Labels
    accessLayer: 'Access & Context',
    languageLayer: 'Language Quality',
    evidenceLayer: 'Evidence Strength',
    technicalLayer: 'Technical Risk',
    // SubScores
    contentAccess: 'Content Access',
    languageQuality: 'Language Quality',
    evidenceStrength: 'Evidence Strength',
    technicalRisk: 'Technical Risk',
    showDetails: 'Show layer analysis details',
    hideDetails: 'Hide details',
    textBasedNote: 'Full text analysis - all layers active',
    limitedNote: 'Limited signal mode - degraded language layer',
    languageUnavailable: 'Language signals unavailable due to access limits',
    layerSynthesis: 'Layered Synthesis',
    weightedCombination: 'Weighted combination of 4 layers',
    mode: 'Mode',
    platform: 'Platform',
    weight: 'Weight',
    layerScore: 'Layer Score',
    signalsAnalyzed: 'Signals Analyzed',
  },
  fr: {
    title: 'Méthodologie Social URL v4',
    subtitle: 'Score de Crédibilité par Synthèse en Couches',
    textLength: 'Longueur du texte',
    linksDetected: 'Liens détectés',
    visualPresent: 'Visuel présent',
    textSources: 'Sources de texte',
    yes: 'Oui',
    no: 'Non',
    chars: 'car.',
    // Layer Labels
    accessLayer: 'Accès & Contexte',
    languageLayer: 'Qualité du Langage',
    evidenceLayer: 'Force des Preuves',
    technicalLayer: 'Risque Technique',
    // SubScores
    contentAccess: 'Accès au Contenu',
    languageQuality: 'Qualité du Langage',
    evidenceStrength: 'Force des Preuves',
    technicalRisk: 'Risque Technique',
    showDetails: 'Voir les détails d\'analyse par couche',
    hideDetails: 'Masquer les détails',
    textBasedNote: 'Analyse textuelle complète - toutes les couches actives',
    limitedNote: 'Mode signaux limités - couche langage dégradée',
    languageUnavailable: 'Signaux linguistiques indisponibles en raison des limitations d\'accès',
    layerSynthesis: 'Synthèse en Couches',
    weightedCombination: 'Combinaison pondérée de 4 couches',
    mode: 'Mode',
    platform: 'Plateforme',
    weight: 'Poids',
    layerScore: 'Score Couche',
    signalsAnalyzed: 'Signaux Analysés',
  },
};

// Layer definitions for v4 methodology
const layerDefinitions = [
  { key: 'access', weight: 0.30, icon: Eye, subScoreKey: 'content_access' },
  { key: 'language', weight: 0.25, icon: Volume2, subScoreKey: 'language_quality' },
  { key: 'evidence', weight: 0.25, icon: Shield, subScoreKey: 'evidence_strength' },
  { key: 'technical', weight: 0.20, icon: RadarIcon, subScoreKey: 'technical_risk' },
];

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-cyan-400';
  if (score >= 50) return 'text-teal-400';
  if (score >= 35) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBgColor = (score: number) => {
  if (score >= 70) return 'bg-cyan-500/20 border-cyan-500/30';
  if (score >= 50) return 'bg-teal-500/20 border-teal-500/30';
  if (score >= 35) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-red-500/20 border-red-500/30';
};

const getProgressColor = (score: number) => {
  if (score >= 70) return 'bg-cyan-500';
  if (score >= 50) return 'bg-teal-500';
  if (score >= 35) return 'bg-amber-500';
  return 'bg-red-500';
};

export const SocialV3Methodology = ({ language, transparency, subScores, layerAnalysis }: SocialV3MethodologyProps) => {
  const t = translations[language];
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isTextBased = transparency?.mode === 'TEXT_BASED';
  const platform = transparency?.platform || 'other';
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
  
  // Get text length with backward compatibility
  const textLength = transparency?.combined_text_length ?? transparency?.extracted_text_length ?? 0;

  // Layer labels for display
  const layerLabels: Record<string, string> = {
    access: t.accessLayer,
    language: t.languageLayer,
    evidence: t.evidenceLayer,
    technical: t.technicalLayer,
  };

  // SubScore cards data
  const subScoreCards = [
    { key: 'content_access', label: t.contentAccess, value: subScores?.content_access ?? 50, icon: Eye, layerKey: 'access_context' },
    { key: 'language_quality', label: t.languageQuality, value: subScores?.language_quality ?? 50, icon: Volume2, layerKey: 'language_quality' },
    { key: 'evidence_strength', label: t.evidenceStrength, value: subScores?.evidence_strength ?? 50, icon: Shield, layerKey: 'evidence_strength' },
    { key: 'technical_risk', label: t.technicalRisk, value: subScores?.technical_risk ?? 50, icon: RadarIcon, layerKey: 'technical_risk' },
  ];

  // Radar chart data
  const radarData = subScoreCards.map(card => ({
    subject: card.label,
    value: card.value,
    fullMark: 100,
  }));

  // Get color based on average score
  const avgScore = subScoreCards.reduce((acc, card) => acc + card.value, 0) / subScoreCards.length;
  const getRadarColor = () => {
    if (avgScore >= 70) return { fill: 'rgba(34, 211, 238, 0.3)', stroke: 'hsl(185, 84%, 53%)' }; // cyan
    if (avgScore >= 50) return { fill: 'rgba(45, 212, 191, 0.3)', stroke: 'hsl(168, 71%, 51%)' }; // teal
    if (avgScore >= 35) return { fill: 'rgba(251, 191, 36, 0.3)', stroke: 'hsl(43, 96%, 56%)' }; // amber
    return { fill: 'rgba(248, 113, 113, 0.3)', stroke: 'hsl(0, 91%, 71%)' }; // red
  };
  const radarColors = getRadarColor();

  // Get layer weights with defaults
  const layerWeights = transparency?.layer_weights ?? { access: 0.30, language: 0.25, evidence: 0.25, technical: 0.20 };

  return (
    <div className="analysis-card mb-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-slate-900">{t.title}</h3>
          <p className="text-xs text-slate-500">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {platformLabel}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isTextBased ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
            {transparency?.mode || 'LIMITED_SIGNAL'}
          </span>
        </div>
      </div>

      {/* Transparency Stats - Updated for v4 Layered Synthesis */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <div className="text-lg font-bold text-slate-900">{textLength}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.textLength}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <div className="text-lg font-bold text-slate-900">{transparency?.detected_links_count ?? 0}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.linksDetected}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <div className="text-lg font-bold text-slate-900">{transparency?.visual_present ? t.yes : t.no}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.visualPresent}</div>
        </div>
        {transparency?.text_sources && transparency.text_sources.length > 0 && (
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <div className="text-sm font-bold text-slate-900">{transparency.text_sources.join(', ')}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.textSources}</div>
          </div>
        )}
      </div>

      {/* Layer Weights Visualization */}
      <div className="mb-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{t.layerSynthesis}</span>
        </div>
        <p className="text-xs text-slate-600 mb-3">{t.weightedCombination}</p>
        <div className="flex gap-2 flex-wrap">
          {layerDefinitions.map((layer) => (
            <div key={layer.key} className="flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs">
              <layer.icon className="h-3 w-3 text-primary" />
              <span className="font-medium text-slate-700">{layerLabels[layer.key]}</span>
              <span className="text-primary font-bold">{Math.round(layerWeights[layer.key as keyof typeof layerWeights] * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mode indicator with language unavailable note for LIMITED_SIGNAL */}
      <div className={`mb-4 rounded-lg p-3 ${isTextBased ? 'bg-teal-50 border border-teal-200' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-center gap-2">
          <Info className={`h-4 w-4 ${isTextBased ? 'text-teal-600' : 'text-amber-600'}`} />
          <span className={`text-sm font-medium ${isTextBased ? 'text-teal-800' : 'text-amber-800'}`}>
            {isTextBased ? t.textBasedNote : t.limitedNote}
          </span>
        </div>
        {!isTextBased && (
          <p className="mt-2 text-xs text-amber-700 italic pl-6">
            {t.languageUnavailable}
          </p>
        )}
      </div>

      {/* Radar Chart for SubScores */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-full max-w-[280px] h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
              />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: 10,
                  fontWeight: 500
                }}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                tickCount={5}
                axisLine={false}
              />
              <Radar
                name={language === 'fr' ? 'Score' : 'Score'}
                dataKey="value"
                stroke={radarColors.stroke}
                fill={radarColors.fill}
                strokeWidth={2}
                dot={{ r: 4, fill: radarColors.stroke }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
                formatter={(value: number) => [`${value}/100`, language === 'fr' ? 'Score' : 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-1">
          {language === 'fr' ? 'Vue radar des 4 couches de crédibilité' : 'Radar view of 4 credibility layers'}
        </p>
      </div>

      {/* SubScores Grid - With degraded indicator for LIMITED_SIGNAL language */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {subScoreCards.map((card) => {
          const IconComponent = card.icon;
          const isLanguageDegraded = card.key === 'language_quality' && !isTextBased && card.value === 40;
          const layerWeight = layerDefinitions.find(l => l.subScoreKey === card.key)?.weight ?? 0;
          return (
            <div 
              key={card.key}
              className={`rounded-xl border p-4 ${getScoreBgColor(card.value)} ${isLanguageDegraded ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${getScoreColor(card.value)}`} />
                  <span className="text-xs font-semibold text-slate-700">{card.label}</span>
                </div>
                <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                  {Math.round(layerWeight * 100)}%
                </span>
              </div>
              {isLanguageDegraded && (
                <span className="inline-block mb-2 rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-medium text-amber-800">
                  {language === 'fr' ? 'dégradé' : 'degraded'}
                </span>
              )}
              <div className="mb-2 flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${getScoreColor(card.value)}`}>{card.value}</span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div 
                  className={`h-full rounded-full transition-all ${getProgressColor(card.value)}`}
                  style={{ width: `${card.value}%` }}
                />
              </div>
              {isLanguageDegraded && (
                <p className="mt-2 text-[10px] text-amber-700 italic">
                  {language === 'fr' ? 'Valeur neutre dégradée (données indisponibles)' : 'Degraded neutral value (data unavailable)'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse for layer details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            {t.hideDetails}
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            {t.showDetails}
          </>
        )}
      </button>

      {/* Detailed Layer Analysis (collapsible) */}
      {isExpanded && layerAnalysis && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {subScoreCards.map((card) => {
            const IconComponent = card.icon;
            const layerData = layerAnalysis[card.layerKey as keyof typeof layerAnalysis];
            const isLanguageLayer = card.key === 'language_quality';
            const isDegraded = isLanguageLayer && !isTextBased;
            
            return (
              <div key={card.key} className={`rounded-lg border p-4 ${isDegraded ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${isDegraded ? 'text-amber-600' : 'text-primary'}`} />
                    <h4 className="text-sm font-semibold text-slate-800">{card.label}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getScoreColor(layerData?.score ?? card.value)}`}>
                      {layerData?.score ?? card.value}
                    </span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>
                
                {isDegraded && (
                  <p className="mb-3 text-xs italic text-amber-700">
                    {t.languageUnavailable}
                  </p>
                )}
                
                {layerData?.signals && layerData.signals.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">{t.signalsAnalyzed}</p>
                    <ul className="space-y-1">
                      {layerData.signals.map((signal, idx) => (
                        <li key={idx} className="text-xs text-slate-600 pl-3 border-l-2 border-slate-300">
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {/* Synthesis explanation */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-start gap-2">
              <Layers className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold text-primary">
                  {language === 'fr' ? 'Synthèse Finale' : 'Final Synthesis'}
                </p>
                <p className="text-xs text-slate-700">
                  {language === 'fr' 
                    ? `Score = (Accès × ${Math.round(layerWeights.access * 100)}%) + (Langage × ${Math.round(layerWeights.language * 100)}%) + (Preuves × ${Math.round(layerWeights.evidence * 100)}%) + (Technique × ${Math.round(layerWeights.technical * 100)}%), limité à 25-70.`
                    : `Score = (Access × ${Math.round(layerWeights.access * 100)}%) + (Language × ${Math.round(layerWeights.language * 100)}%) + (Evidence × ${Math.round(layerWeights.evidence * 100)}%) + (Technical × ${Math.round(layerWeights.technical * 100)}%), clamped to 25-70.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show simplified message when no layer analysis data but expanded */}
      {isExpanded && !layerAnalysis && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">
            {language === 'fr' 
              ? 'Les détails d\'analyse par couche seront affichés ici lors des prochaines analyses.'
              : 'Layer analysis details will be displayed here in future analyses.'}
          </p>
        </div>
      )}
    </div>
  );
};
