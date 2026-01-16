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
    }
  }, [score]);

  const getScoreColor = (value: number) => {
    if (value < 25) return 'hsl(var(--score-red))';
    if (value < 50) return 'hsl(var(--score-orange))';
    if (value < 75) return 'hsl(var(--score-yellow))';
    return 'hsl(var(--score-green))';
  };

  const offset = arc - (arc * animatedScore) / 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-[135deg]"
      >
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
          opacity={0.3}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--score-red))" />
            <stop offset="33%" stopColor="hsl(var(--score-orange))" />
            <stop offset="66%" stopColor="hsl(var(--score-yellow))" />
            <stop offset="100%" stopColor="hsl(var(--score-green))" />
          </linearGradient>
        </defs>

        {/* Score arc */}
        {score !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        )}

        {/* Indicator dots */}
        {[0, 0.33, 0.66, 1].map((pos, i) => {
          const angle = (-135 + pos * 270) * (Math.PI / 180);
          const dotRadius = 4;
          const dotX = size / 2 + (radius + 15) * Math.cos(angle);
          const dotY = size / 2 + (radius + 15) * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={dotX}
              cy={dotY}
              r={dotRadius}
              fill={['hsl(var(--score-red))', 'hsl(var(--score-orange))', 'hsl(var(--score-yellow))', 'hsl(var(--score-green))'][i]}
              opacity={0.6}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-light text-muted-foreground">
          {score === null ? '?' : animatedScore}
        </span>
      </div>
    </div>
  );
};
