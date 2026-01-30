import { memo } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Static Earth Globe - Premium Fixed Display
 * 
 * Sharp, detailed, static Earth image:
 * - No rotation for clarity and stability
 * - High-quality Blue Marble texture
 * - Soft lighting with subtle sunrise rim
 * - Clean visual focus
 */
export const RotatingGlobe = memo(({ size, isAnalyzing = false }: RotatingGlobeProps) => {
  // Globe size with clean gap from gauge ring
  const globeSize = size * 0.82;
  
  // High-quality Blue Marble Earth texture
  const earthTexture = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png';
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: globeSize,
        height: globeSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
      }}
    >
      {/* ========== EARTH GLOBE - STATIC & SHARP ========== */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          boxShadow: `
            0 0 30px hsl(200 50% 20% / 0.3),
            0 0 60px hsl(200 40% 15% / 0.15)
          `,
        }}
      >
        {/* Ocean base gradient */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, 
              hsl(200 55% 40%) 0%, 
              hsl(210 50% 30%) 40%, 
              hsl(220 45% 18%) 100%
            )`,
          }}
        />
        
        {/* STATIC EARTH TEXTURE - No animation */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '25% 50%', // Fixed position showing Americas/Atlantic
            backgroundRepeat: 'no-repeat',
            // Sharp, vivid look
            filter: 'saturate(1.15) brightness(1.1) contrast(1.05)',
          }}
        />
        
        {/* SUNRISE RIM LIGHT - Right side glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 40% 80% at 95% 50%, 
                hsl(45 80% 70% / 0.15) 0%,
                hsl(35 70% 60% / 0.08) 30%,
                transparent 60%
              )
            `,
          }}
        />
        
        {/* SOFT TERMINATOR SHADOW - Left side */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(100deg, 
              hsl(230 30% 8% / 0.4) 0%,
              hsl(230 25% 10% / 0.2) 25%,
              transparent 50%
            )`,
          }}
        />
        
        {/* Subtle atmospheric glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: 'inset 0 0 20px hsl(200 60% 50% / 0.1)',
          }}
        />
      </div>
      
      {/* ========== SCAN RING (analysis mode only) ========== */}
      {isAnalyzing && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '104%',
            height: '104%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid hsl(174 50% 50% / 0.3)',
            animation: 'scan-pulse 3s ease-out infinite',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
