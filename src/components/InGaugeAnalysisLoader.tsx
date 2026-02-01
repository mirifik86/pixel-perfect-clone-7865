import { useEffect, useState, useMemo, useRef } from 'react';
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

// PRO analysis steps - Title Case, more professional labels
const proSteps = {
  en: ["Scanning Sources", "Verification", "Cross-referencing Data"],
  fr: ["Scan des sources", "Vérification", "Recoupement des sources"],
  es: ["Escaneando Fuentes", "Verificación", "Cotejo de Datos"],
  de: ["Quellenprüfung", "Verifizierung", "Datenabgleich"],
  pt: ["Escaneando Fontes", "Verificação", "Cruzamento de Dados"],
  it: ["Scansione Fonti", "Verifica", "Incrocio Dati"],
  ja: ["ソーススキャン", "検証中", "データ照合"],
  ko: ["소스 스캔", "검증 중", "데이터 교차 검증"]
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

// Generate particles for PRO mode orbital effect - organic distribution
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + (Math.random() - 0.5) * 25,
    distance: 0.80 + Math.random() * 0.14,
    size: 1.0 + Math.random() * 1.0,
    delay: Math.random() * 4,
    duration: 5 + Math.random() * 4,
    opacity: 0.20 + Math.random() * 0.30,
    orbitSpeed: 14 + Math.random() * 10,
  }));
};

export const InGaugeAnalysisLoader = ({ size, mode = 'standard' }: InGaugeAnalysisLoaderProps) => {
  const { language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevStepRef = useRef(0);
  
  const isPro = mode === 'pro';
  const steps = isPro 
    ? (proSteps[language] || proSteps.en)
    : (standardSteps[language] || standardSteps.en);
  
  // Memoize particles for PRO mode - 8 particles for subtle effect
  const particles = useMemo(() => isPro ? generateParticles(8) : [], [isPro]);
  
  // Cycle through steps with smooth fade transitions
  useEffect(() => {
    const stepDuration = isPro ? 1400 : 2800;
    const fadeOutDuration = isPro ? 220 : 300;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Trigger pulse on PRO stage change
      if (isPro) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 450);
      }
      
      setTimeout(() => {
        setStepIndex((prev) => {
          prevStepRef.current = prev;
          return (prev + 1) % steps.length;
        });
        setIsTransitioning(false);
      }, fadeOutDuration);
      
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [steps.length, isPro]);
  
  // Premium loader dimensions - slightly thicker for PRO
  const loaderSize = size * 0.34;
  const loaderStrokeWidth = isPro ? 3 : 2;
  const loaderRadius = (loaderSize - loaderStrokeWidth) / 2;
  const loaderCircumference = 2 * Math.PI * loaderRadius;
  
  // Outer glow ring for PRO (counter-rotating)
  const outerGlowRadius = loaderRadius + 8;
  const outerGlowCircumference = 2 * Math.PI * outerGlowRadius;
  
  // Centered positioning
  const textOffsetTop = size * 0.07;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
      {/* PRO: Premium radar-signature effects */}
      {isPro && (
        <>
          {/* Ambient inner glow - pulses on stage change */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 10,
              background: 'radial-gradient(circle, hsl(200 80% 55% / 0.10) 0%, hsl(260 60% 52% / 0.05) 50%, transparent 70%)',
              animation: 'inner-glow-pulse 2.8s ease-in-out infinite',
              transform: isPulsing ? 'scale(1.04)' : 'scale(1)',
              opacity: isPulsing ? 1 : 0.75,
              transition: 'transform 380ms cubic-bezier(0.4, 0, 0.2, 1), opacity 380ms ease-out',
            }}
          />
          
          {/* Radar sweep - slow conic gradient rotation */}
          <div 
            className="absolute rounded-full pointer-events-none overflow-hidden"
            style={{ inset: 10 }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: `conic-gradient(
                  from 0deg,
                  transparent 0deg,
                  transparent 320deg,
                  hsl(200 90% 62% / 0.08) 340deg,
                  hsl(174 85% 58% / 0.18) 350deg,
                  hsl(200 90% 62% / 0.12) 355deg,
                  transparent 360deg
                )`,
                animation: 'radar-sweep 10s linear infinite',
              }}
            />
          </div>
          
          {/* Secondary radar sweep - opposite direction, offset */}
          <div 
            className="absolute rounded-full pointer-events-none overflow-hidden"
            style={{ inset: 10 }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: `conic-gradient(
                  from 180deg,
                  transparent 0deg,
                  transparent 330deg,
                  hsl(260 75% 60% / 0.06) 345deg,
                  hsl(280 70% 58% / 0.12) 352deg,
                  hsl(260 75% 60% / 0.06) 356deg,
                  transparent 360deg
                )`,
                animation: 'radar-sweep-reverse 14s linear infinite',
              }}
            />
          </div>
          
          {/* Orbiting micro particles */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                width: 0,
                height: 0,
                animation: `particle-orbit ${particle.orbitSpeed}s linear infinite`,
                animationDelay: `${-particle.delay}s`,
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  transform: `translate(-50%, -50%) translateX(${(size / 2) * particle.distance}px) rotate(${particle.angle}deg)`,
                  background: particle.id % 3 === 0 
                    ? 'hsl(174 88% 72%)' 
                    : particle.id % 3 === 1
                      ? 'hsl(200 92% 76%)'
                      : 'hsl(260 78% 74%)',
                  opacity: particle.opacity,
                  boxShadow: `0 0 ${particle.size * 3}px ${
                    particle.id % 3 === 0 ? 'hsl(174 88% 68%)' : 
                    particle.id % 3 === 1 ? 'hsl(200 92% 72%)' : 'hsl(260 78% 70%)'
                  }`,
                  animation: `twinkle-soft ${particle.duration}s ease-in-out infinite`,
                  animationDelay: `${particle.delay}s`,
                }}
              />
            </div>
          ))}
        </>
      )}
      
      {/* Main centered container */}
      <div 
        className="relative flex flex-col items-center justify-center"
        style={{ 
          width: size * 0.78,
          height: size * 0.58,
          marginTop: -textOffsetTop,
        }}
      >
        {/* PRO Badge - refined seal appearance */}
        {isPro && (
          <div 
            className="absolute flex items-center justify-center gap-1.5"
            style={{
              top: -size * 0.015,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '4px 14px',
              borderRadius: '16px',
              background: 'linear-gradient(145deg, hsl(200 88% 52% / 0.22) 0%, hsl(260 72% 55% / 0.18) 100%)',
              border: '1.5px solid hsl(200 82% 58% / 0.55)',
              boxShadow: `
                0 1px 12px hsl(200 85% 55% / 0.35),
                0 0 24px hsl(260 70% 55% / 0.15),
                inset 0 1px 1px hsl(200 75% 75% / 0.25),
                inset 0 -1px 1px hsl(260 65% 45% / 0.15)
              `,
              animation: 'pro-seal-glow 2.5s ease-in-out infinite',
            }}
          >
            <Sparkles 
              className="h-3 w-3"
              style={{ 
                color: 'hsl(174 88% 62%)',
                filter: 'drop-shadow(0 0 3px hsl(174 85% 58% / 0.7))',
                animation: 'sparkle-subtle 2s ease-in-out infinite',
              }} 
            />
            <span 
              className="text-xs font-black"
              style={{
                background: 'linear-gradient(140deg, hsl(174 92% 65%) 0%, hsl(200 95% 70%) 45%, hsl(260 82% 72%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 4px hsl(200 80% 58% / 0.4))',
                letterSpacing: '0.12em',
                fontSize: '0.72rem',
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
            width: loaderSize + (isPro ? 18 : 0), 
            height: loaderSize + (isPro ? 18 : 0),
            marginTop: isPro ? size * 0.035 : 0,
          }}
        >
          {/* PRO: Outer glow ring - slow counter-rotation */}
          {isPro && (
            <svg 
              className="absolute"
              width={loaderSize + 18} 
              height={loaderSize + 18} 
              viewBox={`0 0 ${loaderSize + 18} ${loaderSize + 18}`}
              style={{
                left: 0,
                top: 0,
                animation: 'glow-ring-rotate 12s linear infinite',
              }}
            >
              <defs>
                <linearGradient id="outerGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(200 88% 68%)" stopOpacity="0.28" />
                  <stop offset="40%" stopColor="hsl(260 72% 65%)" stopOpacity="0.18" />
                  <stop offset="80%" stopColor="hsl(174 82% 60%)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(200 88% 68%)" stopOpacity="0.28" />
                </linearGradient>
              </defs>
              <circle
                cx={(loaderSize + 18) / 2}
                cy={(loaderSize + 18) / 2}
                r={outerGlowRadius}
                fill="none"
                stroke="url(#outerGlowGradient)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={`${outerGlowCircumference * 0.22} ${outerGlowCircumference * 0.12} ${outerGlowCircumference * 0.08} ${outerGlowCircumference * 0.58}`}
                style={{
                  filter: 'blur(1px) drop-shadow(0 0 10px hsl(200 85% 62% / 0.35))',
                  transform: isPulsing ? 'scale(1.03)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </svg>
          )}
          
          {/* Deep ambient glow - enhanced pulse on stage change for PRO */}
          <div 
            className="absolute rounded-full"
            style={{
              left: isPro ? 9 : 0,
              top: isPro ? 9 : 0,
              width: loaderSize,
              height: loaderSize,
              background: isPro
                ? 'radial-gradient(circle, hsl(200 88% 58% / 0.50) 0%, hsl(174 72% 48% / 0.22) 45%, transparent 72%)'
                : 'radial-gradient(circle, hsl(174 80% 50% / 0.5) 0%, hsl(174 70% 45% / 0.2) 40%, transparent 70%)',
              filter: 'blur(14px)',
              animation: 'loader-glow-breathe 2.2s ease-in-out infinite',
              transform: isPro && isPulsing ? 'scale(1.18)' : 'scale(1)',
              opacity: isPro && isPulsing ? 1 : 0.82,
              transition: 'transform 380ms cubic-bezier(0.4, 0, 0.2, 1), opacity 380ms ease-out',
            }}
          />
          
          {/* Static track ring */}
          <svg 
            className="absolute"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              left: isPro ? 9 : 0,
              top: isPro ? 9 : 0,
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius}
              fill="none"
              stroke={isPro ? 'hsl(200 18% 16% / 0.65)' : 'hsl(200 15% 18% / 0.6)'}
              strokeWidth={loaderStrokeWidth + 1}
            />
          </svg>
          
          {/* Primary rotating arc */}
          <svg 
            className="absolute"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              left: isPro ? 9 : 0,
              top: isPro ? 9 : 0,
              animation: `loader-rotate ${isPro ? '1.1s' : '1.4s'} linear infinite`,
            }}
          >
            <defs>
              <linearGradient id={`arcGradient-${mode}`} x1="0%" y1="0%" x2="100%" y2="0%">
                {isPro ? (
                  <>
                    <stop offset="0%" stopColor="hsl(200 95% 66%)" stopOpacity="1" />
                    <stop offset="30%" stopColor="hsl(174 92% 60%)" stopOpacity="0.95" />
                    <stop offset="60%" stopColor="hsl(260 82% 66%)" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="hsl(200 88% 58%)" stopOpacity="0.25" />
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
              strokeDasharray={`${loaderCircumference * 0.38} ${loaderCircumference * 0.62}`}
              style={{
                filter: isPro
                  ? 'drop-shadow(0 0 12px hsl(200 92% 64% / 0.85)) drop-shadow(0 0 24px hsl(260 78% 60% / 0.45))'
                  : 'drop-shadow(0 0 8px hsl(174 85% 55% / 0.9)) drop-shadow(0 0 16px hsl(174 75% 50% / 0.5))',
              }}
            />
          </svg>
          
          {/* Secondary counter-rotating arc */}
          <svg 
            className="absolute"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              left: isPro ? 9 : 0,
              top: isPro ? 9 : 0,
              animation: `loader-rotate-reverse ${isPro ? '2s' : '2.8s'} linear infinite`,
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius - 6}
              fill="none"
              stroke={isPro ? 'hsl(260 78% 70% / 0.42)' : 'hsl(180 70% 60% / 0.35)'}
              strokeWidth={isPro ? 1.4 : 1.2}
              strokeLinecap="round"
              strokeDasharray={`${(loaderCircumference - 12 * Math.PI) * 0.18} ${(loaderCircumference - 12 * Math.PI) * 0.82}`}
              style={{
                filter: isPro
                  ? 'drop-shadow(0 0 6px hsl(260 78% 65% / 0.5))'
                  : 'drop-shadow(0 0 4px hsl(180 70% 55% / 0.4))',
              }}
            />
          </svg>
          
          {/* Tertiary fast inner ring */}
          <svg 
            className="absolute"
            width={loaderSize} 
            height={loaderSize} 
            viewBox={`0 0 ${loaderSize} ${loaderSize}`}
            style={{
              left: isPro ? 9 : 0,
              top: isPro ? 9 : 0,
              animation: `loader-rotate ${isPro ? '0.65s' : '0.9s'} linear infinite`,
            }}
          >
            <circle
              cx={loaderSize / 2}
              cy={loaderSize / 2}
              r={loaderRadius - 10}
              fill="none"
              stroke={isPro ? 'hsl(200 88% 74% / 0.38)' : 'hsl(174 75% 65% / 0.25)'}
              strokeWidth={isPro ? 1 : 0.8}
              strokeLinecap="round"
              strokeDasharray={`${(loaderCircumference - 20 * Math.PI) * 0.12} ${(loaderCircumference - 20 * Math.PI) * 0.88}`}
            />
          </svg>
          
          {/* Center core pulse */}
          <div 
            className="absolute rounded-full"
            style={{
              left: isPro ? 9 + loaderSize / 2 : loaderSize / 2,
              top: isPro ? 9 + loaderSize / 2 : loaderSize / 2,
              width: isPro ? 9 : 6,
              height: isPro ? 9 : 6,
              transform: 'translate(-50%, -50%)',
              background: isPro
                ? 'radial-gradient(circle, hsl(200 95% 80%) 0%, hsl(260 88% 68%) 100%)'
                : 'radial-gradient(circle, hsl(174 90% 70%) 0%, hsl(174 85% 55%) 100%)',
              boxShadow: isPro
                ? '0 0 18px hsl(200 92% 70% / 0.9), 0 0 36px hsl(260 82% 62% / 0.5)'
                : '0 0 12px hsl(174 85% 60% / 0.9), 0 0 24px hsl(174 80% 55% / 0.5)',
              animation: 'center-core-pulse 1.1s ease-in-out infinite',
            }}
          />
          
          {/* Expanding ring effect */}
          <div 
            className="absolute rounded-full"
            style={{
              left: isPro ? 9 + loaderSize / 2 : loaderSize / 2,
              top: isPro ? 9 + loaderSize / 2 : loaderSize / 2,
              width: 10,
              height: 10,
              transform: 'translate(-50%, -50%)',
              border: isPro
                ? '1px solid hsl(200 88% 70% / 0.55)'
                : '1px solid hsl(174 80% 60% / 0.6)',
              animation: 'ring-expand-out 1.8s ease-out infinite',
            }}
          />
        </div>
        
        {/* Status text - enhanced readability */}
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            marginTop: size * 0.045,
            height: size * 0.10,
            width: '100%',
          }}
        >
          <span
            className="absolute text-center font-semibold whitespace-nowrap"
            style={{
              fontSize: 'clamp(0.58rem, 1.9vw, 0.75rem)',
              color: isPro ? 'hsl(200 78% 88%)' : 'hsl(174 60% 75%)',
              textShadow: isPro
                ? '0 0 28px hsl(200 82% 65% / 0.65), 0 0 50px hsl(260 72% 60% / 0.30)'
                : '0 0 20px hsl(174 70% 55% / 0.6), 0 0 40px hsl(174 60% 50% / 0.3)',
              opacity: isTransitioning ? 0 : (isPro ? 1 : 0.9),
              transform: isTransitioning ? 'translateY(5px) scale(0.95)' : 'translateY(0) scale(1)',
              transition: `opacity ${isPro ? '200ms' : '280ms'} ease-out, transform ${isPro ? '200ms' : '280ms'} ease-out`,
              letterSpacing: isPro ? '0.20em' : '0.18em',
              textTransform: isPro ? 'none' : 'uppercase',
            }}
          >
            {steps[stepIndex]}
          </span>
        </div>
        
        {/* Progress bar indicator */}
        <div 
          className="relative overflow-hidden rounded-full"
          style={{ 
            marginTop: size * 0.025,
            width: size * 0.26,
            height: isPro ? 2.5 : 2,
            background: 'hsl(200 15% 18% / 0.55)',
          }}
        >
          <div 
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${((stepIndex + 1) / steps.length) * 100}%`,
              background: isPro
                ? 'linear-gradient(90deg, hsl(200 92% 60%), hsl(174 88% 54%), hsl(260 78% 64%))'
                : 'linear-gradient(90deg, hsl(174 80% 50%), hsl(180 75% 55%))',
              boxShadow: isPro
                ? '0 0 14px hsl(200 88% 64% / 0.7)'
                : '0 0 8px hsl(174 80% 55% / 0.7)',
              transition: 'width 400ms ease-out',
            }}
          />
        </div>
        
        {/* Step dots */}
        <div 
          className="flex items-center justify-center gap-2"
          style={{ marginTop: size * 0.022 }}
        >
          {steps.map((_, idx) => (
            <div
              key={idx}
              className="rounded-full transition-all duration-400"
              style={{
                width: idx === stepIndex ? (isPro ? 10 : 8) : 4,
                height: isPro ? 4.5 : 4,
                background: idx === stepIndex 
                  ? isPro
                    ? 'linear-gradient(90deg, hsl(200 92% 64%), hsl(260 82% 68%))'
                    : 'linear-gradient(90deg, hsl(174 85% 55%), hsl(180 80% 60%))'
                  : idx < stepIndex 
                    ? isPro
                      ? 'hsl(200 72% 60% / 0.55)'
                      : 'hsl(174 65% 50% / 0.5)'
                    : 'hsl(200 15% 32% / 0.45)',
                boxShadow: idx === stepIndex 
                  ? isPro
                    ? '0 0 16px hsl(200 92% 64% / 0.8), 0 0 30px hsl(260 78% 60% / 0.4)'
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
        @keyframes glow-ring-rotate {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes radar-sweep-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes loader-glow-breathe {
          0%, 100% { 
            opacity: 0.65; 
            transform: scale(0.88);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.15);
          }
        }
        @keyframes center-core-pulse {
          0%, 100% { 
            opacity: 0.75; 
          }
          50% { 
            opacity: 1; 
          }
        }
        @keyframes ring-expand-out {
          0% {
            opacity: 0.75;
            width: 10px;
            height: 10px;
          }
          100% {
            opacity: 0;
            width: 32px;
            height: 32px;
          }
        }
        @keyframes twinkle-soft {
          0%, 100% { opacity: 0.18; transform: scale(0.88); }
          50% { opacity: 0.55; transform: scale(1.12); }
        }
        @keyframes inner-glow-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.88; }
        }
        @keyframes particle-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pro-seal-glow {
          0%, 100% { 
            box-shadow: 0 1px 12px hsl(200 85% 55% / 0.35), 0 0 24px hsl(260 70% 55% / 0.15), inset 0 1px 1px hsl(200 75% 75% / 0.25), inset 0 -1px 1px hsl(260 65% 45% / 0.15);
          }
          50% { 
            box-shadow: 0 1px 18px hsl(200 88% 58% / 0.48), 0 0 32px hsl(260 75% 58% / 0.22), inset 0 1px 1px hsl(200 78% 78% / 0.32), inset 0 -1px 1px hsl(260 68% 48% / 0.18);
          }
        }
        @keyframes sparkle-subtle {
          0%, 100% { opacity: 0.78; transform: scale(0.94); }
          50% { opacity: 1; transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
};
