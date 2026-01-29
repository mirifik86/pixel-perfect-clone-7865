import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { Sparkles } from 'lucide-react';

interface InGaugeAnalysisLoaderProps {
  size: number;
  mode?: 'standard' | 'pro';
}

// Standard analysis steps with translations
const standardSteps = {
  en: ["Structuring input", "Evaluating credibility", "Analyzing context", "Finalizing score"],
  fr: ["Structuration", "Évaluation crédibilité", "Analyse contextuelle", "Finalisation"],
  es: ["Estructurando", "Evaluando credibilidad", "Analizando contexto", "Finalizando"],
  de: ["Strukturierung", "Glaubwürdigkeit prüfen", "Kontext analysieren", "Finalisierung"],
  pt: ["Estruturando", "Avaliando credibilidade", "Analizando contexto", "Finalizando"],
  it: ["Strutturazione", "Valutazione credibilità", "Analisi contesto", "Finalizzazione"],
  ja: ["構造化中", "信頼性評価", "文脈分析", "最終化"],
  ko: ["구조화 중", "신뢰성 평가", "맥락 분석", "완료 중"]
};

// PRO analysis steps - faster rotation (3 steps) with premium labels
const proSteps = {
  en: ["Scanning sources", "Verification", "Cross-referencing"],
  fr: ["Scan des sources", "Vérification", "Recoupement"],
  es: ["Escaneando fuentes", "Verificación", "Cotejo"],
  de: ["Quellenprüfung", "Verifizierung", "Abgleich"],
  pt: ["Escaneando fontes", "Verificação", "Cruzamento"],
  it: ["Scansione fonti", "Verifica", "Incrocio"],
  ja: ["ソーススキャン", "検証中", "照合中"],
  ko: ["소스 스캔", "검증 중", "교차 검증"]
};

// PRO badge localization
const proBadgeText = {
  en: "PRO",
  fr: "PRO",
  es: "PRO",
  de: "PRO",
  pt: "PRO",
  it: "PRO",
  ja: "PRO",
  ko: "PRO"
};

// Generate particles for PRO mode orbital effect
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360,
    distance: 0.85 + Math.random() * 0.1,
    size: 1.5 + Math.random() * 1.5,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.4,
  }));
};

export const InGaugeAnalysisLoader = ({ size, mode = 'standard' }: InGaugeAnalysisLoaderProps) => {
  const { language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const isPro = mode === 'pro';
  const steps = isPro 
    ? (proSteps[language] || proSteps.en)
    : (standardSteps[language] || standardSteps.en);
  
  // Memoize particles for PRO mode
  const particles = useMemo(() => isPro ? generateParticles(8) : [], [isPro]);
  
  // Cycle through steps with smooth fade transitions
  // PRO mode cycles faster (1.2s) vs standard (2.8s)
  useEffect(() => {
    const stepDuration = isPro ? 1200 : 2800;
    const fadeOutDuration = isPro ? 200 : 300;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % steps.length);
        setIsTransitioning(false);
      }, fadeOutDuration);
      
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [steps.length, isPro]);
  
  // Premium loader dimensions
  const loaderSize = size * 0.32;
  const loaderStrokeWidth = isPro ? 2.5 : 2;
  const loaderRadius = (loaderSize - loaderStrokeWidth) / 2;
  const loaderCircumference = 2 * Math.PI * loaderRadius;
  
  // Centered positioning
  const textOffsetTop = size * 0.08;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
      {/* PRO: Premium shimmer sweep on the gauge ring (rendered at parent level) */}
      {isPro && (
        <>
          {/* Inner glow pulse - premium PRO effect */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 8,
              background: 'radial-gradient(circle, hsl(200 80% 55% / 0.08) 0%, hsl(260 60% 50% / 0.04) 50%, transparent 70%)',
              animation: 'inner-glow-pulse 2.5s ease-in-out infinite',
            }}
          />
          
          {/* Scanning beam sweep - radar effect */}
          <div 
            className="absolute rounded-full pointer-events-none overflow-hidden"
            style={{ inset: 8 }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: `conic-gradient(
                  from 0deg,
                  transparent 0deg,
                  transparent 340deg,
                  hsl(200 85% 60% / 0.15) 350deg,
                  hsl(174 80% 55% / 0.25) 355deg,
                  hsl(200 85% 60% / 0.15) 358deg,
                  transparent 360deg
                )`,
                animation: 'beam-sweep-left 3s linear infinite',
              }}
            />
            <div 
              className="absolute inset-0"
              style={{
                background: `conic-gradient(
                  from 180deg,
                  transparent 0deg,
                  transparent 340deg,
                  hsl(260 70% 60% / 0.12) 350deg,
                  hsl(280 65% 55% / 0.18) 355deg,
                  hsl(260 70% 60% / 0.12) 358deg,
                  transparent 360deg
                )`,
                animation: 'beam-sweep-right 4.5s linear infinite',
              }}
            />
          </div>
          
          {/* Orbiting particles - very subtle */}
          <div 
            className="absolute pointer-events-none"
            style={{
              inset: 0,
              animation: 'particle-orbit 8s linear infinite',
            }}
          >
            {particles.map((particle) => {
              const rad = (particle.angle * Math.PI) / 180;
              const x = Math.cos(rad) * (size / 2) * particle.distance;
              const y = Math.sin(rad) * (size / 2) * particle.distance;
              
              return (
                <div
                  key={particle.id}
                  className="absolute rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: particle.size,
                    height: particle.size,
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    background: particle.id % 2 === 0 
                      ? 'hsl(174 80% 65%)' 
                      : 'hsl(200 85% 70%)',
                    opacity: particle.opacity,
                    boxShadow: `0 0 ${particle.size * 2}px ${particle.id % 2 === 0 ? 'hsl(174 80% 60%)' : 'hsl(200 85% 65%)'}`,
                    animation: `twinkle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                  }}
                />
              );
            })}
          </div>
        </>
      )}
      
      {/* Main centered container */}
      <div 
        className="relative flex flex-col items-center justify-center"
        style={{ 
          width: size * 0.75,
          height: size * 0.55,
          marginTop: -textOffsetTop,
        }}
      >
        {/* PRO Badge - appears above the loader */}
        {isPro && (
          <div 
            className="absolute flex items-center justify-center gap-1.5"
            style={{
              top: -size * 0.02,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, hsl(200 85% 50% / 0.25) 0%, hsl(260 70% 55% / 0.25) 100%)',
              border: '1px solid hsl(200 80% 55% / 0.4)',
              boxShadow: '0 2px 12px hsl(200 80% 50% / 0.3), inset 0 1px 0 hsl(200 60% 60% / 0.2)',
              animation: 'pro-badge-glow 2s ease-in-out infinite',
            }}
          >
            <Sparkles 
              className="h-3 w-3"
              style={{ 
                color: 'hsl(174 80% 60%)',
                animation: 'sparkle-pulse 1.5s ease-in-out infinite',
              }} 
            />
            <span 
              className="text-xs font-bold tracking-wide"
              style={{
                background: 'linear-gradient(135deg, hsl(174 80% 60%) 0%, hsl(200 85% 65%) 50%, hsl(260 70% 70%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {proBadgeText[language] || proBadgeText.en}
            </span>
          </div>
        )}
        
        {/* Premium orbital ring loader */}
        <div 
          className="relative"
          style={{ 
            width: loaderSize, 
            height: loaderSize,
            marginTop: isPro ? size * 0.04 : 0,
          }}
        >
          {/* Deep ambient glow - multi-layer (enhanced for PRO) */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: isPro
                ? 'radial-gradient(circle, hsl(200 85% 55% / 0.5) 0%, hsl(174 70% 45% / 0.25) 40%, transparent 70%)'
                : 'radial-gradient(circle, hsl(174 80% 50% / 0.5) 0%, hsl(174 70% 45% / 0.2) 40%, transparent 70%)',
              filter: 'blur(12px)',
              animation: 'loader-glow-breathe 2s ease-in-out infinite',
            }}
          />
          
          {/* Outer glow ring */}
          <div 
            className="absolute rounded-full"
            style={{
              inset: -8,
              background: isPro
                ? 'radial-gradient(circle, transparent 50%, hsl(200 80% 60% / 0.18) 70%, transparent 100%)'
                : 'radial-gradient(circle, transparent 50%, hsl(174 75% 55% / 0.15) 70%, transparent 100%)',
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
          
          {/* Primary rotating arc - intense glow (premium gradient for PRO) */}
          <svg 
            className="absolute inset-0"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              animation: `loader-rotate ${isPro ? '1.2s' : '1.4s'} linear infinite`,
            }}
          >
            <defs>
              <linearGradient id={`arcGradient-${mode}`} x1="0%" y1="0%" x2="100%" y2="0%">
                {isPro ? (
                  <>
                    <stop offset="0%" stopColor="hsl(200 90% 60%)" stopOpacity="1" />
                    <stop offset="40%" stopColor="hsl(174 85% 55%)" stopOpacity="0.95" />
                    <stop offset="70%" stopColor="hsl(260 75% 60%)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="hsl(200 80% 50%)" stopOpacity="0.3" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="hsl(174 90% 55%)" stopOpacity="1" />
                    <stop offset="50%" stopColor="hsl(180 85% 50%)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(174 80% 45%)" stopOpacity="0.3" />
                  </>
                )}
              </linearGradient>
            </defs>
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius}
              fill="none"
              stroke={`url(#arcGradient-${mode})`}
              strokeWidth={loaderStrokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${loaderCircumference * 0.35} ${loaderCircumference * 0.65}`}
              style={{
                filter: isPro
                  ? 'drop-shadow(0 0 10px hsl(200 85% 60% / 0.9)) drop-shadow(0 0 20px hsl(260 70% 55% / 0.5))'
                  : 'drop-shadow(0 0 8px hsl(174 85% 55% / 0.9)) drop-shadow(0 0 16px hsl(174 75% 50% / 0.5))',
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
              animation: `loader-rotate-reverse ${isPro ? '2.2s' : '2.8s'} linear infinite`,
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius - 6}
              fill="none"
              stroke={isPro ? 'hsl(260 70% 65% / 0.4)' : 'hsl(180 70% 60% / 0.35)'}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeDasharray={`${(loaderCircumference - 12 * Math.PI) * 0.15} ${(loaderCircumference - 12 * Math.PI) * 0.85}`}
              style={{
                filter: isPro
                  ? 'drop-shadow(0 0 5px hsl(260 70% 60% / 0.5))'
                  : 'drop-shadow(0 0 4px hsl(180 70% 55% / 0.4))',
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
              animation: `loader-rotate ${isPro ? '0.7s' : '0.9s'} linear infinite`,
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius - 10}
              fill="none"
              stroke={isPro ? 'hsl(200 80% 70% / 0.3)' : 'hsl(174 75% 65% / 0.25)'}
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeDasharray={`${(loaderCircumference - 20 * Math.PI) * 0.1} ${(loaderCircumference - 20 * Math.PI) * 0.9}`}
            />
          </svg>
          
          {/* Center core pulse */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: isPro ? 7 : 6,
              height: isPro ? 7 : 6,
              background: isPro
                ? 'radial-gradient(circle, hsl(200 90% 75%) 0%, hsl(260 80% 60%) 100%)'
                : 'radial-gradient(circle, hsl(174 90% 70%) 0%, hsl(174 85% 55%) 100%)',
              boxShadow: isPro
                ? '0 0 14px hsl(200 85% 65% / 0.9), 0 0 28px hsl(260 75% 58% / 0.5)'
                : '0 0 12px hsl(174 85% 60% / 0.9), 0 0 24px hsl(174 80% 55% / 0.5)',
              animation: 'center-core-pulse 1.2s ease-in-out infinite',
            }}
          />
          
          {/* Expanding ring effect */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 8,
              height: 8,
              border: isPro
                ? '1px solid hsl(200 80% 65% / 0.6)'
                : '1px solid hsl(174 80% 60% / 0.6)',
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
              color: isPro ? 'hsl(200 70% 80%)' : 'hsl(174 60% 75%)',
              textShadow: isPro
                ? '0 0 20px hsl(200 75% 60% / 0.6), 0 0 40px hsl(260 65% 55% / 0.3)'
                : '0 0 20px hsl(174 70% 55% / 0.6), 0 0 40px hsl(174 60% 50% / 0.3)',
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(4px) scale(0.96)' : 'translateY(0) scale(1)',
              transition: `opacity ${isPro ? '180ms' : '280ms'} ease-out, transform ${isPro ? '180ms' : '280ms'} ease-out`,
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
              background: isPro
                ? 'linear-gradient(90deg, hsl(200 85% 55%), hsl(174 80% 50%), hsl(260 70% 58%))'
                : 'linear-gradient(90deg, hsl(174 80% 50%), hsl(180 75% 55%))',
              boxShadow: isPro
                ? '0 0 10px hsl(200 80% 60% / 0.7)'
                : '0 0 8px hsl(174 80% 55% / 0.7)',
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
                  ? isPro
                    ? 'linear-gradient(90deg, hsl(200 85% 60%), hsl(260 75% 62%))'
                    : 'linear-gradient(90deg, hsl(174 85% 55%), hsl(180 80% 60%))'
                  : idx < stepIndex 
                    ? isPro
                      ? 'hsl(200 65% 55% / 0.5)'
                      : 'hsl(174 65% 50% / 0.5)'
                    : 'hsl(200 15% 35% / 0.4)',
                boxShadow: idx === stepIndex 
                  ? isPro
                    ? '0 0 12px hsl(200 85% 60% / 0.8), 0 0 24px hsl(260 70% 55% / 0.4)'
                    : '0 0 10px hsl(174 85% 55% / 0.8), 0 0 20px hsl(174 75% 50% / 0.4)'
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
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: translate(calc(-50% + var(--x, 0)), calc(-50% + var(--y, 0))) scale(0.8); }
          50% { opacity: 0.7; transform: translate(calc(-50% + var(--x, 0)), calc(-50% + var(--y, 0))) scale(1.2); }
        }
        @keyframes inner-glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @keyframes beam-sweep-left {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes beam-sweep-right {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes particle-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pro-badge-glow {
          0%, 100% { 
            box-shadow: 0 2px 12px hsl(200 80% 50% / 0.3), inset 0 1px 0 hsl(200 60% 60% / 0.2);
          }
          50% { 
            box-shadow: 0 2px 18px hsl(200 80% 55% / 0.5), 0 0 25px hsl(260 70% 55% / 0.3), inset 0 1px 0 hsl(200 60% 60% / 0.3);
          }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.7; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};
