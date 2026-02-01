import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface ProVerifiedFactsProps {
  facts: string[];
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'Verified Facts',
    showMore: 'Show more',
    showLess: 'Show less',
  },
  fr: {
    title: 'Faits vérifiés',
    showMore: 'Voir plus',
    showLess: 'Voir moins',
  },
};

export const ProVerifiedFacts = ({ facts, language }: ProVerifiedFactsProps) => {
  const t = translations[language];
  const [expanded, setExpanded] = useState(false);
  
  if (!facts || facts.length === 0) return null;
  
  const visibleFacts = expanded ? facts : facts.slice(0, 4);
  const hasMore = facts.length > 4;

  return (
    <div 
      className="analysis-card mb-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(145 30% 97%) 100%)',
        border: '1px solid hsl(145 40% 80%)',
        boxShadow: '0 4px 24px hsl(145 40% 50% / 0.08), 0 0 0 1px hsl(145 40% 85% / 0.5)',
      }}
    >
      {/* Subtle glow accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, hsl(145 60% 50% / 0.4) 0%, hsl(160 60% 50% / 0.6) 50%, hsl(145 60% 50% / 0.4) 100%)',
        }}
      />
      
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(145 50% 45%) 0%, hsl(160 50% 40%) 100%)',
            boxShadow: '0 2px 8px hsl(145 50% 45% / 0.3)',
          }}
        >
          <CheckCircle2 className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="font-serif text-lg font-semibold text-slate-900">
          {t.title}
        </h3>
      </div>
      
      <ul className="space-y-2.5">
        {visibleFacts.map((fact, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span 
              className="flex-shrink-0 mt-1.5 h-2 w-2 rounded-full"
              style={{ background: 'hsl(145 55% 50%)' }}
            />
            <span className="text-sm text-slate-700 leading-relaxed">{fact}</span>
          </li>
        ))}
      </ul>
      
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              {t.showLess}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              {t.showMore} ({facts.length - 4})
            </>
          )}
        </button>
      )}
    </div>
  );
};
