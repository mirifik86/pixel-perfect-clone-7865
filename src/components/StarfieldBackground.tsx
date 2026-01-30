import { memo } from 'react';
import earthCosmicBg from '@/assets/earth-cosmic-bg-hq.jpg';

/**
 * Cinematic Earth Background - Premium Global Atmosphere
 * 
 * Full-page Earth-from-space background:
 * - High-res orbital view with clouds/atmosphere
 * - Dark gradient overlays for text readability
 * - Subtle blur to avoid visual distraction
 * - Zero animation, optimized for mobile
 * - UI elements float above this layer
 */
export const StarfieldBackground = memo(() => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Cinematic Earth background image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${earthCosmicBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(1.5px) brightness(0.35) saturate(0.9)',
        }}
      />
      
      {/* Dark gradient overlay - top */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(225 30% 3% / 0.85) 0%,
            hsl(225 25% 4% / 0.5) 30%,
            transparent 50%
          )`,
        }}
      />
      
      {/* Dark gradient overlay - bottom */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, 
            hsl(225 30% 2% / 0.9) 0%,
            hsl(225 25% 3% / 0.6) 25%,
            transparent 50%
          )`,
        }}
      />
      
      {/* Radial vignette for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 45%, 
            transparent 20%,
            hsl(225 30% 3% / 0.4) 60%,
            hsl(225 35% 2% / 0.7) 100%
          )`,
        }}
      />
      
      {/* Subtle sunrise glow - offset down-left */}
      <div 
        className="absolute"
        style={{
          bottom: '20%',
          left: '30%',
          width: '60%',
          height: '50%',
          background: `radial-gradient(ellipse 100% 80% at 30% 70%, 
            hsl(180 40% 30% / 0.06) 0%,
            transparent 60%
          )`,
        }}
      />
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';
