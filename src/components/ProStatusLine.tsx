import { Sparkles, AlertTriangle, CheckCircle2, Search, AlertCircle, XCircle } from 'lucide-react';

/**
 * IA11 is the SINGLE SOURCE OF TRUTH.
 * Lovable is a pure renderer - no inference, no fallback logic.
 * Status is derived ONLY from explicit IA11 keyPoints values.
 */

interface KeyPoints {
  confirmed: number;
  uncertain: number;
  contradicted: number;
}

interface ProStatusLineProps {
  hasCorrections: boolean;
  hasVerifiedFacts: boolean;
  keyPoints?: KeyPoints;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    withCorrections: 'Contradictions detected + factual corrections',
    withVerifiedFacts: 'Facts verified by IA11',
    default: 'PRO analysis with web evidence',
    statusConfirmed: 'Confirmed by credible sources',
    statusContradicted: 'Contradicted by credible sources',
    statusUncertain: 'Conflicting source conclusions',
    statusLimited: 'Limited verification available',
  },
  fr: {
    withCorrections: 'Contradictions détectées + corrections factuelles',
    withVerifiedFacts: 'Faits vérifiés par IA11',
    default: 'Analyse PRO avec preuves web',
    statusConfirmed: 'Confirmé par des sources fiables',
    statusContradicted: 'Contredit par des sources fiables',
    statusUncertain: 'Conclusions contradictoires entre sources',
    statusLimited: 'Vérification limitée disponible',
  },
};

/**
 * Derive badge text ONLY from IA11 counters.
 * HARD RULES:
 * - Missing keyPoints => treat as 0/0/0
 * - Priority: contradicted > confirmed > uncertain > limited
 */
type DisplayStatus = 'confirmed' | 'contradicted' | 'uncertain' | 'limited';

const deriveStatusFromKeyPoints = (keyPoints?: KeyPoints): DisplayStatus => {
  const confirmed = keyPoints?.confirmed ?? 0;
  const uncertain = keyPoints?.uncertain ?? 0;
  const contradicted = keyPoints?.contradicted ?? 0;

  if (contradicted > 0) return 'contradicted';
  if (confirmed > 0) return 'confirmed';
  if (uncertain > 0) return 'uncertain';
  return 'limited';
};

export const ProStatusLine = ({ hasCorrections, hasVerifiedFacts, keyPoints, language }: ProStatusLineProps) => {
  const t = translations[language];
  
  // Derive status ONLY from explicit IA11 keyPoints
  const displayStatus = deriveStatusFromKeyPoints(keyPoints);
  
  let message: string;
  let Icon: typeof Sparkles;
  let iconColor: string;
  let bgColor: string;
  let borderColor: string;
  let textColor: string;
  
  // Priority 1: If corrections exist, show corrections message
  if (hasCorrections) {
    message = t.withCorrections;
    Icon = AlertTriangle;
    iconColor = 'hsl(35 80% 50%)';
    bgColor = 'hsl(35 50% 96%)';
    borderColor = 'hsl(35 50% 85%)';
    textColor = 'hsl(35 60% 35%)';
  } 
  // Priority 2: Show status-based message from IA11 keyPoints
  else {
    switch (displayStatus) {
      case 'confirmed':
        message = hasVerifiedFacts ? t.withVerifiedFacts : t.statusConfirmed;
        Icon = CheckCircle2;
        iconColor = 'hsl(145 55% 42%)';
        bgColor = 'hsl(145 40% 96%)';
        borderColor = 'hsl(145 40% 85%)';
        textColor = 'hsl(145 50% 30%)';
        break;
        
      case 'contradicted':
        message = t.statusContradicted;
        Icon = XCircle;
        iconColor = 'hsl(0 65% 50%)';
        bgColor = 'hsl(0 40% 97%)';
        borderColor = 'hsl(0 40% 88%)';
        textColor = 'hsl(0 55% 40%)';
        break;
        
      case 'uncertain':
        message = t.statusUncertain;
        Icon = AlertCircle;
        iconColor = 'hsl(35 70% 50%)';
        bgColor = 'hsl(35 50% 96%)';
        borderColor = 'hsl(35 50% 85%)';
        textColor = 'hsl(35 60% 35%)';
        break;
        
      case 'limited':
      default:
        message = t.statusLimited;
        Icon = Search;
        iconColor = 'hsl(220 15% 50%)';
        bgColor = 'hsl(220 15% 97%)';
        borderColor = 'hsl(220 15% 88%)';
        textColor = 'hsl(220 15% 45%)';
        break;
    }
  }

  return (
    <div 
      className="flex items-center justify-center gap-2 rounded-full px-4 py-1.5 mb-4 mx-auto w-fit"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
      <span 
        className="text-xs font-medium"
        style={{ color: textColor }}
      >
        {message}
      </span>
    </div>
  );
};