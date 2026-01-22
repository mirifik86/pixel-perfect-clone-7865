import { useState, useEffect } from 'react';
import { ScanText, ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

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

const stepIcons = [ScanText, ImageIcon, Sparkles];

export const ScreenshotAnalysisLoader = ({ language, currentStep }: ScreenshotAnalysisLoaderProps) => {
  const t = translations[language];
  const [animatedStep, setAnimatedStep] = useState(0);

  // Smooth step transitions
  useEffect(() => {
    setAnimatedStep(currentStep);
  }, [currentStep]);

  return (
    <div 
      className="w-full max-w-sm mx-auto animate-fade-in"
      style={{
        padding: 'var(--space-6)',
      }}
    >
      {/* Premium glassmorphism container */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, hsl(220 30% 12% / 0.95), hsl(230 25% 8% / 0.98))',
          border: '1px solid hsl(174 50% 45% / 0.2)',
          boxShadow: `
            0 0 60px hsl(174 60% 40% / 0.12),
            0 20px 50px hsl(0 0% 0% / 0.4),
            inset 0 1px 1px hsl(0 0% 100% / 0.06)
          `,
          padding: 'var(--space-6)',
        }}
      >
        {/* Ambient glow effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, hsl(174 50% 50% / 0.08) 0%, transparent 60%)',
          }}
        />

        {/* Title with premium styling */}
        <h3 
          className="relative text-center font-semibold tracking-wide mb-6"
          style={{
            fontSize: '15px',
            color: 'hsl(174 60% 65%)',
            textShadow: '0 0 20px hsl(174 60% 50% / 0.5)',
            letterSpacing: '0.05em',
          }}
        >
          {t.title}
        </h3>

        {/* Stepper with vertical line */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div 
            className="absolute left-5 top-5 bottom-5 w-px"
            style={{
              background: 'linear-gradient(to bottom, hsl(174 50% 45% / 0.4), hsl(174 40% 35% / 0.15), transparent)',
            }}
          />

          {/* Progress line overlay */}
          <div 
            className="absolute left-5 top-5 w-px transition-all duration-700 ease-out"
            style={{
              height: `${Math.min(animatedStep * 50, 100)}%`,
              background: 'linear-gradient(to bottom, hsl(160 70% 50%), hsl(174 60% 45%))',
              boxShadow: '0 0 8px hsl(160 70% 50% / 0.6)',
            }}
          />

          <div className="space-y-4 relative">
            {t.steps.map((step, index) => {
              const Icon = stepIcons[index];
              const isActive = index === animatedStep;
              const isComplete = index < animatedStep;

              return (
                <div
                  key={index}
                  className="relative flex items-start gap-4 transition-all duration-500"
                  style={{
                    opacity: isActive || isComplete ? 1 : 0.4,
                  }}
                >
                  {/* Step icon circle */}
                  <div 
                    className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 shrink-0"
                    style={{
                      background: isComplete 
                        ? 'linear-gradient(145deg, hsl(160 70% 45%), hsl(160 60% 38%))'
                        : isActive 
                          ? 'linear-gradient(145deg, hsl(174 55% 45%), hsl(174 45% 38%))'
                          : 'hsl(220 20% 18%)',
                      border: isComplete
                        ? '2px solid hsl(160 70% 55% / 0.6)'
                        : isActive
                          ? '2px solid hsl(174 60% 55% / 0.6)'
                          : '2px solid hsl(0 0% 100% / 0.1)',
                      boxShadow: isActive 
                        ? '0 0 25px hsl(174 60% 50% / 0.5), 0 0 10px hsl(174 50% 45% / 0.3)'
                        : isComplete
                          ? '0 0 20px hsl(160 70% 50% / 0.4)'
                          : 'none',
                    }}
                  >
                    {isComplete ? (
                      <CheckCircle2 
                        className="h-5 w-5"
                        style={{ color: 'white' }}
                      />
                    ) : (
                      <Icon 
                        className="h-5 w-5"
                        style={{ 
                          color: isActive ? 'white' : 'hsl(0 0% 100% / 0.4)',
                          animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
                        }}
                      />
                    )}

                    {/* Active pulse ring */}
                    {isActive && (
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: '2px solid hsl(174 60% 55% / 0.4)',
                          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                        }}
                      />
                    )}
                  </div>

                  {/* Step content card */}
                  <div 
                    className="flex-1 rounded-xl transition-all duration-500"
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      background: isActive 
                        ? 'linear-gradient(135deg, hsl(174 40% 25% / 0.25), hsl(174 30% 20% / 0.15))'
                        : isComplete
                          ? 'linear-gradient(135deg, hsl(160 35% 22% / 0.2), hsl(160 25% 18% / 0.1))'
                          : 'transparent',
                      border: isActive 
                        ? '1px solid hsl(174 50% 50% / 0.25)'
                        : isComplete
                          ? '1px solid hsl(160 50% 50% / 0.15)'
                          : '1px solid transparent',
                      boxShadow: isActive 
                        ? '0 4px 20px hsl(174 50% 40% / 0.15)'
                        : 'none',
                    }}
                  >
                    <p 
                      className="font-semibold transition-colors duration-300"
                      style={{
                        fontSize: '13px',
                        color: isActive 
                          ? 'hsl(174 70% 70%)'
                          : isComplete 
                            ? 'hsl(160 60% 60%)' 
                            : 'hsl(0 0% 100% / 0.5)',
                        textShadow: isActive 
                          ? '0 0 10px hsl(174 60% 55% / 0.4)'
                          : 'none',
                      }}
                    >
                      {step.label}
                    </p>
                    <p 
                      className="transition-colors duration-300 mt-0.5"
                      style={{
                        fontSize: '11px',
                        color: isActive 
                          ? 'hsl(0 0% 100% / 0.6)' 
                          : 'hsl(0 0% 100% / 0.35)',
                      }}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Completion checkmark badge */}
                  {isComplete && (
                    <div 
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{
                        color: 'hsl(160 70% 55%)',
                        filter: 'drop-shadow(0 0 6px hsl(160 70% 50% / 0.5))',
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom progress indicator */}
        <div 
          className="mt-6 h-1 rounded-full overflow-hidden"
          style={{
            background: 'hsl(220 20% 15%)',
          }}
        >
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${((animatedStep + 1) / 3) * 100}%`,
              background: 'linear-gradient(90deg, hsl(174 60% 45%), hsl(160 70% 50%))',
              boxShadow: '0 0 10px hsl(174 60% 50% / 0.5)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
