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
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationDone, setCalibrationDone] = useState(false);
  const animationRef = useRef<number | null>(null);
  const calibrationRef = useRef<number | null>(null);
  
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalArc = circumference * 0.75; // 270 degrees
  const segmentArc = totalArc / 5; // Each segment is 1/5 of the arc
  const gap = 4; // Gap between segments

  const pendingLabel = language === 'fr' 
    ? 'Indice de confiance en attente' 
    : 'Trust Score pending analysis';

  // Calibration animation - runs once on mount when no score
  useEffect(() => {
    if (score === null && !calibrationDone) {
      setIsCalibrating(true);
      
      const startTime = performance.now();
      const calibrationDuration = 1800; // 1.8 seconds total
      
      const calibrate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / calibrationDuration, 1);
        
        // Custom easing: sweep up to ~68% then back to center
        let calibrationValue: number;
        
        if (progress < 0.5) {
          // First half: ease-in to peak (0 to 68)
          const t = progress * 2; // 0 to 1
          const easeIn = t * t * (3 - 2 * t); // smooth-step
          calibrationValue = easeIn * 68;
        } else {
          // Second half: ease-out back to 0 (68 to 0)
          const t = (progress - 0.5) * 2; // 0 to 1
          const easeOut = t * t * (3 - 2 * t); // smooth-step
          calibrationValue = 68 * (1 - easeOut);
        }
        
        setAnimatedScore(calibrationValue);
        
        if (progress < 1) {
          calibrationRef.current = requestAnimationFrame(calibrate);
        } else {
          setAnimatedScore(0);
          setIsCalibrating(false);
          setCalibrationDone(true);
        }
      };
      
      // Small delay before starting calibration
      const timer = setTimeout(() => {
        calibrationRef.current = requestAnimationFrame(calibrate);
      }, 400);
      
      return () => {
        clearTimeout(timer);
        if (calibrationRef.current) {
          cancelAnimationFrame(calibrationRef.current);
        }
      };
    }
  }, [score, calibrationDone]);

  // Score animation when score is provided
  useEffect(() => {
    if (score !== null) {
      // Cancel calibration if running
      if (calibrationRef.current) {
        cancelAnimationFrame(calibrationRef.current);
      }
      setIsCalibrating(false);
      
      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const startValue = 0;
      const endValue = score;
      const duration = 2000; // 2 seconds
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Professional easing: cubic bezier for smooth acceleration/deceleration
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
      }, 200);
      
      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      if (!isCalibrating) {
        setAnimatedScore(0);
      }
      setDisplayScore(0);
    }
  }, [score, isCalibrating]);

  // Active colors (when score is present)
  const activeColors = [
    'hsl(var(--score-red))',     // 0-20: Red
    'hsl(var(--score-orange))',  // 20-40: Orange
    'hsl(var(--score-yellow))',  // 40-60: Yellow
    'hsl(var(--score-green))',   // 60-80: Green
    'hsl(var(--score-teal))'     // 80-100: Teal (Leen)
  ];

  // Muted colors for pending/calibration state
  const mutedColors = [
    'hsl(220 10% 35%)',
    'hsl(220 10% 40%)',
    'hsl(220 10% 45%)',
    'hsl(220 10% 50%)',
    'hsl(200 15% 55%)'
  ];

  const colors = score !== null ? activeColors : mutedColors;

  // Get current color based on score
  const getCurrentColor = (value: number) => {
    const colorSet = score !== null ? activeColors : mutedColors;
    if (value < 20) return colorSet[0];
    if (value < 40) return colorSet[1];
    if (value < 60) return colorSet[2];
    if (value < 80) return colorSet[3];
    return colorSet[4];
  };

  // Calculate which segments should be filled based on score
  const getSegmentOpacity = (segmentIndex: number) => {
    const segmentStart = segmentIndex * 20;
    const segmentEnd = (segmentIndex + 1) * 20;
    
    if (score === null && !isCalibrating) {
      return 0.4; // Muted but visible in pending state
    }
    
    const currentScore = animatedScore;
    if (currentScore >= segmentEnd) return 1;
    if (currentScore <= segmentStart) return 0.25;
    // Partial fill
    return 0.25 + 0.75 * ((currentScore - segmentStart) / 20);
  };

  // Calculate indicator position
  const indicatorAngle = 135 + animatedScore / 100 * 270;
  const indicatorRad = indicatorAngle * (Math.PI / 180);
  const indicatorX = size / 2 + (radius - 2) * Math.cos(indicatorRad);
  const indicatorY = size / 2 + (radius - 2) * Math.sin(indicatorRad);

  // Show indicator during calibration or when score is present
  const showIndicator = score !== null || isCalibrating;

  return (
    <div className={`flex flex-col items-center ${className || ''}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            {/* Enhanced glow filter for indicator */}
            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Subtle shadow for depth */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* 5 separate color segments */}
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
                filter="url(#shadow)"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  opacity: getSegmentOpacity(i),
                  transition: 'opacity 0.15s ease-out'
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
                opacity={score !== null ? 0.7 : 0.4}
              />
            );
          })}

          {/* Position indicator - shows during calibration and with score */}
          {showIndicator && (
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r={8}
              fill={getCurrentColor(animatedScore)}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              filter="url(#glow)"
              style={{
                transition: isCalibrating ? 'none' : 'fill 0.3s ease-out'
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-light transition-colors duration-500"
            style={{
              fontSize: size * 0.35,
              color: score !== null ? getCurrentColor(animatedScore) : 'hsl(220 10% 50%)'
            }}
          >
            {score === null ? '—' : displayScore}
          </span>
        </div>
      </div>

      {/* Pending label - only shown before analysis */}
      {score === null && (
        <p 
          className="mt-2 animate-fade-in text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 md:mt-3 md:text-xs"
          style={{ animationDelay: '600ms', animationFillMode: 'both' }}
        >
          {pendingLabel}
        </p>
      )}
    </div>
  );
};
