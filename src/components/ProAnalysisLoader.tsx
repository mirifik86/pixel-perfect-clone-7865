import { Sparkles, Search, Scale, GitBranch } from 'lucide-react';

interface ProAnalysisLoaderProps {
  language: 'en' | 'fr';
}

const steps = {
  en: [
    { icon: Scale, text: 'Assessing claim gravity...' },
    { icon: GitBranch, text: 'Evaluating contextual coherence...' },
    { icon: Search, text: 'Performing web research...' },
    { icon: Sparkles, text: 'Computing plausibility score...' },
  ],
  fr: [
    { icon: Scale, text: 'Évaluation de la gravité...' },
    { icon: GitBranch, text: 'Analyse de la cohérence contextuelle...' },
    { icon: Search, text: 'Recherche web en cours...' },
    { icon: Sparkles, text: 'Calcul du score de plausibilité...' },
  ],
};

export const ProAnalysisLoader = ({ language }: ProAnalysisLoaderProps) => {
  return (
    <div className="w-full max-w-2xl animate-fade-in">
      {/* PRO badge header */}
      <div className="mb-6 flex justify-center">
        <div 
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: 'linear-gradient(135deg, hsl(200 80% 50% / 0.15) 0%, hsl(280 60% 55% / 0.15) 100%)',
            border: '1px solid hsl(200 80% 55% / 0.3)',
          }}
        >
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span 
            className="text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, hsl(200 80% 65%) 0%, hsl(280 60% 70%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {language === 'fr' ? 'Analyse PRO en cours' : 'PRO Analysis in Progress'}
          </span>
        </div>
      </div>

      {/* Skeleton cards with animated steps */}
      <div className="space-y-4">
        {steps[language].map((step, index) => {
          const Icon = step.icon;
          return (
            <div 
              key={index}
              className="analysis-card animate-fade-in"
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Animated icon */}
                <div 
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, hsl(200 80% 55% / 0.15) 0%, hsl(174 70% 50% / 0.15) 100%)',
                    border: '1px solid hsl(174 60% 45% / 0.25)'
                  }}
                >
                  <Icon className="h-5 w-5 text-cyan-500" />
                </div>

                {/* Step text with skeleton lines */}
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-slate-700">{step.text}</p>
                  
                  {/* Skeleton lines */}
                  <div className="space-y-1.5">
                    <div 
                      className="h-2 rounded-full animate-pulse"
                      style={{
                        width: `${70 + (index * 5)}%`,
                        background: 'linear-gradient(90deg, hsl(200 30% 90%) 0%, hsl(200 40% 85%) 50%, hsl(200 30% 90%) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                    <div 
                      className="h-2 rounded-full animate-pulse"
                      style={{
                        width: `${50 + (index * 8)}%`,
                        background: 'linear-gradient(90deg, hsl(200 30% 90%) 0%, hsl(200 40% 85%) 50%, hsl(200 30% 90%) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                        animationDelay: '0.2s',
                      }}
                    />
                  </div>
                </div>

                {/* Progress indicator */}
                <div 
                  className="h-6 w-6 rounded-full border-2 border-cyan-400/30"
                  style={{
                    borderTopColor: 'hsl(174 70% 50%)',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom message */}
      <p className="mt-6 text-center text-xs text-muted-foreground/60 animate-pulse">
        {language === 'fr' 
          ? 'Consultation de sources fiables...' 
          : 'Consulting reliable sources...'}
      </p>
    </div>
  );
};
