import { useEffect, useState, memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface AnimatedEarthBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * Pro Premium MAX Earth Globe - Centered Axial Rotation
 * 
 * Features:
 * - FIXED centered globe (no drifting/panning)
 * - Texture scrolls horizontally inside the circle for rotation effect
 * - Realistic depth: terminator shadow, sun highlight, atmospheric rim
 * - Idle: ~100s per rotation / Analyze: ~28s (3.5x faster)
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
  const rotationSpeed = isAnalyzing ? '28s' : '100s'; // Idle ~100s, Analyze ~28s (3.5x faster)
  
  // Visual intensity
  const globeOpacity = isAnalyzing ? 0.95 : (hasContent && !hasResults ? 0.82 : 0.88);
  const glowIntensity = analyzeTransition ? 1.4 : 1;
  
  // Globe size - responsive, cinematic
  const globeSize = 'min(85vh, 85vw)';
  
  // Generate star positions (static, memoized)
  const stars = useMemo(() => 
    Array.from({ length: 45 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.4 + Math.random() * 1.3,
      opacity: 0.1 + Math.random() * 0.35,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }))
  , []);
  
  // Particle positions for analyze state
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * 360,
      distance: 38 + (i % 3) * 5,
      size: 2 + (i % 2),
      delay: i * 0.2,
      duration: 2.5 + (i % 3) * 0.3,
      isTeal: i % 2 === 0,
    }))
  , []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ========== DEEP SPACE BACKGROUND (static) ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 130% 110% at 50% 35%, 
              hsl(215 45% 8%) 0%, 
              hsl(228 38% 6%) 35%, 
              hsl(242 32% 4%) 65%, 
              hsl(255 28% 3%) 100%
            )
          `,
        }}
      />
      
      {/* ========== STATIC STAR FIELD ========== */}
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
      
      {/* ========== CENTERED GLOBE CONTAINER (fixed position, no drift) ========== */}
      <div 
        className="absolute transition-opacity duration-700"
        style={{
          top: '50%',
          left: '50%',
          width: globeSize,
          height: globeSize,
          transform: 'translate(-50%, -55%)', // Slightly above center for better composition
          opacity: globeOpacity,
        }}
      >
        {/* Globe base - circular container */}
        <div 
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            boxShadow: `
              inset -25px -15px 50px hsl(220 45% 4% / 0.8),
              inset 15px 10px 35px hsl(200 30% 25% / 0.12)
            `,
          }}
        >
          {/* Earth texture - scrolls horizontally inside fixed circle */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${earthBgHQ})`,
              backgroundSize: '200% 100%',
              backgroundPosition: shouldAnimate ? undefined : '25% center',
              backgroundRepeat: 'repeat-x',
              animation: shouldAnimate 
                ? `globe-texture-scroll ${rotationSpeed} linear infinite` 
                : 'none',
              willChange: shouldAnimate ? 'background-position' : 'auto',
            }}
          />
          
          {/* Optional cloud layer (slightly faster rotation for depth) */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 30% 20% at 25% 30%, hsl(0 0% 100% / 0.08) 0%, transparent 70%),
                radial-gradient(ellipse 25% 15% at 60% 45%, hsl(0 0% 100% / 0.06) 0%, transparent 60%),
                radial-gradient(ellipse 35% 18% at 75% 25%, hsl(0 0% 100% / 0.07) 0%, transparent 65%),
                radial-gradient(ellipse 20% 12% at 40% 65%, hsl(0 0% 100% / 0.05) 0%, transparent 55%)
              `,
              animation: shouldAnimate 
                ? `globe-clouds-scroll ${isAnalyzing ? '22s' : '85s'} linear infinite` 
                : 'none',
              opacity: 0.7,
            }}
          />
          
          {/* Terminator shadow (night side) - right side darker */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                105deg,
                transparent 0%,
                transparent 35%,
                hsl(220 50% 5% / 0.15) 50%,
                hsl(225 55% 4% / 0.4) 65%,
                hsl(230 60% 3% / 0.7) 80%,
                hsl(235 65% 2% / 0.85) 100%
              )`,
            }}
          />
          
          {/* Sun highlight (day side) - left side brighter */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(
                ellipse 60% 70% at 20% 35%,
                hsl(45 30% 95% / 0.08) 0%,
                hsl(40 25% 90% / 0.04) 30%,
                transparent 60%
              )`,
            }}
          />
        </div>
        
        {/* Atmospheric rim glow - outer edge */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-500"
          style={{
            background: `
              radial-gradient(circle at 50% 50%, 
                transparent 42%, 
                hsl(174 50% 50% / ${0.04 * glowIntensity}) 48%, 
                hsl(174 60% 48% / ${0.1 * glowIntensity}) 50%, 
                hsl(190 55% 45% / ${0.06 * glowIntensity}) 52%, 
                transparent 55%
              )
            `,
            boxShadow: isAnalyzing 
              ? `
                0 0 60px hsl(174 55% 50% / 0.25),
                0 0 120px hsl(174 50% 45% / 0.15),
                0 0 200px hsl(190 45% 42% / 0.08)
              `
              : `
                0 0 40px hsl(174 50% 48% / 0.15),
                0 0 80px hsl(174 45% 45% / 0.08),
                0 0 140px hsl(190 40% 40% / 0.04)
              `,
          }}
        />
        
        {/* Inner atmospheric scatter */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(
              circle at 30% 30%,
              hsl(200 45% 60% / 0.04) 0%,
              transparent 40%
            )`,
          }}
        />
      </div>
      
      {/* ========== ANALYZE STATE: WORLD SEARCH OVERLAYS ========== */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ 
          opacity: analyzeTransition && shouldAnimate ? 1 : 0,
        }}
      >
        {/* Radar sweep - rotates around the globe */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 1.15)`,
            height: `calc(${globeSize} * 1.15)`,
            transform: 'translate(-50%, -55%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 0deg, 
              transparent 0%, 
              transparent 78%, 
              hsl(174 60% 50% / 0.1) 85%, 
              hsl(174 70% 55% / 0.2) 92%, 
              hsl(174 75% 58% / 0.06) 97%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-globe 4s linear infinite' : 'none',
          }}
        />
        
        {/* Secondary sweep (counter-rotate) */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 1.08)`,
            height: `calc(${globeSize} * 1.08)`,
            transform: 'translate(-50%, -55%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 180deg, 
              transparent 0%, 
              transparent 82%, 
              hsl(200 50% 50% / 0.06) 89%, 
              hsl(200 60% 55% / 0.12) 95%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-globe-reverse 5.5s linear infinite' : 'none',
            opacity: 0.6,
          }}
        />
        
        {/* Faint grid overlay on globe */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: globeSize,
            height: globeSize,
            transform: 'translate(-50%, -55%)',
            borderRadius: '50%',
            backgroundImage: `
              linear-gradient(0deg, hsl(174 40% 55% / 0.03) 1px, transparent 1px),
              linear-gradient(90deg, hsl(174 40% 55% / 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '8% 8%',
            animation: isAnalyzing && shouldAnimate ? 'grid-pulse 2.5s ease-in-out infinite' : 'none',
            maskImage: 'radial-gradient(circle, white 35%, transparent 50%)',
            WebkitMaskImage: 'radial-gradient(circle, white 35%, transparent 50%)',
          }}
        />
        
        {/* Network arcs - on globe surface */}
        <svg 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: globeSize,
            height: globeSize,
            transform: 'translate(-50%, -55%)',
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Arc 1 */}
          <path
            d="M 22 50 Q 50 20 78 50"
            fill="none"
            stroke="hsl(174 70% 55%)"
            strokeWidth="0.4"
            strokeLinecap="round"
            strokeDasharray="2 3"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3s ease-in-out infinite' : 'none',
            }}
          />
          {/* Arc 2 */}
          <path
            d="M 28 65 Q 50 40 72 62"
            fill="none"
            stroke="hsl(200 55% 55%)"
            strokeWidth="0.3"
            strokeLinecap="round"
            strokeDasharray="1.5 2.5"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3.5s ease-in-out infinite' : 'none',
              animationDelay: '1s',
            }}
          />
          {/* Arc 3 */}
          <path
            d="M 30 38 Q 45 28 60 40"
            fill="none"
            stroke="hsl(174 55% 52%)"
            strokeWidth="0.25"
            strokeLinecap="round"
            strokeDasharray="1 2"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 2.8s ease-in-out infinite' : 'none',
              animationDelay: '1.8s',
            }}
          />
          
          {/* Node points */}
          <circle cx="22" cy="50" r="1.2" fill="hsl(174 70% 60%)" opacity="0.5" />
          <circle cx="78" cy="50" r="1.2" fill="hsl(174 70% 60%)" opacity="0.5" />
          <circle cx="28" cy="65" r="1" fill="hsl(200 55% 58%)" opacity="0.4" />
          <circle cx="72" cy="62" r="1" fill="hsl(200 55% 58%)" opacity="0.4" />
        </svg>
        
        {/* Orbiting particles */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: globeSize,
            height: globeSize,
            transform: 'translate(-50%, -55%)',
          }}
        >
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.isTeal ? 'hsl(174 65% 58%)' : 'hsl(200 55% 55%)',
                boxShadow: `0 0 ${p.size * 2}px ${p.isTeal ? 'hsl(174 60% 52%)' : 'hsl(200 50% 50%)'}`,
                top: '50%',
                left: '50%',
                transform: `rotate(${p.angle}deg) translateY(-${p.distance}%) rotate(-${p.angle}deg)`,
                animation: isAnalyzing && shouldAnimate 
                  ? `particle-orbit ${p.duration}s ease-in-out infinite` 
                  : 'none',
                animationDelay: `${p.delay}s`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
        
        {/* Scan pulse rings */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 0.6)`,
            height: `calc(${globeSize} * 0.6)`,
            transform: 'translate(-50%, -55%)',
            borderRadius: '50%',
            border: '1px solid hsl(174 50% 50% / 0.18)',
            animation: isAnalyzing && shouldAnimate ? 'scan-pulse-ring 2.5s ease-out infinite' : 'none',
          }}
        />
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: `calc(${globeSize} * 0.6)`,
            height: `calc(${globeSize} * 0.6)`,
            transform: 'translate(-50%, -55%)',
            borderRadius: '50%',
            border: '1px solid hsl(200 45% 52% / 0.12)',
            animation: isAnalyzing && shouldAnimate ? 'scan-pulse-ring 2.5s ease-out infinite' : 'none',
            animationDelay: '1.25s',
          }}
        />
      </div>
      
      {/* ========== VIGNETTES FOR DEPTH & READABILITY ========== */}
      
      {/* Top fade */}
      <div 
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '35%',
          background: `linear-gradient(to bottom, 
            hsl(235 35% 5% / 0.85) 0%,
            hsl(240 32% 5% / 0.5) 40%,
            transparent 100%
          )`,
        }}
      />
      
      {/* Bottom fade for text readability */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '50%',
          background: `linear-gradient(to top, 
            hsl(240 30% 5% / 0.98) 0%, 
            hsl(240 30% 5% / 0.8) 20%,
            hsl(240 30% 5% / 0.5) 45%, 
            transparent 100%
          )`,
        }}
      />
      
      {/* Radial vignette for cinematic edges */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 100% 90% at 50% 45%, 
              transparent 35%, 
              hsl(238 30% 5% / 0.3) 60%, 
              hsl(240 28% 4% / 0.6) 80%, 
              hsl(242 25% 4% / 0.8) 100%
            )
          `,
        }}
      />
      
      {/* Content dim overlay when showing results */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: hasResults 
            ? 'radial-gradient(ellipse 80% 60% at 50% 45%, hsl(235 30% 6% / 0.3) 0%, transparent 60%)'
            : 'none',
          opacity: hasResults ? 1 : 0,
        }}
      />
    </div>
  );
});

AnimatedEarthBackground.displayName = 'AnimatedEarthBackground';