import { useEffect, useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/i18n/useLanguage';
import { Button } from '@/components/ui/button';
import { InGaugeAnalysisLoader } from '@/components/InGaugeAnalysisLoader';
import { RotatingGlobe } from '@/components/RotatingGlobe';

interface ScoreGaugeProps {
  score: number | null; // 0-100 or null for pending
  size?: number;
  className?: string;
  hasContent?: boolean; // When true, shows ANALYZE button instead of READY status
  typingState?: 'idle' | 'typing' | 'valid'; // Typing feedback state from form
  onAnalyze?: () => void; // Callback when ANALYZE button is clicked
  isLoading?: boolean; // Loading state for the button
  onChevronCycleComplete?: () => void; // Callback when chevron cascade completes (for input highlight)
  onTransferStart?: () => void; // Callback when idle→ready transfer animation starts (for input capture effect)
  loaderMode?: 'standard' | 'pro'; // Which loader mode to display during analysis
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
  typingState = 'idle',
  onAnalyze,
  isLoading = false,
  onChevronCycleComplete,
  onTransferStart,
  loaderMode = 'standard'
}: ScoreGaugeProps) => {
  const { language, t } = useLanguage();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [buttonAbsorbed, setButtonAbsorbed] = useState(false);
  const [showTransferBeam, setShowTransferBeam] = useState(false);
  const [buttonCharged, setButtonCharged] = useState(false);
  const [isRevealingScore, setIsRevealingScore] = useState(false); // Loader → Score morph transition
  const [isHovering, setIsHovering] = useState(false); // Hover state for gauge-as-button
  const [isFocused, setIsFocused] = useState(false); // Focus state for accessibility
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

  // PREMIUM VIBRANT gradient colors - MUCH MORE VISIBLE
  // Higher saturation and brightness for premium punch
  // Muted colors when idle, VIVID when activated
  const colorPairsMuted = [
    { base: 'hsl(0 55% 45%)', light: 'hsl(0 60% 52%)' },        // Red - Very Low (visible muted)
    { base: 'hsl(28 60% 48%)', light: 'hsl(32 65% 55%)' },      // Orange - Low (visible muted)
    { base: 'hsl(48 58% 48%)', light: 'hsl(50 65% 55%)' },      // Yellow - Moderate (visible muted)
    { base: 'hsl(145 48% 42%)', light: 'hsl(150 55% 50%)' },    // Green - Good (visible muted)
    { base: 'hsl(174 65% 45%)', light: 'hsl(174 72% 52%)' }     // Leen Blue - High (visible muted)
  ];
  
  const colorPairsActive = [
    { base: 'hsl(0 80% 50%)', light: 'hsl(0 85% 58%)' },        // Red - VIVID
    { base: 'hsl(28 90% 52%)', light: 'hsl(32 95% 60%)' },      // Orange - VIVID
    { base: 'hsl(48 88% 50%)', light: 'hsl(50 92% 58%)' },      // Yellow - VIVID
    { base: 'hsl(145 70% 45%)', light: 'hsl(150 75% 52%)' },    // Green - VIVID
    { base: 'hsl(174 90% 48%)', light: 'hsl(174 95% 55%)' }     // Leen Blue - VIVID PREMIUM
  ];
  
  // Use activated colors when content is detected or score is shown
  const isActivated = hasContent || score !== null || isLoading;
  const colorPairs = isActivated ? colorPairsActive : colorPairsMuted;
  
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
  // HIGHER BASE OPACITY for premium visibility
  const getSegmentOpacity = (segmentIndex: number) => {
    const segmentStart = segmentIndex * 20;
    const segmentEnd = (segmentIndex + 1) * 20;
    if (score === null) return 0.45; // MUCH MORE VISIBLE in idle (was 0.15)
    if (animatedScore >= segmentEnd) return 1;
    if (animatedScore <= segmentStart) return 0.25; // More visible unfilled (was 0.15)
    return 0.25 + 0.75 * ((animatedScore - segmentStart) / 20);
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
    
    // Reset buttonAbsorbed when transitioning back to idle or ready from any state
    // This ensures the button reappears after validation failures
    if (uiState === 'idle' || (prevState !== 'ready' && uiState === 'ready')) {
      setButtonAbsorbed(false);
    }
    
    // Idle → Ready transition: Trigger transfer animation sequence
    if (prevState === 'idle' && uiState === 'ready') {
      setIsTransitioning(true);
      setButtonAbsorbed(false); // Ensure button is visible
      
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
    
    // Analyzing → Result transition (loader morphs to score)
    if (prevState === 'analyzing' && uiState === 'result') {
      setIsRevealingScore(true);
      // Keep reveal state active during score animation
      setTimeout(() => setIsRevealingScore(false), 800);
    }
    
    // Any state → Idle transition: Reset all animation states
    if (uiState === 'idle' && prevState !== 'idle') {
      setButtonAbsorbed(false);
      setIsTransitioning(false);
      setShowTransferBeam(false);
      setButtonCharged(false);
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
      
      {/* ULTRA-PREMIUM SOFT RADIAL HALO - intensifies based on typing state */}
      <div 
        className="absolute rounded-full pointer-events-none transition-all duration-300"
        style={{
          width: size * 1.6,
          height: size * 1.6,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: score !== null 
            ? `radial-gradient(circle, ${getCurrentColor(animatedScore).replace(')', ' / 0.18)')} 0%, ${getCurrentColor(animatedScore).replace(')', ' / 0.06)')} 40%, transparent 70%)`
            : isLoading
              ? 'radial-gradient(circle, hsl(174 75% 55% / 0.2) 0%, hsl(174 65% 50% / 0.08) 40%, transparent 70%)'
              : typingState === 'valid'
                ? 'radial-gradient(circle, hsl(174 85% 58% / 0.25) 0%, hsl(174 75% 52% / 0.1) 40%, transparent 70%)'
                : typingState === 'typing'
                  ? 'radial-gradient(circle, hsl(174 70% 52% / 0.15) 0%, hsl(174 60% 48% / 0.06) 40%, transparent 70%)'
                  : 'radial-gradient(circle, hsl(174 55% 50% / 0.1) 0%, hsl(200 45% 45% / 0.04) 40%, transparent 70%)',
          filter: 'blur(30px)',
          animation: typingState === 'typing' || typingState === 'valid' 
            ? 'idle-glow-pulse 3s ease-in-out infinite' 
            : (score === null ? 'idle-glow-pulse 4.5s ease-in-out infinite' : 'none'),
        }}
      />
      
      {/* Secondary inner halo - tighter, more focused glow */}
      <div 
        className="absolute rounded-full pointer-events-none transition-all duration-300"
        style={{
          width: size * 1.25,
          height: size * 1.25,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: score !== null 
            ? `radial-gradient(circle, ${getCurrentColor(animatedScore).replace(')', ' / 0.22)')} 0%, transparent 65%)`
            : isLoading
              ? 'radial-gradient(circle, hsl(174 72% 52% / 0.22) 0%, hsl(174 62% 48% / 0.1) 45%, transparent 70%)'
              : typingState === 'valid'
                ? 'radial-gradient(circle, hsl(174 85% 58% / 0.28) 0%, hsl(174 72% 52% / 0.12) 45%, transparent 70%)'
                : typingState === 'typing'
                  ? 'radial-gradient(circle, hsl(174 65% 52% / 0.15) 0%, hsl(174 55% 48% / 0.06) 45%, transparent 70%)'
                  : 'radial-gradient(circle, hsl(174 50% 48% / 0.08) 0%, hsl(200 42% 42% / 0.03) 45%, transparent 70%)',
          filter: 'blur(15px)',
          animation: score === null 
            ? (isLoading ? 'analyzing-ambient-glow 3.5s ease-in-out infinite' : 'idle-glow-pulse 3.8s ease-in-out 200ms infinite') 
            : 'none',
        }}
      />
      
      {/* INNER GLOW PULSE - slow elegant breathing for premium click affordance in ready state */}
      {uiState === 'ready' && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size * 0.92,
            height: size * 0.92,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, hsl(174 80% 55% / 0.12) 0%, hsl(174 70% 50% / 0.04) 60%, transparent 85%)',
            filter: 'blur(8px)',
            animation: 'capture-inner-pulse 3.5s ease-in-out infinite',
          }}
        />
      )}
      
      {/* FOCUS RING - accessible keyboard focus indicator */}
      {isFocused && uiState === 'ready' && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size + 8,
            height: size + 8,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px solid hsl(174 75% 55% / 0.8)',
            boxShadow: '0 0 12px hsl(174 70% 55% / 0.5), 0 0 24px hsl(174 65% 50% / 0.3)',
          }}
        />
      )}
      
      {/* Gauge container - PREMIUM CLICKABLE CTA when ready */}
      <div 
        className={`relative ${uiState === 'ready' ? 'cursor-pointer' : ''}`}
        style={{ 
          width: size, 
          height: size,
          outline: 'none',
        }}
        tabIndex={uiState === 'ready' ? 0 : -1}
        role={uiState === 'ready' ? 'button' : undefined}
        aria-label={uiState === 'ready' ? t('gauge.startAnalysis') : undefined}
        onClick={uiState === 'ready' && !isLoading ? handleAnalyzeClick : undefined}
        onKeyDown={(e) => {
          if (uiState === 'ready' && !isLoading && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleAnalyzeClick();
          }
        }}
        onMouseEnter={() => {
          if (uiState === 'ready') setIsHovering(true);
        }}
        onMouseLeave={() => {
          setIsHovering(false);
        }}
        onFocus={() => {
          if (uiState === 'ready') setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
      >
        {/* GLASS LENS HIGHLIGHT on ring - premium subtle reflection */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
          style={{ zIndex: 10 }}
        >
          {/* Primary lens highlight - top-left arc reflection */}
          <div 
            className="absolute"
            style={{
              top: '3%',
              left: '8%',
              width: '45%',
              height: '25%',
              background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.12) 0%, hsl(0 0% 100% / 0.04) 50%, transparent 100%)',
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              filter: 'blur(1px)',
              transform: 'rotate(-15deg)',
            }}
          />
          {/* Secondary micro-reflection - bottom edge */}
          <div 
            className="absolute"
            style={{
              bottom: '6%',
              right: '12%',
              width: '30%',
              height: '8%',
              background: 'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.04) 50%, transparent 100%)',
              borderRadius: '50%',
              filter: 'blur(1px)',
            }}
          />
        </div>
        
        {/* Premium outer ring glow - activates when content detected */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-400 ease-out"
          style={{
            boxShadow: score !== null 
              ? `0 0 35px ${getCurrentColor(animatedScore).replace(')', ' / 0.35)')}, 0 0 70px ${getCurrentColor(animatedScore).replace(')', ' / 0.18)')}, inset 0 0 25px ${getCurrentColor(animatedScore).replace(')', ' / 0.12)')}`
              : hasContent && !isLoading
                ? '0 0 40px hsl(174 80% 52% / 0.3), 0 0 65px hsl(174 70% 50% / 0.15), inset 0 0 20px hsl(174 70% 48% / 0.14)'
                : '0 0 28px hsl(174 55% 48% / 0.15), 0 0 50px hsl(200 45% 45% / 0.08), inset 0 0 15px hsl(174 50% 42% / 0.08)',
            animation: score === null ? 'idle-ring-pulse 3.8s ease-in-out 75ms infinite' : 'none',
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
        
        {/* Idle state premium contour ring - synchronized with halo pulse + phase delay for wave effect */}
        {score === null && !isLoading && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: strokeWidth / 2 - 1,
              border: '1px solid hsl(174 50% 50% / 0.2)',
              boxShadow: 'inset 0 0 20px hsl(174 60% 50% / 0.1), 0 0 1px hsl(174 60% 55% / 0.3)',
              animation: 'idle-contour-glow 3.8s ease-in-out infinite',
              animationDelay: '150ms',
            }}
          />
        )}
        
        {/* Subtle internal light sweep - premium "alive" effect */}
        <div 
          className="absolute rounded-full pointer-events-none overflow-hidden"
          style={{
            inset: strokeWidth / 2 + 2,
          }}
        >
          {/* Slow rotating light sweep */}
          <div 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(
                from 0deg,
                transparent 0deg,
                transparent 160deg,
                hsl(174 55% 50% / 0.04) 170deg,
                hsl(174 60% 55% / 0.08) 180deg,
                hsl(174 55% 50% / 0.04) 190deg,
                transparent 200deg,
                transparent 360deg
              )`,
              animation: 'gauge-light-sweep 12s linear infinite',
            }}
          />
          {/* Secondary counter-rotating subtle sweep */}
          <div 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(
                from 180deg,
                transparent 0deg,
                transparent 170deg,
                hsl(180 50% 55% / 0.03) 175deg,
                hsl(180 55% 60% / 0.05) 180deg,
                hsl(180 50% 55% / 0.03) 185deg,
                transparent 190deg,
                transparent 360deg
              )`,
              animation: 'gauge-light-sweep-reverse 18s linear infinite',
            }}
          />
        </div>
        
        {/* Soft ambient inner glow pulse */}
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: strokeWidth / 2 + 4,
            background: 'radial-gradient(circle at center, hsl(174 50% 50% / 0.03) 0%, transparent 70%)',
            animation: 'gauge-ambient-pulse 6s ease-in-out infinite',
          }}
        />
        
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

          {/* Scientific tick marks - 0-100% reference scale */}
          {(() => {
            const ticks = [];
            const tickRadius = radius - strokeWidth / 2 - 2; // Just inside the inner edge of gauge ring
            const startAngle = 135; // Gauge starts at 135°
            const totalDegrees = 270; // Gauge spans 270°
            
            for (let i = 0; i <= 100; i += 5) {
              const isMajor = i % 10 === 0;
              const angle = startAngle + (i / 100) * totalDegrees;
              const rad = angle * (Math.PI / 180);
              
              // Tick dimensions
              const tickLength = isMajor ? 6 : 3;
              const tickWidth = isMajor ? 1.2 : 0.8;
              
              // Calculate tick positions (pointing inward from edge)
              const outerX = size / 2 + tickRadius * Math.cos(rad);
              const outerY = size / 2 + tickRadius * Math.sin(rad);
              const innerX = size / 2 + (tickRadius - tickLength) * Math.cos(rad);
              const innerY = size / 2 + (tickRadius - tickLength) * Math.sin(rad);
              
              // Highlight nearest tick when score is displayed
              const isNearestTick = score !== null && Math.abs(animatedScore - i) < 2.5;
              const tickOpacity = isNearestTick ? 0.7 : (isMajor ? 0.3 : 0.2);
              
              ticks.push(
                <line
                  key={`tick-${i}`}
                  x1={innerX}
                  y1={innerY}
                  x2={outerX}
                  y2={outerY}
                  stroke={isNearestTick ? 'hsl(0 0% 100%)' : 'hsl(0 0% 85%)'}
                  strokeWidth={tickWidth}
                  strokeLinecap="round"
                  style={{
                    opacity: tickOpacity,
                    transition: isNearestTick ? 'opacity 0.3s ease-out' : 'none',
                  }}
                />
              );
            }
            return ticks;
          })()}

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
            const isIdle = score === null && !isLoading;
            const isAnalyzing = isLoading;
            const idleOpacity = 0.55 + (i * 0.08); // MUCH MORE VISIBLE idle (was 0.35 + 0.04)
            
            // During analyzing, the Leen Blue segment (index 4) gets a breathing glow
            const isLeenBlueSegment = i === 4;
            const analyzingAnimation = isAnalyzing && isLeenBlueSegment 
              ? 'arc-breathing-glow 3.5s ease-in-out infinite' 
              : 'none';
            
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
                filter={isActive ? 'url(#segment-glow)' : (isIdle || isAnalyzing) ? 'url(#idle-segment-glow)' : undefined}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  opacity: isAnalyzing 
                    ? (isLeenBlueSegment ? 0.7 : 0.25) 
                    : (isIdle ? idleOpacity : opacity),
                  transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: analyzingAnimation,
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
          {/* Rotating Globe - always visible behind other content */}
          <RotatingGlobe size={size} isAnalyzing={isLoading} />
          {/* RESULT STATE: Display score - PREMIUM VISUAL FOCAL POINT with morph reveal */}
          {uiState === 'result' && (
            <div 
              className="relative flex items-center justify-center"
              style={{
                animation: isRevealingScore ? 'score-reveal-container 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
              }}
            >
              {/* Reveal flash ring - appears during morph transition */}
              {isRevealingScore && (
                <div 
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: scoreFontSize * 2.5,
                    height: scoreFontSize * 2.5,
                    border: '2px solid hsl(174 70% 55% / 0.6)',
                    boxShadow: '0 0 30px hsl(174 65% 55% / 0.5), 0 0 60px hsl(174 60% 50% / 0.3)',
                    animation: 'score-reveal-ring 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                />
              )}
              
              {/* Score breathing glow - very slow, subtle pulse suggesting intelligence */}
              <div 
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: scoreFontSize * 2.2,
                  height: scoreFontSize * 2.2,
                  background: `radial-gradient(circle, ${getInterpolatedColor(animatedScore).replace(')', ' / 0.35)')} 0%, ${getInterpolatedColor(animatedScore).replace(')', ' / 0.15)')} 40%, transparent 70%)`,
                  filter: 'blur(12px)',
                  animation: isRevealingScore 
                    ? 'score-glow-reveal 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards, score-breathing-glow 4s ease-in-out 600ms infinite'
                    : 'score-breathing-glow 4s ease-in-out infinite',
                }}
              />
              
              {/* Score number with strong controlled glow - premium reveal animation */}
              <span
                className="relative font-semibold tabular-nums"
                style={{
                  fontSize: scoreFontSize,
                  lineHeight: 1,
                  color: getInterpolatedColor(animatedScore),
                  letterSpacing: '-0.02em',
                  textShadow: `
                    0 0 8px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.9)')},
                    0 0 25px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.6)')},
                    0 0 50px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.35)')},
                    0 0 80px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.2)')}
                  `,
                  animation: isRevealingScore
                    ? 'score-number-reveal 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    : 'score-text-pulse 4s ease-in-out infinite',
                }}
              >
                {displayScore}
              </span>
              
              {/* Confirmation pulse ring - subtle signal that score is locked */}
              {isRevealingScore && (
                <div 
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: scoreFontSize * 1.8,
                    height: scoreFontSize * 1.8,
                    animation: 'score-confirm-pulse 800ms cubic-bezier(0.16, 1, 0.3, 1) 400ms forwards',
                  }}
                />
              )}
            </div>
          )}

          {/* ANALYZING STATE: Premium in-gauge loader with evolving steps */}
          {uiState === 'analyzing' && (
            <InGaugeAnalysisLoader size={size} mode={loaderMode} />
          )}

          {/* IDLE STATE: "READY TO ANALYZE" with premium glass pill */}
          {uiState === 'idle' && (
            <div 
              className="flex flex-col items-center justify-center text-center relative"
              style={{ padding: 'var(--space-2)' }}
            >
              {/* Premium glass pill backdrop - elegant frosted glass effect */}
              <div 
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: size * 0.72,
                  height: size * 0.22,
                  background: 'linear-gradient(135deg, hsl(200 30% 20% / 0.45) 0%, hsl(220 25% 15% / 0.35) 50%, hsl(200 30% 18% / 0.4) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid hsl(174 40% 60% / 0.15)',
                  boxShadow: `
                    inset 0 1px 1px hsl(0 0% 100% / 0.08),
                    inset 0 -1px 1px hsl(0 0% 0% / 0.15),
                    0 4px 16px hsl(200 50% 10% / 0.4),
                    0 0 1px hsl(174 50% 60% / 0.2)
                  `,
                }}
              />
              
              {/* Subtle inner glow for premium depth */}
              <div 
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: size * 0.68,
                  height: size * 0.18,
                  background: 'radial-gradient(ellipse 100% 100% at center, hsl(174 35% 55% / 0.08) 0%, transparent 70%)',
                  filter: 'blur(4px)',
                  animation: 'idle-halo-pulse 3.8s ease-in-out infinite',
                }}
              />
              
              {/* Text with elegant shadow for readability */}
              <span
                className="relative uppercase font-medium tracking-[0.18em] text-center"
                style={{
                  fontSize: 'clamp(0.65rem, 2.2vw, 0.85rem)',
                  lineHeight: 1.4,
                  color: 'hsl(0 0% 96%)',
                  textShadow: '0 1px 3px hsl(0 0% 0% / 0.5), 0 0 12px hsl(174 50% 55% / 0.25)',
                  animation: 'idle-text-brightness 3.8s ease-in-out infinite',
                }}
              >
                {t('gauge.readyToAnalyze')}
              </span>
            </div>
          )}
          
          {/* READY STATE: "PRÊT À ANALYSER" text with premium glass pill - gauge is the CTA */}
          {uiState === 'ready' && (
            <div 
              className="flex flex-col items-center justify-center text-center relative"
              style={{ 
                padding: 'var(--space-2)',
                animation: isTransitioning ? 'idle-text-enter 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
              }}
            >
              {/* Premium glass pill backdrop - elegant frosted glass effect */}
              <div 
                className="absolute rounded-full pointer-events-none transition-all duration-300"
                style={{
                  width: size * 0.72,
                  height: size * 0.22,
                  background: (isHovering || isFocused)
                    ? 'linear-gradient(135deg, hsl(200 35% 22% / 0.55) 0%, hsl(220 30% 18% / 0.45) 50%, hsl(200 35% 20% / 0.5) 100%)'
                    : 'linear-gradient(135deg, hsl(200 30% 20% / 0.45) 0%, hsl(220 25% 15% / 0.35) 50%, hsl(200 30% 18% / 0.4) 100%)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: (isHovering || isFocused)
                    ? '1px solid hsl(174 50% 65% / 0.25)'
                    : '1px solid hsl(174 40% 60% / 0.15)',
                  boxShadow: (isHovering || isFocused)
                    ? `
                      inset 0 1px 1px hsl(0 0% 100% / 0.12),
                      inset 0 -1px 1px hsl(0 0% 0% / 0.15),
                      0 4px 20px hsl(200 50% 10% / 0.5),
                      0 0 3px hsl(174 60% 60% / 0.35)
                    `
                    : `
                      inset 0 1px 1px hsl(0 0% 100% / 0.08),
                      inset 0 -1px 1px hsl(0 0% 0% / 0.15),
                      0 4px 16px hsl(200 50% 10% / 0.4),
                      0 0 1px hsl(174 50% 60% / 0.2)
                    `,
                }}
              />
              
              {/* Subtle inner glow for premium depth */}
              <div 
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: size * 0.68,
                  height: size * 0.18,
                  background: (isHovering || isFocused)
                    ? 'radial-gradient(ellipse 100% 100% at center, hsl(174 45% 60% / 0.14) 0%, transparent 70%)'
                    : 'radial-gradient(ellipse 100% 100% at center, hsl(174 35% 55% / 0.08) 0%, transparent 70%)',
                  filter: 'blur(4px)',
                  animation: 'idle-halo-pulse 3.8s ease-in-out infinite',
                }}
              />
              
              {/* Text with elegant shadow for readability - intensifies on hover */}
              {/* Show 'PRÊT' when valid input, otherwise full 'PRÊT À ANALYSER' */}
              <span
                className="relative uppercase font-medium tracking-[0.18em] text-center transition-all duration-300"
                style={{
                  fontSize: typingState === 'valid' ? 'clamp(0.8rem, 2.8vw, 1.1rem)' : 'clamp(0.65rem, 2.2vw, 0.85rem)',
                  lineHeight: 1.4,
                  color: (isHovering || isFocused) ? 'hsl(0 0% 100%)' : 'hsl(0 0% 96%)',
                  textShadow: (isHovering || isFocused)
                    ? '0 1px 4px hsl(0 0% 0% / 0.6), 0 0 18px hsl(174 60% 58% / 0.4)'
                    : '0 1px 3px hsl(0 0% 0% / 0.5), 0 0 12px hsl(174 50% 55% / 0.25)',
                  animation: 'idle-text-brightness 3.8s ease-in-out infinite',
                }}
              >
                {typingState === 'valid' ? t('gauge.readyShort') : t('gauge.readyToAnalyze')}
              </span>
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
      
      {/* Credibility label BELOW gauge - PREMIUM AUTHORITY PRESENTATION */}
      {score !== null && (
        <div 
          className="relative w-full flex flex-col items-center justify-center"
          style={{ 
            marginTop: 'var(--space-3)', 
            minHeight: '44px',
            animation: 'label-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Static authority glow - no animation, reinforces stability */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '110%',
              height: '100%',
              background: `radial-gradient(ellipse 100% 80% at center, ${currentLabelColor.replace(')', ' / 0.28)')} 0%, ${currentLabelColor.replace(')', ' / 0.1)')} 50%, transparent 80%)`,
              filter: 'blur(18px)',
            }}
          />
          {/* Category label with enhanced brightness and contrast */}
          <span
            className="relative text-center uppercase font-bold"
            style={{
              fontSize: size * 0.115,
              color: currentLabelColor,
              letterSpacing: '0.16em',
              fontFamily: 'var(--font-sans)',
              filter: 'brightness(1.15) contrast(1.1)',
              textShadow: `
                0 0 6px ${currentLabelColor.replace(')', ' / 0.95)')},
                0 0 18px ${currentLabelColor.replace(')', ' / 0.7)')},
                0 0 35px ${currentLabelColor.replace(')', ' / 0.45)')},
                0 1px 2px hsl(0 0% 0% / 0.3)
              `,
            }}
          >
            {currentLabel}
          </span>
        </div>
      )}
        
      {/* CSS animations */}
      <style>{`
        /* ===== LOADER → SCORE MORPH REVEAL ANIMATIONS ===== */
        
        /* Container reveal - slight scale up with blur clear */
        @keyframes score-reveal-container {
          0% { 
            opacity: 0;
            transform: scale(0.7);
            filter: blur(8px);
          }
          40% {
            opacity: 1;
            filter: blur(2px);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }
        
        /* Flash ring that expands outward during reveal */
        @keyframes score-reveal-ring {
          0% { 
            opacity: 1;
            transform: scale(0.6);
          }
          60% { 
            opacity: 0.8;
            transform: scale(1.2);
          }
          100% { 
            opacity: 0;
            transform: scale(1.5);
          }
        }
        
        /* Glow intensifies then settles during reveal */
        @keyframes score-glow-reveal {
          0% { 
            opacity: 0;
            transform: scale(0.5);
          }
          50% { 
            opacity: 1.2;
            transform: scale(1.15);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Score number morphs in with premium reveal */
        @keyframes score-number-reveal {
          0% { 
            opacity: 0;
            transform: scale(0.5) translateY(8px);
            filter: blur(6px);
          }
          30% {
            opacity: 0.8;
            filter: blur(2px);
          }
          60% { 
            opacity: 1;
            transform: scale(1.08) translateY(-2px);
            filter: blur(0px);
          }
          100% { 
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }
        
        /* Confirmation pulse - subtle ring that signals score is locked */
        @keyframes score-confirm-pulse {
          0% { 
            opacity: 0;
            transform: scale(0.9);
            box-shadow: 0 0 0 0 hsl(174 70% 55% / 0);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1);
            box-shadow: 0 0 20px 4px hsl(174 65% 55% / 0.4);
          }
          100% { 
            opacity: 0;
            transform: scale(1.3);
            box-shadow: 0 0 30px 8px hsl(174 60% 50% / 0);
          }
        }
        
        /* ===== EXISTING ANIMATIONS ===== */
        
        /* Premium score breathing glow - very slow, intelligent rhythm */
        @keyframes score-breathing-glow {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(0.95);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.08);
          }
        }
        /* Arc breathing glow for analyzing state - very slow, subtle */
        @keyframes arc-breathing-glow {
          0%, 100% { 
            opacity: 0.5;
            filter: url(#idle-segment-glow) brightness(1);
          }
          50% { 
            opacity: 0.85;
            filter: url(#idle-segment-glow) brightness(1.2);
          }
        }
        /* Score text subtle pulse - synchronized with glow */
        @keyframes score-text-pulse {
          0%, 100% { 
            filter: brightness(1);
          }
          50% { 
            filter: brightness(1.08);
          }
        }
        /* Category label reveal animation */
        @keyframes label-reveal {
          0% { 
            opacity: 0; 
            transform: translateY(6px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        @keyframes idle-glow-pulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.98); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.02); }
        }
        /* Analyzing state ambient glow - premium breathing rhythm */
        @keyframes analyzing-ambient-glow {
          0%, 100% { 
            opacity: 0.6; 
            transform: translate(-50%, -50%) scale(0.96);
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.06);
          }
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
        /* Subtle alive effects for gauge */
        @keyframes gauge-light-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gauge-light-sweep-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes gauge-ambient-pulse {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};
