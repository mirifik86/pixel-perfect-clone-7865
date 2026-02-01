import { AlertTriangle, CheckCircle2, Search, AlertCircle, XCircle } from 'lucide-react';
import type { ProDisplayStatus } from '@/utils/ia11Normalization';

/**
 * IA11 is the SINGLE SOURCE OF TRUTH.
 * Lovable is a pure renderer - no inference, no fallback logic.
 * Status is derived ONLY from the normalization layer.
 */

interface ProStatusLineProps {
  /** Pre-computed status from normalization layer */
  status: ProDisplayStatus;
  /** Pre-computed badge text from normalization layer */
  badgeText: string;
  /** Whether corrections exist (affects styling) */
  hasCorrections: boolean;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    withCorrections: 'Contradictions detected + factual corrections',
  },
  fr: {
    withCorrections: 'Contradictions détectées + corrections factuelles',
  },
};

export const ProStatusLine = ({ 
  status,
  badgeText,
  hasCorrections, 
  language 
}: ProStatusLineProps) => {
  const t = translations[language];
  
  let message: string;
  let Icon: typeof CheckCircle2;
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
  // Priority 2: Use pre-computed badge text from normalization
  else {
    message = badgeText;
    
    switch (status) {
      case 'confirmed':
        Icon = CheckCircle2;
        iconColor = 'hsl(145 55% 42%)';
        bgColor = 'hsl(145 40% 96%)';
        borderColor = 'hsl(145 40% 85%)';
        textColor = 'hsl(145 50% 30%)';
        break;
        
      case 'contradicted':
        Icon = XCircle;
        iconColor = 'hsl(0 65% 50%)';
        bgColor = 'hsl(0 40% 97%)';
        borderColor = 'hsl(0 40% 88%)';
        textColor = 'hsl(0 55% 40%)';
        break;
        
      case 'uncertain':
        Icon = AlertCircle;
        iconColor = 'hsl(35 70% 50%)';
        bgColor = 'hsl(35 50% 96%)';
        borderColor = 'hsl(35 50% 85%)';
        textColor = 'hsl(35 60% 35%)';
        break;
        
      case 'limited':
      default:
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