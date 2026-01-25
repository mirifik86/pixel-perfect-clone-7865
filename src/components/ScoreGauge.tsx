import { useEffect, useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { Loader2 } from 'lucide-react';
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
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [showClickFlash, setShowClickFlash] = useState(false);
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
      const duration = 1800;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
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
    { base: 'hsl(0 70% 45%)', light: 'hsl(0 75% 55%)' },
    { base: 'hsl(25 85% 48%)', light: 'hsl(30 90% 58%)' },
    { base: 'hsl(45 80% 45%)', light: 'hsl(50 85% 55%)' },
    { base: 'hsl(145 55% 40%)', light: 'hsl(150 60% 50%)' },
    { base: 'hsl(174 60% 42%)', light: 'hsl(174 70% 52%)' }
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

  const getSegmentIndex = (value: number) => {
    if (value < 20) return 0;
    if (value < 40) return 1;
    if (value < 60) return 2;
    if (value < 80) return 3;
    return 4;
  };

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
    
    // Idle → Ready transition: Synchronized transfer beam + morph sequence
    if (prevState === 'idle' && uiState === 'ready') {
      setIsTransitioning(true);
      onTransferStart?.();
      
      // Phase 1: Start transfer beam as text begins morphing out (0ms)
      setShowTransferBeam(true);
      
      // Phase 2: Transfer beam reaches gauge center, button starts morphing in (350ms)
      setTimeout(() => {
        setShowTransferBeam(false);
        setButtonCharged(true);
      }, 350);
      
      // Phase 3: Button fully charged, sheen sweep (550ms)
      setTimeout(() => {
        setButtonCharged(false);
      }, 650);
      
      // Phase 4: Transition complete (850ms total)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 850);
    }
    
    // Ready → Analyzing transition (button absorbed)
    if (prevState === 'ready' && uiState === 'analyzing') {
      setButtonAbsorbed(true);
      setTimeout(() => setButtonAbsorbed(false), 600);
    }
    
    prevUiStateRef.current = uiState;
  }, [uiState, onTransferStart]);
  
  // Handle analyze click with premium tactile feedback
  const handleAnalyzeClick = () => {
    setIsButtonPressed(true);
    setShowClickFlash(true);
    
    setTimeout(() => {
      setIsButtonPressed(false);
      setShowClickFlash(false);
      setButtonAbsorbed(true);
    }, 120);
    
    setTimeout(() => {
      onAnalyze?.();
    }, 200);
  };

  // Instrument-grade state-based styling
  const getGaugeGlowStyle = () => {
    switch (uiState) {
      case 'idle':
        // Powered & calibrated - visible presence halo
        return {
          background: 'radial-gradient(circle, hsl(174 50% 48% / 0.10) 0%, hsl(174 45% 45% / 0.04) 50%, transparent 75%)',
          filter: 'blur(32px)',
          animation: 'idle-halo-breathe 3.2s ease-in-out infinite',
          opacity: 0.7,
        };
      case 'ready':
        // 50% awake - soft diffused halo, static (no pulse animation yet)
        return {
          background: 'radial-gradient(circle, hsl(174 50% 50% / 0.14) 0%, hsl(174 45% 48% / 0.06) 50%, transparent 70%)',
          filter: 'blur(28px)',
          animation: 'none', // Static - no pulse at 50% awake
          opacity: 0.85,
        };
      case 'analyzing':
        return {
          background: 'radial-gradient(circle, hsl(174 60% 50% / 0.22) 0%, hsl(174 55% 48% / 0.1) 50%, transparent 75%)',
          filter: 'blur(26px)',
          animation: 'instrument-glow-analyzing 1.4s ease-in-out infinite',
          opacity: 1,
        };
      case 'result':
        return {
          background: `radial-gradient(circle, ${getCurrentColor(animatedScore).replace(')', ' / 0.18)')} 0%, transparent 70%)`,
          filter: 'blur(22px)',
          animation: 'none',
          opacity: 1,
        };
      default:
        return {};
    }
  };

  const getRingGlowStyle = () => {
    switch (uiState) {
      case 'idle':
        // Powered state - subtle ring presence
        return {
          boxShadow: '0 0 18px hsl(174 50% 48% / 0.10), 0 0 35px hsl(174 45% 45% / 0.04), inset 0 0 12px hsl(174 45% 48% / 0.05)',
          animation: 'idle-ring-breathe 3.2s ease-in-out infinite',
        };
      case 'ready':
        // 50% awake - subtle glow, static (no animation)
        return {
          boxShadow: '0 0 22px hsl(174 50% 50% / 0.12), 0 0 40px hsl(174 45% 48% / 0.05), inset 0 0 14px hsl(174 48% 48% / 0.06)',
          animation: 'none', // Static - presence, not urgency
        };
      case 'analyzing':
        return {
          boxShadow: '0 0 35px hsl(174 60% 50% / 0.22), 0 0 60px hsl(174 55% 48% / 0.1), inset 0 0 22px hsl(174 55% 48% / 0.1)',
          animation: 'instrument-ring-analyzing 1.4s ease-in-out infinite',
        };
      case 'result':
        return {
          boxShadow: `0 0 30px ${getCurrentColor(animatedScore).replace(')', ' / 0.25)')}, 0 0 55px ${getCurrentColor(animatedScore).replace(')', ' / 0.12)')}, inset 0 0 18px ${getCurrentColor(animatedScore).replace(')', ' / 0.08)')}`,
          animation: 'none',
        };
      default:
        return {};
    }
  };

  // Segment brightness based on state - 50% awake in ready state
  const getSegmentBrightness = () => {
    switch (uiState) {
      case 'idle': return 0.28; // Powered & calibrated - clearly readable segments
      case 'ready': return 0.50; // 50% brightness - clearly visible but restrained
      case 'analyzing': return 0.60;
      case 'result': return 1;
      default: return 0.12;
    }
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
      
      {/* Instrument-grade ambient glow behind gauge - state-dependent */}
      <div 
        className="absolute rounded-full motion-reduce:!animation-none"
        style={{
          width: size * 1.35,
          height: size * 1.35,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'opacity 0.4s ease-out',
          ...getGaugeGlowStyle(),
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
        {/* Instrument-grade outer ring glow - state-dependent */}
        <div 
          className="absolute inset-0 rounded-full motion-reduce:!animation-none"
          style={{
            transition: 'box-shadow 0.4s ease-out',
            ...getRingGlowStyle(),
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
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, transparent 0%, hsl(174 70% 55% / 0.15) 20%, hsl(174 70% 55% / 0.15) 80%, transparent 100%)',
                animation: 'beam-path-fade 320ms ease-out forwards',
              }}
            />
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
            className="absolute inset-0 rounded-full pointer-events-none motion-reduce:hidden"
            style={{
              background: 'radial-gradient(circle, hsl(174 65% 55% / 0.5) 0%, hsl(174 60% 50% / 0.25) 30%, transparent 70%)',
              animation: 'activation-wave 600ms ease-out 460ms forwards',
              opacity: 0,
            }}
          />
        )}
        
        {/* Idle/Ready state contour ring - subtle in idle, brighter in ready */}
        {score === null && !isLoading && (
          <div 
            className="absolute rounded-full pointer-events-none motion-reduce:!animation-none"
            style={{
              inset: strokeWidth / 2 - 1,
              border: `1px solid hsl(174 50% 50% / ${uiState === 'idle' ? '0.12' : '0.25'})`,
              boxShadow: uiState === 'idle' 
                ? 'inset 0 0 12px hsl(174 50% 45% / 0.04), 0 0 1px hsl(174 55% 50% / 0.15)'
                : 'inset 0 0 18px hsl(174 55% 50% / 0.08), 0 0 2px hsl(174 60% 55% / 0.25)',
              transition: 'all 0.4s ease-out',
              animation: uiState === 'ready' ? 'instrument-contour-ready 2s ease-in-out infinite' : 'none',
            }}
          />
        )}
        
        {/* SVG */}
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
          
          {/* Segment arcs with state-dependent brightness - FLAT colors (no gradient) */}
          {[0, 1, 2, 3, 4].map((i) => {
            const startAngle = 135 + i * 54;
            const endAngle = startAngle + 54;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = ((endAngle - (gap / (2 * Math.PI * radius) * 360)) * Math.PI) / 180;
            
            const x1 = size / 2 + radius * Math.cos(startRad);
            const y1 = size / 2 + radius * Math.sin(startRad);
            const x2 = size / 2 + radius * Math.cos(endRad);
            const y2 = size / 2 + radius * Math.sin(endRad);
            
            const baseOpacity = score !== null ? getSegmentOpacity(i) : getSegmentBrightness();
            
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={colors[i]}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity={baseOpacity}
                filter={score !== null && getSegmentOpacity(i) > 0.5 ? 'url(#segment-glow)' : 'url(#idle-segment-glow)'}
                style={{
                  transition: 'opacity 0.4s ease-out',
                }}
              />
            );
          })}
          
          {/* Premium calibration-style segment separators with hover glow effect */}
          {score === null && [1, 2, 3, 4].map((i) => {
            const separatorAngle = 135 + i * 54 - 1;
            const separatorRad = (separatorAngle * Math.PI) / 180;
            const innerRadius = radius - strokeWidth / 2 + 2;
            const outerRadius = radius + strokeWidth / 2 - 2;
            
            const x1 = size / 2 + innerRadius * Math.cos(separatorRad);
            const y1 = size / 2 + innerRadius * Math.sin(separatorRad);
            const x2 = size / 2 + outerRadius * Math.cos(separatorRad);
            const y2 = size / 2 + outerRadius * Math.sin(separatorRad);
            
            return (
              <g key={`sep-group-${i}`} className="separator-line">
                {/* Glow layer - visible on hover */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(174 55% 55%)"
                  strokeWidth={2}
                  opacity={0}
                  className="separator-glow"
                  style={{
                    filter: 'blur(2px)',
                    transition: 'opacity 0.3s ease-out',
                  }}
                />
                {/* Main separator line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(0 0% 45%)"
                  strokeWidth={0.75}
                  opacity={uiState === 'ready' ? 0.45 : 0.25}
                  className="separator-main"
                  style={{
                    transition: 'opacity 0.3s ease-out, stroke 0.3s ease-out',
                  }}
                />
              </g>
            );
          })}
          
          {/* Score indicator */}
          {score !== null && (
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r={6}
              fill="white"
              filter="url(#segment-glow)"
              style={{
                transition: 'cx 0.1s, cy 0.1s',
              }}
            />
          )}
        </svg>
        
        {/* Center content area */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            top: verticalOffset,
          }}
        >
          {/* RESULT STATE: Score display */}
          {uiState === 'result' && (
            <div className="flex flex-col items-center justify-center animate-scale-in">
              <span 
                className="font-bold tabular-nums"
                style={{
                  fontSize: scoreFontSize,
                  fontFamily: 'var(--font-sans)',
                  color: getInterpolatedColor(animatedScore),
                  textShadow: `0 0 30px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.6)')}, 0 0 60px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.3)')}`,
                  lineHeight: 1,
                }}
              >
                {displayScore}
              </span>
            </div>
          )}
          
          {/* ANALYZING STATE: Spinner with localized text */}
          {uiState === 'analyzing' && (
            <div className="flex flex-col items-center justify-center" style={{ gap: 'var(--space-2)' }}>
              <Loader2 
                className="motion-reduce:animate-none"
                style={{ 
                  width: size * 0.18, 
                  height: size * 0.18,
                  color: 'hsl(174 65% 55%)',
                  animation: 'spin 1.2s linear infinite',
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

          {/* IDLE STATE: Luminous "READY TO ANALYZE" with breathing glow */}
          {uiState === 'idle' && (
            <div 
              className="flex flex-col items-center justify-center text-center relative"
              style={{ padding: 'var(--space-2)' }}
            >
              <span
                className="relative uppercase font-semibold tracking-[0.16em] text-center motion-reduce:!animation-none"
                style={{
                  fontSize: 'clamp(0.68rem, 2.4vw, 0.88rem)',
                  lineHeight: 1.4,
                  color: 'hsl(174 45% 72%)',
                  textShadow: '0 0 12px hsl(174 55% 55% / 0.5), 0 0 24px hsl(174 50% 50% / 0.25), 0 0 40px hsl(174 45% 48% / 0.12)',
                  animation: 'idle-text-breathe 3.2s ease-in-out infinite',
                  transition: 'color 0.3s ease-out, text-shadow 0.3s ease-out',
                }}
              >
                {t('gauge.readyToAnalyze')}
              </span>
            </div>
          )}
          
          {/* TRANSITIONING STATE: Text morphing out with synchronized transfer beam */}
          {uiState === 'ready' && isTransitioning && (
            <>
              {/* Transfer beam energy orb - rises from bottom to center */}
              {showTransferBeam && (
                <div 
                  className="absolute inset-0 pointer-events-none motion-reduce:hidden"
                  style={{
                    zIndex: 10,
                  }}
                >
                  {/* Central energy convergence */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      bottom: '-20%',
                      width: '4px',
                      height: '50%',
                      background: 'linear-gradient(to top, transparent 0%, hsl(174 70% 55% / 0.3) 30%, hsl(174 75% 60% / 0.7) 60%, hsl(174 80% 65% / 0.9) 85%, hsl(180 90% 75%) 100%)',
                      filter: 'blur(1px)',
                      animation: 'transfer-beam-rise 350ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                    }}
                  />
                  
                  {/* Energy orb at tip of beam */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      bottom: '30%',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, hsl(180 90% 80%) 0%, hsl(174 80% 65% / 0.8) 40%, transparent 70%)',
                      boxShadow: '0 0 20px hsl(174 80% 60% / 0.8), 0 0 40px hsl(174 70% 55% / 0.5)',
                      animation: 'transfer-orb-rise 350ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                    }}
                  />
                  
                  {/* Impact glow at center */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, hsl(174 85% 70% / 0.6) 0%, hsl(174 75% 60% / 0.2) 50%, transparent 70%)',
                      animation: 'transfer-impact-glow 400ms ease-out 200ms forwards',
                      opacity: 0,
                    }}
                  />
                </div>
              )}
              
              {/* Text morphing out */}
              <div 
                className="flex flex-col items-center justify-center text-center absolute inset-0 pointer-events-none"
                style={{ 
                  animation: 'text-morph-exit 450ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                }}
              >
                <span
                  className="relative uppercase font-semibold tracking-[0.16em] text-center"
                  style={{
                    fontSize: 'clamp(0.68rem, 2.4vw, 0.88rem)',
                    lineHeight: 1.4,
                    color: 'hsl(174 45% 72%)',
                    textShadow: '0 0 12px hsl(174 55% 55% / 0.5), 0 0 24px hsl(174 50% 50% / 0.25)',
                  }}
                >
                  {t('gauge.readyToAnalyze')}
                </span>
              </div>
            </>
          )}

          {/* READY STATE: Premium signature button with synchronized entrance */}
          {uiState === 'ready' && !buttonAbsorbed && (
            <div 
              className="relative group"
              style={{ 
                width: size * 0.68, 
                maxWidth: '155px',
                animation: isTransitioning 
                  ? 'button-morph-enter 480ms cubic-bezier(0.34, 1.56, 0.64, 1) 320ms forwards' 
                  : 'none',
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'scale(0.7) translateY(10px)' : 'scale(1) translateY(-2px)',
                transition: isTransitioning ? 'none' : 'transform 0.25s ease-out, box-shadow 0.25s ease-out',
              }}
            >
              {/* Floating particles - removed for cleaner look at 50% state */}
              
              {/* Outer soft halo - no pulse, just presence */}
              <div 
                className="absolute -inset-3 rounded-full pointer-events-none motion-reduce:!opacity-50"
                style={{
                  background: 'radial-gradient(circle, hsl(174 55% 52% / 0.18) 0%, hsl(174 50% 48% / 0.06) 60%, transparent 80%)',
                  filter: 'blur(10px)',
                  opacity: buttonCharged ? 1 : 0.85,
                  transition: 'opacity 0.3s ease-out',
                }}
              />
              
              {/* Click flash overlay */}
              {showClickFlash && (
                <div 
                  className="absolute -inset-2 rounded-full pointer-events-none z-20"
                  style={{
                    background: 'radial-gradient(circle, hsl(180 80% 70% / 0.5) 0%, transparent 70%)',
                    animation: 'click-flash 150ms ease-out forwards',
                  }}
                />
              )}
              
              {/* Premium outer border ring - more rounded */}
              <div 
                className="absolute -inset-[2px] rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, hsl(174 70% 55%), hsl(180 65% 50%), hsl(174 70% 55%))',
                  boxShadow: buttonCharged 
                    ? '0 0 16px hsl(174 65% 58% / 0.5), 0 0 32px hsl(174 60% 52% / 0.25)' 
                    : '0 0 10px hsl(174 60% 52% / 0.3), 0 0 20px hsl(174 55% 48% / 0.15)',
                  transition: 'box-shadow 0.25s ease-out',
                }}
              >
                {/* Entrance sheen */}
                <div 
                  className="absolute inset-0 motion-reduce:hidden"
                  style={{
                    background: 'linear-gradient(105deg, transparent 30%, hsl(0 0% 100% / 0.15) 45%, hsl(0 0% 100% / 0.45) 50%, hsl(0 0% 100% / 0.15) 55%, transparent 70%)',
                    animation: buttonCharged 
                      ? 'charge-sheen-sweep 200ms ease-out forwards' 
                      : (isTransitioning ? 'none' : 'entrance-sheen-sweep 600ms ease-out 100ms forwards'),
                  }}
                />
              </div>
              
              {/* Inner teal glow ring - refined */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: buttonCharged 
                    ? 'inset 0 0 14px hsl(174 60% 58% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.25)' 
                    : 'inset 0 0 10px hsl(174 55% 55% / 0.2), inset 0 1px 0 hsl(0 0% 100% / 0.18)',
                  transition: 'box-shadow 0.25s ease-out',
                }}
              />
              
              <Button
                type="button"
                onClick={handleAnalyzeClick}
                disabled={isLoading}
                className="relative w-full py-3 px-5 text-[11px] font-semibold tracking-wider uppercase text-white border-0 focus:outline-none overflow-hidden"
                style={{
                  borderRadius: '9999px', // More circular/rounded
                  background: 'linear-gradient(145deg, hsl(174 58% 46%) 0%, hsl(180 52% 40%) 50%, hsl(174 56% 43%) 100%)',
                  boxShadow: isButtonPressed
                    ? '0 1px 6px hsl(0 0% 0% / 0.25), inset 0 0 8px hsl(174 50% 50% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.15)'
                    : '0 3px 12px hsl(0 0% 0% / 0.2), 0 1px 4px hsl(0 0% 0% / 0.15), inset 0 0 10px hsl(174 50% 52% / 0.12), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                  textShadow: '0 1px 2px hsl(0 0% 0% / 0.35)',
                  letterSpacing: '0.06em',
                  transform: isButtonPressed ? 'scale(0.98) translateY(0)' : 'scale(1) translateY(-1px)',
                  transition: 'transform 0.12s ease-out, box-shadow 0.2s ease-out',
                }}
                onMouseEnter={(e) => {
                  if (!isButtonPressed) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.01) translateY(-2px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 5px 16px hsl(0 0% 0% / 0.22), 0 2px 6px hsl(0 0% 0% / 0.18), inset 0 0 12px hsl(174 55% 55% / 0.18), inset 0 1px 0 hsl(0 0% 100% / 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isButtonPressed) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) translateY(-1px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 3px 12px hsl(0 0% 0% / 0.2), 0 1px 4px hsl(0 0% 0% / 0.15), inset 0 0 10px hsl(174 50% 52% / 0.12), inset 0 1px 0 hsl(0 0% 100% / 0.2)';
                  }
                }}
                onMouseDown={(e) => {
                  setIsButtonPressed(true);
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98) translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 6px hsl(0 0% 0% / 0.25), inset 0 0 8px hsl(174 50% 50% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.15)';
                }}
                onMouseUp={(e) => {
                  setIsButtonPressed(false);
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) translateY(-1px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 3px 12px hsl(0 0% 0% / 0.2), 0 1px 4px hsl(0 0% 0% / 0.15), inset 0 0 10px hsl(174 50% 52% / 0.12), inset 0 1px 0 hsl(0 0% 100% / 0.2)';
                }}
              >
                {/* Subtle inner highlight */}
                <div 
                  className="absolute inset-0 pointer-events-none motion-reduce:hidden"
                  style={{
                    background: 'linear-gradient(to bottom, hsl(0 0% 100% / 0.08) 0%, transparent 40%)',
                    borderRadius: '9999px',
                  }}
                />
                <span className="relative z-10">{t('gauge.startAnalysis')}</span>
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
                  background: 'linear-gradient(145deg, hsl(174 65% 48%) 0%, hsl(180 58% 42%) 50%, hsl(174 63% 45%) 100%)',
                  boxShadow: '0 0 25px hsl(174 65% 55% / 0.5), 0 0 12px hsl(174 60% 52% / 0.35)',
                }}
              >
                <span>{t('gauge.startAnalysis')}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Gauge bottom impact glow - ready state only */}
        {uiState === 'ready' && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none motion-reduce:hidden"
            style={{ 
              bottom: size * 0.08,
              width: size * 0.6,
              height: '8px',
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse 80% 100% at center, hsl(174 55% 52% / 0.2) 0%, transparent 70%)',
                filter: 'blur(4px)',
                animation: 'gauge-bottom-impact 3.2s cubic-bezier(0.22, 1, 0.36, 1) infinite',
              }}
            />
          </div>
        )}
        
        {/* DOWNWARD chevrons for idle state - muted */}
        {uiState === 'idle' && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center motion-reduce:hidden"
            style={{ 
              top: size + 8,
              gap: '6px',
              opacity: 0.5,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="relative"
                style={{
                  animation: `chevron-cascade 3s cubic-bezier(0.22, 1, 0.36, 1) ${i * 160}ms infinite`,
                }}
                onAnimationIteration={i === 2 ? () => onChevronCycleComplete?.() : undefined}
              >
                <div 
                  className="absolute inset-0 -m-2"
                  style={{
                    background: 'radial-gradient(circle, hsl(180 35% 55% / 0.1) 0%, transparent 60%)',
                    filter: 'blur(3px)',
                  }}
                />
                <svg 
                  width="14" 
                  height="7" 
                  viewBox="0 0 14 7" 
                  fill="none"
                  style={{
                    filter: 'drop-shadow(0 0 2px hsl(180 30% 50% / 0.2))',
                  }}
                >
                  <path 
                    d="M1 1L7 6L13 1" 
                    stroke="hsl(180 35% 55% / 0.5)" 
                    strokeWidth="1.25" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>
        )}
        
        {/* UPWARD chevrons for ready state */}
        {uiState === 'ready' && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center motion-reduce:hidden"
            style={{ 
              bottom: -32,
              gap: '5px',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="relative"
                style={{
                  animation: `chevron-up-cascade 3.2s cubic-bezier(0.22, 1, 0.36, 1) ${(2 - i) * 140}ms infinite`,
                }}
              >
                <div 
                  className="absolute inset-0 -m-2"
                  style={{
                    background: 'radial-gradient(circle, hsl(174 50% 55% / 0.12) 0%, transparent 60%)',
                    filter: 'blur(3px)',
                  }}
                />
                <svg 
                  width="12" 
                  height="6" 
                  viewBox="0 0 14 7" 
                  fill="none"
                  style={{
                    filter: 'drop-shadow(0 0 2px hsl(174 45% 55% / 0.2))',
                    transform: 'rotate(180deg)',
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
            className="absolute rounded-full motion-reduce:hidden"
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
        
        /* Instrument-grade gauge glow states */
        @keyframes instrument-glow-ready {
          0%, 100% { opacity: 0.85; transform: translate(-50%, -50%) scale(0.98); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.03); }
        }
        @keyframes instrument-glow-analyzing {
          0%, 100% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.97); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); }
        }
        
        /* Instrument-grade ring states */
        @keyframes instrument-ring-ready {
          0%, 100% { 
            box-shadow: 0 0 25px hsl(174 55% 48% / 0.15), 0 0 45px hsl(174 50% 45% / 0.06), inset 0 0 16px hsl(174 50% 45% / 0.06); 
          }
          50% { 
            box-shadow: 0 0 32px hsl(174 58% 50% / 0.22), 0 0 55px hsl(174 52% 48% / 0.1), inset 0 0 20px hsl(174 52% 48% / 0.1); 
          }
        }
        @keyframes instrument-ring-analyzing {
          0%, 100% { 
            box-shadow: 0 0 32px hsl(174 58% 50% / 0.2), 0 0 55px hsl(174 52% 48% / 0.08), inset 0 0 20px hsl(174 52% 48% / 0.08); 
          }
          50% { 
            box-shadow: 0 0 40px hsl(174 62% 52% / 0.28), 0 0 65px hsl(174 55% 50% / 0.12), inset 0 0 24px hsl(174 55% 50% / 0.12); 
          }
        }
        
        @keyframes instrument-contour-ready {
          0%, 100% { 
            border-color: hsl(174 50% 50% / 0.2); 
            box-shadow: inset 0 0 16px hsl(174 55% 50% / 0.06), 0 0 2px hsl(174 60% 55% / 0.2); 
          }
          50% { 
            border-color: hsl(174 52% 52% / 0.32); 
            box-shadow: inset 0 0 22px hsl(174 58% 52% / 0.1), 0 0 3px hsl(174 62% 58% / 0.3); 
          }
        }
        
        /* Button breathing glow - synced with gauge (2s) */
        @keyframes button-breathing-glow {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(0.98); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.04); 
          }
        }
        
        /* Click flash */
        @keyframes click-flash {
          0% { opacity: 0.8; transform: scale(0.95); }
          100% { opacity: 0; transform: scale(1.1); }
        }
        
        @keyframes center-inner-shine {
          0% { transform: translateX(-150%); }
          60%, 100% { transform: translateX(150%); }
        }
        
        @keyframes chevron-cascade {
          0% { opacity: 0; transform: translateY(-8px); }
          15% { opacity: 0.85; transform: translateY(-2px); }
          50% { opacity: 0.7; transform: translateY(5px); }
          75% { opacity: 0.3; transform: translateY(10px); }
          88%, 100% { opacity: 0; transform: translateY(12px); }
        }
        
        @keyframes idle-text-exit {
          0% { opacity: 1; transform: scale(1); filter: blur(0px); }
          100% { opacity: 0; transform: scale(0.92); filter: blur(4px); }
        }
        
        @keyframes activation-wave {
          0% { opacity: 0.8; transform: scale(0.5); }
          100% { opacity: 0; transform: scale(1.4); }
        }
        
        @keyframes button-ready-enter {
          0% { opacity: 0; transform: scale(0.94) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(-2px); }
        }
        
        @keyframes button-absorb {
          0% { opacity: 1; transform: scale(1); filter: blur(0px); }
          60% { opacity: 0.7; transform: scale(0.85); filter: blur(1px); }
          100% { opacity: 0; transform: scale(0.3); filter: blur(6px); }
        }
        
        @keyframes chevron-up-cascade {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 0.5; transform: translateY(5px); }
          50% { opacity: 0.45; transform: translateY(-2px); }
          75% { opacity: 0.2; transform: translateY(-6px); }
          88%, 100% { opacity: 0; transform: translateY(-8px); }
        }
        
        @keyframes gauge-bottom-impact {
          0%, 70% { opacity: 0.15; transform: scaleX(0.9); }
          80% { opacity: 0.5; transform: scaleX(1.1); }
          85% { opacity: 0.35; transform: scaleX(1); }
          100% { opacity: 0.15; transform: scaleX(0.9); }
        }
        
        @keyframes orb-travel {
          0% { bottom: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { bottom: 100%; opacity: 0; }
        }
        
        @keyframes trail-travel {
          0% { bottom: -10px; opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.6; }
          100% { bottom: calc(100% - 20px); opacity: 0; }
        }
        
        @keyframes beam-path-fade {
          0% { opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        
        @keyframes button-charge-glow {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 0.75; transform: scale(1.05); }
        }
        
        @keyframes charge-sheen-sweep {
          0% { transform: translateX(-150%) rotate(15deg); }
          100% { transform: translateX(150%) rotate(15deg); }
        }
        
        @keyframes entrance-sheen-sweep {
          0% { transform: translateX(-150%) rotate(15deg); }
          100% { transform: translateX(150%) rotate(15deg); }
        }
        
        @keyframes particle-float {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(var(--distance, -28px)); }
          25% { transform: translate(-50%, -50%) rotate(calc(var(--angle, 0deg) + 12deg)) translateY(calc(var(--distance, -28px) - 3px)); }
          50% { transform: translate(-50%, -50%) rotate(calc(var(--angle, 0deg) + 20deg)) translateY(calc(var(--distance, -28px) - 1px)); }
          75% { transform: translate(-50%, -50%) rotate(calc(var(--angle, 0deg) + 8deg)) translateY(calc(var(--distance, -28px) - 4px)); }
        }
        
        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .motion-reduce\\:hidden { display: none !important; }
          .motion-reduce\\:\\!animation-none { animation: none !important; }
          .motion-reduce\\:animate-none { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
