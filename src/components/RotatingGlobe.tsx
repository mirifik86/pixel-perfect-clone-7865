import { memo, useEffect, useState, useMemo } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Premium Mini Earth Globe - High-end visual inside score gauge
 * 
 * Features:
 * - Refined Earth with premium atmospheric effects
 * - Dual-layer rotation for depth
 * - Sophisticated lighting (sun rim, atmosphere glow)
 * - Deep space starfield with nebula hints
 * - Orbital rings with satellite dots
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
  const rotationSpeed = isAnalyzing ? '22s' : '90s';
  
  // Premium sizing
  const globeSize = Math.max(size * 0.52, 85);
  const containerSize = globeSize * 1.7;
  
  // Deep space stars with varied brightness
  const stars = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.6 + Math.random() * 1.8,
      brightness: 0.2 + Math.random() * 0.6,
      twinkleSpeed: 2 + Math.random() * 4,
      delay: Math.random() * 3,
    }))
  , []);
  
  // High-quality Earth texture
  const earthTexture = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png';
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: containerSize,
        height: containerSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
      }}
    >
      {/* ========== DEEP SPACE BACKGROUND ========== */}
      <div 
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 30% 30%, 
              hsl(260 40% 12% / 0.4) 0%, 
              transparent 50%
            ),
            radial-gradient(ellipse 70% 50% at 70% 70%, 
              hsl(200 35% 10% / 0.3) 0%, 
              transparent 45%
            ),
            radial-gradient(circle, 
              hsl(230 35% 8%) 0%, 
              hsl(240 30% 5%) 60%,
              hsl(250 25% 3%) 100%
            )
          `,
        }}
      >
        {/* Premium starfield */}
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: `radial-gradient(circle, 
                hsl(210 30% 95%) 0%, 
                hsl(220 25% 80%) 50%, 
                transparent 100%
              )`,
              opacity: star.brightness,
              boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px hsl(200 40% 80% / 0.3)` : 'none',
              animation: shouldAnimate ? `twinkle ${star.twinkleSpeed}s ease-in-out infinite` : 'none',
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* ========== OUTER ORBITAL RING ========== */}
      <div 
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: globeSize * 1.5,
          height: globeSize * 1.5,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotateX(70deg) rotateZ(15deg)',
          border: `1px solid hsl(200 45% 60% / ${isAnalyzing ? 0.3 : 0.12})`,
          boxShadow: isAnalyzing ? '0 0 8px hsl(200 50% 55% / 0.2)' : 'none',
        }}
      >
        {/* Satellite dot */}
        {shouldAnimate && (
          <div 
            className="absolute rounded-full"
            style={{
              width: '3px',
              height: '3px',
              background: 'hsl(200 60% 70%)',
              boxShadow: '0 0 6px hsl(200 55% 65% / 0.6)',
              top: '0%',
              left: '50%',
              transform: 'translateX(-50%)',
              animation: `orbit-dot ${isAnalyzing ? '8s' : '20s'} linear infinite`,
            }}
          />
        )}
      </div>
      
      {/* ========== INNER ORBITAL RING ========== */}
      <div 
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: globeSize * 1.28,
          height: globeSize * 1.28,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotateX(72deg) rotateZ(-25deg)',
          border: `1px solid hsl(174 50% 55% / ${isAnalyzing ? 0.35 : 0.15})`,
          boxShadow: isAnalyzing ? '0 0 10px hsl(174 55% 50% / 0.25)' : 'none',
        }}
      >
        {/* Moon dot */}
        {shouldAnimate && (
          <div 
            className="absolute rounded-full"
            style={{
              width: '4px',
              height: '4px',
              background: 'radial-gradient(circle, hsl(45 20% 85%) 0%, hsl(40 15% 65%) 100%)',
              boxShadow: '0 0 8px hsl(45 25% 75% / 0.5)',
              top: '50%',
              left: '0%',
              transform: 'translateY(-50%)',
              animation: `orbit-dot-reverse ${isAnalyzing ? '12s' : '28s'} linear infinite`,
            }}
          />
        )}
      </div>
      
      {/* ========== SUN CORONA GLOW ========== */}
      <div 
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: globeSize * 1.6,
          height: globeSize * 1.6,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `
            radial-gradient(circle at 25% 30%, 
              hsl(45 80% 70% / ${isAnalyzing ? 0.18 : 0.08}) 0%, 
              hsl(40 70% 60% / ${isAnalyzing ? 0.1 : 0.04}) 25%, 
              transparent 50%
            )
          `,
          filter: 'blur(8px)',
        }}
      />
      
      {/* ========== ATMOSPHERE OUTER GLOW ========== */}
      <div 
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: globeSize * 1.15,
          height: globeSize * 1.15,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, 
            transparent 65%,
            hsl(200 70% 60% / ${isAnalyzing ? 0.2 : 0.1}) 80%,
            hsl(190 60% 55% / ${isAnalyzing ? 0.35 : 0.18}) 90%,
            hsl(180 50% 50% / ${isAnalyzing ? 0.15 : 0.08}) 100%
          )`,
          filter: 'blur(3px)',
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
            0 0 ${isAnalyzing ? 25 : 15}px hsl(200 65% 55% / ${isAnalyzing ? 0.35 : 0.2}),
            0 0 ${isAnalyzing ? 45 : 30}px hsl(174 55% 50% / ${isAnalyzing ? 0.2 : 0.12}),
            0 0 ${isAnalyzing ? 70 : 50}px hsl(190 45% 45% / ${isAnalyzing ? 0.1 : 0.06})
          `,
          transition: 'box-shadow 0.7s ease-out',
        }}
      >
        {/* Ocean base gradient */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 25%, 
              hsl(200 60% 40%) 0%, 
              hsl(210 55% 30%) 35%, 
              hsl(220 50% 20%) 70%,
              hsl(230 45% 12%) 100%
            )`,
          }}
        />
        
        {/* Primary rotating Earth texture */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${rotationSpeed} linear infinite` : 'none',
            opacity: 0.9,
            filter: 'saturate(0.85) brightness(0.95) contrast(1.08)',
          }}
        />
        
        {/* Secondary texture layer (depth effect) */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${rotationSpeed} linear infinite` : 'none',
            opacity: 0.25,
            filter: 'saturate(0.5) brightness(0.7) blur(0.5px)',
            mixBlendMode: 'overlay',
          }}
        />
        
        {/* Sunlit hemisphere highlight */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 25% 20%, 
                hsl(180 60% 85% / 0.18) 0%, 
                hsl(190 50% 70% / 0.08) 25%,
                transparent 45%
              ),
              radial-gradient(circle at 35% 35%, 
                hsl(45 50% 80% / 0.06) 0%, 
                transparent 30%
              )
            `,
          }}
        />
        
        {/* Night side shadow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(130deg, 
              transparent 35%, 
              hsl(240 35% 8% / 0.35) 55%, 
              hsl(240 40% 5% / 0.55) 75%,
              hsl(245 45% 3% / 0.7) 100%
            )`,
          }}
        />
        
        {/* Atmosphere rim light */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 0 ${globeSize * 0.12}px hsl(200 70% 65% / 0.12),
              inset ${globeSize * 0.03}px ${globeSize * 0.02}px ${globeSize * 0.08}px hsl(180 60% 70% / 0.08),
              inset -${globeSize * 0.08}px -${globeSize * 0.06}px ${globeSize * 0.15}px hsl(240 40% 5% / 0.5)
            `,
          }}
        />
        
        {/* Terminator line glow (day/night boundary) */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: `linear-gradient(115deg, 
              transparent 42%,
              hsl(30 60% 60% / 0.08) 48%,
              hsl(20 50% 50% / 0.04) 52%,
              transparent 58%
            )`,
          }}
        />
      </div>
      
      {/* ========== SCANNING PULSE RING (analysis mode) ========== */}
      {isAnalyzing && shouldAnimate && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: globeSize * 1.1,
            height: globeSize * 1.1,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1.5px solid hsl(174 60% 55% / 0.35)',
            animation: 'scan-pulse 2.8s ease-out infinite',
          }}
        />
      )}
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
