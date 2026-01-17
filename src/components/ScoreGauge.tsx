import { useEffect, useState, useRef } from 'react';

interface ScoreGaugeProps {
  score: number | null; // 0-100 or null for pending
  size?: number;
  className?: string;
  language?: 'en' | 'fr';
}

export const ScoreGauge = ({
  score,
  size = 160,
  className,
  language = 'fr'
}: ScoreGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const animationRef = useRef<number | null>(null);
  
  // Increased stroke width for better readability
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * 0.75; // 270 degrees
  const segmentArc = totalArc / 5; // Each segment is 1/5 of the arc
  const gap = 3; // Smaller gap for cleaner look

  useEffect(() => {
    if (score !== null) {
      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
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
    }
  }, [score]);

  // 5 colors from red to Leen (brand color for highest - matches "Leen" in logo)
  const colors = [
    'hsl(var(--score-red))',
    'hsl(var(--score-orange))',
    'hsl(var(--score-yellow))',
    'hsl(var(--score-green))',
    'hsl(var(--score-leen))'
  ];

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

  // Responsive font sizes based on gauge size
  const scoreFontSize = size * 0.32;
  const labelFontSize = size * 0.09; // Slightly larger for visibility

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
      {/* Unified halo effect behind gauge + label ensemble */}
      <div 
        className="pointer-events-none absolute -inset-4"
        style={{
          background: score !== null 
            ? `radial-gradient(ellipse 70% 60% at 50% 45%, ${getCurrentColor(animatedScore).replace(')', ' / 0.15)')} 0%, transparent 70%)`
            : 'radial-gradient(ellipse 70% 60% at 50% 45%, hsl(174 60% 50% / 0.1) 0%, transparent 70%)',
          filter: 'blur(25px)',
          transition: 'background 0.5s ease-out'
        }}
      />
      
      {/* Gauge container */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            {/* Subtle shadow for depth - no glow */}
            <filter id="arcShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 5 separate color segments with uniform thickness */}
          {colors.map((color, i) => {
            const segmentLength = segmentArc - gap;
            const rotation = 135 + i * 270 / 5;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={`${segmentLength} ${circumference}`}
                filter="url(#arcShadow)"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  opacity: getSegmentOpacity(i),
                  transition: 'opacity 0.1s ease-out'
                }}
              />
            );
          })}

          {/* Discreet position indicator - small, precise mark */}
          {score !== null && (
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r={4}
              fill="hsl(var(--foreground))"
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
            />
          )}
        </svg>

        {/* Center content - score number only */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ marginTop: -verticalOffset }}
        >
          <span
            className="font-semibold tabular-nums"
            style={{
              fontSize: scoreFontSize,
              lineHeight: 1,
              color: score !== null ? getCurrentColor(animatedScore) : 'hsl(var(--muted-foreground))',
              letterSpacing: '-0.02em',
              textShadow: score !== null 
                ? `0 2px 12px ${getCurrentColor(animatedScore).replace(')', ' / 0.4)')}, 0 4px 20px hsl(0 0% 0% / 0.3)` 
                : 'none',
              transition: 'color 0.3s ease-out, text-shadow 0.3s ease-out'
            }}
          >
            {score === null ? '—' : displayScore}
          </span>
        </div>
      </div>

      {/* Premium light beam separator - connects gauge to label */}
      <div className="relative my-1.5 flex w-full items-center justify-center">
        {/* Central glow dot - color matches current score segment */}
        <div 
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: score !== null ? currentLabelColor : 'hsl(174 80% 60%)',
            boxShadow: score !== null 
              ? `0 0 6px 2px ${currentLabelColor.replace(')', ' / 0.7)')}, 0 0 15px 3px ${currentLabelColor.replace(')', ' / 0.4)')}`
              : '0 0 6px 2px hsl(174 80% 55% / 0.7), 0 0 15px 3px hsl(174 60% 45% / 0.4)',
            transition: 'background 0.3s ease-out, box-shadow 0.3s ease-out'
          }}
        />
        {/* Light beam left */}
        <div 
          className="absolute h-px"
          style={{
            width: 40,
            right: '50%',
            marginRight: 6,
            background: score !== null 
              ? `linear-gradient(90deg, transparent 0%, ${currentLabelColor.replace(')', ' / 0.5)')} 100%)`
              : 'linear-gradient(90deg, transparent 0%, hsl(174 60% 50% / 0.5) 100%)',
            transition: 'background 0.3s ease-out'
          }}
        />
        {/* Light beam right */}
        <div 
          className="absolute h-px"
          style={{
            width: 40,
            left: '50%',
            marginLeft: 6,
            background: score !== null 
              ? `linear-gradient(90deg, ${currentLabelColor.replace(')', ' / 0.5)')} 0%, transparent 100%)`
              : 'linear-gradient(90deg, hsl(174 60% 50% / 0.5) 0%, transparent 100%)',
            transition: 'background 0.3s ease-out'
          }}
        />
      </div>

      {/* Status label - seamlessly connected to gauge */}
      <div className="relative w-full flex justify-center">
        {/* Pulse effect for ready state */}
        {score === null && (
          <div 
            className="absolute -inset-x-4 -inset-y-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.4), hsl(174 60% 55% / 0.2), hsl(174 60% 45% / 0.4))',
              animation: 'ready-pulse 2s ease-in-out infinite',
              animationDelay: '0s',
              filter: 'blur(8px)',
            }}
          />
        )}
        <span
          className="relative text-center tracking-wider"
          style={{
            fontSize: labelFontSize,
            color: currentLabelColor,
            fontWeight: 600,
            letterSpacing: '0.12em',
            fontFamily: 'var(--font-sans)',
            textShadow: score !== null 
              ? `0 0 20px ${currentLabelColor.replace(')', ' / 0.5)')}, 0 2px 8px hsl(0 0% 0% / 0.3)`
              : 'none',
            transition: 'color 0.3s ease-out, text-shadow 0.3s ease-out'
          }}
        >
          {currentLabel || (language === 'fr' ? 'PRÊT À ANALYSER' : 'READY TO ANALYZE')}
        </span>
        
        {/* CSS for pulse animation */}
        {score === null && (
          <style>{`
            @keyframes ready-pulse {
              0%, 100% { opacity: 0.5; transform: scale(0.98); }
              50% { opacity: 0.9; transform: scale(1.02); }
            }
          `}</style>
        )}
      </div>
    </div>
  );
};
