import { 
  Eye, 
  MessageSquare, 
  FileText, 
  Image, 
  User,
  Volume2,
  Heart,
  AlertTriangle,
  BookOpen,
  AlignLeft,
  Link2,
  Shield,
  Layers,
  Radar as RadarIcon,
  Sparkles,
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
    extracted_text_length: number;
    detected_links_count: number;
    visual_present?: boolean;
    platform: string;
    signals_applied?: number;
    dynamic_base?: number;
  };
  subScores?: {
    content_access?: number;
    language_quality?: number;
    evidence_strength?: number;
    technical_risk?: number;
  };
}

const translations = {
  en: {
    title: 'Social URL v3 Methodology',
    subtitle: '15 Weighted Credibility Signals',
    baseScore: 'Dynamic Base',
    dynamicRange: '45-55 range',
    signalsApplied: 'Signals Applied',
    minRequired: 'min 6 required',
    finalScore: 'Final Score',
    clamped: 'clamped 25-70',
    mode: 'Mode',
    platform: 'Platform',
    textLength: 'Text Length',
    linksDetected: 'Links Detected',
    visualPresent: 'Visual Present',
    yes: 'Yes',
    no: 'No',
    chars: 'chars',
    // Categories
    accessContext: 'Access & Context',
    languageForm: 'Language & Form',
    evidenceTechnical: 'Evidence & Technical',
    imageAI: 'Image AI (Light)',
    // Signals
    signal1: 'Content accessibility',
    signal2: 'Post type inference',
    signal3: 'Text length',
    signal4: 'Visual presence',
    signal5: 'Account type inference',
    signal6: 'Neutral/informational tone',
    signal7: 'Emotional language',
    signal8: 'Alarmist/manipulative',
    signal9: 'Nuanced language',
    signal10: 'Clear structure',
    signal11: 'Links detected',
    signal12: 'Platform restriction',
    signal13: 'Consistency inference',
    signal14: 'URL technical risk',
    signal15: 'Visual credibility',
    // SubScores
    contentAccess: 'Content Access',
    languageQuality: 'Language Quality',
    evidenceStrength: 'Evidence Strength',
    technicalRisk: 'Technical Risk',
    showDetails: 'Show methodology details',
    hideDetails: 'Hide details',
    textBasedNote: 'Full text analysis applied',
    limitedNote: 'Limited signals mode (6+ signals active)',
    languageUnavailable: 'Language signals unavailable due to access limits',
  },
  fr: {
    title: 'Méthodologie Social URL v3',
    subtitle: '15 Signaux de Crédibilité Pondérés',
    baseScore: 'Base Dynamique',
    dynamicRange: 'plage 45-55',
    signalsApplied: 'Signaux Appliqués',
    minRequired: 'min 6 requis',
    finalScore: 'Score final',
    clamped: 'limité 25-70',
    mode: 'Mode',
    platform: 'Plateforme',
    textLength: 'Longueur du texte',
    linksDetected: 'Liens détectés',
    visualPresent: 'Visuel présent',
    yes: 'Oui',
    no: 'Non',
    chars: 'car.',
    // Categories
    accessContext: 'Accès & Contexte',
    languageForm: 'Langage & Forme',
    evidenceTechnical: 'Preuves & Technique',
    imageAI: 'Image IA (Léger)',
    // Signals
    signal1: 'Accessibilité du contenu',
    signal2: 'Inférence type publication',
    signal3: 'Longueur du texte',
    signal4: 'Présence visuelle',
    signal5: 'Inférence type de compte',
    signal6: 'Ton neutre/informatif',
    signal7: 'Langage émotionnel',
    signal8: 'Alarmiste/manipulateur',
    signal9: 'Langage nuancé',
    signal10: 'Structure claire',
    signal11: 'Liens détectés',
    signal12: 'Restriction plateforme',
    signal13: 'Inférence cohérence',
    signal14: 'Risque technique URL',
    signal15: 'Crédibilité visuelle',
    // SubScores
    contentAccess: 'Accès au Contenu',
    languageQuality: 'Qualité du Langage',
    evidenceStrength: 'Force des Preuves',
    technicalRisk: 'Risque Technique',
    showDetails: 'Voir les détails méthodologiques',
    hideDetails: 'Masquer les détails',
    textBasedNote: 'Analyse textuelle complète appliquée',
    limitedNote: 'Mode signaux limités (6+ signaux actifs)',
    languageUnavailable: 'Signaux linguistiques indisponibles en raison des limitations d\'accès',
  },
};

// Signal definitions with weights - SOFT RECALIBRATION (balanced, non-punitive)
const signalDefinitions = [
  // Access & Context (1-5)
  { id: 1, category: 'access', icon: Eye, weights: { positive: '+4', negative: '-2' }, textBasedOnly: false, limitedActive: true },
  { id: 2, category: 'access', icon: FileText, weights: { positive: '+3', negative: '-1' }, textBasedOnly: false, limitedActive: true },
  { id: 3, category: 'access', icon: MessageSquare, weights: { positive: '+3', negative: '-2' }, textBasedOnly: false, limitedActive: true },
  { id: 4, category: 'access', icon: Image, weights: { positive: '+3', negative: '0' }, textBasedOnly: false, limitedActive: false },
  { id: 5, category: 'access', icon: User, weights: { positive: '+3', negative: '0' }, textBasedOnly: false, limitedActive: false },
  // Language & Form (6-10) - TEXT_BASED only, degraded to 40/100 in LIMITED_SIGNAL
  { id: 6, category: 'language', icon: Volume2, weights: { positive: '+3', negative: '' }, textBasedOnly: true, limitedActive: false },
  { id: 7, category: 'language', icon: Heart, weights: { positive: '', negative: '-2' }, textBasedOnly: true, limitedActive: false },
  { id: 8, category: 'language', icon: AlertTriangle, weights: { positive: '', negative: '-4' }, textBasedOnly: true, limitedActive: false },
  { id: 9, category: 'language', icon: BookOpen, weights: { positive: '+2', negative: '' }, textBasedOnly: true, limitedActive: false },
  { id: 10, category: 'language', icon: AlignLeft, weights: { positive: '+2', negative: '' }, textBasedOnly: true, limitedActive: false },
  // Evidence & Technical (11-14) - All active in LIMITED_SIGNAL (SOFT weights)
  { id: 11, category: 'evidence', icon: Link2, weights: { positive: '+2', negative: '-1' }, textBasedOnly: false, limitedActive: true },
  { id: 12, category: 'evidence', icon: Shield, weights: { positive: '0', negative: '-1' }, textBasedOnly: false, limitedActive: true },
  { id: 13, category: 'evidence', icon: Layers, weights: { positive: '+3', negative: '-1' }, textBasedOnly: false, limitedActive: true },
  { id: 14, category: 'evidence', icon: RadarIcon, weights: { positive: '+2', negative: '-3' }, textBasedOnly: false, limitedActive: true },
  // Image AI (15) - SOFT recalibration
  { id: 15, category: 'image', icon: Sparkles, weights: { positive: '+3', negative: '-4' }, textBasedOnly: false, limitedActive: false },
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

export const SocialV3Methodology = ({ language, transparency, subScores }: SocialV3MethodologyProps) => {
  const t = translations[language];
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isTextBased = transparency?.mode === 'TEXT_BASED';
  const platform = transparency?.platform || 'other';
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  // SubScore cards data
  const subScoreCards = [
    { key: 'content_access', label: t.contentAccess, value: subScores?.content_access ?? 50, icon: Eye },
    { key: 'language_quality', label: t.languageQuality, value: subScores?.language_quality ?? 50, icon: Volume2 },
    { key: 'evidence_strength', label: t.evidenceStrength, value: subScores?.evidence_strength ?? 50, icon: Shield },
    { key: 'technical_risk', label: t.technicalRisk, value: subScores?.technical_risk ?? 50, icon: RadarIcon },
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

  // Category groups for signals
  const categoryGroups = [
    { key: 'access', label: t.accessContext, signals: signalDefinitions.filter(s => s.category === 'access') },
    { key: 'language', label: t.languageForm, signals: signalDefinitions.filter(s => s.category === 'language'), textBasedOnly: true },
    { key: 'evidence', label: t.evidenceTechnical, signals: signalDefinitions.filter(s => s.category === 'evidence') },
    { key: 'image', label: t.imageAI, signals: signalDefinitions.filter(s => s.category === 'image') },
  ];

  const signalLabels: Record<number, string> = {
    1: t.signal1, 2: t.signal2, 3: t.signal3, 4: t.signal4, 5: t.signal5,
    6: t.signal6, 7: t.signal7, 8: t.signal8, 9: t.signal9, 10: t.signal10,
    11: t.signal11, 12: t.signal12, 13: t.signal13, 14: t.signal14, 15: t.signal15,
  };

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

      {/* Transparency Stats - Updated for Dynamic Base & Signals Applied */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <div className="text-lg font-bold text-slate-900">{transparency?.extracted_text_length ?? 0}</div>
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
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-3 text-center">
          <div className="text-lg font-bold text-primary">{transparency?.dynamic_base ?? 47}</div>
          <div className="text-[10px] uppercase tracking-wide text-primary/70">{t.baseScore}</div>
          <div className="text-[9px] text-slate-400">{t.dynamicRange}</div>
        </div>
        <div className={`rounded-lg p-3 text-center ${(transparency?.signals_applied ?? 0) >= 6 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className={`text-lg font-bold ${(transparency?.signals_applied ?? 0) >= 6 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {transparency?.signals_applied ?? 6}
          </div>
          <div className={`text-[10px] uppercase tracking-wide ${(transparency?.signals_applied ?? 0) >= 6 ? 'text-emerald-600/70' : 'text-amber-600/70'}`}>
            {t.signalsApplied}
          </div>
          <div className="text-[9px] text-slate-400">{t.minRequired}</div>
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
          {language === 'fr' ? 'Vue radar des 4 sous-scores de crédibilité' : 'Radar view of 4 credibility sub-scores'}
        </p>
      </div>

      {/* SubScores Grid - With degraded indicator for LIMITED_SIGNAL language */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {subScoreCards.map((card) => {
          const IconComponent = card.icon;
          const isLanguageDegraded = card.key === 'language_quality' && !isTextBased && card.value === 40;
          return (
            <div 
              key={card.key}
              className={`rounded-xl border p-4 ${getScoreBgColor(card.value)} ${isLanguageDegraded ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <IconComponent className={`h-4 w-4 ${getScoreColor(card.value)}`} />
                <span className="text-xs font-semibold text-slate-700">{card.label}</span>
                {isLanguageDegraded && (
                  <span className="ml-auto rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-medium text-amber-800">
                    {language === 'fr' ? 'dégradé' : 'degraded'}
                  </span>
                )}
              </div>
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

      {/* Expand/Collapse for signal details */}
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

      {/* Detailed Signals (collapsible) */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {categoryGroups.map((group) => {
            const isLanguageGroup = group.key === 'language';
            const isDisabled = group.textBasedOnly && !isTextBased;
            return (
              <div key={group.key}>
                <div className="mb-2 flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">{group.label}</h4>
                  {isDisabled && isLanguageGroup && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      40/100 {language === 'fr' ? 'par défaut' : 'default'}
                    </span>
                  )}
                </div>
                {isDisabled && (
                  <p className="mb-2 text-xs italic text-slate-500">
                    {isLanguageGroup
                      ? (language === 'fr' ? 'Signaux non mesurables - valeur neutre dégradée appliquée' : 'Signals not measurable - degraded neutral value applied')
                      : (language === 'fr' ? 'Non applicable en mode LIMITED_SIGNAL' : 'Not applicable in LIMITED_SIGNAL mode')}
                  </p>
                )}
                <div className="space-y-1.5">
                  {group.signals.map((signal) => {
                    const IconComponent = signal.icon;
                    const isActiveInLimited = signal.limitedActive && !isTextBased;
                    return (
                      <div
                        key={signal.id}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                          isActiveInLimited 
                            ? 'bg-emerald-50 border border-emerald-200' 
                            : isDisabled 
                              ? 'bg-slate-100 opacity-50' 
                              : 'bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full shadow-sm ${
                            isActiveInLimited ? 'bg-emerald-100' : 'bg-white'
                          }`}>
                            <IconComponent className={`h-3.5 w-3.5 ${isActiveInLimited ? 'text-emerald-600' : 'text-slate-600'}`} />
                          </div>
                          <span className="text-xs font-medium text-slate-700">
                            <span className="mr-1 text-slate-400">#{signal.id}</span>
                            {signalLabels[signal.id]}
                          </span>
                          {isActiveInLimited && (
                            <span className="rounded-full bg-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                              {language === 'fr' ? 'ACTIF' : 'ACTIVE'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {signal.weights.positive && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              {signal.weights.positive}
                            </span>
                          )}
                          {signal.weights.negative && signal.weights.negative !== '0' && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                              {signal.weights.negative}
                            </span>
                          )}
                          {signal.weights.negative === '0' && !signal.weights.positive && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                              0
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Image AI constraint note */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-amber-600" />
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  {language === 'fr' ? 'Contrainte Image IA' : 'Image AI Constraint'}
                </p>
                <p className="text-xs text-amber-700">
                  {language === 'fr' 
                    ? 'Impact image limité à ±4 points maximum. Si aucun visuel détecté : 0 points.'
                    : 'Image impact capped at ±4 points maximum. If no visual detected: 0 points.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
