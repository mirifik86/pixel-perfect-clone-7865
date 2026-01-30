import { memo, useEffect, useState, useMemo } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Mini Earth Globe - CLEARLY VISIBLE inside roulette center
 * 
 * Features:
 * - Prominent Earth globe with rotating world map texture
 * - Starfield behind the globe
 * - Soft sun glow radial gradient
 * - Idle: 80s per rotation
 * - Analyzing: 25s per rotation
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
  const animationDuration = isAnalyzing ? '25s' : '80s';
  
  // Globe is 55% of gauge size for clear visibility
  const globeSize = Math.max(size * 0.55, 90);
  
  // Generate random stars
  const stars = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.8 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.5,
      delay: Math.random() * 3,
    }))
  , []);
  
  // Earth texture - using existing project asset
  const textureUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png';
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: globeSize * 1.6,
        height: globeSize * 1.6,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
      }}
    >
      {/* ========== STARFIELD BACKGROUND ========== */}
      <div 
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: 'radial-gradient(circle, hsl(230 30% 8%) 0%, hsl(240 25% 5%) 100%)',
        }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'hsl(0 0% 100%)',
              opacity: star.opacity,
              animation: shouldAnimate ? `twinkle ${2 + star.delay}s ease-in-out infinite` : 'none',
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* ========== SUN GLOW (always visible, brighter during analysis) ========== */}
      <div 
        className="absolute rounded-full transition-all duration-500"
        style={{
          width: globeSize * 1.4,
          height: globeSize * 1.4,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 40% 40%, 
            hsl(45 70% 65% / ${isAnalyzing ? 0.25 : 0.12}) 0%, 
            hsl(35 60% 55% / ${isAnalyzing ? 0.15 : 0.06}) 30%, 
            hsl(200 40% 40% / 0.05) 60%,
            transparent 80%
          )`,
          filter: 'blur(6px)',
        }}
      />
      
      {/* ========== EARTH GLOBE ========== */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          width: globeSize,
          height: globeSize,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: `
            0 0 ${isAnalyzing ? 30 : 20}px hsl(200 60% 50% / ${isAnalyzing ? 0.4 : 0.25}),
            0 0 ${isAnalyzing ? 50 : 35}px hsl(174 50% 45% / ${isAnalyzing ? 0.25 : 0.15}),
            inset -8px -6px 20px hsl(240 30% 5% / 0.7)
          `,
          transition: 'box-shadow 0.5s ease-out',
        }}
      >
        {/* Globe base - ocean blue gradient */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, 
              hsl(200 55% 35%) 0%, 
              hsl(210 50% 25%) 40%, 
              hsl(220 45% 15%) 100%
            )`,
          }}
        />
        
        {/* Rotating Earth texture - PRIMARY layer (clearly visible) */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${textureUrl})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${animationDuration} linear infinite` : 'none',
            opacity: 0.85,
            filter: 'saturate(0.7) brightness(0.9) contrast(1.1)',
          }}
        />
        
        {/* Atmospheric highlight (sunlit side) */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 25%, 
              hsl(180 50% 80% / 0.2) 0%, 
              hsl(200 40% 60% / 0.08) 30%,
              transparent 50%
            )`,
          }}
        />
        
        {/* Dark side shadow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, 
              transparent 40%, 
              hsl(240 30% 5% / 0.4) 70%, 
              hsl(240 30% 3% / 0.6) 100%
            )`,
          }}
        />
        
        {/* Atmosphere rim glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 0 ${globeSize * 0.15}px hsl(200 60% 60% / 0.15),
              inset -4px -3px 15px hsl(240 30% 5% / 0.6)
            `,
          }}
        />
      </div>
      
      {/* ========== ORBIT RINGS (analysis mode) ========== */}
      <div 
        className="absolute rounded-full transition-opacity duration-500"
        style={{
          width: globeSize * 1.25,
          height: globeSize * 1.25,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotateX(65deg)',
          border: `1px solid hsl(174 50% 60% / ${isAnalyzing ? 0.35 : 0.12})`,
          opacity: 1,
        }}
      />
      
      {/* Outer orbit ring */}
      <div 
        className="absolute rounded-full transition-opacity duration-500"
        style={{
          width: globeSize * 1.45,
          height: globeSize * 1.45,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotateX(65deg) rotateZ(30deg)',
          border: `1px solid hsl(200 40% 55% / ${isAnalyzing ? 0.25 : 0.08})`,
          opacity: 1,
        }}
      />
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
