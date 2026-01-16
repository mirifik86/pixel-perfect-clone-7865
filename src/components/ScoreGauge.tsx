import { useEffect, useState, useRef } from 'react';
interface ScoreGaugeProps {
  score: number | null; // 0-100 or null for pending
  size?: number;
}
export const ScoreGauge = ({
  score,
  size = 160
}: ScoreGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const animationRef = useRef<number | null>(null);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * 0.75; // 270 degrees
  const segmentArc = totalArc / 5; // Each segment is 1/5 of the arc
  const gap = 4; // Gap between segments

  useEffect(() => {
    if (score !== null) {
      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const startValue = 0;
      const endValue = score;
      const duration = 1500; // 1.5 seconds
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for speedometer effect (ease-out with overshoot)
        const easeOutBack = (t: number) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        
        const easedProgress = easeOutBack(progress);
        const currentValue = Math.round(startValue + (endValue - startValue) * Math.min(easedProgress, 1));
        
        setAnimatedScore(Math.min(currentValue, endValue));
        setDisplayScore(Math.min(currentValue, endValue));
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Small delay before starting animation
      const timer = setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, 100);
      
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

  // 5 colors from red to teal (Leen color)
  const colors = ['hsl(var(--score-red))',
  // 0-20: Red
  'hsl(var(--score-orange))',
  // 20-40: Orange
  'hsl(var(--score-yellow))',
  // 40-60: Yellow
  'hsl(var(--score-green))',
  // 60-80: Green
  'hsl(var(--primary))' // 80-100: Teal (Leen)
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
    if (score === null) return 0.2;
    if (animatedScore >= segmentEnd) return 1;
    if (animatedScore <= segmentStart) return 0.2;
    // Partial fill
    return 0.2 + 0.8 * ((animatedScore - segmentStart) / 20);
  };

  // Calculate indicator position
  const indicatorAngle = 135 + animatedScore / 100 * 270;
  const indicatorRad = indicatorAngle * (Math.PI / 180);
  const indicatorX = size / 2 + (radius - 2) * Math.cos(indicatorRad);
  const indicatorY = size / 2 + (radius - 2) * Math.sin(indicatorRad);
  return <div className="relative" style={{
    width: size,
    height: size
  }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Glow filter for indicator */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 5 separate color segments */}
        {colors.map((color, i) => {
        const segmentLength = segmentArc - gap;
        const rotation = 135 + i * 270 / 5;
        return <circle key={i} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${segmentLength} ${circumference}`} style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          opacity: getSegmentOpacity(i),
          transition: 'opacity 0.3s ease-out'
        }} />;
      })}

        {/* Indicator dots at segment boundaries */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((pos, i) => {
        const angle = (135 + pos * 270) * (Math.PI / 180);
        const dotRadius = 3;
        const dotX = size / 2 + (radius + 18) * Math.cos(angle);
        const dotY = size / 2 + (radius + 18) * Math.sin(angle);
        const colorIndex = Math.min(i, 4);
        return <circle key={i} cx={dotX} cy={dotY} r={dotRadius} fill={colors[colorIndex]} opacity={0.7} />;
      })}

        {/* Precise position indicator - follows arc smoothly */}
        {score !== null && <circle cx={indicatorX} cy={indicatorY} r={8} fill={getCurrentColor(animatedScore)} stroke="hsl(var(--background))" strokeWidth={2} filter="url(#glow)" />}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-light transition-colors duration-500 text-6xl" style={{
        color: score !== null ? getCurrentColor(animatedScore) : 'hsl(var(--muted-foreground))'
      }}>
          {score === null ? '?' : displayScore}
        </span>
      </div>
    </div>;
};