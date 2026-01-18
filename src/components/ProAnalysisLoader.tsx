import { useState, useEffect } from 'react';
import { Sparkles, Search, Globe, Shield, CheckCircle2 } from 'lucide-react';

interface ProAnalysisLoaderProps {
  language: 'en' | 'fr';
}

export const ProAnalysisLoader = ({ language }: ProAnalysisLoaderProps) => {
  const [dots, setDots] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const content = {
    en: {
      title: 'PRO Analysis in progress',
      subtitle: 'Searching and cross-checking reliable sources',
      steps: [
        { icon: Globe, label: 'Scanning trusted sources' },
        { icon: Shield, label: 'Verifying credibility' },
        { icon: CheckCircle2, label: 'Cross-referencing data' },
      ],
    },
    fr: {
      title: 'Analyse PRO en cours',
      subtitle: 'Recherche et recoupement de sources fiables',
      steps: [
        { icon: Globe, label: 'Scan des sources fiables' },
        { icon: Shield, label: 'Vérification de crédibilité' },
        { icon: CheckCircle2, label: 'Recoupement des données' },
      ],
    },
  };

  const t = content[language];

  return (
    <div className="w-full max-w-2xl animate-fade-in mt-8">
      <div 
        className="analysis-card relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(0 0% 100%) 0%, hsl(220 30% 98%) 50%, hsl(280 20% 98%) 100%)',
          border: '1px solid hsl(200 40% 88%)',
          boxShadow: '0 8px 32px hsl(200 80% 50% / 0.08), 0 2px 8px hsl(280 60% 50% / 0.06)',
        }}
      >
        {/* Premium animated gradient bar */}
        <div 
          className="absolute inset-x-0 top-0 h-1.5 overflow-hidden"
          style={{
            background: 'hsl(200 20% 92%)',
          }}
        >
          <div 
            className="h-full w-full"
            style={{
              background: 'linear-gradient(90deg, hsl(174 70% 45%) 0%, hsl(200 85% 55%) 33%, hsl(260 70% 60%) 66%, hsl(174 70% 45%) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
            }}
          />
        </div>

        <div className="pt-8 pb-8 px-8 text-center">
          {/* Premium PRO badge with glow */}
          <div className="mb-6 flex justify-center">
            <div 
              className="relative flex items-center gap-2.5 rounded-full px-5 py-2"
              style={{
                background: 'linear-gradient(135deg, hsl(200 85% 50% / 0.12) 0%, hsl(280 70% 55% / 0.12) 100%)',
                border: '1px solid hsl(200 80% 55% / 0.25)',
                boxShadow: '0 4px 16px hsl(200 80% 50% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.5)',
              }}
            >
              {/* Animated glow */}
              <div 
                className="absolute inset-0 rounded-full opacity-50"
                style={{
                  background: 'linear-gradient(135deg, hsl(174 70% 50% / 0.2) 0%, hsl(280 60% 55% / 0.2) 100%)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <Sparkles className="h-5 w-5 text-cyan-500 relative z-10" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span 
                className="text-base font-bold relative z-10"
                style={{
                  background: 'linear-gradient(135deg, hsl(200 85% 45%) 0%, hsl(280 70% 50%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                PRO
              </span>
            </div>
          </div>

          {/* Title with gradient */}
          <h3 
            className="font-serif text-xl font-semibold mb-3"
            style={{
              background: 'linear-gradient(135deg, hsl(220 20% 25%) 0%, hsl(220 30% 40%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t.title}{dots}
          </h3>

          {/* Subtitle with search icon */}
          <div className="flex items-center justify-center gap-2.5 text-slate-600 mb-8">
            <Search className="h-4 w-4 text-cyan-600" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            <p className="text-sm font-medium">
              {t.subtitle}
            </p>
          </div>

          {/* Premium step indicators */}
          <div className="flex justify-center gap-4 mb-6">
            {t.steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              
              return (
                <div 
                  key={i}
                  className="flex flex-col items-center gap-2 transition-all duration-500"
                  style={{
                    opacity: isActive ? 1 : isPast ? 0.7 : 0.4,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <div 
                    className="relative h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500"
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, hsl(174 70% 45%) 0%, hsl(200 85% 55%) 50%, hsl(260 70% 60%) 100%)'
                        : isPast 
                          ? 'linear-gradient(135deg, hsl(174 60% 55%) 0%, hsl(200 70% 60%) 100%)'
                          : 'hsl(220 20% 94%)',
                      boxShadow: isActive 
                        ? '0 4px 20px hsl(200 80% 50% / 0.35), 0 2px 8px hsl(280 60% 50% / 0.2)'
                        : 'none',
                    }}
                  >
                    {isActive && (
                      <div 
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, hsl(174 70% 50% / 0.5) 0%, hsl(280 60% 55% / 0.5) 100%)',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    )}
                    <Icon 
                      className={`h-5 w-5 relative z-10 transition-colors duration-500 ${
                        isActive || isPast ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <span 
                    className={`text-xs font-medium max-w-[80px] text-center transition-colors duration-500 ${
                      isActive ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Premium pulsing dots */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 70% 50%) 0%, hsl(200 85% 55%) 50%, hsl(260 70% 60%) 100%)',
                    animation: `pulse 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                    boxShadow: '0 2px 8px hsl(200 80% 50% / 0.3)',
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
