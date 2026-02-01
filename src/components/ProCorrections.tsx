import { useState } from 'react';
import { Compass, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface ProCorrectionsProps {
  corrections: string[];
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'Corrections',
    showMore: 'Show more',
    showLess: 'Show less',
  },
  fr: {
    title: 'Corrections',
    showMore: 'Voir plus',
    showLess: 'Voir moins',
  },
};

export const ProCorrections = ({ corrections, language }: ProCorrectionsProps) => {
  const t = translations[language];
  const [expanded, setExpanded] = useState(false);
  
  if (!corrections || corrections.length === 0) return null;
  
  const visibleCorrections = expanded ? corrections : corrections.slice(0, 4);
  const hasMore = corrections.length > 4;

  return (
    <div 
      className="analysis-card mb-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(35 40% 97%) 100%)',
        border: '1px solid hsl(35 50% 78%)',
        boxShadow: '0 4px 24px hsl(35 50% 50% / 0.1), 0 0 0 1px hsl(35 50% 85% / 0.5)',
      }}
    >
      {/* Warning accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, hsl(35 70% 55% / 0.5) 0%, hsl(25 80% 55% / 0.7) 50%, hsl(35 70% 55% / 0.5) 100%)',
        }}
      />
      
      {/* Subtle animated pulse glow for "WOW" effect */}
      <div 
        className="absolute -inset-1 -z-10 rounded-xl opacity-30"
        style={{
          background: 'radial-gradient(ellipse at top, hsl(35 70% 60% / 0.15) 0%, transparent 60%)',
          animation: 'pro-wow-pulse 3s ease-in-out infinite',
        }}
      />
      
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(35 60% 50%) 0%, hsl(25 70% 45%) 100%)',
            boxShadow: '0 2px 8px hsl(35 60% 50% / 0.35)',
          }}
        >
          <Compass className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="font-serif text-lg font-semibold text-slate-900">
          {t.title}
        </h3>
        <AlertTriangle className="h-4 w-4 text-amber-500 ml-auto" />
      </div>
      
      <ul className="space-y-2.5">
        {visibleCorrections.map((correction, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span 
              className="flex-shrink-0 mt-1.5 h-2 w-2 rounded-full"
              style={{ background: 'hsl(35 65% 50%)' }}
            />
            <span className="text-sm text-slate-700 leading-relaxed">{correction}</span>
          </li>
        ))}
      </ul>
      
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {t.showLess}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {t.showMore} ({corrections.length - 4})
            </>
          )}
        </button>
      )}
    </div>
  );
};
