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
  
  // Premium loader dimensions - refined for maximum impact
  const loaderSize = size * 0.32;
  const loaderStrokeWidth = 2;
  const loaderRadius = (loaderSize - loaderStrokeWidth) / 2;
  const loaderCircumference = 2 * Math.PI * loaderRadius;
  
  // Centered positioning
  const textOffsetTop = size * 0.08;
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center animate-fade-in"
    >
      {/* Main centered container */}
      <div 
        className="relative flex flex-col items-center justify-center"
        style={{ 
          width: size * 0.75,
          height: size * 0.55,
          marginTop: -textOffsetTop,
        }}
      >
        {/* Premium orbital ring loader */}
        <div 
          className="relative"
          style={{ width: loaderSize, height: loaderSize }}
        >
          {/* Deep ambient glow - multi-layer */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(174 80% 50% / 0.5) 0%, hsl(174 70% 45% / 0.2) 40%, transparent 70%)',
              filter: 'blur(12px)',
              animation: 'loader-glow-breathe 2s ease-in-out infinite',
            }}
          />
          
          {/* Outer glow ring */}
          <div 
            className="absolute rounded-full"
            style={{
              inset: -8,
              background: 'radial-gradient(circle, transparent 50%, hsl(174 75% 55% / 0.15) 70%, transparent 100%)',
              animation: 'loader-outer-pulse 2.5s ease-in-out infinite',
            }}
          />
          
          {/* Static track ring - darker */}
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
              stroke="hsl(200 15% 18% / 0.6)"
              strokeWidth={loaderStrokeWidth + 1}
            />
          </svg>
          
          {/* Primary rotating arc - intense glow */}
          <svg 
            className="absolute inset-0"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              animation: 'loader-rotate 1.4s linear infinite',
            }}
          >
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(174 90% 55%)" stopOpacity="1" />
                <stop offset="50%" stopColor="hsl(180 85% 50%)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(174 80% 45%)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius}
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth={loaderStrokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${loaderCircumference * 0.35} ${loaderCircumference * 0.65}`}
              style={{
                filter: 'drop-shadow(0 0 8px hsl(174 85% 55% / 0.9)) drop-shadow(0 0 16px hsl(174 75% 50% / 0.5))',
              }}
            />
          </svg>
          
          {/* Secondary counter-rotating arc - subtle depth */}
          <svg 
            className="absolute inset-0"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              animation: 'loader-rotate-reverse 2.8s linear infinite',
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius - 6}
              fill="none"
              stroke="hsl(180 70% 60% / 0.35)"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeDasharray={`${(loaderCircumference - 12 * Math.PI) * 0.15} ${(loaderCircumference - 12 * Math.PI) * 0.85}`}
              style={{
                filter: 'drop-shadow(0 0 4px hsl(180 70% 55% / 0.4))',
              }}
            />
          </svg>
          
          {/* Tertiary fast inner ring */}
          <svg 
            className="absolute inset-0"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              animation: 'loader-rotate 0.9s linear infinite',
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius - 10}
              fill="none"
              stroke="hsl(174 75% 65% / 0.25)"
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeDasharray={`${(loaderCircumference - 20 * Math.PI) * 0.1} ${(loaderCircumference - 20 * Math.PI) * 0.9}`}
            />
          </svg>
          
          {/* Center core pulse */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 6,
              height: 6,
              background: 'radial-gradient(circle, hsl(174 90% 70%) 0%, hsl(174 85% 55%) 100%)',
              boxShadow: '0 0 12px hsl(174 85% 60% / 0.9), 0 0 24px hsl(174 80% 55% / 0.5)',
              animation: 'center-core-pulse 1.2s ease-in-out infinite',
            }}
          />
          
          {/* Expanding ring effect */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 8,
              height: 8,
              border: '1px solid hsl(174 80% 60% / 0.6)',
              animation: 'ring-expand-out 2s ease-out infinite',
            }}
          />
        </div>
        
        {/* Status text - premium styling */}
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            marginTop: size * 0.05,
            height: size * 0.09,
            width: '100%',
          }}
        >
          <span
            className="absolute text-center font-semibold uppercase whitespace-nowrap"
            style={{
              fontSize: 'clamp(0.55rem, 1.8vw, 0.7rem)',
              color: 'hsl(174 60% 75%)',
              textShadow: '0 0 20px hsl(174 70% 55% / 0.6), 0 0 40px hsl(174 60% 50% / 0.3)',
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(4px) scale(0.96)' : 'translateY(0) scale(1)',
              transition: 'opacity 280ms ease-out, transform 280ms ease-out',
              letterSpacing: '0.18em',
            }}
          >
            {steps[stepIndex]}
          </span>
        </div>
        
        {/* Progress bar indicator - sleek line */}
        <div 
          className="relative overflow-hidden rounded-full"
          style={{ 
            marginTop: size * 0.03,
            width: size * 0.25,
            height: 2,
            background: 'hsl(200 15% 20% / 0.5)',
          }}
        >
          <div 
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${((stepIndex + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, hsl(174 80% 50%), hsl(180 75% 55%))',
              boxShadow: '0 0 8px hsl(174 80% 55% / 0.7)',
              transition: 'width 400ms ease-out',
            }}
          />
        </div>
        
        {/* Step dots - refined */}
        <div 
          className="flex items-center justify-center gap-2"
          style={{ marginTop: size * 0.025 }}
        >
          {steps.map((_, idx) => (
            <div
              key={idx}
              className="rounded-full transition-all duration-400"
              style={{
                width: idx === stepIndex ? 8 : 4,
                height: 4,
                background: idx === stepIndex 
                  ? 'linear-gradient(90deg, hsl(174 85% 55%), hsl(180 80% 60%))' 
                  : idx < stepIndex 
                    ? 'hsl(174 65% 50% / 0.5)' 
                    : 'hsl(200 15% 35% / 0.4)',
                boxShadow: idx === stepIndex 
                  ? '0 0 10px hsl(174 85% 55% / 0.8), 0 0 20px hsl(174 75% 50% / 0.4)' 
                  : 'none',
                borderRadius: idx === stepIndex ? 4 : 2,
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
            opacity: 0.6; 
            transform: scale(0.85);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2);
          }
        }
        @keyframes loader-outer-pulse {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(0.95);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.1);
          }
        }
        @keyframes center-core-pulse {
          0%, 100% { 
            opacity: 0.7; 
            transform: translate(-50%, -50%) scale(0.85);
            box-shadow: 0 0 12px hsl(174 85% 60% / 0.9), 0 0 24px hsl(174 80% 55% / 0.5);
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.3);
            box-shadow: 0 0 18px hsl(174 90% 65% / 1), 0 0 36px hsl(174 85% 58% / 0.7);
          }
        }
        @keyframes ring-expand-out {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(3);
          }
        }
      `}</style>
    </div>
  );
};
