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
          backgroundPosition: 'center 40%', // Monté pour voir plus de l'espace
          backgroundRepeat: 'no-repeat',
          // Maximum visibilité - effet WOW
          filter: 'blur(0px) brightness(0.65) contrast(0.95) saturate(0.85)',
          transform: 'scale(1.02)',
        }}
      />
      
      {/* ========== LAYER 2: Vignette légère pour focus central ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 35% 35% at 50% 45%, 
              hsl(220 35% 3% / 0.5) 0%,
              hsl(220 30% 4% / 0.2) 50%,
              transparent 100%
            )
          `,
        }}
      />
      
      {/* Vignette bords - très légère */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 140% 120% at 50% 50%, 
              transparent 40%,
              hsl(225 35% 4% / 0.15) 70%,
              hsl(230 40% 3% / 0.4) 100%
            )
          `,
        }}
      />
      
      {/* Lueur sunrise subtile renforcée */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 105%, 
              hsl(35 60% 40% / 0.12) 0%,
              hsl(200 50% 30% / 0.08) 40%,
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
