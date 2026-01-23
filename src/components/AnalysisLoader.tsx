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
  
  // Match the gauge's professional stroke width
  const strokeWidth = 12;
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

  // Match gauge label sizing
  const labelFontSize = size * 0.085;

  return (
    <div className={`flex flex-col items-center justify-center ${className || ''}`} style={{ width: size }}>
      {/* Rotating ring container - centered */}
      <div 
        className="relative flex items-center justify-center" 
        style={{ width: size, height: size }}
      >
        {/* Background static ring - matches gauge segment style */}
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(220 10% 25%)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
        </svg>
        
        {/* Rotating arc - professional muted teal matching gauge's Leen color */}
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: '5s', animationTimingFunction: 'linear' }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(174 55% 45%)"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${radius * Math.PI * 0.4} ${radius * Math.PI * 2}`}
          />
        </svg>
        
        {/* Center dash indicator - matching gauge typography */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="tabular-nums"
            style={{
              fontSize: size * 0.30,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'hsl(var(--muted-foreground))',
              fontWeight: 600
            }}
          >
            —
          </span>
        </div>
      </div>

      {/* Methodological loading text - matching gauge label style */}
      <div className="flex w-full justify-center mt-1">
        <span
          className="text-center transition-opacity duration-700"
          style={{
            fontSize: labelFontSize,
            color: 'hsl(var(--muted-foreground))',
            fontWeight: 500,
            letterSpacing: '0.15em',
            fontFamily: 'var(--font-sans)',
            maxWidth: size * 2
          }}
        >
          {loadingTexts[language][textIndex]}
        </span>
      </div>
    </div>
  );
};
