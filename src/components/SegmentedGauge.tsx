import { useEffect, useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { Loader2 } from 'lucide-react';

interface SegmentedGaugeProps {
  score: number | null;
  className?: string;
  hasContent?: boolean;
  onAnalyze?: () => void;
  isLoading?: boolean;
  onChevronCycleComplete?: () => void;
  onTransferStart?: () => void;
}

// Sparkle configuration for result state
const generateSparkles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360,
    distance: 0.55 + Math.random() * 0.15,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 1.5,
  }));
};

export const SegmentedGauge = ({
  score,
  className,
  hasContent = false,
  onAnalyze,
  isLoading = false,
  onChevronCycleComplete,
  onTransferStart
}: SegmentedGaugeProps) => {
  const { t } = useLanguage();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [buttonCharged, setButtonCharged] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [showTransferBeam, setShowTransferBeam] = useState(false);
  const animationRef = useRef<number | null>(null);
  const prevUiStateRef = useRef<string>('idle');
  
  const sparkles = useMemo(() => generateSparkles(12), []);

  // Segment colors (solid, no gradients)
  const segmentColors = {
    low: '#B63B3B',
    med: '#D08A2D',
    good: '#4FAE8A',
    exc: '#1F8F6F'
  };

  // Credibility labels
  const getCredibilityLabel = (value: number) => {
    if (value < 25) return t('gauge.veryLowCredibility') || 'VERY LOW';
    if (value < 50) return t('gauge.lowCredibility') || 'LOW';
    if (value < 75) return t('gauge.goodCredibility') || 'GOOD';
    return t('gauge.highCredibility') || 'EXCELLENT';
  };

  const getScoreColor = (value: number) => {
    if (value < 25) return segmentColors.low;
    if (value < 50) return segmentColors.med;
    if (value < 75) return segmentColors.good;
    return segmentColors.exc;
  };

  // Score animation
  useEffect(() => {
    if (score !== null) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      setShowSparkles(true);
      const startValue = 0;
      const endValue = score;
      const duration = 1800;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
        const easedProgress = easeOutQuart(progress);
        const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);
        
        setAnimatedScore(currentValue);
        setDisplayScore(currentValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      const timer = setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, 150);
      
      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      setAnimatedScore(0);
      setDisplayScore(0);
      setShowSparkles(false);
    }
  }, [score]);

  // UI state machine
  const uiState = score !== null ? 'result' : (isLoading ? 'analyzing' : (hasContent ? 'ready' : 'idle'));
  
  // State transitions
  useEffect(() => {
    const prevState = prevUiStateRef.current;
    
    if (prevState === 'idle' && uiState === 'ready') {
      setIsTransitioning(true);
      onTransferStart?.();
      setShowTransferBeam(true);
      
      setTimeout(() => {
        setShowTransferBeam(false);
        setButtonCharged(true);
      }, 350);
      
      setTimeout(() => setButtonCharged(false), 650);
      setTimeout(() => setIsTransitioning(false), 850);
    }
    
    prevUiStateRef.current = uiState;
  }, [uiState, onTransferStart]);

  const handleAnalyzeClick = () => {
    setIsButtonPressed(true);
    setTimeout(() => {
      setIsButtonPressed(false);
      onAnalyze?.();
    }, 120);
  };

  // Calculate score indicator position on the arc
  const scoreAngle = -90 + (animatedScore / 100) * 360; // Full circle from top
  const indicatorRad = (scoreAngle * Math.PI) / 180;
  const indicatorX = 130 + 110 * Math.cos(indicatorRad);
  const indicatorY = 130 + 110 * Math.sin(indicatorRad);

  return (
    <div className={`ls-gauge-wrap ${className || ''}`}>
      {/* Sparkle particles for result */}
      {showSparkles && score !== null && (
        <>
          {sparkles.map((sparkle) => {
            const rad = (sparkle.angle * Math.PI) / 180;
            const finalX = Math.cos(rad) * 140 * sparkle.distance;
            const finalY = Math.sin(rad) * 140 * sparkle.distance;
            const particleColor = getScoreColor(animatedScore);
            
            return (
              <div
                key={sparkle.id}
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  width: sparkle.size,
                  height: sparkle.size,
                  background: particleColor,
                  borderRadius: '50%',
                  boxShadow: `0 0 ${sparkle.size * 2}px ${particleColor}`,
                  animation: `sparkle-orbit ${sparkle.duration}s ease-in-out ${sparkle.delay}s infinite`,
                  transform: `translate(calc(-50% + ${finalX}px), calc(-50% + ${finalY}px))`,
                }}
              />
            );
          })}
        </>
      )}

      <svg className="ls-gauge" viewBox="0 0 260 260" aria-label="LeenScore gauge">
        {/* Subtle base ring */}
        <circle cx="130" cy="130" r="110" className="ls-gauge-base" />

        {/* Segmented ring - 4 solid color segments */}
        {/* Segment 1 (Low) - Red */}
        <circle 
          cx="130" cy="130" r="110" 
          className="ls-gauge-seg"
          style={{ stroke: segmentColors.low, opacity: score !== null && animatedScore >= 0 ? 1 : 0.3 }}
          strokeDasharray="160 691" 
          strokeDashoffset="0"
          transform="rotate(-90 130 130)" 
        />
        
        {/* Segment 2 (Medium) - Orange */}
        <circle 
          cx="130" cy="130" r="110" 
          className="ls-gauge-seg"
          style={{ stroke: segmentColors.med, opacity: score !== null && animatedScore >= 25 ? 1 : 0.3 }}
          strokeDasharray="160 691" 
          strokeDashoffset="-173"
          transform="rotate(-90 130 130)" 
        />
        
        {/* Segment 3 (Good) - Green */}
        <circle 
          cx="130" cy="130" r="110" 
          className="ls-gauge-seg"
          style={{ stroke: segmentColors.good, opacity: score !== null && animatedScore >= 50 ? 1 : 0.3 }}
          strokeDasharray="160 691" 
          strokeDashoffset="-346"
          transform="rotate(-90 130 130)" 
        />
        
        {/* Segment 4 (Excellent) - Teal */}
        <circle 
          cx="130" cy="130" r="110" 
          className="ls-gauge-seg"
          style={{ stroke: segmentColors.exc, opacity: score !== null && animatedScore >= 75 ? 1 : 0.3 }}
          strokeDasharray="160 691" 
          strokeDashoffset="-519"
          transform="rotate(-90 130 130)" 
        />

        {/* Crisp separators (ticks) */}
        <g className="ls-gauge-ticks">
          <line x1="130" y1="14" x2="130" y2="34" />
          <line x1="246" y1="130" x2="226" y2="130" />
          <line x1="130" y1="246" x2="130" y2="226" />
          <line x1="14" y1="130" x2="34" y2="130" />
        </g>

        {/* Soft inner ring (premium depth) */}
        <circle cx="130" cy="130" r="88" className="ls-gauge-inner" />

        {/* Score indicator dot */}
        {score !== null && (
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r="6"
            fill="white"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))',
              transition: 'cx 0.1s, cy 0.1s',
            }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="ls-gauge-center">
        {/* RESULT STATE */}
        {uiState === 'result' && (
          <div className="flex flex-col items-center justify-center animate-scale-in">
            <span 
              className="font-bold tabular-nums"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                color: getScoreColor(animatedScore),
                textShadow: `0 0 30px ${getScoreColor(animatedScore)}80`,
                lineHeight: 1,
              }}
            >
              {displayScore}
            </span>
            <span 
              className="uppercase font-semibold tracking-widest mt-2"
              style={{ 
                fontSize: 'clamp(0.6rem, 2vw, 0.75rem)', 
                color: getScoreColor(animatedScore),
                opacity: 0.9,
              }}
            >
              {getCredibilityLabel(animatedScore)}
            </span>
          </div>
        )}

        {/* ANALYZING STATE */}
        {uiState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 
              className="motion-reduce:animate-none"
              style={{ 
                width: 32, 
                height: 32,
                color: 'hsl(174 65% 55%)',
                animation: 'spin 1.2s linear infinite',
              }}
            />
            <span 
              className="uppercase font-semibold tracking-widest"
              style={{ 
                fontSize: 'clamp(0.6rem, 2vw, 0.75rem)', 
                color: 'hsl(174 60% 60%)',
              }}
            >
              {t('gauge.analyzing')}
            </span>
          </div>
        )}

        {/* IDLE STATE */}
        {uiState === 'idle' && (
          <span
            className="uppercase font-semibold tracking-[0.16em] text-center ls-idle-text"
            style={{
              fontSize: 'clamp(0.68rem, 2.4vw, 0.88rem)',
              color: 'hsl(174 45% 72%)',
            }}
          >
            {t('gauge.readyToAnalyze')}
          </span>
        )}

        {/* TRANSITIONING */}
        {uiState === 'ready' && isTransitioning && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'text-morph-exit 450ms ease-out forwards' }}
          >
            <span
              className="uppercase font-semibold tracking-[0.16em] text-center"
              style={{
                fontSize: 'clamp(0.68rem, 2.4vw, 0.88rem)',
                color: 'hsl(174 45% 72%)',
              }}
            >
              {t('gauge.readyToAnalyze')}
            </span>
          </div>
        )}

        {/* READY STATE - Button */}
        {uiState === 'ready' && (
          <button 
            className="ls-gauge-btn"
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning 
                ? 'scale(0.7) translateY(10px)' 
                : isButtonPressed 
                  ? 'translateY(0) scale(0.99)' 
                  : 'translateY(-1px)',
              animation: isTransitioning 
                ? 'button-morph-enter 480ms cubic-bezier(0.34, 1.56, 0.64, 1) 320ms forwards' 
                : 'none',
              background: buttonCharged 
                ? 'rgba(32, 180, 170, 0.38)' 
                : 'rgba(32, 180, 170, 0.28)',
            }}
          >
            {t('gauge.startAnalysis')}
          </button>
        )}
      </div>

      {/* Transfer beam effect */}
      {showTransferBeam && (
        <div className="ls-transfer-beam">
          <div className="ls-beam-line" />
          <div className="ls-beam-orb" />
        </div>
      )}

      {/* Downward chevrons for idle */}
      {uiState === 'idle' && (
        <div className="ls-chevrons-down">
          {[0, 1, 2].map((i) => (
            <svg 
              key={i} 
              width="14" 
              height="7" 
              viewBox="0 0 14 7"
              style={{ 
                animation: `chevron-cascade 3s ease-in-out ${i * 160}ms infinite`,
                opacity: 0.5,
              }}
              onAnimationIteration={i === 2 ? () => onChevronCycleComplete?.() : undefined}
            >
              <path 
                d="M1 1L7 6L13 1" 
                stroke="hsl(180 35% 55%)" 
                strokeWidth="1.25" 
                strokeLinecap="round" 
                fill="none"
              />
            </svg>
          ))}
        </div>
      )}

      {/* Upward chevrons for ready */}
      {uiState === 'ready' && (
        <div className="ls-chevrons-up">
          {[0, 1, 2].map((i) => (
            <svg 
              key={i} 
              width="12" 
              height="6" 
              viewBox="0 0 14 7"
              style={{ 
                animation: `chevron-up-cascade 3.2s ease-in-out ${(2 - i) * 140}ms infinite`,
                transform: 'rotate(180deg)',
              }}
            >
              <path 
                d="M1 1L7 6L13 1" 
                stroke="hsl(174 50% 60%)" 
                strokeWidth="1.25" 
                strokeLinecap="round" 
                fill="none"
              />
            </svg>
          ))}
        </div>
      )}

      <style>{`
        @keyframes sparkle-orbit {
          0%, 100% { opacity: 0.3; transform: translate(calc(-50% + var(--fx, 0)), calc(-50% + var(--fy, 0))) scale(0.6); }
          50% { opacity: 1; transform: translate(calc(-50% + var(--fx, 0)), calc(-50% + var(--fy, 0))) scale(1.3); }
        }
        @keyframes chevron-cascade {
          0% { opacity: 0; transform: translateY(-8px); }
          15% { opacity: 0.85; transform: translateY(-2px); }
          50% { opacity: 0.7; transform: translateY(5px); }
          75% { opacity: 0.3; transform: translateY(10px); }
          88%, 100% { opacity: 0; transform: translateY(12px); }
        }
        @keyframes chevron-up-cascade {
          0% { opacity: 0; transform: rotate(180deg) translateY(10px); }
          15% { opacity: 0.5; transform: rotate(180deg) translateY(5px); }
          50% { opacity: 0.45; transform: rotate(180deg) translateY(-2px); }
          75% { opacity: 0.2; transform: rotate(180deg) translateY(-6px); }
          88%, 100% { opacity: 0; transform: rotate(180deg) translateY(-8px); }
        }
      `}</style>
    </div>
  );
};
