import { Sparkles, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

interface ProStatusLineProps {
  hasCorrections: boolean;
  hasVerifiedFacts: boolean;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    withCorrections: 'Contradictions detected + factual corrections',
    withVerifiedFacts: 'Facts verified by IA11',
    default: 'PRO analysis with web evidence',
  },
  fr: {
    withCorrections: 'Contradictions détectées + corrections factuelles',
    withVerifiedFacts: 'Faits vérifiés par IA11',
    default: 'Analyse PRO avec preuves web',
  },
};

export const ProStatusLine = ({ hasCorrections, hasVerifiedFacts, language }: ProStatusLineProps) => {
  const t = translations[language];
  
  let message: string;
  let Icon: typeof Sparkles;
  let iconColor: string;
  let bgColor: string;
  let borderColor: string;
  let textColor: string;
  
  if (hasCorrections) {
    message = t.withCorrections;
    Icon = AlertTriangle;
    iconColor = 'hsl(35 80% 50%)';
    bgColor = 'hsl(35 50% 96%)';
    borderColor = 'hsl(35 50% 85%)';
    textColor = 'hsl(35 60% 35%)';
  } else if (hasVerifiedFacts) {
    message = t.withVerifiedFacts;
    Icon = CheckCircle2;
    iconColor = 'hsl(145 55% 42%)';
    bgColor = 'hsl(145 40% 96%)';
    borderColor = 'hsl(145 40% 85%)';
    textColor = 'hsl(145 50% 30%)';
  } else {
    message = t.default;
    Icon = Search;
    iconColor = 'hsl(200 60% 50%)';
    bgColor = 'hsl(200 40% 97%)';
    borderColor = 'hsl(200 40% 88%)';
    textColor = 'hsl(200 50% 35%)';
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
