import { useEffect, useState, useRef } from 'react';

interface ScoreGaugeProps {
  score: number | null; // 0-100 or null for pending
  size?: number;
  className?: string;
}

export const ScoreGauge = ({
  score,
  size = 160,
  className
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

  // 5 colors from red to teal
  const colors = [
    'hsl(var(--score-red))',
    'hsl(var(--score-orange))',
    'hsl(var(--score-yellow))',
    'hsl(var(--score-green))',
    'hsl(var(--score-teal))'
  ];

  // Get current color based on score
  const getCurrentColor = (value: number) => {
    if (value < 20) return colors[0];
    if (value < 40) return colors[1];
    if (value < 60) return colors[2];
    if (value < 80) return colors[3];
    return colors[4];
  };

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

  // Responsive font size based on gauge size
  const scoreFontSize = size * 0.35;

  return (
    <div className={`relative ${className || ''}`} style={{ width: size, height: size }}>
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
              strokeLinecap="round"
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
            r={5}
            fill="hsl(var(--foreground))"
            stroke="hsl(var(--background))"
            strokeWidth={1.5}
          />
        )}
      </svg>

      {/* Center content - score number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-medium tabular-nums"
          style={{
            fontSize: scoreFontSize,
            lineHeight: 1,
            color: score !== null ? getCurrentColor(animatedScore) : 'hsl(var(--muted-foreground))',
            letterSpacing: '-0.02em'
          }}
        >
          {score === null ? '—' : displayScore}
        </span>
      </div>
    </div>
  );
};
