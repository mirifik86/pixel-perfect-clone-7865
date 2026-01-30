import { memo, useMemo } from 'react';

/**
 * Premium Dark Starfield Background
 * 
 * Subtle, static starfield for global-tech aesthetic:
 * - Very small, dim stars
 * - No animation or twinkling
 * - Deep space dark tones
 * - Zero GPU overhead
 */
export const StarfieldBackground = memo(() => {
  // Generate static star positions - sparse and subtle
  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 0.8, // Very small: 0.5-1.3px
      opacity: 0.08 + Math.random() * 0.15, // Very dim: 0.08-0.23
    }))
  , []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Deep space base */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, 
            hsl(225 35% 6%) 0%,
            hsl(228 40% 4%) 50%,
            hsl(230 45% 2%) 100%
          )`,
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
            background: 'hsl(210 20% 85%)',
            opacity: star.opacity,
          }}
        />
      ))}
      
      {/* Edge vignette for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, 
            transparent 0%,
            hsl(228 45% 3% / 0.5) 60%,
            hsl(230 50% 2% / 0.9) 100%
          )`,
        }}
      />
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';
