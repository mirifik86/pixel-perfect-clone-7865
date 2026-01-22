import { useEffect, useState } from 'react';
import { Search, Shield, Sparkles } from 'lucide-react';

interface AnalysisLoaderProps {
  size?: number;
  language?: 'en' | 'fr';
  className?: string;
}

const stepIcons = [Search, Shield, Sparkles];

export const AnalysisLoader = ({ 
  size = 140, 
  language = 'fr',
  className 
}: AnalysisLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [percentage, setPercentage] = useState(0);
  
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const steps = {
    fr: [
      { label: 'Analyse des sources…', short: 'Sources' },
      { label: 'Vérification signaux…', short: 'Signaux' },
      { label: 'Évaluation finale…', short: 'Évaluation' },
    ],
    en: [
      { label: 'Analyzing sources…', short: 'Sources' },
      { label: 'Checking signals…', short: 'Signals' },
      { label: 'Final evaluation…', short: 'Evaluation' },
    ],
  };

  // Animate percentage smoothly
  useEffect(() => {
    const targetPercent = Math.min(((currentStep + 1) / 3) * 100, 99);
    const duration = 2400;
    const startPercent = percentage;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startPercent + (targetPercent - startPercent) * eased);
      
      setPercentage(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [currentStep]);

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const progress = (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center animate-fade-in ${className || ''}`}>
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
            stroke="url(#analysisProgressGradient)"
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
            <linearGradient id="analysisProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
            {steps[language][currentStep]?.label}
          </span>
        </div>
      </div>

      {/* Step indicators below */}
      <div 
        className="flex items-center justify-center gap-3 mt-4"
      >
        {steps[language].map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
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
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
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
