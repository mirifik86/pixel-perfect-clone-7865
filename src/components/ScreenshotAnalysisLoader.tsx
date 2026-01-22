import { useState, useEffect } from 'react';
import { ScanText, ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

interface ScreenshotAnalysisLoaderProps {
  language: 'en' | 'fr';
  currentStep: number; // 0: OCR, 1: Image Signals, 2: LeenScore Analysis
}

const translations = {
  en: {
    steps: [
      { label: 'Extracting text…', short: 'OCR' },
      { label: 'Checking signals…', short: 'Signals' },
      { label: 'Analyzing…', short: 'Analysis' },
    ],
  },
  fr: {
    steps: [
      { label: 'Extraction du texte…', short: 'OCR' },
      { label: 'Vérification signaux…', short: 'Signaux' },
      { label: 'Analyse en cours…', short: 'Analyse' },
    ],
  },
};

const stepIcons = [ScanText, ImageIcon, Sparkles];

export const ScreenshotAnalysisLoader = ({ language, currentStep }: ScreenshotAnalysisLoaderProps) => {
  const t = translations[language];
  const [animatedStep, setAnimatedStep] = useState(0);

  useEffect(() => {
    setAnimatedStep(currentStep);
  }, [currentStep]);

  const size = 140;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((animatedStep + 1) / 3) * circumference;

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      {/* Circular loader */}
      <div 
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Ambient glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(174 50% 45% / 0.15) 0%, transparent 70%)',
            filter: 'blur(15px)',
            transform: 'scale(1.4)',
          }}
        />

        {/* SVG Ring */}
        <svg
          width={size}
          height={size}
          className="relative z-10"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(220 20% 18% / 0.8)"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              transition: 'stroke-dashoffset 0.7s ease-out',
              filter: 'drop-shadow(0 0 6px hsl(174 60% 50% / 0.5))',
            }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(174 60% 50%)" />
              <stop offset="100%" stopColor="hsl(160 70% 55%)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
        >
          {/* Current step icon */}
          <div 
            className="flex items-center justify-center rounded-full mb-2"
            style={{
              width: 44,
              height: 44,
              background: 'linear-gradient(145deg, hsl(174 50% 40% / 0.3), hsl(174 40% 30% / 0.2))',
              border: '1px solid hsl(174 55% 55% / 0.3)',
              boxShadow: '0 0 20px hsl(174 60% 50% / 0.25)',
            }}
          >
            {(() => {
              const Icon = stepIcons[animatedStep] || stepIcons[0];
              return (
                <Icon 
                  className="h-5 w-5"
                  style={{ 
                    color: 'hsl(174 70% 65%)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              );
            })()}
          </div>

          {/* Current step label */}
          <span 
            className="text-center font-medium"
            style={{
              fontSize: '11px',
              color: 'hsl(174 60% 68%)',
              textShadow: '0 0 10px hsl(174 60% 50% / 0.4)',
              maxWidth: '90px',
            }}
          >
            {t.steps[animatedStep]?.label}
          </span>
        </div>
      </div>

      {/* Step indicators below */}
      <div 
        className="flex items-center justify-center gap-3 mt-4"
      >
        {t.steps.map((step, index) => {
          const isActive = index === animatedStep;
          const isComplete = index < animatedStep;
          const Icon = stepIcons[index];

          return (
            <div
              key={index}
              className="flex items-center gap-1.5 transition-all duration-500"
              style={{
                opacity: isActive ? 1 : isComplete ? 0.8 : 0.35,
              }}
            >
              <div 
                className="flex items-center justify-center rounded-full transition-all duration-500"
                style={{
                  width: 22,
                  height: 22,
                  background: isComplete 
                    ? 'hsl(160 65% 45%)'
                    : isActive 
                      ? 'hsl(174 55% 45%)'
                      : 'hsl(220 20% 20%)',
                  border: isComplete
                    ? '1.5px solid hsl(160 70% 55% / 0.6)'
                    : isActive
                      ? '1.5px solid hsl(174 60% 55% / 0.5)'
                      : '1.5px solid hsl(0 0% 100% / 0.1)',
                  boxShadow: isActive 
                    ? '0 0 12px hsl(174 60% 50% / 0.5)'
                    : isComplete
                      ? '0 0 8px hsl(160 70% 50% / 0.4)'
                      : 'none',
                }}
              >
                {isComplete ? (
                  <CheckCircle2 
                    className="h-3 w-3"
                    style={{ color: 'white' }}
                  />
                ) : (
                  <Icon 
                    className="h-3 w-3"
                    style={{ color: isActive ? 'white' : 'hsl(0 0% 100% / 0.4)' }}
                  />
                )}
              </div>
              
              <span 
                className="font-medium transition-colors duration-300 hidden sm:inline"
                style={{
                  fontSize: '10px',
                  color: isComplete 
                    ? 'hsl(160 60% 58%)' 
                    : isActive 
                      ? 'hsl(174 65% 65%)' 
                      : 'hsl(0 0% 100% / 0.4)',
                  letterSpacing: '0.02em',
                }}
              >
                {step.short}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
