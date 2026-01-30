import { memo, useEffect, useState } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Premium Earth Globe - CLEARLY VISIBLE in roulette center
 * 
 * Large, vibrant Earth behind the gauge:
 * - High visibility (65-75% opacity)
 * - No blur - crisp and premium
 * - Rich atmospheric effects
 * - Smooth rotation
 */
export const RotatingGlobe = memo(({ size, isAnalyzing = false }: RotatingGlobeProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  const shouldAnimate = !prefersReducedMotion;
  const rotationSpeed = isAnalyzing ? '28s' : '100s';
  
  // Globe size with gap for physical separation from gauge ring
  // Reduced from 88% to 82% to create ~3-4px visible gap
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
      {/* Removed: ATMOSPHERIC OUTER GLOW - keeping globe clean */}
      
      {/* ========== EARTH GLOBE - PREMIUM VISIBLE ========== */}
      <div 
        className="absolute rounded-full overflow-hidden transition-all duration-500"
        style={{
          width: '100%',
          height: '100%',
          opacity: isAnalyzing ? 0.8 : 0.68, // HIGH VISIBILITY
          boxShadow: `
            0 0 ${isAnalyzing ? 30 : 20}px hsl(190 60% 50% / ${isAnalyzing ? 0.4 : 0.25}),
            0 0 ${isAnalyzing ? 50 : 35}px hsl(180 55% 45% / ${isAnalyzing ? 0.25 : 0.15}),
            0 0 ${isAnalyzing ? 80 : 55}px hsl(174 50% 40% / ${isAnalyzing ? 0.12 : 0.08})
          `,
        }}
      >
        {/* Ocean base gradient - rich blue */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 28% 22%, 
              hsl(200 65% 42%) 0%, 
              hsl(210 60% 32%) 30%, 
              hsl(215 55% 22%) 60%,
              hsl(225 50% 14%) 100%
            )`,
          }}
        />
        
        {/* PRIMARY ROTATING EARTH TEXTURE - DAYLIGHT ENHANCED */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${rotationSpeed} linear infinite` : 'none',
            filter: 'saturate(1.08) brightness(1.18) contrast(1.0)', // More brightness, lifted midtones
          }}
        />
        
        {/* Removed: SPECULAR HIGHLIGHT - was creating white spots on top */}
        
        {/* TERMINATOR SHADOW - REDUCED for daylight feel */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(128deg, 
              transparent 35%, 
              hsl(240 35% 10% / 0.12) 50%,
              hsl(240 40% 6% / 0.28) 65%,
              hsl(245 45% 4% / 0.45) 82%,
              hsl(250 50% 3% / 0.58) 100%
            )`,
          }}
        />
        
        {/* Removed: ATMOSPHERIC RIM LIGHT - keeping globe clean */}
        
        {/* Removed: Terminator edge glow - keeping globe clean */}
      </div>
      
      {/* ========== SUBTLE TEXT READABILITY OVERLAY - REDUCED ========== */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '70%',
          height: '40%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse 100% 100% at center, 
            hsl(235 35% 8% / 0.4) 0%, 
            hsl(235 30% 6% / 0.2) 60%,
            transparent 100%
          )`,
          filter: 'blur(10px)',
          zIndex: 1,
        }}
      />
      
      {/* ========== SCAN PULSE (analysis mode) ========== */}
      {isAnalyzing && shouldAnimate && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '105%',
            height: '105%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1.5px solid hsl(174 60% 55% / 0.35)',
            animation: 'scan-pulse 2.8s ease-out infinite',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
