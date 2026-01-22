import { useEffect, useState, useRef } from 'react';

interface ScoreGaugeProps {
  score: number | null; // 0-100 or null for pending
  size?: number;
  className?: string;
  language?: 'en' | 'fr';
  hasContent?: boolean; // When true, disables pulse effects on "Ready" label
}

export const ScoreGauge = ({
  score,
  size = 160,
  className,
  language = 'fr',
  hasContent = false
}: ScoreGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const animationRef = useRef<number | null>(null);
  
  // Premium thicker stroke for punch and impact
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * 0.75; // 270 degrees
  const segmentArc = totalArc / 5; // Each segment is 1/5 of the arc
  const gap = 5; // Slightly larger gap for premium feel

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

  // Professional muted colors - reduced saturation for serious, instrument-like feel
  // Leen Blue reserved ONLY for highest category
  const colors = [
    'hsl(0 65% 48%)',      // Red - Very Low (desaturated)
    'hsl(25 80% 50%)',     // Orange - Low (desaturated)
    'hsl(45 75% 48%)',     // Yellow - Moderate (desaturated)
    'hsl(145 50% 42%)',    // Green - Good (desaturated)
    'hsl(174 55% 45%)'     // Leen Blue - High (reserved for top tier only)
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

  // Larger, bolder score for premium punch
  const scoreFontSize = size * 0.32;
  const labelFontSize = size * 0.075;

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
      {/* Gauge container */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Premium outer glow ring */}
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '-8px',
            background: score !== null 
              ? `radial-gradient(circle, ${getCurrentColor(animatedScore).replace(')', ' / 0.15)')} 0%, transparent 70%)`
              : 'radial-gradient(circle, hsl(174 50% 50% / 0.1) 0%, transparent 70%)',
            filter: 'blur(12px)',
            animation: score === null ? 'gauge-ambient-pulse 3s ease-in-out infinite' : 'none',
          }}
        />
        
        {/* Subtle ambient glow behind gauge - with pulse when dormant */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: score === null 
              ? 'radial-gradient(circle, hsl(174 40% 40% / 0.18) 0%, transparent 70%)'
              : `radial-gradient(circle, ${getCurrentColor(animatedScore).replace(')', ' / 0.25)')} 0%, transparent 70%)`,
            filter: 'blur(20px)',
            transform: 'scale(1.4)',
            animation: score === null ? 'gauge-ambient-pulse 3s ease-in-out infinite' : 'none',
          }}
        />
        
        {/* Outer ring pulse effect when dormant */}
        {score === null && (
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: '2px solid hsl(174 50% 50% / 0.2)',
              animation: 'gauge-ring-pulse 3s ease-in-out infinite',
            }}
          />
        )}
        
        {/* Active score outer ring glow */}
        {score !== null && (
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: '-3px',
              border: `2px solid ${getCurrentColor(animatedScore).replace(')', ' / 0.3)')}`,
              boxShadow: `0 0 20px ${getCurrentColor(animatedScore).replace(')', ' / 0.25)')}`,
              transition: 'all 0.3s ease-out',
            }}
          />
        )}
        
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* No filters/shadows - clean instrument look */}

          {/* 5 equal color segments with crisp separation */}
          {colors.map((color, i) => {
            const segmentLength = segmentArc - gap;
            const rotation = 135 + i * 270 / 5;
            // When no score, show segments with enhanced dormant visibility
            const dormantOpacity = score === null ? 0.25 : 0.15;
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
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  opacity: score === null ? dormantOpacity : getSegmentOpacity(i),
                  transition: 'opacity 0.1s ease-out',
                  filter: score === null ? 'saturate(0.5)' : 'none',
                }}
              />
            );
          })}

          {/* Position indicator - smaller, no shadow, off-white for premium look */}
          {score !== null && (
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r={3}
              fill="hsl(220 10% 90%)"
              stroke="hsl(220 10% 70%)"
              strokeWidth={1}
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
              color: score !== null 
                ? getCurrentColor(animatedScore) 
                : 'hsl(0 0% 100% / 0.35)',
              letterSpacing: '-0.02em',
              transition: 'color 0.3s ease-out',
              textShadow: score === null 
                ? '0 0 12px hsl(0 0% 100% / 0.15)' 
                : 'none',
            }}
          >
            {score === null ? '—' : displayScore}
          </span>
        </div>
      </div>

      {/* Status label - seamlessly connected to gauge */}
      <div className="relative w-full flex justify-center mt-2">
        {/* Pulse effect for ready state - only when no content */}
        {score === null && !hasContent && (
          <div 
            className="absolute -inset-x-6 -inset-y-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(174 70% 50% / 0.5), hsl(174 70% 55% / 0.3), hsl(174 70% 50% / 0.5))',
              animation: 'ready-pulse 2s ease-in-out infinite',
              animationDelay: '0s',
              filter: 'blur(10px)',
            }}
          />
        )}
        <span
          className="relative text-center transition-all duration-300"
          style={{
            fontSize: size * 0.095,
            color: score === null 
              ? hasContent 
                ? 'hsl(0 0% 100% / 0.4)' // Dimmed when content is present
                : 'hsl(0 0% 100%)' // Bright when empty
              : currentLabelColor,
            fontWeight: 600,
            letterSpacing: '0.18em',
            fontFamily: 'var(--font-sans)',
            textShadow: score === null && !hasContent 
              ? '0 0 20px hsl(0 0% 100% / 0.4), 0 0 40px hsl(0 0% 100% / 0.2)' 
              : 'none',
          }}
        >
          {currentLabel || (language === 'fr' ? 'PRÊT À ANALYSER' : 'READY TO ANALYZE')}
        </span>
        
        {/* CSS for pulse animations */}
        {score === null && (
          <style>{`
            @keyframes ready-pulse {
              0%, 100% { opacity: 0.4; transform: scale(0.96); }
              50% { opacity: 1; transform: scale(1.04); }
            }
            @keyframes gauge-ambient-pulse {
              0%, 100% { 
                opacity: 0.6; 
                transform: scale(1.25);
              }
              50% { 
                opacity: 1; 
                transform: scale(1.4);
              }
            }
            @keyframes gauge-ring-pulse {
              0%, 100% { 
                opacity: 0.3; 
                transform: scale(1);
              }
              50% { 
                opacity: 0.6; 
                transform: scale(1.02);
              }
            }
          `}</style>
        )}
      </div>
    </div>
  );
};
