import { memo, useMemo } from 'react';

/**
 * Starfield Background - Ultra-Optimized for Mobile Performance
 * 
 * 100% Static, zero animations:
 * - Fixed star positions, no twinkling
 * - Deep space gradient (dark, no purple)
 * - Minimal DOM elements
 * - Zero GPU overhead
 */
export const StarfieldBackground = memo(() => {
  // Generate static star positions - sparse, dim stars
  const stars = useMemo(() => 
    Array.from({ length: 35 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.4 + Math.random() * 0.6, // Very small: 0.4-1px
      opacity: 0.1 + Math.random() * 0.2, // Very dim: 0.1-0.3
    }))
  , []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Deep space gradient - pure dark tones, no purple */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 30%, 
              hsl(220 20% 6%) 0%, 
              hsl(225 25% 4%) 40%,
              hsl(230 30% 2%) 100%
            )
          `,
        }}
      />
      
      {/* Static stars - no animation, minimal opacity */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'hsl(210 10% 80%)',
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';
