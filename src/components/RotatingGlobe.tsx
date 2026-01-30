import { memo, useEffect, useState, useMemo } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Premium Earth Background Layer
 * 
 * Subtle rotating Earth BEHIND the score gauge:
 * - Large (85% of gauge inner area)
 * - Reduced opacity for subtlety
 * - Soft overlay for gauge/text readability
 * - Smooth rotation (110s idle, 30s analyzing)
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
  const rotationSpeed = isAnalyzing ? '30s' : '110s';
  
  // LARGE: 85% of gauge for prominent but background presence
  const globeSize = size * 0.85;
  
  // Blue Marble Earth texture
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
        zIndex: 0, // Behind everything
      }}
    >
      {/* ========== EARTH GLOBE (subtle background) ========== */}
      <div 
        className="absolute rounded-full overflow-hidden transition-all duration-700"
        style={{
          width: '100%',
          height: '100%',
          opacity: isAnalyzing ? 0.45 : 0.3, // Subtle opacity
          filter: `blur(${isAnalyzing ? '0.5px' : '1px'})`, // Slight blur for depth
        }}
      >
        {/* Ocean base gradient */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 25%, 
              hsl(200 55% 35%) 0%, 
              hsl(210 50% 25%) 35%, 
              hsl(220 45% 18%) 70%,
              hsl(230 40% 10%) 100%
            )`,
          }}
        />
        
        {/* Rotating Earth texture */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${rotationSpeed} linear infinite` : 'none',
            filter: 'saturate(0.75) brightness(0.85) contrast(1.05)',
          }}
        />
        
        {/* Terminator shadow (day/night) */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(130deg, 
              transparent 25%, 
              hsl(240 40% 8% / 0.3) 45%,
              hsl(240 45% 5% / 0.55) 65%,
              hsl(245 50% 3% / 0.75) 100%
            )`,
          }}
        />
        
        {/* Atmospheric rim */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 0 ${globeSize * 0.08}px hsl(190 60% 55% / 0.15),
              inset -${globeSize * 0.05}px -${globeSize * 0.04}px ${globeSize * 0.1}px hsl(240 40% 5% / 0.5)
            `,
          }}
        />
      </div>
      
      {/* ========== DARK OVERLAY FOR TEXT READABILITY ========== */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, 
            hsl(235 35% 8% / 0.5) 0%, 
            hsl(235 30% 6% / 0.35) 40%,
            hsl(240 25% 5% / 0.2) 70%,
            transparent 90%
          )`,
          zIndex: 1,
        }}
      />
      
      {/* ========== SUBTLE GLOW EFFECT ========== */}
      <div 
        className="absolute rounded-full pointer-events-none transition-all duration-700"
        style={{
          width: '105%',
          height: '105%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, 
            transparent 50%,
            hsl(190 50% 50% / ${isAnalyzing ? 0.12 : 0.06}) 75%,
            hsl(174 45% 45% / ${isAnalyzing ? 0.08 : 0.04}) 90%,
            transparent 100%
          )`,
          zIndex: 2,
        }}
      />
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
