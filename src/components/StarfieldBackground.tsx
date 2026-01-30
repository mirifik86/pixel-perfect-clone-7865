import { memo, useMemo } from 'react';
import earthSunriseBg from '@/assets/earth-sunrise-space.jpg';

/**
 * Premium Space Background - Earth from Space with Sunrise
 * 
 * Layer 1: Cinematic Earth-from-space with sun (blurred, dimmed)
 * Layer 2: Dark overlays for center globe dominance
 * Layer 3: Subtle static stars for cosmic depth
 * 
 * The background creates atmosphere while the center globe remains the focus
 */
export const StarfieldBackground = memo(() => {
  // Generate subtle static star positions
  const stars = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.3 + Math.random() * 0.7, // Very small: 0.3-1px
      opacity: 0.08 + Math.random() * 0.12, // Very dim: 0.08-0.2
    }))
  , []);
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ========== LAYER 1: Earth from space with sunrise ========== */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${earthSunriseBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 55%',
          backgroundRepeat: 'no-repeat',
          // Fond spatial visible mais atmosphérique
          filter: 'blur(0.5px) brightness(0.45) contrast(0.85) saturate(0.7)',
          transform: 'scale(1.08)', // Prevent blur edge artifacts
        }}
      />
      
      {/* ========== LAYER 2: Dark center vignette ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 40% 40% at 50% 42%, 
              hsl(220 35% 3% / 0.6) 0%,
              hsl(220 30% 4% / 0.4) 40%,
              hsl(225 25% 5% / 0.25) 70%,
              transparent 100%
            )
          `,
        }}
      />
      
      {/* Deep space vignette edges */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 130% 110% at 50% 50%, 
              transparent 30%,
              hsl(225 35% 4% / 0.3) 65%,
              hsl(230 40% 3% / 0.7) 100%
            )
          `,
        }}
      />
      
      {/* Subtle sunrise glow at bottom (from background image sun) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 40% at 50% 110%, 
              hsl(35 50% 25% / 0.06) 0%,
              hsl(200 40% 20% / 0.04) 40%,
              transparent 70%
            )
          `,
        }}
      />
      
      {/* ========== LAYER 3: Subtle cosmic stars ========== */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'hsl(210 25% 85%)',
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';

StarfieldBackground.displayName = 'StarfieldBackground';
