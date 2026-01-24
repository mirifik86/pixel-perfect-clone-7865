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
  // Each color has a base and a lighter variant for gradient effect
  const colorPairs = [
    { base: 'hsl(0 70% 45%)', light: 'hsl(0 75% 55%)' },      // Red - Very Low
    { base: 'hsl(25 85% 48%)', light: 'hsl(30 90% 58%)' },    // Orange - Low
    { base: 'hsl(45 80% 45%)', light: 'hsl(50 85% 55%)' },    // Yellow - Moderate
    { base: 'hsl(145 55% 40%)', light: 'hsl(150 60% 50%)' },  // Green - Good
    { base: 'hsl(174 60% 42%)', light: 'hsl(174 70% 52%)' }   // Leen Blue - High
  ];
  
  const colors = colorPairs.map(c => c.base);

  // Credibility labels for each segment (uppercase for institutional authority)
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
    
    // Use the light variant when progressing through a segment
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
    // Partial fill
    return 0.15 + 0.85 * ((animatedScore - segmentStart) / 20);
  };

  // Calculate indicator position - on the arc itself
  const indicatorAngle = 135 + animatedScore / 100 * 270;
  const indicatorRad = indicatorAngle * (Math.PI / 180);
  const indicatorX = size / 2 + radius * Math.cos(indicatorRad);
  const indicatorY = size / 2 + radius * Math.sin(indicatorRad);

  // Slightly smaller score for professional feel
  const scoreFontSize = size * 0.30;
  const labelFontSize = size * 0.085;

  // Get current credibility label and color
  const segmentIndex = score !== null ? getSegmentIndex(animatedScore) : null;
  const currentLabel = segmentIndex !== null 
    ? credibilityLabels[segmentIndex][language]
    : null;
  const currentLabelColor = segmentIndex !== null 
    ? colors[segmentIndex] 
    : 'hsl(var(--muted-foreground))';

  // Calculate vertical offset to perfectly center content in the visible arc area
  // The arc spans 270° starting at 135°, so the visual center is slightly above geometric center
  const verticalOffset = size * 0.02;

  return (
    <div className={`relative flex flex-col items-center ${className || ''}`}>
      {/* Sparkle particles with light trails - visible when score is shown */}
      {showSparkles && score !== null && (
        <>
          {sparkles.map((sparkle, index) => {
            const rad = (sparkle.angle * Math.PI) / 180;
            const finalX = Math.cos(rad) * size * sparkle.distance;
            const finalY = Math.sin(rad) * size * sparkle.distance;
            // Staggered spiral entry delay based on particle index
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
                {/* Light trail effect - multiple fading copies behind the particle */}
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
                {/* Main particle with glow */}
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
              0% { 
                opacity: 0;
                transform: translate(-50%, -50%) rotate(0deg) scale(0);
              }
              10% {
                opacity: 1;
              }
              100% { 
                opacity: 1;
                transform: translate(calc(-50% + var(--final-x)), calc(-50% + var(--final-y))) rotate(var(--sparkle-angle)) scale(1);
              }
            }
            @keyframes trail-fade {
              0% {
                opacity: 0.8;
              }
              60% {
                opacity: 0.4;
              }
              100% {
                opacity: 0;
              }
            }
            @keyframes sparkle-twinkle {
              0%, 100% { 
                opacity: 0.3; 
                transform: translate(calc(-50% + var(--final-x)), calc(-50% + var(--final-y))) scale(0.6);
              }
              50% { 
                opacity: 1; 
                transform: translate(calc(-50% + var(--final-x)), calc(-50% + var(--final-y))) scale(1.3);
              }
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
            : 'radial-gradient(circle, hsl(174 60% 45% / 0.08) 0%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none'
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
              : '0 0 20px hsl(174 60% 45% / 0.1), 0 0 40px hsl(174 60% 45% / 0.05)',
            transition: 'box-shadow 0.5s ease-out'
          }}
        />
        
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Gradient definitions for smooth color transitions */}
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
            
            {/* Glow filter for active segments */}
            <filter id="segment-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* 5 equal color segments with gradient fills */}
          {colorPairs.map((pair, i) => {
            const segmentLength = segmentArc - gap;
            const rotation = 135 + i * 270 / 5;
            const opacity = getSegmentOpacity(i);
            const isActive = opacity > 0.5;
            
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
                filter={isActive ? 'url(#segment-glow)' : undefined}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  opacity: opacity,
                  transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}

          {/* Position indicator - glowing for premium look */}
          {score !== null && (
            <g>
              <circle
                cx={indicatorX}
                cy={indicatorY}
                r={5}
                fill={getInterpolatedColor(animatedScore)}
                style={{
                  filter: 'drop-shadow(0 0 4px currentColor)',
                  transition: 'fill 0.3s ease-out'
                }}
              />
              <circle
                cx={indicatorX}
                cy={indicatorY}
                r={2.5}
                fill="hsl(0 0% 100%)"
              />
            </g>
          )}
        </svg>

        {/* Center content - score number with premium glow */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ marginTop: -verticalOffset }}
        >
          <span
            className="font-semibold tabular-nums"
            style={{
              fontSize: scoreFontSize,
              lineHeight: 1,
              color: score !== null ? getInterpolatedColor(animatedScore) : 'hsl(var(--muted-foreground))',
              letterSpacing: '-0.02em',
              transition: 'color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              textShadow: score !== null 
                ? `0 0 20px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.4)')}, 0 0 40px ${getInterpolatedColor(animatedScore).replace(')', ' / 0.2)')}`
                : 'none'
            }}
          >
            {score === null ? '—' : displayScore}
          </span>
        </div>
      </div>

      {/* Status label / CTA - transforms based on content state */}
      <div 
        className="relative w-full flex flex-col items-center justify-center"
        style={{ marginTop: 'var(--space-4)', minHeight: '80px' }}
      >
        {/* When score is shown - display credibility label */}
        {score !== null && (
          <>
            {/* Premium glow behind label */}
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
              className="relative text-center transition-all duration-500 uppercase font-bold"
              style={{
                fontSize: size * 0.13,
                color: currentLabelColor,
                letterSpacing: '0.2em',
                fontFamily: 'var(--font-sans)',
                textShadow: `0 0 20px ${currentLabelColor.replace(')', ' / 0.8)')}, 0 0 40px ${currentLabelColor.replace(')', ' / 0.5)')}, 0 0 60px ${currentLabelColor.replace(')', ' / 0.3)')}`,
              }}
            >
              {currentLabel}
            </span>
          </>
        )}
        
        {/* When no score: Idle or Active state */}
        {score === null && (
          <div 
            className="relative flex flex-col items-center justify-center w-full"
            style={{ minHeight: '90px' }}
          >
            {/* IDLE STATE: "READY TO ANALYZE" + Arrow - Premium Design */}
            <div 
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-200 ${
                hasContent ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {/* Premium multi-layer halo effect */}
              <div 
                className="absolute rounded-full"
                style={{
                  width: '200%',
                  height: '150%',
                  background: 'radial-gradient(ellipse at center, hsl(174 65% 50% / 0.15) 0%, hsl(174 60% 45% / 0.08) 40%, transparent 70%)',
                  filter: 'blur(20px)',
                  animation: 'halo-breathe 3s ease-in-out infinite',
                }}
              />
              
              {/* Inner pulse glow */}
              <div 
                className="absolute"
                style={{
                  width: '120%',
                  height: '80%',
                  background: 'radial-gradient(ellipse at center, hsl(174 70% 55% / 0.25) 0%, transparent 60%)',
                  filter: 'blur(15px)',
                  animation: 'ready-pulse 2.5s ease-in-out infinite',
                }}
              />
              
              {/* Premium status text with gradient */}
              <div className="relative flex flex-col items-center">
                {/* Subtle decorative line above */}
                <div 
                  className="mb-3"
                  style={{
                    width: '40px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, hsl(174 60% 55% / 0.6), transparent)',
                    borderRadius: '1px',
                  }}
                />
                
                {/* Main text with premium styling */}
                <span
                  className="relative text-center uppercase font-black tracking-[0.25em]"
                  style={{
                    fontSize: 'clamp(1rem, 4vw, 1.35rem)',
                    background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(174 30% 85%) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: 'var(--font-sans)',
                    textShadow: 'none',
                    filter: 'drop-shadow(0 0 20px hsl(174 60% 55% / 0.4)) drop-shadow(0 0 40px hsl(174 60% 50% / 0.2))',
                  }}
                >
                  {t('gauge.readyToAnalyze')}
                </span>
                
              </div>
            </div>
            
            {/* ACTIVE STATE: "ANALYZE" button */}
            <div 
              className={`w-full max-w-xs transition-all duration-200 ${
                hasContent ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-105'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="relative group">
                {/* BOTTOM IMPACT ZONE - Arrow impact effect */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    bottom: '-20px',
                    width: '80px',
                    height: '40px',
                  }}
                >
                  {/* Impact glow burst */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(ellipse 100% 80% at 50% 0%, hsl(174 90% 70% / 0.9) 0%, hsl(180 85% 60% / 0.5) 30%, hsl(185 80% 55% / 0.2) 60%, transparent 100%)',
                      filter: 'blur(6px)',
                      animation: 'bottom-impact-glow 1.8s ease-out infinite',
                    }}
                  />
                  
                  {/* Impact pulse rings from bottom */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 top-0"
                    style={{
                      width: '30px',
                      height: '15px',
                      borderRadius: '50%',
                      border: '2px solid hsl(174 85% 65% / 0.7)',
                      animation: 'bottom-impact-ring 1.8s ease-out infinite',
                    }}
                  />
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 top-0"
                    style={{
                      width: '30px',
                      height: '15px',
                      borderRadius: '50%',
                      border: '1.5px solid hsl(180 80% 60% / 0.5)',
                      animation: 'bottom-impact-ring 1.8s ease-out infinite 0.2s',
                    }}
                  />
                  
                  {/* Energy particles shooting outward */}
                  <div 
                    className="absolute left-1/2 top-0"
                    style={{
                      width: '3px',
                      height: '12px',
                      background: 'linear-gradient(to bottom, hsl(174 90% 75%) 0%, transparent 100%)',
                      borderRadius: '2px',
                      transformOrigin: 'top center',
                      animation: 'particle-left 1.8s ease-out infinite',
                    }}
                  />
                  <div 
                    className="absolute left-1/2 top-0"
                    style={{
                      width: '3px',
                      height: '12px',
                      background: 'linear-gradient(to bottom, hsl(180 85% 70%) 0%, transparent 100%)',
                      borderRadius: '2px',
                      transformOrigin: 'top center',
                      animation: 'particle-right 1.8s ease-out infinite',
                    }}
                  />
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 top-0"
                    style={{
                      width: '2px',
                      height: '16px',
                      background: 'linear-gradient(to bottom, hsl(174 95% 80%) 0%, transparent 100%)',
                      borderRadius: '2px',
                      animation: 'particle-center 1.8s ease-out infinite',
                    }}
                  />
                </div>
                
                {/* Outer glow ring - premium pulsing synced with impact */}
                <div 
                  className="absolute -inset-3 rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 80% 55% / 0.7), hsl(195 85% 50% / 0.5), hsl(174 80% 55% / 0.7))',
                    animation: 'button-glow-impact 1.8s ease-out infinite',
                    filter: 'blur(16px)',
                  }}
                />
                
                {/* Secondary inner glow */}
                <div 
                  className="absolute -inset-1 rounded-xl opacity-80"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 70% 50% / 0.5), hsl(200 75% 55% / 0.3), hsl(174 70% 50% / 0.5))',
                    filter: 'blur(8px)',
                    animation: 'button-inner-glow 2s ease-in-out infinite 0.5s',
                  }}
                />
                
                {/* Border shimmer layer */}
                <div 
                  className="absolute -inset-0.5 rounded-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 70% 52%), hsl(185 65% 48%), hsl(174 70% 52%))',
                  }}
                >
                  {/* Fast sweeping shine effect */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, hsl(0 0% 100% / 0.15) 40%, hsl(0 0% 100% / 0.5) 50%, hsl(0 0% 100% / 0.15) 60%, transparent 70%)',
                      animation: 'button-shine-sweep 2s ease-in-out infinite',
                    }}
                  />
                </div>
                
                <Button
                  type="button"
                  onClick={onAnalyze}
                  disabled={isLoading}
                  className="relative w-full rounded-xl py-4 md:py-5 text-sm md:text-base font-bold tracking-wider uppercase text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 68% 46%) 0%, hsl(182 58% 40%) 50%, hsl(174 65% 44%) 100%)',
                    boxShadow: '0 0 60px hsl(174 65% 55% / 0.6), 0 0 30px hsl(174 60% 50% / 0.4), 0 12px 35px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.25), inset 0 -1px 0 hsl(0 0% 0% / 0.15)',
                    textShadow: '0 2px 4px hsl(0 0% 0% / 0.5)',
                    letterSpacing: '0.15em',
                    animation: 'button-pulse-impact 1.8s ease-out infinite',
                  }}
                >
                  {/* Bottom edge glow on impact */}
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
                    style={{
                      width: '60%',
                      height: '4px',
                      background: 'linear-gradient(90deg, transparent 0%, hsl(174 90% 75% / 0.9) 30%, hsl(180 95% 80%) 50%, hsl(174 90% 75% / 0.9) 70%, transparent 100%)',
                      borderRadius: '2px',
                      filter: 'blur(2px)',
                      animation: 'bottom-edge-glow 1.8s ease-out infinite',
                    }}
                  />
                  
                  {/* Inner shine layer on button */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(110deg, transparent 25%, hsl(0 0% 100% / 0.12) 40%, hsl(0 0% 100% / 0.35) 50%, hsl(0 0% 100% / 0.12) 60%, transparent 75%)',
                      animation: 'button-inner-shine 2.5s ease-in-out infinite 0.3s',
                    }}
                  />
                  
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-5 w-5" style={{ filter: 'drop-shadow(0 2px 3px hsl(0 0% 0% / 0.4))' }} />
                  )}
                  <span className="relative z-10">
                    {t('common.analyze')}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* CSS animations */}
        <style>{`
          @keyframes ready-pulse {
            0%, 100% { opacity: 0.5; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
          }
          @keyframes halo-breathe {
            0%, 100% { opacity: 0.6; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes label-glow {
            0% { opacity: 0.5; transform: scale(0.95); }
            100% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes arrow-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(6px); }
          }
          @keyframes arrow-glow {
            0%, 100% { opacity: 0.5; transform: scale(0.9); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes button-glow-pulse {
            0%, 100% { opacity: 0.5; transform: scale(0.96); }
            50% { opacity: 1; transform: scale(1.04); }
          }
          @keyframes button-glow-impact {
            0%, 50%, 100% { opacity: 0.5; transform: scale(0.96); }
            15% { opacity: 1; transform: scale(1.08); }
            30% { opacity: 0.8; transform: scale(1.02); }
          }
          @keyframes button-pulse-impact {
            0%, 50%, 100% { transform: scale(1); }
            15% { transform: scale(1.015); }
            30% { transform: scale(1.005); }
          }
          @keyframes button-inner-glow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes button-shine-sweep {
            0% { transform: translateX(-120%); }
            50%, 100% { transform: translateX(120%); }
          }
          @keyframes button-inner-shine {
            0% { transform: translateX(-150%); }
            60%, 100% { transform: translateX(150%); }
          }
          @keyframes bottom-impact-glow {
            0%, 60%, 100% { opacity: 0; transform: scale(0.5) translateY(5px); }
            15% { opacity: 1; transform: scale(1.2) translateY(0); }
            35% { opacity: 0.6; transform: scale(1) translateY(2px); }
          }
          @keyframes bottom-impact-ring {
            0% { opacity: 0.9; transform: translateX(-50%) scale(0.3); }
            25% { opacity: 0.6; transform: translateX(-50%) scale(1.2); }
            50%, 100% { opacity: 0; transform: translateX(-50%) scale(2); }
          }
          @keyframes bottom-edge-glow {
            0%, 60%, 100% { opacity: 0; }
            15% { opacity: 1; }
            35% { opacity: 0.5; }
          }
          @keyframes particle-left {
            0% { opacity: 0; transform: translateX(-50%) rotate(-30deg) translateY(0); }
            15% { opacity: 1; transform: translateX(-50%) rotate(-30deg) translateY(8px); }
            40%, 100% { opacity: 0; transform: translateX(-50%) rotate(-30deg) translateY(20px); }
          }
          @keyframes particle-right {
            0% { opacity: 0; transform: translateX(-50%) rotate(30deg) translateY(0); }
            15% { opacity: 1; transform: translateX(-50%) rotate(30deg) translateY(8px); }
            40%, 100% { opacity: 0; transform: translateX(-50%) rotate(30deg) translateY(20px); }
          }
          @keyframes particle-center {
            0% { opacity: 0; transform: translateY(0); }
            15% { opacity: 1; transform: translateY(10px); }
            40%, 100% { opacity: 0; transform: translateY(25px); }
          }
        `}</style>
      </div>
    </div>
  );
};
