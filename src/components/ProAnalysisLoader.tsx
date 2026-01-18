import { useState, useEffect } from 'react';
import { Sparkles, Search, Scale, GitBranch, CheckCircle } from 'lucide-react';

interface ProAnalysisLoaderProps {
  language: 'en' | 'fr';
}

const steps = {
  en: [
    { icon: Scale, text: 'Assessing claim gravity...', complete: 'Gravity assessed' },
    { icon: GitBranch, text: 'Evaluating contextual coherence...', complete: 'Coherence evaluated' },
    { icon: Search, text: 'Performing web research...', complete: 'Sources analyzed' },
    { icon: Sparkles, text: 'Computing plausibility score...', complete: 'Score computed' },
  ],
  fr: [
    { icon: Scale, text: 'Évaluation de la gravité...', complete: 'Gravité évaluée' },
    { icon: GitBranch, text: 'Analyse de la cohérence contextuelle...', complete: 'Cohérence évaluée' },
    { icon: Search, text: 'Recherche web en cours...', complete: 'Sources analysées' },
    { icon: Sparkles, text: 'Calcul du score de plausibilité...', complete: 'Score calculé' },
  ],
};

export const ProAnalysisLoader = ({ language }: ProAnalysisLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate progress over ~8-12 seconds (typical PRO analysis time)
    const totalDuration = 10000; // 10 seconds
    const interval = 100; // Update every 100ms
    const increment = 100 / (totalDuration / interval);
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment + (Math.random() * 0.5); // Slight randomness
        
        // Update current step based on progress
        if (next >= 25 && currentStep < 1) setCurrentStep(1);
        else if (next >= 50 && currentStep < 2) setCurrentStep(2);
        else if (next >= 75 && currentStep < 3) setCurrentStep(3);
        
        // Cap at 95% to avoid showing 100% before actual completion
        return Math.min(next, 95);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStep]);

  const displayPercentage = Math.round(progress);

  return (
    <div className="w-full max-w-2xl animate-fade-in">
      {/* PRO badge header with percentage */}
      <div className="mb-4 flex flex-col items-center gap-3">
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

        {/* Progress percentage */}
        <div className="flex items-center gap-3">
          <span 
            className="font-mono text-2xl font-bold tabular-nums"
            style={{
              background: 'linear-gradient(135deg, hsl(174 70% 55%) 0%, hsl(200 80% 60%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {displayPercentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div 
          className="w-full max-w-xs h-2 rounded-full overflow-hidden"
          style={{
            background: 'hsl(220 20% 20%)',
            border: '1px solid hsl(220 20% 30%)',
          }}
        >
          <div 
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, hsl(174 70% 50%) 0%, hsl(200 80% 55%) 50%, hsl(280 60% 55%) 100%)',
              boxShadow: '0 0 10px hsl(174 70% 50% / 0.5)',
            }}
          />
        </div>
      </div>

      {/* Steps with completion states */}
      <div className="space-y-3">
        {steps[language].map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <div 
              key={index}
              className="analysis-card animate-fade-in transition-all duration-300"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both',
                opacity: isComplete ? 0.7 : 1,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Status icon */}
                <div 
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${isActive ? 'animate-pulse' : ''}`}
                  style={{
                    background: isComplete 
                      ? 'linear-gradient(135deg, hsl(160 60% 45% / 0.2) 0%, hsl(160 70% 40% / 0.2) 100%)'
                      : 'linear-gradient(135deg, hsl(200 80% 55% / 0.15) 0%, hsl(174 70% 50% / 0.15) 100%)',
                    border: isComplete 
                      ? '1px solid hsl(160 60% 45% / 0.4)'
                      : '1px solid hsl(174 60% 45% / 0.25)'
                  }}
                >
                  {isComplete ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Icon className="h-5 w-5 text-cyan-500" />
                  )}
                </div>

                {/* Step text */}
                <div className="flex-1">
                  <p className={`text-sm font-medium transition-colors duration-300 ${isComplete ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {isComplete ? step.complete : step.text}
                  </p>
                  
                  {/* Skeleton lines for active/pending steps */}
                  {!isComplete && (
                    <div className="mt-2 space-y-1.5">
                      <div 
                        className="h-2 rounded-full"
                        style={{
                          width: isActive ? `${40 + (progress % 25) * 2}%` : `${60 + (index * 5)}%`,
                          background: 'linear-gradient(90deg, hsl(200 30% 90%) 0%, hsl(200 40% 85%) 50%, hsl(200 30% 90%) 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 1.5s infinite',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Step status indicator */}
                {isActive && (
                  <div 
                    className="h-5 w-5 rounded-full border-2 border-cyan-400/30"
                    style={{
                      borderTopColor: 'hsl(174 70% 50%)',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                )}
                {isComplete && (
                  <span className="text-xs font-medium text-emerald-500">✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom message */}
      <p className="mt-5 text-center text-xs text-muted-foreground/60">
        {language === 'fr' 
          ? 'Consultation de sources fiables...' 
          : 'Consulting reliable sources...'}
      </p>
    </div>
  );
};
