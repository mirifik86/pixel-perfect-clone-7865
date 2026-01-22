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
  const [percentage, setPercentage] = useState(0);
  const [basePercentage, setBasePercentage] = useState(0);

  useEffect(() => {
    setAnimatedStep(currentStep);
    // Set base percentage for this step
    setBasePercentage(currentStep * 33);
  }, [currentStep]);

  // Continuous smooth animation within each step
  useEffect(() => {
    let animationId: number;
    const stepStart = animatedStep * 33;
    const stepEnd = Math.min((animatedStep + 1) * 33, 99);
    const duration = 4000; // Time to fill one step
    const startTime = performance.now();
    const startPercent = Math.max(percentage, stepStart);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease with micro-variations
      const eased = 1 - Math.pow(1 - progress, 2);
      const microVariation = Math.sin(elapsed / 150) * 0.3;
      const current = startPercent + (stepEnd - startPercent) * eased + microVariation;
      
      setPercentage(Math.min(Math.max(Math.round(current), stepStart), stepEnd));
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [animatedStep]);

  const size = 140;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

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
            stroke="url(#screenshotProgressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-out',
              filter: 'drop-shadow(0 0 6px hsl(174 60% 50% / 0.5))',
            }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="screenshotProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(174 60% 50%)" />
              <stop offset="100%" stopColor="hsl(160 70% 55%)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content - Percentage */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center z-20"
        >
          {/* Percentage display */}
          <div className="flex items-baseline">
            <span 
              className="font-semibold tabular-nums"
              style={{
                fontSize: size * 0.28,
                color: 'hsl(174 70% 65%)',
                textShadow: '0 0 20px hsl(174 60% 50% / 0.5)',
                lineHeight: 1,
              }}
            >
              {percentage}
            </span>
            <span 
              className="font-medium"
              style={{
                fontSize: size * 0.12,
                color: 'hsl(174 60% 60%)',
                marginLeft: '2px',
              }}
            >
              %
            </span>
          </div>

          {/* Current step label */}
          <span 
            className="text-center font-medium mt-1"
            style={{
              fontSize: '10px',
              color: 'hsl(0 0% 100% / 0.6)',
              maxWidth: '80px',
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
