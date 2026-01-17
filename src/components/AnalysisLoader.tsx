import { useEffect, useState } from 'react';

interface AnalysisLoaderProps {
  size?: number;
  language?: 'en' | 'fr';
  className?: string;
}

export const AnalysisLoader = ({ 
  size = 160, 
  language = 'fr',
  className 
}: AnalysisLoaderProps) => {
  const [textIndex, setTextIndex] = useState(0);
  
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  
  // Methodological loading messages - calm, professional
  const loadingTexts = {
    fr: [
      'Analyse des sources et de la cohérence contextuelle…',
      'Évaluation des signaux linguistiques et de la fiabilité…',
      'Traitement de l\'analyse structurée de crédibilité…'
    ],
    en: [
      'Analyzing sources and contextual consistency…',
      'Evaluating linguistic signals and source reliability…',
      'Processing structured credibility analysis…'
    ]
  };

  // Slowly cycle through texts
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts[language].length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, [language]);

  const labelFontSize = size * 0.085;

  return (
    <div className={`flex flex-col items-center ${className || ''}`}>
      {/* Rotating ring container */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="animate-spin"
          style={{ animationDuration: '8s' }}
        >
          {/* Single continuous ring - thin, elegant */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${radius * Math.PI * 0.6} ${radius * Math.PI * 2}`}
            opacity={0.8}
          />
          
          {/* Secondary subtle ring for depth */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={strokeWidth / 2}
            opacity={0.15}
          />
        </svg>
        
        {/* Center dash indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-medium tabular-nums text-muted-foreground"
            style={{
              fontSize: size * 0.25,
              lineHeight: 1,
              letterSpacing: '-0.02em'
            }}
          >
            —
          </span>
        </div>
      </div>

      {/* Methodological loading text */}
      <div className="w-full flex justify-center mt-3 md:mt-4">
        <span
          className="text-center tracking-wide transition-opacity duration-500"
          style={{
            fontSize: labelFontSize,
            color: 'hsl(var(--muted-foreground))',
            fontWeight: 500,
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-sans)',
            maxWidth: size * 1.8
          }}
        >
          {loadingTexts[language][textIndex]}
        </span>
      </div>
    </div>
  );
};
