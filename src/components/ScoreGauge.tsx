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
  isLoading = false
}: ScoreGaugeProps) => {
  const { language, t } = useLanguage();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const animationRef = useRef<number | null>(null);
  
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
      <div className="relative" style={{ width: size, height: size }}>
        {/* Premium outer ring glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: score !== null 
              ? `0 0 30px ${getCurrentColor(animatedScore).replace(')', ' / 0.3)')}, 0 0 60px ${getCurrentColor(animatedScore).replace(')', ' / 0.15)')}, inset 0 0 20px ${getCurrentColor(animatedScore).replace(')', ' / 0.1)')}`
              : '0 0 25px hsl(174 60% 45% / 0.15), 0 0 50px hsl(200 50% 45% / 0.08), inset 0 0 15px hsl(174 50% 40% / 0.08)',
            transition: 'box-shadow 0.5s ease-out',
            animation: score === null ? 'idle-ring-pulse 4s ease-in-out infinite' : 'none',
          }}
        />
        
        {/* Idle state premium contour ring */}
        {score === null && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: strokeWidth / 2 - 1,
              border: '1px solid hsl(174 50% 50% / 0.2)',
              boxShadow: 'inset 0 0 20px hsl(174 60% 50% / 0.1), 0 0 1px hsl(174 60% 55% / 0.3)',
              animation: 'idle-contour-glow 4s ease-in-out infinite',
            }}
          />
        )}
        
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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

          {/* IDLE STATE: "READY TO ANALYZE" text */}
          {uiState === 'idle' && (
            <div 
              className="flex flex-col items-center justify-center text-center animate-fade-in"
              style={{ padding: 'var(--space-2)' }}
            >
              {/* Breathing halo */}
              <div 
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: size * 0.7,
                  height: size * 0.7,
                  background: 'radial-gradient(circle, hsl(174 60% 50% / 0.15) 0%, transparent 70%)',
                  filter: 'blur(15px)',
                  animation: 'idle-center-breathe 3s ease-in-out infinite',
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
                  filter: 'drop-shadow(0 0 15px hsl(174 60% 55% / 0.4))',
                }}
              >
                {t('gauge.readyToAnalyze')}
              </span>
            </div>
          )}

          {/* READY STATE: ANALYZE button inside gauge */}
          {uiState === 'ready' && (
            <div 
              className="relative animate-scale-in"
              style={{ width: size * 0.65, maxWidth: '140px' }}
            >
              {/* Outer glow ring */}
              <div 
                className="absolute -inset-2 rounded-full opacity-80"
                style={{
                  background: 'radial-gradient(circle, hsl(174 70% 50% / 0.5) 0%, hsl(174 60% 45% / 0.2) 60%, transparent 100%)',
                  filter: 'blur(10px)',
                  animation: 'center-button-glow 2s ease-in-out infinite',
                }}
              />
              
              {/* Border shimmer */}
              <div 
                className="absolute -inset-0.5 rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, hsl(174 70% 52%), hsl(185 65% 48%), hsl(174 70% 52%))',
                }}
              >
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, hsl(0 0% 100% / 0.2) 45%, hsl(0 0% 100% / 0.6) 50%, hsl(0 0% 100% / 0.2) 55%, transparent 70%)',
                    animation: 'center-shine-sweep 2.5s ease-in-out infinite',
                  }}
                />
              </div>
              
              <Button
                type="button"
                onClick={onAnalyze}
                disabled={isLoading}
                className="relative w-full rounded-full py-3 text-xs font-bold tracking-wider uppercase text-white transition-all duration-300 hover:scale-105 active:scale-95 border-0 focus:outline-none overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, hsl(174 68% 46%) 0%, hsl(182 58% 40%) 50%, hsl(174 65% 44%) 100%)',
                  boxShadow: '0 0 30px hsl(174 65% 55% / 0.5), 0 0 15px hsl(174 60% 50% / 0.3), 0 6px 20px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                  textShadow: '0 1px 3px hsl(0 0% 0% / 0.4)',
                  letterSpacing: '0.12em',
                  animation: 'center-button-pulse 2s ease-in-out infinite',
                }}
              >
                {/* Inner shine */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / 0.15) 45%, hsl(0 0% 100% / 0.3) 50%, hsl(0 0% 100% / 0.15) 55%, transparent 70%)',
                    animation: 'center-inner-shine 3s ease-in-out infinite 0.5s',
                  }}
                />
                <Search className="mr-1.5 h-3.5 w-3.5" style={{ filter: 'drop-shadow(0 1px 2px hsl(0 0% 0% / 0.3))' }} />
                <span className="relative z-10">{t('common.analyze')}</span>
              </Button>
            </div>
          )}
        </div>
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
      `}</style>
    </div>
  );
};
