import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/useLanguage';

interface InGaugeAnalysisLoaderProps {
  size: number;
}

// Analysis steps with translations
const analysisSteps = {
  en: [
    "Structuring input",
    "Evaluating credibility signals",
    "Assessing contextual consistency",
    "Finalizing plausibility score"
  ],
  fr: [
    "Structuration de l'entrée",
    "Évaluation des signaux de crédibilité",
    "Analyse de la cohérence contextuelle",
    "Finalisation du score de plausibilité"
  ],
  es: [
    "Estructurando entrada",
    "Evaluando señales de credibilidad",
    "Analizando consistencia contextual",
    "Finalizando puntuación de plausibilidad"
  ],
  de: [
    "Eingabe strukturieren",
    "Glaubwürdigkeitssignale auswerten",
    "Kontextuelle Konsistenz prüfen",
    "Plausibilitätswert finalisieren"
  ],
  pt: [
    "Estruturando entrada",
    "Avaliando sinais de credibilidade",
    "Analisando consistência contextual",
    "Finalizando pontuação de plausibilidade"
  ],
  it: [
    "Strutturazione dell'input",
    "Valutazione dei segnali di credibilità",
    "Analisi della coerenza contestuale",
    "Finalizzazione del punteggio di plausibilità"
  ],
  ja: [
    "入力を構造化中",
    "信頼性シグナルを評価中",
    "文脈の一貫性を分析中",
    "妥当性スコアを最終化中"
  ],
  ko: [
    "입력 구조화 중",
    "신뢰성 신호 평가 중",
    "맥락 일관성 분석 중",
    "타당성 점수 완료 중"
  ]
};

export const InGaugeAnalysisLoader = ({ size }: InGaugeAnalysisLoaderProps) => {
  const { language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const steps = analysisSteps[language] || analysisSteps.en;
  
  // Cycle through steps with smooth fade transitions
  useEffect(() => {
    const stepDuration = 3200; // Time per step in ms
    const fadeOutDuration = 400;
    
    const interval = setInterval(() => {
      // Start fade out
      setIsTransitioning(true);
      
      // Change step after fade out
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % steps.length);
        setIsTransitioning(false);
      }, fadeOutDuration);
      
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [steps.length]);
  
  // Thin ring loader dimensions
  const loaderSize = size * 0.35;
  const loaderStrokeWidth = 2;
  const loaderRadius = (loaderSize - loaderStrokeWidth) / 2;
  const loaderCircumference = 2 * Math.PI * loaderRadius;
  
  return (
    <div 
      className="flex flex-col items-center justify-center animate-fade-in"
      style={{ gap: size * 0.06 }}
    >
      {/* Premium thin ring loader */}
      <div 
        className="relative"
        style={{ width: loaderSize, height: loaderSize }}
      >
        {/* Ambient glow behind loader */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(174 70% 55% / 0.25) 0%, transparent 70%)',
            filter: 'blur(8px)',
            animation: 'loader-glow-breathe 3s ease-in-out infinite',
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
            stroke="hsl(200 20% 30% / 0.3)"
            strokeWidth={loaderStrokeWidth}
          />
        </svg>
        
        {/* Rotating arc - premium smooth rotation */}
        <svg 
          className="absolute inset-0"
          width={loaderSize} 
          height={loaderSize} 
          viewBox={`0 0 ${loaderSize} ${loaderSize}`}
          style={{
            animation: 'loader-rotate 2.4s linear infinite',
          }}
        >
          <circle
            cx={loaderSize / 2}
            cy={loaderSize / 2}
            r={loaderRadius}
            fill="none"
            stroke="hsl(174 78% 48%)"
            strokeWidth={loaderStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${loaderCircumference * 0.25} ${loaderCircumference * 0.75}`}
            style={{
              filter: 'drop-shadow(0 0 4px hsl(174 70% 55% / 0.6))',
            }}
          />
        </svg>
        
        {/* Secondary slower arc for depth */}
        <svg 
          className="absolute inset-0"
          width={loaderSize} 
          height={loaderSize} 
          viewBox={`0 0 ${loaderSize} ${loaderSize}`}
          style={{
            animation: 'loader-rotate-reverse 4s linear infinite',
          }}
        >
          <circle
            cx={loaderSize / 2}
            cy={loaderSize / 2}
            r={loaderRadius - 4}
            fill="none"
            stroke="hsl(180 60% 50% / 0.4)"
            strokeWidth={1}
            strokeLinecap="round"
            strokeDasharray={`${(loaderCircumference - 8 * Math.PI) * 0.15} ${(loaderCircumference - 8 * Math.PI) * 0.85}`}
          />
        </svg>
      </div>
      
      {/* Evolving analysis step text */}
      <div 
        className="relative flex items-center justify-center"
        style={{ 
          minHeight: size * 0.14,
          width: size * 0.85,
        }}
      >
        <span
          className="absolute text-center font-medium tracking-wide"
          style={{
            fontSize: 'clamp(0.55rem, 1.8vw, 0.7rem)',
            color: 'hsl(174 50% 65%)',
            textShadow: '0 0 12px hsl(174 60% 50% / 0.4)',
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(4px)' : 'translateY(0)',
            transition: 'opacity 400ms ease-out, transform 400ms ease-out',
            lineHeight: 1.3,
          }}
        >
          {steps[stepIndex]}
        </span>
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
            transform: scale(0.95);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};
