import { useState, useEffect } from 'react';
import { FileSearch, ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

interface ScreenshotAnalysisLoaderProps {
  language: 'en' | 'fr';
  currentStep: number; // 0: OCR, 1: Image Signals, 2: LeenScore Analysis
}

const translations = {
  en: {
    steps: [
      { label: 'Extracting text (OCR)…', description: 'Reading visible text from your screenshot' },
      { label: 'Checking image signals…', description: 'Analyzing visual authenticity indicators' },
      { label: 'Running LeenScore analysis…', description: 'Evaluating credibility signals' },
    ],
    title: 'Analyzing Screenshot',
  },
  fr: {
    steps: [
      { label: 'Extraction du texte (OCR)…', description: 'Lecture du texte visible sur la capture' },
      { label: 'Vérification des signaux image…', description: 'Analyse des indicateurs visuels' },
      { label: 'Analyse LeenScore en cours…', description: 'Évaluation des signaux de crédibilité' },
    ],
    title: 'Analyse de la capture',
  },
};

const stepIcons = [FileSearch, ImageIcon, Sparkles];

export const ScreenshotAnalysisLoader = ({ language, currentStep }: ScreenshotAnalysisLoaderProps) => {
  const t = translations[language];
  const [animatedStep, setAnimatedStep] = useState(0);

  // Smooth step transitions
  useEffect(() => {
    setAnimatedStep(currentStep);
  }, [currentStep]);

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Title */}
      <h3 
        className="text-center text-lg font-semibold text-white mb-6"
        style={{
          textShadow: '0 0 20px hsl(174 60% 45% / 0.4)',
        }}
      >
        {t.title}
      </h3>

      {/* Stepper */}
      <div className="space-y-4">
        {t.steps.map((step, index) => {
          const Icon = stepIcons[index];
          const isActive = index === animatedStep;
          const isComplete = index < animatedStep;

          return (
            <div
              key={index}
              className={`
                relative flex items-center gap-4 rounded-xl p-4 transition-all duration-500
                ${isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30' 
                  : isComplete 
                    ? 'bg-white/5 border border-emerald-500/30' 
                    : 'bg-white/[0.02] border border-white/10 opacity-50'
                }
              `}
              style={{
                boxShadow: isActive 
                  ? '0 0 30px hsl(174 60% 45% / 0.15), 0 4px 16px hsl(0 0% 0% / 0.3)'
                  : '0 2px 8px hsl(0 0% 0% / 0.2)',
              }}
            >
              {/* Step number / icon */}
              <div 
                className={`
                  relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isComplete 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white/10 text-white/40'
                  }
                `}
                style={{
                  boxShadow: isActive 
                    ? '0 0 20px hsl(174 60% 45% / 0.5)'
                    : isComplete
                      ? '0 0 15px hsl(160 80% 45% / 0.4)'
                      : 'none',
                }}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                )}
              </div>

              {/* Step text */}
              <div className="flex-1">
                <p 
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isActive ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-white/50'
                  }`}
                >
                  {step.label}
                </p>
                <p 
                  className={`text-xs transition-colors duration-300 ${
                    isActive ? 'text-white/70' : 'text-white/40'
                  }`}
                >
                  {step.description}
                </p>
              </div>

              {/* Active indicator animation */}
              {isActive && (
                <div className="absolute right-4">
                  <div 
                    className="h-2 w-2 rounded-full bg-primary"
                    style={{
                      animation: 'pulse 1.5s ease-in-out infinite',
                      boxShadow: '0 0 10px hsl(174 60% 45% / 0.8)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress line connecting steps */}
      <div className="absolute left-[2.25rem] top-16 h-[calc(100%-5rem)] w-0.5 -z-10">
        <div 
          className="h-full w-full bg-gradient-to-b from-primary/50 via-primary/20 to-transparent"
          style={{
            clipPath: `inset(0 0 ${100 - (animatedStep / 2) * 100}% 0)`,
            transition: 'clip-path 0.5s ease-out',
          }}
        />
      </div>
    </div>
  );
};
