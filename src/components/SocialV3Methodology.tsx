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
  Radar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useState } from 'react';

interface SocialV3MethodologyProps {
  language: 'en' | 'fr';
  transparency?: {
    mode: string;
    extracted_text_length: number;
    detected_links_count: number;
    visual_present?: boolean;
    platform: string;
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
    baseScore: 'Base Score',
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
    signal2: 'Post type',
    signal3: 'Text length',
    signal4: 'Visual present',
    signal5: 'Account type',
    signal6: 'Neutral/informational tone',
    signal7: 'Emotional language',
    signal8: 'Alarmist/manipulative',
    signal9: 'Nuanced language',
    signal10: 'Clear structure',
    signal11: 'Real links detected',
    signal12: 'Link quality',
    signal13: 'Consistency',
    signal14: 'Technical risk',
    signal15: 'Visual credibility',
    // SubScores
    contentAccess: 'Content Access',
    languageQuality: 'Language Quality',
    evidenceStrength: 'Evidence Strength',
    technicalRisk: 'Technical Risk',
    showDetails: 'Show methodology details',
    hideDetails: 'Hide details',
    textBasedNote: 'Full text analysis applied',
    limitedNote: 'Limited signals only (content not accessible)',
  },
  fr: {
    title: 'Méthodologie Social URL v3',
    subtitle: '15 Signaux de Crédibilité Pondérés',
    baseScore: 'Score de base',
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
    signal2: 'Type de publication',
    signal3: 'Longueur du texte',
    signal4: 'Visuel présent',
    signal5: 'Type de compte',
    signal6: 'Ton neutre/informatif',
    signal7: 'Langage émotionnel',
    signal8: 'Alarmiste/manipulateur',
    signal9: 'Langage nuancé',
    signal10: 'Structure claire',
    signal11: 'Liens réels détectés',
    signal12: 'Qualité des liens',
    signal13: 'Cohérence',
    signal14: 'Risque technique',
    signal15: 'Crédibilité visuelle',
    // SubScores
    contentAccess: 'Accès au Contenu',
    languageQuality: 'Qualité du Langage',
    evidenceStrength: 'Force des Preuves',
    technicalRisk: 'Risque Technique',
    showDetails: 'Voir les détails méthodologiques',
    hideDetails: 'Masquer les détails',
    textBasedNote: 'Analyse textuelle complète appliquée',
    limitedNote: 'Signaux limités uniquement (contenu non accessible)',
  },
};

// Signal definitions with weights
const signalDefinitions = [
  // Access & Context (1-5)
  { id: 1, category: 'access', icon: Eye, weights: { positive: '+4', negative: '-2' }, textBasedOnly: false },
  { id: 2, category: 'access', icon: FileText, weights: { positive: '+3', negative: '-1' }, textBasedOnly: false },
  { id: 3, category: 'access', icon: MessageSquare, weights: { positive: '+3', negative: '-2' }, textBasedOnly: false },
  { id: 4, category: 'access', icon: Image, weights: { positive: '+2', negative: '0' }, textBasedOnly: false },
  { id: 5, category: 'access', icon: User, weights: { positive: '+3', negative: '0' }, textBasedOnly: false },
  // Language & Form (6-10) - TEXT_BASED only
  { id: 6, category: 'language', icon: Volume2, weights: { positive: '+3', negative: '' }, textBasedOnly: true },
  { id: 7, category: 'language', icon: Heart, weights: { positive: '', negative: '-2' }, textBasedOnly: true },
  { id: 8, category: 'language', icon: AlertTriangle, weights: { positive: '', negative: '-4' }, textBasedOnly: true },
  { id: 9, category: 'language', icon: BookOpen, weights: { positive: '+2', negative: '' }, textBasedOnly: true },
  { id: 10, category: 'language', icon: AlignLeft, weights: { positive: '+2', negative: '' }, textBasedOnly: true },
  // Evidence & Technical (11-14)
  { id: 11, category: 'evidence', icon: Link2, weights: { positive: '+2', negative: '0' }, textBasedOnly: false },
  { id: 12, category: 'evidence', icon: Shield, weights: { positive: '+4', negative: '-4' }, textBasedOnly: false },
  { id: 13, category: 'evidence', icon: Layers, weights: { positive: '+3', negative: '-3' }, textBasedOnly: false },
  { id: 14, category: 'evidence', icon: Radar, weights: { positive: '0', negative: '-3' }, textBasedOnly: false },
  // Image AI (15)
  { id: 15, category: 'image', icon: Sparkles, weights: { positive: '+2', negative: '-4' }, textBasedOnly: false },
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
    { key: 'technical_risk', label: t.technicalRisk, value: subScores?.technical_risk ?? 50, icon: Radar },
  ];

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

      {/* Transparency Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <div className="text-lg font-bold text-primary">47</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.baseScore}</div>
        </div>
      </div>

      {/* Mode indicator */}
      <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${isTextBased ? 'bg-teal-50 border border-teal-200' : 'bg-amber-50 border border-amber-200'}`}>
        <Info className={`h-4 w-4 ${isTextBased ? 'text-teal-600' : 'text-amber-600'}`} />
        <span className={`text-sm font-medium ${isTextBased ? 'text-teal-800' : 'text-amber-800'}`}>
          {isTextBased ? t.textBasedNote : t.limitedNote}
        </span>
      </div>

      {/* SubScores Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {subScoreCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={card.key}
              className={`rounded-xl border p-4 ${getScoreBgColor(card.value)}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <IconComponent className={`h-4 w-4 ${getScoreColor(card.value)}`} />
                <span className="text-xs font-semibold text-slate-700">{card.label}</span>
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
            const isDisabled = group.textBasedOnly && !isTextBased;
            return (
              <div key={group.key} className={isDisabled ? 'opacity-50' : ''}>
                <h4 className="mb-2 text-sm font-semibold text-slate-800">{group.label}</h4>
                {isDisabled && (
                  <p className="mb-2 text-xs italic text-slate-500">
                    {language === 'fr' ? 'Non applicable en mode LIMITED_SIGNAL' : 'Not applicable in LIMITED_SIGNAL mode'}
                  </p>
                )}
                <div className="space-y-1.5">
                  {group.signals.map((signal) => {
                    const IconComponent = signal.icon;
                    return (
                      <div
                        key={signal.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                            <IconComponent className="h-3.5 w-3.5 text-slate-600" />
                          </div>
                          <span className="text-xs font-medium text-slate-700">
                            <span className="mr-1 text-slate-400">#{signal.id}</span>
                            {signalLabels[signal.id]}
                          </span>
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
