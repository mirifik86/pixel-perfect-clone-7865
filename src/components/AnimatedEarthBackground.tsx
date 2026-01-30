import { useEffect, useState, memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface AnimatedEarthBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * Centered Globe with Axial Surface Rotation
 * 
 * Features:
 * - FULL circular globe, fixed in center (no panning/movement)
 * - Axial rotation via horizontal texture scroll (all continents visible over time)
 * - Idle: Ultra-slow rotation (~100s per full cycle)
 * - Analyze: 3-4x faster rotation + radar sweep + grid + network arcs
 * - Smooth transitions between states
 * - Respects prefers-reduced-motion
 * - Pauses when tab is hidden
 */
export const AnimatedEarthBackground = memo(({ 
  isAnalyzing, 
  hasContent, 
  hasResults 
}: AnimatedEarthBackgroundProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [analyzeTransition, setAnalyzeTransition] = useState(false);
  
  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Pause animation when tab is not visible
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  
  // Smooth transition for analyze state
  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => setAnalyzeTransition(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnalyzeTransition(false);
    }
  }, [isAnalyzing]);
  
  // Animation control
  const shouldAnimate = !prefersReducedMotion && isVisible;
  const rotationSpeed = isAnalyzing ? '28s' : '100s';
  
  // Intensity levels
  const globeOpacity = isAnalyzing ? 0.95 : (hasContent && !hasResults ? 0.82 : 0.88);
  const glowIntensity = analyzeTransition ? 1.4 : 1;
  
  // Globe sizing - responsive, centered
  const globeSize = 'min(85vh, 85vw)';
  
  // Generate star positions (memoized)
  const stars = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.2,
      opacity: 0.15 + Math.random() * 0.4,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
    }))
  , []);
  
  // Particle positions for analyze state
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      angle: (i / 10) * 360,
      distance: 35 + (i % 3) * 8,
      size: 2 + (i % 3),
      delay: i * 0.18,
      duration: 2.4 + (i % 4) * 0.35,
      isTeal: i % 2 === 0,
    }))
  , []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ========== DEEP SPACE BASE ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 150% 130% at 50% 50%, 
              hsl(210 50% 8%) 0%, 
              hsl(225 40% 6%) 25%, 
              hsl(240 35% 5%) 45%, 
              hsl(250 30% 4%) 65%,
              hsl(260 25% 3%) 100%
            )
          `,
        }}
      />
      
      {/* ========== PREMIUM STAR FIELD ========== */}
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
      
      {/* ========== CENTERED CIRCULAR GLOBE ========== */}
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
        {/* Globe container - circular with overflow hidden */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            boxShadow: `
              inset -30px -20px 60px hsl(220 40% 5% / 0.7),
              inset 20px 15px 50px hsl(174 50% 50% / ${0.08 * glowIntensity}),
              0 0 80px hsl(174 60% 45% / ${0.15 * glowIntensity}),
              0 0 150px hsl(200 50% 40% / ${0.08 * glowIntensity})
            `,
          }}
        >
          {/* Rotating texture layer - scrolls horizontally for axial rotation */}
          <div
            className="absolute"
            style={{
              top: '-5%',
              left: 0,
              width: '200%',
              height: '110%',
              backgroundImage: `url(${earthBgHQ})`,
              backgroundSize: '50% 100%',
              backgroundPosition: '0% 50%',
              backgroundRepeat: 'repeat-x',
              animation: shouldAnimate 
                ? `globe-axial-rotate ${rotationSpeed} linear infinite` 
                : 'none',
              willChange: shouldAnimate ? 'transform' : 'auto',
              filter: `brightness(1.05) contrast(1.1) saturate(1.15)`,
            }}
          />
          
          {/* Spherical shading overlay - creates 3D depth */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(circle at 35% 30%,
                  transparent 0%,
                  transparent 45%,
                  hsl(220 50% 8% / 0.3) 65%,
                  hsl(230 45% 6% / 0.6) 80%,
                  hsl(240 40% 4% / 0.85) 100%
                )
              `,
            }}
          />
          
          {/* Atmospheric rim glow */}
          <div 
            className="absolute inset-0 rounded-full transition-opacity duration-500"
            style={{
              background: `
                radial-gradient(circle at 50% 50%,
                  transparent 42%,
                  hsl(174 50% 55% / ${0.06 * glowIntensity}) 55%,
                  hsl(190 45% 50% / ${0.12 * glowIntensity}) 70%,
                  hsl(200 40% 45% / ${0.18 * glowIntensity}) 85%,
                  hsl(210 35% 40% / ${0.08 * glowIntensity}) 100%
                )
              `,
            }}
          />
          
          {/* Terminator line (day/night edge) - subtle */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                linear-gradient(105deg,
                  transparent 0%,
                  transparent 48%,
                  hsl(220 40% 8% / 0.25) 52%,
                  hsl(230 35% 6% / 0.5) 60%,
                  hsl(240 30% 5% / 0.7) 75%,
                  hsl(250 25% 4% / 0.85) 100%
                )
              `,
            }}
          />
        </div>
        
        {/* Outer atmospheric halo */}
        <div 
          className="absolute rounded-full transition-opacity duration-500"
          style={{
            top: '-8%',
            left: '-8%',
            width: '116%',
            height: '116%',
            background: `
              radial-gradient(circle at 50% 50%,
                transparent 40%,
                hsl(174 55% 50% / ${0.04 * glowIntensity}) 50%,
                hsl(190 50% 48% / ${0.08 * glowIntensity}) 60%,
                hsl(200 45% 45% / ${0.04 * glowIntensity}) 72%,
                transparent 85%
              )
            `,
            pointerEvents: 'none',
          }}
        />
      </div>
      
      {/* ========== ANALYZE STATE: WORLD SEARCH OVERLAYS ========== */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: analyzeTransition && shouldAnimate ? 1 : 0 }}
      >
        {/* Primary radar sweep - centered on globe */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 1.1)`,
            height: `calc(${globeSize} * 1.1)`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 0deg, 
              transparent 0%, 
              transparent 80%, 
              hsl(174 60% 50% / 0.12) 87%, 
              hsl(174 70% 55% / 0.2) 93%, 
              hsl(174 75% 58% / 0.08) 97%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-center 4.5s linear infinite' : 'none',
          }}
        />
        
        {/* Secondary sweep (counter-rotate) */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 0.95)`,
            height: `calc(${globeSize} * 0.95)`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 180deg, 
              transparent 0%, 
              transparent 84%, 
              hsl(200 50% 50% / 0.08) 90%, 
              hsl(200 60% 55% / 0.14) 96%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-center-reverse 6s linear infinite' : 'none',
            opacity: 0.6,
          }}
        />
        
        {/* Latitude/longitude grid overlay - constrained to globe area */}
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
                linear-gradient(0deg, hsl(174 40% 55% / 0.04) 1px, transparent 1px),
                linear-gradient(90deg, hsl(174 40% 55% / 0.04) 1px, transparent 1px)
              `,
              backgroundSize: '8% 8%',
              animation: isAnalyzing && shouldAnimate ? 'grid-pulse 2.5s ease-in-out infinite' : 'none',
            }}
          />
        </div>
        
        {/* Network intelligence arcs */}
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
          {/* Arc 1: Long intercontinental */}
          <path
            d="M 20 50 Q 50 15 80 50"
            fill="none"
            stroke="hsl(174 70% 55%)"
            strokeWidth="0.4"
            strokeLinecap="round"
            strokeDasharray="2 4"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3.2s ease-in-out infinite' : 'none',
            }}
          />
          {/* Arc 2: Medium route */}
          <path
            d="M 25 65 Q 50 35 75 60"
            fill="none"
            stroke="hsl(200 55% 55%)"
            strokeWidth="0.3"
            strokeLinecap="round"
            strokeDasharray="1.5 3"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3.8s ease-in-out infinite' : 'none',
              animationDelay: '1.2s',
            }}
          />
          {/* Arc 3: Short regional */}
          <path
            d="M 30 40 Q 45 25 60 38"
            fill="none"
            stroke="hsl(174 55% 52%)"
            strokeWidth="0.25"
            strokeLinecap="round"
            strokeDasharray="1 2"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3s ease-in-out infinite' : 'none',
              animationDelay: '2s',
            }}
          />
          
          {/* Node points */}
          <circle cx="20" cy="50" r="1" fill="hsl(174 70% 60%)" opacity="0.5" />
          <circle cx="80" cy="50" r="1" fill="hsl(174 70% 60%)" opacity="0.5" />
          <circle cx="25" cy="65" r="0.8" fill="hsl(200 55% 58%)" opacity="0.4" />
          <circle cx="75" cy="60" r="0.8" fill="hsl(200 55% 58%)" opacity="0.4" />
        </svg>
        
        {/* Floating scan particles - orbit around globe */}
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
                  boxShadow: `0 0 ${p.size * 2}px ${p.isTeal ? 'hsl(174 60% 52%)' : 'hsl(200 50% 50%)'}`,
                  top: `${y}%`,
                  left: `${x}%`,
                  transform: 'translate(-50%, -50%)',
                  animation: isAnalyzing && shouldAnimate 
                    ? `particle-float ${p.duration}s ease-in-out infinite` 
                    : 'none',
                  animationDelay: `${p.delay}s`,
                  opacity: 0.5,
                }}
              />
            );
          })}
        </div>
        
        {/* Expanding scan pulse rings - centered on globe */}
        <div 
          className="absolute rounded-full"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 0.6)`,
            height: `calc(${globeSize} * 0.6)`,
            transform: 'translate(-50%, -50%)',
            border: '1px solid hsl(174 50% 50% / 0.18)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring-center 2.8s ease-out infinite' : 'none',
          }}
        />
        <div 
          className="absolute rounded-full"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 0.6)`,
            height: `calc(${globeSize} * 0.6)`,
            transform: 'translate(-50%, -50%)',
            border: '1px solid hsl(200 45% 52% / 0.12)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring-center 2.8s ease-out infinite' : 'none',
            animationDelay: '1.4s',
          }}
        />
      </div>
      
      {/* ========== SOFT BOTTOM VIGNETTE (text readability) ========== */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '50%',
          background: `linear-gradient(to top, 
            hsl(240 30% 5% / 0.95) 0%, 
            hsl(240 30% 5% / 0.8) 20%,
            hsl(240 30% 5% / 0.5) 45%,
            hsl(240 30% 5% / 0.2) 70%, 
            transparent 100%
          )`,
        }}
      />
      
      {/* Content dim overlay when showing results */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: hasResults 
            ? 'radial-gradient(ellipse 90% 70% at 50% 50%, hsl(235 30% 6% / 0.3) 0%, transparent 60%)'
            : 'none',
          opacity: hasResults ? 1 : 0,
        }}
      />
    </div>
  );
});

AnimatedEarthBackground.displayName = 'AnimatedEarthBackground';
