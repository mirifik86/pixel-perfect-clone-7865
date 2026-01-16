import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number | null; // 0-100 or null for pending
  size?: number;
}

export const ScoreGauge = ({ score, size = 160 }: ScoreGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * 0.75; // 270 degrees
  const segmentArc = totalArc / 5; // Each segment is 1/5 of the arc
  const gap = 4; // Gap between segments
  
  useEffect(() => {
    if (score !== null) {
      const timer = setTimeout(() => setAnimatedScore(score), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [score]);

  // 5 colors from red to teal (Leen color)
  const colors = [
    'hsl(var(--score-red))',      // 0-20: Red
    'hsl(var(--score-orange))',   // 20-40: Orange
    'hsl(var(--score-yellow))',   // 40-60: Yellow
    'hsl(var(--score-green))',    // 60-80: Green
    'hsl(var(--primary))',        // 80-100: Teal (Leen)
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
  const indicatorAngle = 135 + (animatedScore / 100) * 270;
  const indicatorRad = indicatorAngle * (Math.PI / 180);
  const indicatorX = size / 2 + (radius - 2) * Math.cos(indicatorRad);
  const indicatorY = size / 2 + (radius - 2) * Math.sin(indicatorRad);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          {/* Glow filter for indicator */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 5 separate color segments */}
        {colors.map((color, i) => {
          const segmentLength = segmentArc - gap;
          const rotation = 135 + (i * 270) / 5;
          
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
              style={{ 
                transform: `rotate(${rotation}deg)`, 
                transformOrigin: 'center',
                opacity: getSegmentOpacity(i),
                transition: 'opacity 0.3s ease-out'
              }}
            />
          );
        })}

        {/* Indicator dots at segment boundaries */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((pos, i) => {
          const angle = (135 + pos * 270) * (Math.PI / 180);
          const dotRadius = 3;
          const dotX = size / 2 + (radius + 18) * Math.cos(angle);
          const dotY = size / 2 + (radius + 18) * Math.sin(angle);
          const colorIndex = Math.min(i, 4);
          return (
            <circle
              key={i}
              cx={dotX}
              cy={dotY}
              r={dotRadius}
              fill={colors[colorIndex]}
              opacity={0.7}
            />
          );
        })}

        {/* Precise position indicator */}
        {score !== null && (
          <circle
            cx={indicatorX}
            cy={indicatorY}
            r={8}
            fill={getCurrentColor(animatedScore)}
            stroke="hsl(var(--background))"
            strokeWidth={2}
            filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-4xl font-light transition-colors duration-500"
          style={{ color: score !== null ? getCurrentColor(animatedScore) : 'hsl(var(--muted-foreground))' }}
        >
          {score === null ? '?' : animatedScore}
        </span>
      </div>
    </div>
  );
};
