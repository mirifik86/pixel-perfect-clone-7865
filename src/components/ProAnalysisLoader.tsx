import { useState, useEffect } from 'react';
import { Sparkles, Search } from 'lucide-react';

interface ProAnalysisLoaderProps {
  language: 'en' | 'fr';
}

export const ProAnalysisLoader = ({ language }: ProAnalysisLoaderProps) => {
  const [dots, setDots] = useState('');

  // Subtle animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const content = {
    en: {
      title: 'PRO Analysis in progress',
      subtitle: 'Searching and cross-checking reliable sources',
    },
    fr: {
      title: 'Analyse PRO en cours',
      subtitle: 'Recherche et recoupement de sources fiables',
    },
  };

  const t = content[language];

  return (
    <div className="w-full max-w-2xl animate-fade-in mt-8">
      {/* Inline PRO status section */}
      <div 
        className="analysis-card relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(200 30% 98%) 100%)',
          border: '1px solid hsl(200 40% 88%)',
        }}
      >
        {/* Subtle animated gradient bar at top */}
        <div 
          className="absolute inset-x-0 top-0 h-1 overflow-hidden"
          style={{
            background: 'hsl(200 30% 90%)',
          }}
        >
          <div 
            className="h-full w-1/3"
            style={{
              background: 'linear-gradient(90deg, hsl(174 70% 50%) 0%, hsl(200 80% 55%) 50%, hsl(280 60% 55%) 100%)',
              animation: 'slideProgress 2s ease-in-out infinite',
            }}
          />
        </div>

        <div className="pt-4 pb-6 px-6 text-center">
          {/* PRO badge */}
          <div className="mb-4 flex justify-center">
            <div 
              className="flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{
                background: 'linear-gradient(135deg, hsl(200 80% 50% / 0.1) 0%, hsl(280 60% 55% / 0.1) 100%)',
                border: '1px solid hsl(200 80% 55% / 0.2)',
              }}
            >
              <Sparkles className="h-4 w-4 text-cyan-500" />
              <span 
                className="text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, hsl(200 80% 45%) 0%, hsl(280 60% 50%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                PRO
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-slate-800 mb-2">
            {t.title}{dots}
          </h3>

          {/* Subtitle with search icon */}
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Search className="h-4 w-4 text-cyan-600" />
            <p className="text-sm font-medium">
              {t.subtitle}{dots}
            </p>
          </div>

          {/* Calm pulsing indicator */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 70% 50%) 0%, hsl(200 80% 55%) 100%)',
                    animation: `pulse 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
