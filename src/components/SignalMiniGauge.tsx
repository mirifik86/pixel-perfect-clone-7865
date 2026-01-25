import React from 'react';

interface SignalMiniGaugeProps {
  /** Confidence level: 0-100 percent filled */
  confidence: number;
  /** Whether this signal is not evaluated (shows muted empty state) */
  notEvaluated?: boolean;
  /** Size in pixels */
  size?: number;
}

/**
 * Premium mini circular gauge for signal confidence visualization
 * Uses Leen Blue for positive signals, muted gray for "Not evaluated"
 */
export const SignalMiniGauge: React.FC<SignalMiniGaugeProps> = ({
  confidence,
  notEvaluated = false,
  size = 24,
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Clamp confidence to 0-100
  const clampedConfidence = Math.max(0, Math.min(100, confidence));
  const fillPercent = notEvaluated ? 0 : clampedConfidence;
  const strokeDashoffset = circumference - (fillPercent / 100) * circumference;
  
  // Colors
  const trackColor = notEvaluated ? 'hsl(220 10% 85%)' : 'hsl(200 20% 90%)';
  const fillColor = notEvaluated 
    ? 'transparent' 
    : fillPercent >= 70 
      ? 'hsl(174 78% 44%)' // Leen Blue - high confidence
      : fillPercent >= 40 
        ? 'hsl(45 90% 50%)' // Amber - moderate
        : 'hsl(220 15% 60%)'; // Muted - limited
  
  const glowColor = fillPercent >= 70 
    ? 'hsl(174 78% 44% / 0.4)' 
    : fillPercent >= 40 
      ? 'hsl(45 90% 50% / 0.3)' 
      : 'transparent';

  return (
    <div 
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track (background circle) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Fill arc */}
        {!notEvaluated && fillPercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={fillColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: glowColor !== 'transparent' ? `drop-shadow(0 0 3px ${glowColor})` : 'none',
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        )}
      </svg>
      
      {/* Center dot for "not evaluated" state */}
      {notEvaluated && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.25,
            height: size * 0.25,
            backgroundColor: 'hsl(220 10% 75%)',
          }}
        />
      )}
    </div>
  );
};

export default SignalMiniGauge;
