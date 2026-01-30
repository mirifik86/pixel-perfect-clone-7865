import { memo, useMemo } from 'react';

/**
 * Starfield Background - Optimized for Mobile Performance
 * 
 * Static, subtle star texture:
 * - Fewer stars (40 instead of 80)
 * - Smaller, dimmer stars
 * - NO twinkling animation
 * - Static deep space gradient
 * - Minimal transparency layers
 */
export const StarfieldBackground = memo(() => {
  // Generate static star positions - fewer, smaller stars
  const stars = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 0.8, // Smaller: 0.5-1.3px
      opacity: 0.15 + Math.random() * 0.25, // Dimmer: 0.15-0.4
    }))
  , []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Static deep space gradient - no animation */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 0%, 
              hsl(225 25% 8%) 0%, 
              transparent 50%
            ),
            radial-gradient(ellipse 80% 50% at 20% 80%, 
              hsl(235 20% 6%) 0%, 
              transparent 45%
            )
          `,
        }}
      />
      
      {/* Subtle depth glow behind globe area - static, no blur */}
      <div 
        className="absolute"
        style={{
          top: '20%',
          left: '40%',
          width: '50%',
          height: '45%',
          background: `
            radial-gradient(ellipse 100% 80% at 50% 50%, 
              hsl(180 30% 20% / 0.06) 0%,
              transparent 70%
            )
          `,
          pointerEvents: 'none',
        }}
      />
      
      {/* Static stars - no animation */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'hsl(210 15% 85%)',
            opacity: star.opacity,
            // No animation, no box-shadow for performance
          }}
        />
      ))}
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';
