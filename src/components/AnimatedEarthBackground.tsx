import { useEffect, useState, memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface AnimatedEarthBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * Centered Globe with Axial Rotation (Plan B)
 * 
 * Implementation:
 * - Full circular globe, fixed in viewport center
 * - Equirectangular texture with repeat-x
 * - Rotation via background-position animation (seamless loop)
 * - All continents visible over one full rotation cycle
 */
export const AnimatedEarthBackground = memo(({ 
  isAnalyzing, 
  hasContent, 
  hasResults 
}: AnimatedEarthBackgroundProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [analyzeTransition, setAnalyzeTransition] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  
  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => setAnalyzeTransition(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnalyzeTransition(false);
    }
  }, [isAnalyzing]);
  
  const shouldAnimate = !prefersReducedMotion && isVisible;
  const rotationSpeed = isAnalyzing ? '25s' : '90s';
  
  const globeOpacity = isAnalyzing ? 0.95 : (hasContent && !hasResults ? 0.8 : 0.88);
  const glowIntensity = analyzeTransition ? 1.5 : 1;
  
  // Globe sizing - large centered sphere
  const globeSize = 'min(75vh, 75vw)';
  
  const stars = useMemo(() => 
    Array.from({ length: 45 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.4 + Math.random() * 1.4,
      opacity: 0.12 + Math.random() * 0.4,
      delay: Math.random() * 5,
      duration: 2.5 + Math.random() * 4,
    }))
  , []);
  
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * 360,
      distance: 38 + (i % 3) * 6,
      size: 2 + (i % 3),
      delay: i * 0.15,
      duration: 2.2 + (i % 4) * 0.4,
      isTeal: i % 2 === 0,
    }))
  , []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ========== DEEP SPACE ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 140% 120% at 50% 50%, 
              hsl(215 45% 7%) 0%, 
              hsl(225 40% 5%) 30%, 
              hsl(235 35% 4%) 55%, 
              hsl(245 30% 3%) 80%,
              hsl(255 25% 2%) 100%
            )
          `,
        }}
      />
      
      {/* ========== STAR FIELD ========== */}
      <div className="absolute inset-0">
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
              animation: shouldAnimate 
                ? `star-twinkle ${star.duration}s ease-in-out infinite`
                : 'none',
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* ========== CENTERED GLOBE ========== */}
      <div 
        className="absolute transition-opacity duration-700"
        style={{
          top: '50%',
          left: '50%',
          width: globeSize,
          height: globeSize,
          transform: 'translate(-50%, -50%)',
          opacity: globeOpacity,
        }}
      >
        {/* Globe sphere container */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            boxShadow: `
              inset -25px -15px 50px hsl(220 45% 4% / 0.8),
              inset 15px 10px 40px hsl(174 50% 50% / ${0.06 * glowIntensity}),
              0 0 60px hsl(174 55% 48% / ${0.12 * glowIntensity}),
              0 0 120px hsl(200 45% 42% / ${0.06 * glowIntensity})
            `,
          }}
        >
          {/* Rotating equirectangular texture - background-position animation */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${earthBgHQ})`,
              backgroundSize: '200% 100%',
              backgroundRepeat: 'repeat-x',
              backgroundPosition: '0% 50%',
              animation: shouldAnimate 
                ? `globe-rotate-texture ${rotationSpeed} linear infinite` 
                : 'none',
              willChange: shouldAnimate ? 'background-position' : 'auto',
              filter: 'brightness(1.08) contrast(1.12) saturate(1.18)',
            }}
          />
          
          {/* Spherical depth shading */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(circle at 38% 32%,
                  transparent 0%,
                  transparent 40%,
                  hsl(220 50% 6% / 0.35) 60%,
                  hsl(230 45% 5% / 0.65) 78%,
                  hsl(240 40% 4% / 0.88) 100%
                )
              `,
            }}
          />
          
          {/* Atmospheric rim light */}
          <div 
            className="absolute inset-0 rounded-full transition-opacity duration-500"
            style={{
              background: `
                radial-gradient(circle at 50% 50%,
                  transparent 40%,
                  hsl(174 55% 55% / ${0.05 * glowIntensity}) 52%,
                  hsl(190 50% 52% / ${0.1 * glowIntensity}) 68%,
                  hsl(200 45% 48% / ${0.15 * glowIntensity}) 82%,
                  hsl(210 40% 42% / ${0.06 * glowIntensity}) 100%
                )
              `,
            }}
          />
          
          {/* Day/night terminator */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                linear-gradient(108deg,
                  transparent 0%,
                  transparent 45%,
                  hsl(220 45% 6% / 0.3) 52%,
                  hsl(230 40% 5% / 0.55) 62%,
                  hsl(240 35% 4% / 0.75) 78%,
                  hsl(250 30% 3% / 0.9) 100%
                )
              `,
            }}
          />
        </div>
        
        {/* Outer atmospheric halo */}
        <div 
          className="absolute rounded-full pointer-events-none transition-opacity duration-500"
          style={{
            top: '-10%',
            left: '-10%',
            width: '120%',
            height: '120%',
            background: `
              radial-gradient(circle at 50% 50%,
                transparent 38%,
                hsl(174 60% 52% / ${0.035 * glowIntensity}) 48%,
                hsl(190 55% 50% / ${0.07 * glowIntensity}) 58%,
                hsl(200 50% 46% / ${0.035 * glowIntensity}) 70%,
                transparent 82%
              )
            `,
          }}
        />
      </div>
      
      {/* ========== ANALYZE OVERLAYS ========== */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: analyzeTransition && shouldAnimate ? 1 : 0 }}
      >
        {/* Primary radar sweep */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 1.15)`,
            height: `calc(${globeSize} * 1.15)`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 0deg, 
              transparent 0%, 
              transparent 78%, 
              hsl(174 65% 52% / 0.1) 85%, 
              hsl(174 70% 55% / 0.22) 92%, 
              hsl(174 75% 58% / 0.06) 97%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-center 4s linear infinite' : 'none',
          }}
        />
        
        {/* Counter-rotating sweep */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: globeSize,
            height: globeSize,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 180deg, 
              transparent 0%, 
              transparent 82%, 
              hsl(200 55% 52% / 0.06) 88%, 
              hsl(200 60% 55% / 0.12) 95%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-center-reverse 5.5s linear infinite' : 'none',
            opacity: 0.55,
          }}
        />
        
        {/* Grid overlay */}
        <div 
          className="absolute rounded-full overflow-hidden"
          style={{
            top: '50%',
            left: '50%',
            width: globeSize,
            height: globeSize,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(0deg, hsl(174 45% 55% / 0.035) 1px, transparent 1px),
                linear-gradient(90deg, hsl(174 45% 55% / 0.035) 1px, transparent 1px)
              `,
              backgroundSize: '10% 10%',
              animation: isAnalyzing && shouldAnimate ? 'grid-pulse 2.2s ease-in-out infinite' : 'none',
            }}
          />
        </div>
        
        {/* Network arcs */}
        <svg 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: globeSize,
            height: globeSize,
            transform: 'translate(-50%, -50%)',
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M 18 48 Q 50 12 82 48"
            fill="none"
            stroke="hsl(174 70% 55%)"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="2.5 4"
            style={{ animation: isAnalyzing && shouldAnimate ? 'arc-fade 3s ease-in-out infinite' : 'none' }}
          />
          <path
            d="M 22 62 Q 50 32 78 58"
            fill="none"
            stroke="hsl(200 55% 55%)"
            strokeWidth="0.28"
            strokeLinecap="round"
            strokeDasharray="1.8 3.2"
            style={{ animation: isAnalyzing && shouldAnimate ? 'arc-fade 3.5s ease-in-out infinite' : 'none', animationDelay: '1s' }}
          />
          <path
            d="M 28 38 Q 42 22 58 36"
            fill="none"
            stroke="hsl(174 55% 52%)"
            strokeWidth="0.22"
            strokeLinecap="round"
            strokeDasharray="1.2 2.4"
            style={{ animation: isAnalyzing && shouldAnimate ? 'arc-fade 2.8s ease-in-out infinite' : 'none', animationDelay: '1.8s' }}
          />
          <circle cx="18" cy="48" r="0.9" fill="hsl(174 70% 60%)" opacity="0.45" />
          <circle cx="82" cy="48" r="0.9" fill="hsl(174 70% 60%)" opacity="0.45" />
          <circle cx="22" cy="62" r="0.7" fill="hsl(200 55% 58%)" opacity="0.38" />
          <circle cx="78" cy="58" r="0.7" fill="hsl(200 55% 58%)" opacity="0.38" />
        </svg>
        
        {/* Orbiting particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p, i) => {
            const x = 50 + Math.cos((p.angle * Math.PI) / 180) * p.distance;
            const y = 50 + Math.sin((p.angle * Math.PI) / 180) * p.distance;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.isTeal ? 'hsl(174 65% 58%)' : 'hsl(200 55% 55%)',
                  boxShadow: `0 0 ${p.size * 2.5}px ${p.isTeal ? 'hsl(174 60% 52%)' : 'hsl(200 50% 50%)'}`,
                  top: `${y}%`,
                  left: `${x}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: isAnalyzing && shouldAnimate 
                    ? `particle-float ${p.duration}s ease-in-out infinite` 
                    : 'none',
                  animationDelay: `${p.delay}s`,
                  opacity: 0.55,
                }}
              />
            );
          })}
        </div>
        
        {/* Scan rings */}
        <div 
          className="absolute rounded-full"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 0.55)`,
            height: `calc(${globeSize} * 0.55)`,
            transform: 'translate(-50%, -50%)',
            border: '1px solid hsl(174 55% 52% / 0.2)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring-center 2.5s ease-out infinite' : 'none',
          }}
        />
        <div 
          className="absolute rounded-full"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 0.55)`,
            height: `calc(${globeSize} * 0.55)`,
            transform: 'translate(-50%, -50%)',
            border: '1px solid hsl(200 50% 52% / 0.14)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring-center 2.5s ease-out infinite' : 'none',
            animationDelay: '1.25s',
          }}
        />
      </div>
      
      {/* ========== BOTTOM VIGNETTE ========== */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '45%',
          background: `linear-gradient(to top, 
            hsl(240 30% 4% / 0.95) 0%, 
            hsl(240 28% 4% / 0.75) 25%,
            hsl(240 26% 4% / 0.45) 50%,
            hsl(240 24% 4% / 0.15) 75%, 
            transparent 100%
          )`,
        }}
      />
      
      {/* Results overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: hasResults 
            ? 'radial-gradient(ellipse 85% 65% at 50% 50%, hsl(235 30% 5% / 0.35) 0%, transparent 55%)'
            : 'none',
          opacity: hasResults ? 1 : 0,
        }}
      />
    </div>
  );
});

AnimatedEarthBackground.displayName = 'AnimatedEarthBackground';
