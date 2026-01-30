import { memo, useMemo } from 'react';
import earthSunriseBg from '@/assets/earth-sunrise-space.jpg';

/**
 * Premium Space Background - Layered Cinematic Composition
 * 
 * Layer 1: Dark cinematic Earth-from-space sunrise (blurred, dimmed)
 * Layer 2: Dark overlay to ensure center globe dominance
 * Layer 3: Subtle static stars for depth
 * 
 * Performance optimized for mobile devices
 */
export const StarfieldBackground = memo(() => {
  // Generate subtle static star positions
  const stars = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.4 + Math.random() * 0.6, // Very small: 0.4-1px
      opacity: 0.1 + Math.random() * 0.15, // Very dim: 0.1-0.25
    }))
  , []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ========== LAYER 1: Cinematic Earth-from-space sunrise ========== */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${earthSunriseBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
          backgroundRepeat: 'no-repeat',
          // Strongly reduced brightness and contrast, soft blur
          filter: 'blur(3px) brightness(0.25) contrast(0.7) saturate(0.6)',
          transform: 'scale(1.05)', // Prevent blur edge artifacts
        }}
      />
      
      {/* ========== LAYER 2: Dark overlay for center dominance ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 50% at 50% 45%, 
              hsl(220 30% 4% / 0.7) 0%,
              hsl(220 25% 3% / 0.85) 50%,
              hsl(220 20% 2% / 0.92) 100%
            )
          `,
        }}
      />
      
      {/* Deep space vignette for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 50%, 
              transparent 30%,
              hsl(225 30% 3% / 0.6) 70%,
              hsl(230 35% 2%) 100%
            )
          `,
        }}
      />
      
      {/* Subtle sunrise glow hint at bottom */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 30% at 50% 100%, 
              hsl(200 40% 15% / 0.08) 0%,
              transparent 60%
            )
          `,
        }}
      />
      
      {/* ========== LAYER 3: Subtle static stars ========== */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'hsl(210 20% 80%)',
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';
