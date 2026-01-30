import { memo } from 'react';
import earthCosmicBg from '@/assets/earth-cosmic-bg-hq.jpg';

/**
 * Cinematic Earth Background - Premium Global Atmosphere
 * 
 * Full-page Earth-from-space background:
 * - High-res orbital view with clouds/atmosphere
 * - Darkened 25% more for premium depth
 * - Centered radial dark gradient behind gauge area
 * - Soft diffused cyan glow for high-tech feel
 * - Zero animation, optimized for mobile
 */
export const StarfieldBackground = memo(() => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Cinematic Earth background image - DARKENED 25% more */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${earthCosmicBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(2px) brightness(0.25) saturate(0.85)',
        }}
      />
      
      {/* Dark gradient overlay - top (stronger) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(225 35% 2% / 0.92) 0%,
            hsl(225 30% 3% / 0.65) 25%,
            transparent 50%
          )`,
        }}
      />
      
      {/* Dark gradient overlay - bottom (stronger) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, 
            hsl(225 35% 2% / 0.95) 0%,
            hsl(225 30% 2% / 0.7) 25%,
            transparent 50%
          )`,
        }}
      />
      
      {/* CENTERED DARK RADIAL GRADIENT - Focus attention on gauge area */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 35%, 
            hsl(225 40% 2% / 0.85) 0%,
            hsl(225 35% 3% / 0.5) 40%,
            transparent 70%
          )`,
        }}
      />
      
      {/* SOFT DIFFUSED CYAN GLOW - High-tech equipment feel */}
      <div 
        className="absolute"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50%',
          height: '40%',
          background: `radial-gradient(ellipse 100% 80% at 50% 50%, 
            hsl(180 50% 45% / 0.06) 0%,
            hsl(180 45% 40% / 0.03) 40%,
            transparent 70%
          )`,
          filter: 'blur(40px)',
        }}
      />
      
      {/* Radial vignette for depth (enhanced) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 75% 65% at 50% 40%, 
            transparent 15%,
            hsl(225 35% 2% / 0.5) 55%,
            hsl(225 40% 1% / 0.8) 100%
          )`,
        }}
      />
      
      {/* Subtle sunrise glow - offset down-left */}
      <div 
        className="absolute"
        style={{
          bottom: '25%',
          left: '25%',
          width: '55%',
          height: '45%',
          background: `radial-gradient(ellipse 100% 80% at 30% 70%, 
            hsl(180 35% 28% / 0.04) 0%,
            transparent 55%
          )`,
        }}
      />
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';
