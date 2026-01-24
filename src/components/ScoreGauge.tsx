import { useEffect, useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScoreGaugeProps {
  score: number | null; // 0-100 or null for pending
  size?: number;
  className?: string;
  hasContent?: boolean; // When true, shows ANALYZE button instead of READY status
  onAnalyze?: () => void; // Callback when ANALYZE button is clicked
  isLoading?: boolean; // Loading state for the button
  onChevronCycleComplete?: () => void; // Callback when chevron cascade completes (for input highlight)
  onTransferStart?: () => void; // Callback when idle→ready transfer animation starts (for input capture effect)
}

// Generate sparkle particles configuration
const generateSparkles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360,
    distance: 0.55 + Math.random() * 0.15,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 1.5,
    opacity: 0.4 + Math.random() * 0.6
  }));
};

export const ScoreGauge = ({
  score,
  size = 160,
  className,
  hasContent = false,
  onAnalyze,
  isLoading = false,
  onChevronCycleComplete,
  onTransferStart
}: ScoreGaugeProps) => {
  const { language, t } = useLanguage();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [buttonAbsorbed, setButtonAbsorbed] = useState(false);
  const [showTransferBeam, setShowTransferBeam] = useState(false);
  const [buttonCharged, setButtonCharged] = useState(false);
  const animationRef = useRef<number | null>(null);
  const prevUiStateRef = useRef<string>('idle');
  
  // Memoize sparkles to prevent regeneration on each render
  const sparkles = useMemo(() => generateSparkles(16), []);
  
  // Premium thicker stroke for visual impact
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * 0.75; // 270 degrees
  const segmentArc = totalArc / 5; // Each segment is 1/5 of the arc
  const gap = 4; // Crisp gap between segments

  useEffect(() => {
    if (score !== null) {
      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Trigger sparkles when score appears
      setShowSparkles(true);
      
      const startValue = 0;
      const endValue = score;
      const duration = 1800; // Slightly shorter for snappier feel
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing without bounce
        const easeOutQuart = (t: number) => {
          return 1 - Math.pow(1 - t, 4);
        };
        
        const easedProgress = easeOutQuart(progress);
        const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);
        
        setAnimatedScore(currentValue);
        setDisplayScore(currentValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Small delay before starting animation
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

  // Premium gradient colors with smooth transitions
  const colorPairs = [
    { base: 'hsl(0 70% 45%)', light: 'hsl(0 75% 55%)' },      // Red - Very Low
    { base: 'hsl(25 85% 48%)', light: 'hsl(30 90% 58%)' },    // Orange - Low
    { base: 'hsl(45 80% 45%)', light: 'hsl(50 85% 55%)' },    // Yellow - Moderate
    { base: 'hsl(145 55% 40%)', light: 'hsl(150 60% 50%)' },  // Green - Good
    { base: 'hsl(174 60% 42%)', light: 'hsl(174 70% 52%)' }   // Leen Blue - High
  ];
  
  const colors = colorPairs.map(c => c.base);

  // Credibility labels for each segment
  const credibilityLabels = [
    { en: 'VERY LOW CREDIBILITY', fr: 'CRÉDIBILITÉ TRÈS FAIBLE' },
    { en: 'LOW CREDIBILITY', fr: 'CRÉDIBILITÉ FAIBLE' },
    { en: 'MODERATE CREDIBILITY', fr: 'CRÉDIBILITÉ MODÉRÉE' },
    { en: 'GOOD CREDIBILITY', fr: 'BONNE CRÉDIBILITÉ' },
    { en: 'HIGH CREDIBILITY', fr: 'HAUTE CRÉDIBILITÉ' }
  ];

  // Get current color and label index based on score
  const getSegmentIndex = (value: number) => {
    if (value < 20) return 0;
    if (value < 40) return 1;
    if (value < 60) return 2;
    if (value < 80) return 3;
    return 4;
  };

  // Smooth interpolated color for fluid transitions
  const getInterpolatedColor = (value: number) => {
    const segmentIndex = getSegmentIndex(value);
    const segmentStart = segmentIndex * 20;
    const progress = (value - segmentStart) / 20;
    
    if (progress > 0.5) {
      return colorPairs[segmentIndex].light;
    }
    return colorPairs[segmentIndex].base;
  };

  const getCurrentColor = (value: number) => colors[getSegmentIndex(value)];

  // Calculate which segments should be filled based on score
  const getSegmentOpacity = (segmentIndex: number) => {
    const segmentStart = segmentIndex * 20;
    const segmentEnd = (segmentIndex + 1) * 20;
    if (score === null) return 0.15;
    if (animatedScore >= segmentEnd) return 1;
    if (animatedScore <= segmentStart) return 0.15;
    return 0.15 + 0.85 * ((animatedScore - segmentStart) / 20);
  };

  // Calculate indicator position
  const indicatorAngle = 135 + animatedScore / 100 * 270;
  const indicatorRad = indicatorAngle * (Math.PI / 180);
  const indicatorX = size / 2 + radius * Math.cos(indicatorRad);
  const indicatorY = size / 2 + radius * Math.sin(indicatorRad);

  // Font sizes
  const scoreFontSize = size * 0.30;

  // Get current credibility label and color
  const segmentIndex = score !== null ? getSegmentIndex(animatedScore) : null;
  const currentLabel = segmentIndex !== null 
    ? credibilityLabels[segmentIndex][language]
    : null;
  const currentLabelColor = segmentIndex !== null 
    ? colors[segmentIndex] 
    : 'hsl(var(--muted-foreground))';

  // Calculate vertical offset
  const verticalOffset = size * 0.02;

  // UI States: idle | ready | analyzing | result
  const uiState = score !== null ? 'result' : (isLoading ? 'analyzing' : (hasContent ? 'ready' : 'idle'));
  
  // Track state transitions for animations
  useEffect(() => {
    const prevState = prevUiStateRef.current;
    
    // Idle → Ready transition: Trigger transfer animation sequence
    if (prevState === 'idle' && uiState === 'ready') {
      setIsTransitioning(true);
      
      // 1) Input capture phase (notify parent to show input glow)
      onTransferStart?.();
      
      // 2) Beam transfer phase (starts after 180ms)
      setTimeout(() => {
        setShowTransferBeam(true);
      }, 180);
      
      // 3) Button charge phase (starts when beam arrives ~460ms)
      setTimeout(() => {
        setShowTransferBeam(false);
        setButtonCharged(true);
      }, 500);
      
      // 4) Settle into armed state
      setTimeout(() => {
        setIsTransitioning(false);
        setButtonCharged(false);
      }, 800);
    }
    
    // Ready → Analyzing transition (button absorbed)
    if (prevState === 'ready' && uiState === 'analyzing') {
      setButtonAbsorbed(true);
      setTimeout(() => setButtonAbsorbed(false), 600);
    }
    
    prevUiStateRef.current = uiState;
  }, [uiState, onTransferStart]);
  
  // Handle analyze click with absorption animation
  const handleAnalyzeClick = () => {
    setButtonAbsorbed(true);
    setTimeout(() => {
      onAnalyze?.();
    }, 200);
  };

  return (
    <div className={`relative flex flex-col items-center ${className || ''}`}>
      {/* Sparkle particles with light trails - visible when score is shown */}
      {showSparkles && score !== null && (
        <>
          {sparkles.map((sparkle, index) => {
            const rad = (sparkle.angle * Math.PI) / 180;
            const finalX = Math.cos(rad) * size * sparkle.distance;
            const finalY = Math.sin(rad) * size * sparkle.distance;
            const spiralDelay = index * 0.08;
            const particleColor = getInterpolatedColor(animatedScore);
            
            return (
              <div
                key={sparkle.id}
                className="absolute pointer-events-none"
                style={{
                  '--final-x': `${finalX}px`,
                  '--final-y': `${finalY}px`,
                  '--sparkle-angle': `${sparkle.angle + 720}deg`,
                  '--trail-color': particleColor,
                  left: '50%',
                  top: '50%',
                  width: sparkle.size,
                  height: sparkle.size,
                  opacity: 0,
                  transform: 'translate(-50%, -50%) scale(0)',
                  animation: `sparkle-spiral-in 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${spiralDelay}s forwards, sparkle-twinkle ${sparkle.duration}s ease-in-out ${spiralDelay + 1.2 + sparkle.delay}s infinite`,
                } as React.CSSProperties}
              >
                {[0, 1, 2, 3, 4].map((trailIndex) => (
                  <div
                    key={trailIndex}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: particleColor,
                      opacity: 0.6 - trailIndex * 0.12,
                      transform: `scale(${1 - trailIndex * 0.15})`,
                      filter: `blur(${trailIndex * 1.5}px)`,
                      animation: `trail-fade 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${spiralDelay + trailIndex * 0.05}s forwards`,
                    }}
                  />
                ))}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: particleColor,
                    boxShadow: `0 0 ${sparkle.size * 2}px ${particleColor.replace(')', ' / 0.9)')}, 0 0 ${sparkle.size * 4}px ${particleColor.replace(')', ' / 0.5)')}, 0 0 ${sparkle.size * 6}px ${particleColor.replace(')', ' / 0.3)')}`,
                  }}
                />
              </div>
            );
          })}
          <style>{`
            @keyframes sparkle-spiral-in {
              0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg) scale(0); }
              10% { opacity: 1; }
              100% { opacity: 1; transform: translate(calc(-50% + var(--final-x)), calc(-50% + var(--final-y))) rotate(var(--sparkle-angle)) scale(1); }
            }
            @keyframes trail-fade {
              0% { opacity: 0.8; }
              60% { opacity: 0.4; }
              100% { opacity: 0; }
            }
            @keyframes sparkle-twinkle {
              0%, 100% { opacity: 0.3; transform: translate(calc(-50% + var(--final-x)), calc(-50% + var(--final-y))) scale(0.6); }
              50% { opacity: 1; transform: translate(calc(-50% + var(--final-x)), calc(-50% + var(--final-y))) scale(1.3); }
            }
          `}</style>
        </>
      )}
      
      {/* Premium ambient glow behind gauge */}
      <div 
        className="absolute rounded-full"
        style={{
          width: size * 1.3,
          height: size * 1.3,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: score !== null 
            ? `radial-gradient(circle, ${getCurrentColor(animatedScore).replace(')', ' / 0.15)')} 0%, transparent 70%)`
            : 'radial-gradient(circle, hsl(174 60% 45% / 0.12) 0%, hsl(200 50% 40% / 0.06) 40%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          animation: score === null ? 'idle-glow-pulse 4s ease-in-out infinite' : 'none',
        }}
      />
      
      {/* Gauge container */}
      <div 
        className="relative" 
        style={{ 
          width: size, 
          height: size,
        }}
      >
        {/* Premium outer ring glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: score !== null 
              ? `0 0 30px ${getCurrentColor(animatedScore).replace(')', ' / 0.3)')}, 0 0 60px ${getCurrentColor(animatedScore).replace(')', ' / 0.15)')}, inset 0 0 20px ${getCurrentColor(animatedScore).replace(')', ' / 0.1)')}`
              : '0 0 25px hsl(174 60% 45% / 0.15), 0 0 50px hsl(200 50% 45% / 0.08), inset 0 0 15px hsl(174 50% 40% / 0.08)',
            transition: 'box-shadow 0.5s ease-out',
            animation: score === null ? 'idle-ring-pulse 3.5s ease-in-out infinite' : 'none',
          }}
        />
        
        {/* Transfer beam - traveling from input to gauge center */}
        {showTransferBeam && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-50"
            style={{
              bottom: -size * 0.45,
              width: '4px',
              height: size * 0.5,
            }}
          >
            {/* Beam path */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, transparent 0%, hsl(174 70% 55% / 0.15) 20%, hsl(174 70% 55% / 0.15) 80%, transparent 100%)',
                animation: 'beam-path-fade 320ms ease-out forwards',
              }}
            />
            {/* Luminous orb head */}
            <div 
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, hsl(180 80% 75%) 0%, hsl(174 75% 60%) 40%, transparent 70%)',
                boxShadow: '0 0 12px hsl(174 80% 65% / 0.8), 0 0 25px hsl(174 70% 55% / 0.5)',
                animation: 'orb-travel 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
              }}
            />
            {/* Trailing blur */}
            <div 
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                height: '30px',
                borderRadius: '3px',
                background: 'linear-gradient(to top, transparent 0%, hsl(174 65% 55% / 0.4) 50%, hsl(174 70% 60% / 0.6) 100%)',
                filter: 'blur(2px)',
                animation: 'trail-travel 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
              }}
            />
          </div>
        )}
        
        {/* Activation wave - triggers when content is detected */}
        {uiState === 'ready' && isTransitioning && (
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, hsl(174 65% 55% / 0.5) 0%, hsl(174 60% 50% / 0.25) 30%, transparent 70%)',
              animation: 'activation-wave 600ms ease-out 460ms forwards',
              opacity: 0,
            }}
          />
        )}
        
        {/* Idle state premium contour ring */}
        {score === null && !isLoading && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: strokeWidth / 2 - 1,
              border: '1px solid hsl(174 50% 50% / 0.2)',
              boxShadow: 'inset 0 0 20px hsl(174 60% 50% / 0.1), 0 0 1px hsl(174 60% 55% / 0.3)',
              animation: 'idle-contour-glow 3.5s ease-in-out infinite',
            }}
          />
        )}
        
        {/* SVG - static (no rotation) */}
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            {colorPairs.map((pair, i) => (
              <linearGradient 
                key={`gradient-${i}`} 
                id={`segment-gradient-${i}`}
                gradientUnits="userSpaceOnUse"
                x1="0%" y1="0%" x2="100%" y2="100%"
              >
                <stop offset="0%" stopColor={pair.base} />
                <stop offset="50%" stopColor={pair.light} />
                <stop offset="100%" stopColor={pair.base} />
              </linearGradient>
            ))}
            
            <filter id="segment-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="idle-segment-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background arc track for idle state */}
          {score === null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(200 20% 25% / 0.4)"
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${totalArc} ${circumference}`}
              style={{ transform: 'rotate(135deg)', transformOrigin: 'center' }}
            />
          )}

          {/* 5 color segments */}
          {colorPairs.map((pair, i) => {
            const segmentLength = segmentArc - gap;
            const rotation = 135 + i * 270 / 5;
            const opacity = getSegmentOpacity(i);
            const isActive = opacity > 0.5;
            const isIdle = score === null;
            const idleOpacity = 0.35 + (i * 0.04);
            
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#segment-gradient-${i})`}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={`${segmentLength} ${circumference}`}
                filter={isActive ? 'url(#segment-glow)' : isIdle ? 'url(#idle-segment-glow)' : undefined}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  opacity: isIdle ? idleOpacity : opacity,
                  transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}

          {/* Position indicator */}
          {score !== null && (
            <g>
              <circle
                cx={indicatorX}
                cy={indicatorY}
                r={5}
                fill={getInterpolatedColor(animatedScore)}
                style={{ filter: 'drop-shadow(0 0 4px currentColor)', transition: 'fill 0.3s ease-out' }}
              />
              <circle cx={indicatorX} cy={indicatorY} r={2.5} fill="hsl(0 0% 100%)" />
            </g>
          )}
        </svg>

        {/* ========== CENTER CONTENT - The single source of action ========== */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ marginTop: -verticalOffset }}
        >
          {/* RESULT STATE: Display score */}
          {uiState === 'result' && (
            <span
              className="font-semibold tabular-nums animate-scale-in"
              style={{
                fontSize: scoreFontSize,
                lineHeight: 1,
                color: getInterpolatedColor(animatedScore),
                letterSpacing: '-0.02em',
                textShadow: `0 0 20px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.4)')}, 0 0 40px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.2)')}`
              }}
            >
              {displayScore}
            </span>
          )}

          {/* ANALYZING STATE: Loading spinner */}
          {uiState === 'analyzing' && (
            <div className="flex flex-col items-center animate-fade-in" style={{ gap: 'var(--space-2)' }}>
              <Loader2 
                className="animate-spin" 
                style={{ 
                  width: size * 0.18, 
                  height: size * 0.18, 
                  color: 'hsl(174 65% 55%)',
                  filter: 'drop-shadow(0 0 10px hsl(174 60% 50% / 0.5))'
                }} 
              />
              <span 
                className="uppercase font-semibold tracking-widest"
                style={{ 
                  fontSize: 'clamp(0.6rem, 2vw, 0.75rem)', 
                  color: 'hsl(174 60% 60%)',
                  textShadow: '0 0 10px hsl(174 60% 50% / 0.5)'
                }}
              >
                {t('gauge.analyzing')}
              </span>
            </div>
          )}

          {/* IDLE STATE: "READY TO ANALYZE" text with premium breathing animation */}
          {uiState === 'idle' && (
            <div 
              className="flex flex-col items-center justify-center text-center"
              style={{ 
                padding: 'var(--space-2)',
                animation: 'idle-text-breathe 3.5s ease-in-out infinite',
              }}
            >
              {/* Soft radial glow from center */}
              <div 
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: size * 0.75,
                  height: size * 0.75,
                  background: 'radial-gradient(circle, hsl(174 60% 50% / 0.12) 0%, hsl(174 50% 45% / 0.06) 40%, transparent 70%)',
                  filter: 'blur(12px)',
                  animation: 'idle-center-glow 3.5s ease-in-out infinite',
                }}
              />
              <span
                className="relative uppercase font-black tracking-[0.15em] text-center"
                style={{
                  fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)',
                  lineHeight: 1.3,
                  background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(174 30% 80%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 12px hsl(174 60% 55% / 0.35))',
                }}
              >
                {t('gauge.readyToAnalyze')}
              </span>
            </div>
          )}
          
          {/* TRANSITIONING STATE: Text fading out with blur */}
          {uiState === 'ready' && isTransitioning && (
            <div 
              className="flex flex-col items-center justify-center text-center absolute inset-0"
              style={{ 
                animation: 'idle-text-exit 450ms ease-out forwards',
              }}
            >
              <span
                className="relative uppercase font-black tracking-[0.15em] text-center"
                style={{
                  fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)',
                  lineHeight: 1.3,
                  background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(174 30% 80%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('gauge.readyToAnalyze')}
              </span>
            </div>
          )}

          {/* READY STATE: ANALYZE button emerging from center - Premium signature control */}
          {uiState === 'ready' && !buttonAbsorbed && (
            <div 
              className="relative group"
              style={{ 
                width: size * 0.65, 
                maxWidth: '150px',
                animation: isTransitioning 
                  ? 'button-emerge 450ms cubic-bezier(0.16, 1, 0.3, 1) 480ms forwards' 
                  : 'none',
                opacity: isTransitioning ? 0 : 1,
              }}
            >
              {/* Floating particles around button */}
              {!isTransitioning && (
                <>
                  {[...Array(8)].map((_, i) => {
                    const angle = (i / 8) * 360;
                    const distance = 28 + (i % 3) * 8;
                    const particleSize = 2 + (i % 2);
                    const delay = i * 0.4;
                    const duration = 3 + (i % 3) * 0.5;
                    
                    return (
                      <div
                        key={i}
                        className="absolute pointer-events-none"
                        style={{
                          left: '50%',
                          top: '50%',
                          width: `${particleSize}px`,
                          height: `${particleSize}px`,
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, hsl(180 75% 70%) 0%, hsl(174 70% 60%) 50%, transparent 100%)',
                          boxShadow: `0 0 ${particleSize * 2}px hsl(174 70% 60% / 0.6), 0 0 ${particleSize * 4}px hsl(174 65% 55% / 0.3)`,
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
                          animation: `particle-float ${duration}s ease-in-out ${delay}s infinite, particle-twinkle ${duration * 0.6}s ease-in-out ${delay}s infinite`,
                        }}
                      />
                    );
                  })}
                </>
              )}
              
              {/* Outer halo with gentle pulse */}
              <div 
                className="absolute -inset-4 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, hsl(174 70% 55% / 0.4) 0%, hsl(174 60% 50% / 0.15) 50%, transparent 80%)',
                  filter: 'blur(14px)',
                  animation: buttonCharged 
                    ? 'button-charge-glow 260ms ease-out forwards' 
                    : 'button-halo-pulse 4s ease-in-out infinite',
                }}
              />
              
              {/* Crisp glass border ring */}
              <div 
                className="absolute -inset-[2px] rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, hsl(174 80% 58%), hsl(185 75% 52%), hsl(174 80% 58%))',
                  boxShadow: buttonCharged 
                    ? '0 0 16px hsl(174 75% 60% / 0.7), 0 0 30px hsl(174 70% 55% / 0.4)' 
                    : '0 0 10px hsl(174 70% 55% / 0.5)',
                }}
              >
                {/* Sheen sweep every 6-8 seconds + charge sheen */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, hsl(0 0% 100% / 0.3) 45%, hsl(0 0% 100% / 0.8) 50%, hsl(0 0% 100% / 0.3) 55%, transparent 70%)',
                    animation: buttonCharged 
                      ? 'charge-sheen-sweep 200ms ease-out forwards' 
                      : 'signature-sheen 7s ease-in-out infinite 1.5s',
                  }}
                />
              </div>
              
              {/* Inner glow ring */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: buttonCharged 
                    ? 'inset 0 0 20px hsl(174 70% 65% / 0.45), inset 0 1px 0 hsl(0 0% 100% / 0.35)' 
                    : 'inset 0 0 14px hsl(174 65% 60% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.25)',
                  transition: 'box-shadow 200ms ease-out',
                }}
              />
              
              <Button
                type="button"
                onClick={handleAnalyzeClick}
                disabled={isLoading}
                className="relative w-full rounded-full py-3 px-4 text-[11px] font-bold tracking-wider uppercase text-white border-0 focus:outline-none overflow-hidden transition-all duration-200"
                style={{
                  background: 'linear-gradient(145deg, hsl(174 70% 50%) 0%, hsl(180 62% 44%) 50%, hsl(174 68% 47%) 100%)',
                  boxShadow: buttonCharged 
                    ? '0 0 30px hsl(174 70% 58% / 0.55), 0 6px 20px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.35), inset 0 -1px 3px hsl(0 0% 0% / 0.2)' 
                    : '0 0 22px hsl(174 65% 55% / 0.4), 0 5px 16px hsl(0 0% 0% / 0.28), inset 0 1px 0 hsl(0 0% 100% / 0.3), inset 0 -1px 2px hsl(0 0% 0% / 0.15)',
                  textShadow: '0 1px 3px hsl(0 0% 0% / 0.5)',
                  letterSpacing: '0.08em',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04) translateY(-1px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 35px hsl(174 70% 58% / 0.6), 0 8px 22px hsl(0 0% 0% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.4), inset 0 -1px 2px hsl(0 0% 0% / 0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 22px hsl(174 65% 55% / 0.4), 0 5px 16px hsl(0 0% 0% / 0.28), inset 0 1px 0 hsl(0 0% 100% / 0.3), inset 0 -1px 2px hsl(0 0% 0% / 0.15)';
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                {/* Inner shine sweep */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / 0.12) 45%, hsl(0 0% 100% / 0.25) 50%, hsl(0 0% 100% / 0.12) 55%, transparent 70%)',
                    animation: 'center-inner-shine 4.5s ease-in-out infinite 2s',
                  }}
                />
                <span className="relative z-10">{t('common.launchAnalysis')}</span>
              </Button>
            </div>
          )}
          
          {/* Button absorption animation when clicked */}
          {uiState === 'ready' && buttonAbsorbed && (
            <div 
              className="relative flex items-center justify-center"
              style={{ 
                width: size * 0.65, 
                maxWidth: '150px',
                animation: 'button-absorb 400ms cubic-bezier(0.4, 0, 1, 1) forwards',
              }}
            >
              <div 
                className="w-full rounded-full py-3 px-4 text-[11px] font-bold tracking-wider uppercase text-white flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, hsl(174 70% 50%) 0%, hsl(180 62% 44%) 50%, hsl(174 68% 47%) 100%)',
                  boxShadow: '0 0 30px hsl(174 70% 58% / 0.6), 0 0 15px hsl(174 65% 55% / 0.4)',
                }}
              >
                <span>{t('common.launchAnalysis')}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Gauge bottom impact glow - triggered when upward chevrons reach the gauge */}
        {uiState === 'ready' && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ 
              bottom: size * 0.08,
              width: size * 0.6,
              height: '8px',
            }}
          >
            {/* Impact glow that pulses with chevron cycle */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse 80% 100% at center, hsl(174 60% 55% / 0.25) 0%, transparent 70%)',
                filter: 'blur(4px)',
                animation: 'gauge-bottom-impact 3.2s cubic-bezier(0.22, 1, 0.36, 1) infinite',
              }}
            />
          </div>
        )}
        
        {/* Premium cascade guidance chevrons - DOWNWARD for idle state */}
        {uiState === 'idle' && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center"
            style={{ 
              top: size + 8,
              gap: '6px',
            }}
          >
            {/* Three chevrons with waterfall cascade animation */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="relative"
                style={{
                  animation: `chevron-cascade 3s cubic-bezier(0.22, 1, 0.36, 1) ${i * 160}ms infinite`,
                }}
                onAnimationIteration={i === 2 ? () => onChevronCycleComplete?.() : undefined}
              >
                {/* Subtle chevron glow - very low opacity */}
                <div 
                  className="absolute inset-0 -m-2"
                  style={{
                    background: 'radial-gradient(circle, hsl(180 40% 60% / 0.15) 0%, transparent 60%)',
                    filter: 'blur(3px)',
                  }}
                />
                {/* Chevron SVG - muted teal with subtle glow */}
                <svg 
                  width="14" 
                  height="7" 
                  viewBox="0 0 14 7" 
                  fill="none"
                  style={{
                    filter: 'drop-shadow(0 0 2px hsl(180 35% 55% / 0.25))',
                  }}
                >
                  <path 
                    d="M1 1L7 6L13 1" 
                    stroke="hsl(180 40% 65% / 0.7)" 
                    strokeWidth="1.25" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>
        )}
        
        {/* Premium UPWARD chevrons - READY state (between input and gauge) */}
        {uiState === 'ready' && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center"
            style={{ 
              bottom: -32, // Position below gauge (pointing upward toward it)
              gap: '5px',
            }}
          >
            {/* Three upward chevrons with waterfall cascade animation - reversed order for upward motion */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="relative"
                style={{
                  animation: `chevron-up-cascade 3.2s cubic-bezier(0.22, 1, 0.36, 1) ${(2 - i) * 140}ms infinite`,
                }}
              >
                {/* Subtle chevron glow */}
                <div 
                  className="absolute inset-0 -m-2"
                  style={{
                    background: 'radial-gradient(circle, hsl(174 50% 55% / 0.12) 0%, transparent 60%)',
                    filter: 'blur(3px)',
                  }}
                />
                {/* Upward chevron SVG - subtle, lower opacity than downward */}
                <svg 
                  width="12" 
                  height="6" 
                  viewBox="0 0 14 7" 
                  fill="none"
                  style={{
                    filter: 'drop-shadow(0 0 2px hsl(174 45% 55% / 0.2))',
                    transform: 'rotate(180deg)', // Flip to point upward
                  }}
                >
                  <path 
                    d="M1 1L7 6L13 1" 
                    stroke="hsl(174 50% 60% / 0.55)" 
                    strokeWidth="1.25" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Credibility label BELOW gauge - only shown when score exists */}
      {score !== null && (
        <div 
          className="relative w-full flex flex-col items-center justify-center animate-fade-in"
          style={{ marginTop: 'var(--space-3)', minHeight: '40px' }}
        >
          <div 
            className="absolute rounded-full"
            style={{
              width: '100%',
              height: '100%',
              background: `radial-gradient(ellipse at center, ${currentLabelColor.replace(')', ' / 0.2)')} 0%, transparent 70%)`,
              filter: 'blur(15px)',
              animation: 'label-glow 2s ease-in-out infinite alternate'
            }}
          />
          <span
            className="relative text-center uppercase font-bold"
            style={{
              fontSize: size * 0.11,
              color: currentLabelColor,
              letterSpacing: '0.15em',
              fontFamily: 'var(--font-sans)',
              textShadow: `0 0 15px ${currentLabelColor.replace(')', ' / 0.7)')}, 0 0 30px ${currentLabelColor.replace(')', ' / 0.4)')}`,
            }}
          >
            {currentLabel}
          </span>
        </div>
      )}
        
      {/* CSS animations */}
      <style>{`
        @keyframes label-glow {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes idle-glow-pulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.98); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.02); }
        }
        @keyframes idle-ring-pulse {
          0%, 100% { box-shadow: 0 0 25px hsl(174 60% 45% / 0.12), 0 0 50px hsl(200 50% 45% / 0.06), inset 0 0 15px hsl(174 50% 40% / 0.06); }
          50% { box-shadow: 0 0 35px hsl(174 60% 45% / 0.2), 0 0 70px hsl(200 50% 45% / 0.1), inset 0 0 20px hsl(174 50% 40% / 0.1); }
        }
        @keyframes idle-contour-glow {
          0%, 100% { border-color: hsl(174 50% 50% / 0.15); box-shadow: inset 0 0 15px hsl(174 60% 50% / 0.08), 0 0 1px hsl(174 60% 55% / 0.2); }
          50% { border-color: hsl(174 50% 50% / 0.3); box-shadow: inset 0 0 25px hsl(174 60% 50% / 0.15), 0 0 2px hsl(174 60% 55% / 0.4); }
        }
        @keyframes idle-center-breathe {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes center-button-glow {
          0%, 100% { opacity: 0.6; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes center-button-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px hsl(174 65% 55% / 0.5), 0 0 15px hsl(174 60% 50% / 0.3), 0 6px 20px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.2); }
          50% { transform: scale(1.02); box-shadow: 0 0 40px hsl(174 65% 55% / 0.7), 0 0 20px hsl(174 60% 50% / 0.5), 0 8px 25px hsl(0 0% 0% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.25); }
        }
        @keyframes center-shine-sweep {
          0% { transform: translateX(-150%) rotate(15deg); }
          50%, 100% { transform: translateX(150%) rotate(15deg); }
        }
        @keyframes center-inner-shine {
          0% { transform: translateX(-150%); }
          60%, 100% { transform: translateX(150%); }
        }
        /* Premium chevron cascade animation - synced with beam impact */
        @keyframes chevron-cascade {
          0% { 
            opacity: 0;
            transform: translateY(-8px);
          }
          15% { 
            opacity: 0.85;
            transform: translateY(-2px);
          }
          50% { 
            opacity: 0.7;
            transform: translateY(5px);
          }
          75% { 
            opacity: 0.3;
            transform: translateY(10px);
          }
          88%, 100% { 
            opacity: 0;
            transform: translateY(12px);
          }
        }
        @keyframes idle-text-breathe {
          0%, 100% { 
            opacity: 0.92;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.015);
          }
        }
        @keyframes idle-center-glow {
          0%, 100% { 
            opacity: 0.7;
            transform: scale(0.97);
          }
          50% { 
            opacity: 1;
            transform: scale(1.03);
          }
        }
        @keyframes idle-text-exit {
          0% { 
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
          100% { 
            opacity: 0;
            transform: scale(0.92);
            filter: blur(4px);
          }
        }
        @keyframes activation-wave {
          0% { 
            opacity: 0.8;
            transform: scale(0.5);
          }
          100% { 
            opacity: 0;
            transform: scale(1.4);
          }
        }
        @keyframes button-emerge {
          0% { 
            opacity: 0;
            transform: scale(0.92);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes button-glow-ramp {
          0% { 
            opacity: 0;
          }
          100% { 
            opacity: 0.7;
          }
        }
        @keyframes button-absorb {
          0% { 
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
          60% { 
            opacity: 0.7;
            transform: scale(0.85);
            filter: blur(1px);
          }
          100% { 
            opacity: 0;
            transform: scale(0.3);
            filter: blur(6px);
          }
        }
        /* Premium halo pulse for signature button */
        @keyframes button-halo-pulse {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(0.98);
          }
          50% { 
            opacity: 1;
            transform: scale(1.04);
          }
        }
        /* Sheen sweep for premium button */
        @keyframes signature-sheen {
          0%, 85% { 
            transform: translateX(-200%) rotate(15deg);
          }
          100% { 
            transform: translateX(200%) rotate(15deg);
          }
        }
        /* Upward chevron animation for READY state */
        @keyframes chevron-up-cascade {
          0% { 
            opacity: 0;
            transform: translateY(10px);
          }
          15% { 
            opacity: 0.5;
            transform: translateY(5px);
          }
          50% { 
            opacity: 0.45;
            transform: translateY(-2px);
          }
          75% { 
            opacity: 0.2;
            transform: translateY(-6px);
          }
          88%, 100% { 
            opacity: 0;
            transform: translateY(-8px);
          }
        }
        /* Gauge bottom impact glow synced with upward chevrons */
        @keyframes gauge-bottom-impact {
          0%, 70% { 
            opacity: 0.15;
            transform: scaleX(0.9);
          }
          80% { 
            opacity: 0.6;
            transform: scaleX(1.1);
          }
          85% { 
            opacity: 0.4;
            transform: scaleX(1);
          }
          100% { 
            opacity: 0.15;
            transform: scaleX(0.9);
          }
        }
        /* Transfer beam animations */
        @keyframes orb-travel {
          0% { 
            bottom: 0;
            opacity: 0;
          }
          10% { 
            opacity: 1;
          }
          90% { 
            opacity: 1;
          }
          100% { 
            bottom: 100%;
            opacity: 0;
          }
        }
        @keyframes trail-travel {
          0% { 
            bottom: -10px;
            opacity: 0;
          }
          15% { 
            opacity: 0.8;
          }
          85% { 
            opacity: 0.6;
          }
          100% { 
            bottom: calc(100% - 20px);
            opacity: 0;
          }
        }
        @keyframes beam-path-fade {
          0% { 
            opacity: 0;
          }
          30% { 
            opacity: 1;
          }
          70% { 
            opacity: 0.6;
          }
          100% { 
            opacity: 0;
          }
        }
        /* Button charge animations */
        @keyframes button-charge-glow {
          0% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.15);
          }
          100% { 
            opacity: 0.75;
            transform: scale(1.05);
          }
        }
        @keyframes charge-sheen-sweep {
          0% { 
            transform: translateX(-150%) rotate(15deg);
          }
          100% { 
            transform: translateX(150%) rotate(15deg);
          }
        }
        /* Floating particles around button */
        @keyframes particle-float {
          0%, 100% { 
            transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(var(--distance, -28px));
          }
          25% { 
            transform: translate(-50%, -50%) rotate(calc(var(--angle, 0deg) + 15deg)) translateY(calc(var(--distance, -28px) - 4px));
          }
          50% { 
            transform: translate(-50%, -50%) rotate(calc(var(--angle, 0deg) + 25deg)) translateY(calc(var(--distance, -28px) - 2px));
          }
          75% { 
            transform: translate(-50%, -50%) rotate(calc(var(--angle, 0deg) + 10deg)) translateY(calc(var(--distance, -28px) - 5px));
          }
        }
        @keyframes particle-twinkle {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};
