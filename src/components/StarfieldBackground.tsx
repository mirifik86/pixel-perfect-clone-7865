import { memo } from 'react';
import earthCosmicBg from '@/assets/earth-cosmic-bg-hq.jpg';

/**
 * Cinematic Deep Space Background - Ultra Premium & Subtle
 * 
 * Almost invisible Earth atmosphere:
 * - Heavy blur to eliminate sharp details
 * - Very low brightness/contrast for deep space feel
 * - Strong dark overlays - interface is the focus
 * - Center slightly lighter for depth, edges darkened
 * - Zero animation, optimized for mobile
 */
export const StarfieldBackground = memo(() => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Deep space base - pure dark */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'hsl(225 40% 3%)',
        }}
      />
      
      {/* Earth image - HEAVILY subdued, almost invisible */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${earthCosmicBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          // Heavy blur + very low brightness = soft atmospheric glow only
          filter: 'blur(8px) brightness(0.12) contrast(0.7) saturate(0.6)',
          opacity: 0.7,
        }}
      />
      
      {/* Primary dark overlay - eliminates most detail */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'hsl(225 40% 2% / 0.75)',
        }}
      />
      
      {/* Top edge darkening */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(225 45% 2% / 0.95) 0%,
            hsl(225 40% 2% / 0.7) 15%,
            transparent 40%
          )`,
        }}
      />
      
      {/* Bottom edge darkening */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, 
            hsl(225 45% 2% / 0.98) 0%,
            hsl(225 40% 2% / 0.8) 15%,
            transparent 40%
          )`,
        }}
      />
      
      {/* Left edge darkening */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, 
            hsl(225 45% 2% / 0.9) 0%,
            transparent 25%
          )`,
        }}
      />
      
      {/* Right edge darkening */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to left, 
            hsl(225 45% 2% / 0.9) 0%,
            transparent 25%
          )`,
        }}
      />
      
      {/* CENTER LIGHTER ZONE - subtle lift behind gauge area */}
      <div 
        className="absolute"
        style={{
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '50%',
          background: `radial-gradient(ellipse 100% 80% at 50% 40%, 
            hsl(220 30% 8% / 0.4) 0%,
            hsl(225 35% 5% / 0.2) 40%,
            transparent 70%
          )`,
        }}
      />
      
      {/* Soft diffused cyan atmospheric glow - very subtle */}
      <div 
        className="absolute"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '45%',
          height: '35%',
          background: `radial-gradient(ellipse 100% 80% at 50% 50%, 
            hsl(190 40% 35% / 0.04) 0%,
            hsl(190 35% 30% / 0.02) 50%,
            transparent 80%
          )`,
          filter: 'blur(30px)',
        }}
      />
      
      {/* Extreme vignette - focus on center */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 40%, 
            transparent 0%,
            hsl(225 45% 2% / 0.4) 50%,
            hsl(225 50% 1% / 0.85) 100%
          )`,
        }}
      />
    </div>
  );
});

StarfieldBackground.displayName = 'StarfieldBackground';
