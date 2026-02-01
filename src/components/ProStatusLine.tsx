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
 * Derive display status ONLY from explicit IA11 keyPoints.
 * NO inference from sourcesBuckets or missing data.
 */
type DisplayStatus = 'confirmed' | 'contradicted' | 'uncertain' | 'limited' | 'default';

const deriveStatusFromKeyPoints = (keyPoints?: KeyPoints): DisplayStatus => {
  if (!keyPoints) return 'default';
  
  const { confirmed, uncertain, contradicted } = keyPoints;
  
  // All zeros = limited verification
  if (confirmed === 0 && uncertain === 0 && contradicted === 0) {
    return 'limited';
  }
  
  // IA11 explicitly says uncertain > 0
  if (uncertain > 0) {
    return 'uncertain';
  }
  
  // IA11 explicitly says contradicted > 0 (and no uncertainty)
  if (contradicted > 0 && confirmed === 0) {
    return 'contradicted';
  }
  
  // IA11 explicitly says confirmed > 0 (and no contradiction)
  if (confirmed > 0 && contradicted === 0) {
    return 'confirmed';
  }
  
  // Both confirmed and contradicted exist but no uncertain flag = default
  return 'default';
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
        message = t.statusLimited;
        Icon = Search;
        iconColor = 'hsl(220 15% 50%)';
        bgColor = 'hsl(220 15% 97%)';
        borderColor = 'hsl(220 15% 88%)';
        textColor = 'hsl(220 15% 45%)';
        break;
        
      default:
        message = t.default;
        Icon = Sparkles;
        iconColor = 'hsl(200 60% 50%)';
        bgColor = 'hsl(200 40% 97%)';
        borderColor = 'hsl(200 40% 88%)';
        textColor = 'hsl(200 50% 35%)';
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