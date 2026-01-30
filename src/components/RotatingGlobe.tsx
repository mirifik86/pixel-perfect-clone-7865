import { memo, useEffect, useState, useMemo } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Premium Pro Mini Earth Globe
 * 
 * Hero-level visual inside score gauge:
 * - Large, prominent Earth (65% of gauge)
 * - Realistic terminator shadow (day/night)
 * - Atmospheric rim glow (cyan/teal)
 * - Specular highlight for photoreal depth
 * - Deep space starfield backdrop
 * - Inner vignette blend
 * - Dark overlay for text readability
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
  // Smooth slow rotation: 100s idle, 28s analyzing
  const rotationSpeed = isAnalyzing ? '28s' : '100s';
  
  // HERO SIZE: 65% of gauge for prominent visual presence
  const globeSize = Math.max(size * 0.65, 100);
  const containerSize = globeSize * 1.5;
  
  // Premium starfield with depth variation
  const stars = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      brightness: 0.15 + Math.random() * 0.45,
      twinkleSpeed: 2.5 + Math.random() * 4,
      delay: Math.random() * 4,
    }))
  , []);
  
  // High-quality Blue Marble Earth texture
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
      {/* ========== DEEP SPACE BACKGROUND WITH STARFIELD ========== */}
      <div 
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 25% 25%, 
              hsl(260 35% 10% / 0.25) 0%, 
              transparent 45%
            ),
            radial-gradient(ellipse 60% 40% at 75% 70%, 
              hsl(200 30% 8% / 0.2) 0%, 
              transparent 40%
            ),
            radial-gradient(circle, 
              hsl(225 35% 7%) 0%, 
              hsl(235 32% 5%) 50%,
              hsl(245 28% 3%) 100%
            )
          `,
        }}
      >
        {/* Premium starfield - very low opacity for subtlety */}
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'hsl(210 20% 95%)',
              opacity: star.brightness,
              boxShadow: star.size > 1.2 ? `0 0 ${star.size}px hsl(200 30% 85% / 0.4)` : 'none',
              animation: shouldAnimate ? `twinkle ${star.twinkleSpeed}s ease-in-out infinite` : 'none',
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* ========== INNER VIGNETTE (blend globe into UI) ========== */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, 
            transparent 40%, 
            hsl(235 30% 6% / 0.4) 70%, 
            hsl(240 28% 5% / 0.7) 90%,
            hsl(240 25% 4% / 0.85) 100%
          )`,
          zIndex: 10,
        }}
      />
      
      {/* ========== ATMOSPHERIC RIM GLOW ========== */}
      <div 
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: globeSize * 1.08,
          height: globeSize * 1.08,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, 
            transparent 70%,
            hsl(190 65% 55% / ${isAnalyzing ? 0.18 : 0.1}) 82%,
            hsl(180 60% 50% / ${isAnalyzing ? 0.25 : 0.14}) 90%,
            hsl(174 55% 45% / ${isAnalyzing ? 0.12 : 0.06}) 100%
          )`,
          filter: 'blur(2px)',
          zIndex: 2,
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
            0 0 ${isAnalyzing ? 20 : 12}px hsl(190 60% 50% / ${isAnalyzing ? 0.3 : 0.18}),
            0 0 ${isAnalyzing ? 40 : 25}px hsl(180 50% 45% / ${isAnalyzing ? 0.18 : 0.1}),
            0 0 ${isAnalyzing ? 60 : 40}px hsl(174 45% 40% / ${isAnalyzing ? 0.08 : 0.05})
          `,
          transition: 'box-shadow 0.7s ease-out',
          zIndex: 3,
        }}
      >
        {/* Ocean base - rich blue gradient */}
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
        
        {/* PRIMARY ROTATING EARTH TEXTURE */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `url(${earthTexture})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate ? `globe-rotate ${rotationSpeed} linear infinite` : 'none',
            opacity: 0.92,
            filter: 'saturate(0.9) brightness(0.95) contrast(1.06)',
          }}
        />
        
        {/* SPECULAR HIGHLIGHT - photoreal gloss */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 45% 35% at 22% 18%, 
                hsl(180 70% 92% / 0.22) 0%, 
                hsl(190 60% 85% / 0.1) 35%,
                transparent 60%
              ),
              radial-gradient(ellipse 30% 20% at 28% 25%, 
                hsl(45 60% 95% / 0.08) 0%, 
                transparent 50%
              )
            `,
          }}
        />
        
        {/* TERMINATOR SHADOW - day/night gradient for 3D depth */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(125deg, 
              transparent 30%, 
              hsl(240 40% 8% / 0.25) 48%,
              hsl(240 45% 6% / 0.45) 60%,
              hsl(245 50% 4% / 0.65) 75%,
              hsl(250 55% 3% / 0.8) 100%
            )`,
          }}
        />
        
        {/* ATMOSPHERIC RIM LIGHT - subtle edge glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 0 ${globeSize * 0.1}px hsl(190 70% 60% / 0.1),
              inset ${globeSize * 0.02}px ${globeSize * 0.015}px ${globeSize * 0.06}px hsl(180 65% 70% / 0.08),
              inset -${globeSize * 0.06}px -${globeSize * 0.05}px ${globeSize * 0.12}px hsl(240 45% 4% / 0.55)
            `,
          }}
        />
        
        {/* Terminator edge glow (sunrise/sunset line) */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: `linear-gradient(120deg, 
              transparent 38%,
              hsl(25 55% 55% / 0.06) 46%,
              hsl(35 50% 50% / 0.03) 52%,
              transparent 60%
            )`,
          }}
        />
      </div>
      
      {/* ========== TEXT READABILITY OVERLAY ========== */}
      {/* Dark gradient overlay centered for text contrast */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: globeSize * 0.9,
          height: globeSize * 0.5,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse 100% 100% at center, 
            hsl(235 35% 8% / 0.55) 0%, 
            hsl(240 30% 6% / 0.35) 50%,
            transparent 85%
          )`,
          filter: 'blur(6px)',
          zIndex: 4,
        }}
      />
      
      {/* ========== SCANNING PULSE (analysis mode) ========== */}
      {isAnalyzing && shouldAnimate && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: globeSize * 1.05,
            height: globeSize * 1.05,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1.5px solid hsl(174 55% 52% / 0.3)',
            animation: 'scan-pulse 3s ease-out infinite',
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
