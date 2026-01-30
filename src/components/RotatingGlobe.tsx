import { memo, useEffect, useState } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Premium Mini Earth + Solar System
 * 
 * Features:
 * - Subtle Earth globe with rotating world map texture
 * - Idle: 120s per rotation (ultra slow)
 * - Analyzing: 30s per rotation + sun glow + orbital rings + moon/satellite
 * - All effects are premium and understated
 * - Respects prefers-reduced-motion
 */
export const RotatingGlobe = memo(({ size, isAnalyzing = false }: RotatingGlobeProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showOrbits, setShowOrbits] = useState(false);
  
  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Smooth fade-in for orbit elements
  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => setShowOrbits(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowOrbits(false);
    }
  }, [isAnalyzing]);
  
  const shouldAnimate = !prefersReducedMotion;
  const animationDuration = isAnalyzing ? '30s' : '120s';
  
  // Globe dimensions
  const globeSize = size * 0.42;
  const orbitRing1 = size * 0.52;
  const orbitRing2 = size * 0.62;
  
  // Use a subtle equirectangular world map
  const textureUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_der_Grinten_projection_SW.jpg/1280px-Van_der_Grinten_projection_SW.jpg';
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: size * 0.7,
        height: size * 0.7,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
      }}
    >
      {/* ========== SUN GLOW (analysis mode only) ========== */}
      <div 
        className="absolute rounded-full transition-opacity duration-700"
        style={{
          width: globeSize * 1.8,
          height: globeSize * 1.8,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, 
            hsl(45 60% 70% / ${isAnalyzing ? 0.08 : 0}) 0%, 
            hsl(35 50% 60% / ${isAnalyzing ? 0.04 : 0}) 30%, 
            transparent 60%
          )`,
          filter: 'blur(8px)',
          opacity: showOrbits ? 1 : 0,
        }}
      />
      
      {/* ========== ORBITAL RING 1 (outer) ========== */}
      <div 
        className="absolute rounded-full transition-opacity duration-500"
        style={{
          width: orbitRing2,
          height: orbitRing2,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid hsl(200 30% 50% / 0.12)',
          opacity: showOrbits ? 1 : 0,
        }}
      >
        {/* Satellite dot on outer ring */}
        {shouldAnimate && showOrbits && (
          <div 
            className="absolute"
            style={{
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: 'hsl(200 40% 60% / 0.5)',
              boxShadow: '0 0 4px hsl(200 40% 60% / 0.3)',
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
              animation: 'orbit-satellite 25s linear infinite',
            }}
          />
        )}
      </div>
      
      {/* ========== ORBITAL RING 2 (inner) ========== */}
      <div 
        className="absolute rounded-full transition-opacity duration-500"
        style={{
          width: orbitRing1,
          height: orbitRing1,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid hsl(174 35% 55% / 0.15)',
          opacity: showOrbits ? 1 : 0,
        }}
      >
        {/* Moon dot on inner ring */}
        {shouldAnimate && showOrbits && (
          <div 
            className="absolute"
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, hsl(45 10% 75%) 0%, hsl(45 5% 60%) 100%)',
              boxShadow: '0 0 6px hsl(45 15% 70% / 0.4)',
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
              animation: 'orbit-moon 18s linear infinite',
            }}
          />
        )}
      </div>
      
      {/* ========== EARTH GLOBE ========== */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          width: globeSize,
          height: globeSize,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: isAnalyzing ? 0.75 : 0.55,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        {/* Globe base - deep ocean gradient fallback */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 35%, 
              hsl(200 35% 28%) 0%, 
              hsl(210 30% 18%) 50%, 
              hsl(220 25% 10%) 100%
            )`,
          }}
        />
        
        {/* Primary rotating texture layer */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${textureUrl})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${animationDuration} linear infinite` : 'none',
            opacity: 0.6,
            filter: 'saturate(0.45) brightness(0.75) contrast(1.05)',
            mixBlendMode: 'overlay',
          }}
        />
        
        {/* Secondary layer for depth */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${textureUrl})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${animationDuration} linear infinite` : 'none',
            opacity: 0.3,
            filter: 'saturate(0.35) brightness(0.65)',
          }}
        />
        
        {/* Atmospheric highlight (top-left light source) */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 25%, 
              hsl(174 40% 70% / 0.12) 0%, 
              transparent 45%
            )`,
          }}
        />
        
        {/* Edge shadow for 3D spherical effect */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset -6px -5px 16px hsl(240 30% 5% / 0.55),
              inset 3px 2px 10px hsl(174 35% 55% / 0.08)
            `,
          }}
        />
        
        {/* Analyzing state: subtle atmospheric glow */}
        <div 
          className="absolute inset-0 rounded-full transition-opacity duration-500"
          style={{
            boxShadow: '0 0 12px hsl(174 50% 50% / 0.25), 0 0 24px hsl(174 45% 45% / 0.12)',
            opacity: isAnalyzing ? 1 : 0,
          }}
        />
      </div>
      
      {/* ========== SCAN RING (analysis mode pulse) ========== */}
      {showOrbits && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: globeSize * 1.1,
            height: globeSize * 1.1,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid hsl(174 50% 55% / 0.2)',
            animation: shouldAnimate ? 'scan-pulse 3s ease-out infinite' : 'none',
          }}
        />
      )}
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
