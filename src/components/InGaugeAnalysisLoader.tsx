import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/useLanguage';

interface InGaugeAnalysisLoaderProps {
  size: number;
}

// Analysis steps with translations
const analysisSteps = {
  en: [
    "Structuring input",
    "Evaluating credibility",
    "Analyzing context",
    "Finalizing score"
  ],
  fr: [
    "Structuration",
    "Évaluation crédibilité",
    "Analyse contextuelle",
    "Finalisation"
  ],
  es: [
    "Estructurando",
    "Evaluando credibilidad",
    "Analizando contexto",
    "Finalizando"
  ],
  de: [
    "Strukturierung",
    "Glaubwürdigkeit prüfen",
    "Kontext analysieren",
    "Finalisierung"
  ],
  pt: [
    "Estruturando",
    "Avaliando credibilidade",
    "Analisando contexto",
    "Finalizando"
  ],
  it: [
    "Strutturazione",
    "Valutazione credibilità",
    "Analisi contesto",
    "Finalizzazione"
  ],
  ja: [
    "構造化中",
    "信頼性評価",
    "文脈分析",
    "最終化"
  ],
  ko: [
    "구조화 중",
    "신뢰성 평가",
    "맥락 분석",
    "완료 중"
  ]
};

export const InGaugeAnalysisLoader = ({ size }: InGaugeAnalysisLoaderProps) => {
  const { language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const steps = analysisSteps[language] || analysisSteps.en;
  
  // Cycle through steps with smooth fade transitions
  useEffect(() => {
    const stepDuration = 2800;
    const fadeOutDuration = 300;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % steps.length);
        setIsTransitioning(false);
      }, fadeOutDuration);
      
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [steps.length]);
  
  // Premium loader dimensions - compact and centered
  const loaderSize = size * 0.28;
  const loaderStrokeWidth = 2.5;
  const loaderRadius = (loaderSize - loaderStrokeWidth) / 2;
  const loaderCircumference = 2 * Math.PI * loaderRadius;
  
  // Text positioned above the colored gauge arc (which starts at ~-45deg from bottom)
  const textOffsetTop = size * 0.12;
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center animate-fade-in"
    >
      {/* Main centered container */}
      <div 
        className="relative flex flex-col items-center justify-center"
        style={{ 
          width: size * 0.7,
          height: size * 0.5,
          marginTop: -textOffsetTop,
        }}
      >
        {/* Premium orbital ring loader */}
        <div 
          className="relative"
          style={{ width: loaderSize, height: loaderSize }}
        >
          {/* Ambient glow behind loader */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(174 75% 55% / 0.35) 0%, transparent 65%)',
              filter: 'blur(6px)',
              animation: 'loader-glow-breathe 2.5s ease-in-out infinite',
            }}
          />
          
          {/* Static track ring */}
          <svg 
            className="absolute inset-0"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius}
              fill="none"
              stroke="hsl(200 20% 25% / 0.4)"
              strokeWidth={loaderStrokeWidth}
            />
          </svg>
          
          {/* Primary rotating arc */}
          <svg 
            className="absolute inset-0"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              animation: 'loader-rotate 1.8s linear infinite',
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius}
              fill="none"
              stroke="hsl(174 80% 50%)"
              strokeWidth={loaderStrokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${loaderCircumference * 0.3} ${loaderCircumference * 0.7}`}
              style={{
                filter: 'drop-shadow(0 0 5px hsl(174 75% 55% / 0.7))',
              }}
            />
          </svg>
          
          {/* Secondary counter-rotating arc for depth */}
          <svg 
            className="absolute inset-0"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              animation: 'loader-rotate-reverse 3.2s linear infinite',
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius - 5}
              fill="none"
              stroke="hsl(180 65% 55% / 0.45)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray={`${(loaderCircumference - 10 * Math.PI) * 0.18} ${(loaderCircumference - 10 * Math.PI) * 0.82}`}
            />
          </svg>
          
          {/* Center dot pulse */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 4,
              height: 4,
              background: 'hsl(174 85% 60%)',
              boxShadow: '0 0 8px hsl(174 80% 55% / 0.8)',
              animation: 'center-dot-pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
        
        {/* Status text - positioned below the loader ring */}
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            marginTop: size * 0.04,
            height: size * 0.08,
            width: '100%',
          }}
        >
          <span
            className="absolute text-center font-semibold uppercase tracking-widest whitespace-nowrap"
            style={{
              fontSize: 'clamp(0.5rem, 1.6vw, 0.65rem)',
              color: 'hsl(174 55% 70%)',
              textShadow: '0 0 15px hsl(174 65% 55% / 0.5), 0 0 30px hsl(174 55% 50% / 0.25)',
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(3px) scale(0.98)' : 'translateY(0) scale(1)',
              transition: 'opacity 300ms ease-out, transform 300ms ease-out',
              letterSpacing: '0.15em',
            }}
          >
            {steps[stepIndex]}
          </span>
        </div>
        
        {/* Progress dots indicator */}
        <div 
          className="flex items-center justify-center gap-1.5"
          style={{ marginTop: size * 0.025 }}
        >
          {steps.map((_, idx) => (
            <div
              key={idx}
              className="rounded-full transition-all duration-300"
              style={{
                width: idx === stepIndex ? 6 : 3,
                height: 3,
                background: idx === stepIndex 
                  ? 'hsl(174 80% 55%)' 
                  : idx < stepIndex 
                    ? 'hsl(174 60% 45% / 0.6)' 
                    : 'hsl(200 20% 40% / 0.4)',
                boxShadow: idx === stepIndex ? '0 0 6px hsl(174 80% 55% / 0.6)' : 'none',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* CSS animations */}
      <style>{`
        @keyframes loader-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loader-rotate-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes loader-glow-breathe {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(0.9);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.15);
          }
        }
        @keyframes center-dot-pulse {
          0%, 100% { 
            opacity: 0.6; 
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};
