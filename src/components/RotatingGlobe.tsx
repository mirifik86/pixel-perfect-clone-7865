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
  
  // LARGE: 88% of gauge for prominent presence
  const globeSize = size * 0.88;
  
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
      {/* ========== ATMOSPHERIC OUTER GLOW ========== */}
      <div 
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: '115%',
          height: '115%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, 
            transparent 45%,
            hsl(190 60% 50% / ${isAnalyzing ? 0.2 : 0.12}) 65%,
            hsl(180 55% 45% / ${isAnalyzing ? 0.28 : 0.18}) 80%,
            hsl(174 50% 40% / ${isAnalyzing ? 0.15 : 0.08}) 100%
          )`,
          filter: 'blur(4px)',
        }}
      />
      
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
        
        {/* PRIMARY ROTATING EARTH TEXTURE - CRISP */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${rotationSpeed} linear infinite` : 'none',
            filter: 'saturate(1) brightness(0.95) contrast(1.08)', // Full saturation, crisp
          }}
        />
        
        {/* SPECULAR HIGHLIGHT - premium gloss */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 50% 40% at 25% 20%, 
                hsl(180 70% 92% / 0.28) 0%, 
                hsl(190 60% 85% / 0.12) 40%,
                transparent 65%
              ),
              radial-gradient(ellipse 35% 25% at 30% 28%, 
                hsl(45 60% 95% / 0.1) 0%, 
                transparent 55%
              )
            `,
          }}
        />
        
        {/* TERMINATOR SHADOW - day/night for 3D depth */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(128deg, 
              transparent 28%, 
              hsl(240 40% 8% / 0.22) 45%,
              hsl(240 45% 5% / 0.42) 60%,
              hsl(245 50% 3% / 0.62) 78%,
              hsl(250 55% 2% / 0.78) 100%
            )`,
          }}
        />
        
        {/* ATMOSPHERIC RIM LIGHT */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 0 ${globeSize * 0.12}px hsl(190 65% 60% / 0.15),
              inset ${globeSize * 0.025}px ${globeSize * 0.02}px ${globeSize * 0.08}px hsl(180 60% 70% / 0.1),
              inset -${globeSize * 0.07}px -${globeSize * 0.06}px ${globeSize * 0.14}px hsl(240 45% 4% / 0.55)
            `,
          }}
        />
        
        {/* Terminator edge glow (sunrise line) */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(122deg, 
              transparent 40%,
              hsl(30 60% 60% / 0.08) 48%,
              hsl(25 55% 55% / 0.04) 54%,
              transparent 62%
            )`,
          }}
        />
      </div>
      
      {/* ========== SUBTLE TEXT READABILITY OVERLAY ========== */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '75%',
          height: '45%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse 100% 100% at center, 
            hsl(235 40% 6% / 0.55) 0%, 
            hsl(235 35% 5% / 0.3) 60%,
            transparent 100%
          )`,
          filter: 'blur(8px)',
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
