import { memo, useMemo } from 'react';

/**
 * Premium Starfield Background
 * 
 * Elegant, subtle star pattern for the entire page.
 * Respects the cosmic aesthetic without being noisy.
 */
export const StarfieldBackground = memo(() => {
  // Generate elegant star positions
  const stars = useMemo(() => 
    Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.35,
      twinkleDelay: Math.random() * 5,
      twinkleDuration: 3 + Math.random() * 4,
    }))
  , []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Deep space gradient base */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 0%, 
              hsl(230 30% 10% / 0.4) 0%, 
              transparent 50%
            ),
            radial-gradient(ellipse 80% 50% at 20% 80%, 
              hsl(260 25% 8% / 0.25) 0%, 
              transparent 45%
            ),
            radial-gradient(ellipse 70% 40% at 85% 60%, 
              hsl(200 25% 8% / 0.2) 0%, 
              transparent 40%
            )
          `,
        }}
      />
      
      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'hsl(210 20% 95%)',
            opacity: star.opacity,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 1.5}px hsl(200 30% 80% / 0.3)` : 'none',
            animation: `twinkle ${star.twinkleDuration}s ease-in-out infinite`,
            animationDelay: `${star.twinkleDelay}s`,
          }}
        />
      ))}
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';
