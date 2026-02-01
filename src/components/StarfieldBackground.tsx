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
      {/* ========== LAYER 1: Earth from space with sunrise - shifted for sun visibility ========== */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${earthSunriseBg})`,
          backgroundSize: 'cover',
          // Shift right to reveal more of the sunrise/sun glow on the left side
          backgroundPosition: '35% 45%',
          backgroundRepeat: 'no-repeat',
          // Slightly brighter to enhance sunrise warmth
          filter: 'blur(0px) brightness(0.58) contrast(0.95) saturate(0.85)',
          transform: 'scale(1.05)',
        }}
      />
      
      {/* ========== SUNRISE GLOW ACCENT - Left side warmth ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 80% at 15% 55%, 
              hsl(35 70% 50% / 0.12) 0%,
              hsl(30 60% 45% / 0.08) 30%,
              hsl(25 50% 40% / 0.04) 50%,
              transparent 70%
            )
          `,
        }}
      />
      
      {/* ========== LAYER 2: Center focus vignette - stronger for gauge prominence ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 30% 30% at 50% 42%, 
              hsl(220 40% 2% / 0.7) 0%,
              hsl(220 35% 4% / 0.4) 40%,
              hsl(225 30% 5% / 0.15) 70%,
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
      
      {/* Subtle sunrise warmth at bottom */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 45% at 50% 105%, 
              hsl(35 55% 35% / 0.1) 0%,
              hsl(200 45% 25% / 0.06) 40%,
              transparent 70%
            )
          `,
        }}
      />
      
      {/* ========== LAYER 3: Dark radial gradient behind input panels ========== */}
      {/* Creates floating effect for the input cards */}
      <div 
        className="absolute"
        style={{
          width: '100%',
          maxWidth: '720px',
          height: '320px',
          left: '50%',
          bottom: '5%',
          transform: 'translateX(-50%)',
          background: `
            radial-gradient(ellipse 100% 100% at 50% 50%, 
              hsl(220 35% 3% / 0.85) 0%,
              hsl(220 30% 4% / 0.5) 40%,
              hsl(225 25% 5% / 0.2) 70%,
              transparent 100%
            )
          `,
          filter: 'blur(40px)',
        }}
      />
      
      {/* ========== LAYER 4: Soft cyan "active system" glow under gauge ========== */}
      {/* Minimal, static accent for depth - barely noticeable */}
      <div 
        className="absolute"
        style={{
          width: '180px',
          height: '60px',
          left: '50%',
          top: '52%',
          transform: 'translateX(-50%)',
          background: `
            radial-gradient(ellipse 100% 100% at 50% 0%, 
              hsl(174 55% 50% / 0.06) 0%,
              hsl(174 50% 45% / 0.03) 50%,
              transparent 100%
            )
          `,
          filter: 'blur(16px)',
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
