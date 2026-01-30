import { memo, useEffect, useState } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Premium Earth Globe - Optimized for Mobile Performance
 * 
 * Cinematic, slow-rotating Earth with soft lighting:
 * - Very slow rotation (150s cycle)
 * - No glows, halos, or bright edges
 * - Minimal transparency and blur
 * - Stable, calm visual presence
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
  // Cinematic slow rotation - 150s normal, 80s when analyzing
  const rotationSpeed = isAnalyzing ? '80s' : '150s';
  
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
      {/* ========== EARTH GLOBE - CLEAN & PERFORMANT ========== */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          opacity: isAnalyzing ? 0.75 : 0.65,
          // Minimal shadow - no heavy glow layers
          boxShadow: '0 0 20px hsl(200 40% 30% / 0.2)',
        }}
      >
        {/* Ocean base - simple gradient */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 25%, 
              hsl(200 50% 35%) 0%, 
              hsl(210 45% 25%) 40%, 
              hsl(220 40% 15%) 100%
            )`,
          }}
        />
        
        {/* PRIMARY ROTATING EARTH TEXTURE */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${rotationSpeed} linear infinite` : 'none',
            // Soft, realistic look - no oversaturation
            filter: 'saturate(1.0) brightness(1.05) contrast(0.95)',
          }}
        />
        
        {/* SOFT TERMINATOR SHADOW - Low contrast day/night */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(125deg, 
              transparent 40%, 
              hsl(230 30% 10% / 0.15) 55%,
              hsl(235 35% 8% / 0.3) 70%,
              hsl(240 40% 6% / 0.45) 100%
            )`,
          }}
        />
      </div>
      
      {/* ========== MINIMAL CENTER OVERLAY FOR TEXT READABILITY ========== */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '65%',
          height: '35%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse 100% 100% at center, 
            hsl(230 30% 8% / 0.35) 0%, 
            transparent 100%
          )`,
          // No blur for performance
          zIndex: 1,
        }}
      />
      
      {/* ========== SCAN RING (analysis mode only) - No pulse animation ========== */}
      {isAnalyzing && shouldAnimate && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '102%',
            height: '102%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid hsl(174 50% 50% / 0.25)',
            animation: 'scan-pulse 3.5s ease-out infinite',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
