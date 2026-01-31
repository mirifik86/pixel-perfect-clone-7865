import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/useLanguage';

interface AnalysisLoaderProps {
  size?: number;
  className?: string;
}

export const AnalysisLoader = ({ 
  size = 160, 
  className 
}: AnalysisLoaderProps) => {
  const { t, tArray } = useLanguage();
  const [textIndex, setTextIndex] = useState(0);
  
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const loadingTexts = tArray('loader.secondary');
  
  // Primary message: "Connexion au moteur IA11..."
  const primaryMessage = t('loader.ia11Connecting');

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loadingTexts.length]);

  const labelFontSize = size * 0.085;

  return (
    <div className={`flex flex-col items-center justify-center ${className || ''}`} style={{ width: size }}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(220 10% 25%)" strokeWidth={strokeWidth} opacity={0.3} />
        </svg>
        <svg 
          width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: '5s', animationTimingFunction: 'linear' }}
        >
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="hsl(174 55% 45%)" strokeWidth={strokeWidth} strokeLinecap="butt"
            strokeDasharray={`${radius * Math.PI * 0.4} ${radius * Math.PI * 2}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="tabular-nums" style={{ fontSize: size * 0.30, lineHeight: 1, letterSpacing: '-0.02em', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
            —
          </span>
        </div>
      </div>

      {/* Primary IA11 connection message */}
      <div className="flex w-full justify-center mt-2">
        <span
          className="text-center font-semibold"
          style={{ 
            fontSize: labelFontSize * 1.1, 
            color: 'hsl(174 55% 55%)', 
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}
        >
          {primaryMessage}
        </span>
      </div>

      {/* Secondary rotating messages */}
      <div className="flex w-full justify-center mt-1">
        <span
          className="text-center transition-opacity duration-700"
          style={{ fontSize: labelFontSize, color: 'hsl(var(--muted-foreground))', fontWeight: 500, letterSpacing: '0.05em', fontFamily: 'var(--font-sans)', maxWidth: size * 2 }}
        >
          {loadingTexts[textIndex]}
        </span>
      </div>
    </div>
  );
};