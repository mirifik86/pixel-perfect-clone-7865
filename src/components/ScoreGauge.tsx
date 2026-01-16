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
  const arc = circumference * 0.75; // 270 degrees
  
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

  // Calculate indicator position (angle in degrees)
  const indicatorAngle = 135 + (animatedScore / 100) * 270;
  const indicatorRad = indicatorAngle * (Math.PI / 180);
  const indicatorX = size / 2 + (radius - 2) * Math.cos(indicatorRad);
  const indicatorY = size / 2 + (radius - 2) * Math.sin(indicatorRad);

  // Calculate the filled portion
  const filledArc = (arc * animatedScore) / 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Gradient definition - 5 colors from red to teal */}
        <defs>
          <linearGradient id="scoreGradient5" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--score-red))" />
            <stop offset="25%" stopColor="hsl(var(--score-orange))" />
            <stop offset="50%" stopColor="hsl(var(--score-yellow))" />
            <stop offset="75%" stopColor="hsl(var(--score-green))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
          
          {/* Glow filter for indicator */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
          style={{ transform: `rotate(135deg)`, transformOrigin: 'center' }}
          opacity={0.3}
        />

        {/* Score arc - fills from left to right with 5-color gradient */}
        {score !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient5)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filledArc} ${circumference}`}
            style={{ transform: `rotate(135deg)`, transformOrigin: 'center' }}
            className="transition-all duration-1000 ease-out"
          />
        )}

        {/* 5 Indicator dots - positioned from left (red) to right (teal) */}
        {[0, 0.25, 0.5, 0.75, 1].map((pos, i) => {
          const angle = (135 + pos * 270) * (Math.PI / 180);
          const dotRadius = 3;
          const dotX = size / 2 + (radius + 18) * Math.cos(angle);
          const dotY = size / 2 + (radius + 18) * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={dotX}
              cy={dotY}
              r={dotRadius}
              fill={colors[i]}
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
