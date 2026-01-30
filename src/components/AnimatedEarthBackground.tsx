import { useEffect, useState, memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface AnimatedEarthBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * Pro Premium MAX Earth Globe Background
 * 
 * Features:
 * - Cinematic "far camera" framing (smaller Earth, more space)
 * - Premium atmospheric rim glow with teal/cyan palette
 * - Idle: Ultra-slow rotation (~100s per cycle)
 * - Analyze: 3-4x faster + radar sweep + grid + network arcs + particles
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
      // Slight delay for smooth intensity ramp
      const timer = setTimeout(() => setAnalyzeTransition(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnalyzeTransition(false);
    }
  }, [isAnalyzing]);
  
  // Animation control
  const shouldAnimate = !prefersReducedMotion && isVisible;
  const animationSpeed = isAnalyzing ? '28s' : '100s'; // ~100s idle, ~28s analyze (3.5x faster)
  
  // Intensity levels
  const globeOpacity = isAnalyzing ? 0.88 : (hasContent && !hasResults ? 0.75 : 0.82);
  const glowIntensity = analyzeTransition ? 1.3 : 1;
  
  // Generate star positions (memoized for performance)
  const stars = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.4,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
    }))
  , []);
  
  // Particle positions for analyze state
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: 15 + (i * 7) % 70,
      y: 20 + (i * 11) % 45,
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
      {/* ========== DEEP SPACE BASE ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 140% 120% at 50% 20%, 
              hsl(215 45% 7%) 0%, 
              hsl(230 35% 5%) 40%, 
              hsl(245 30% 4%) 70%, 
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
      
      {/* ========== EARTH GLOBE (CINEMATIC FAR FRAME) ========== */}
      <div 
        className="absolute transition-all duration-700 ease-out"
        style={{
          // Positioned higher and smaller for "global overview" feel
          top: '15%',
          left: '50%',
          width: '95vmax',  // Smaller = more cinematic, global feel
          height: '95vmax',
          transform: 'translate(-50%, -20%)',
          opacity: globeOpacity,
          filter: `brightness(${hasContent && !isAnalyzing && !hasResults ? 0.92 : 1}) contrast(1.05)`,
        }}
      >
        {/* Globe surface with horizontal pan */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            boxShadow: `
              inset -30px -20px 60px hsl(220 40% 3% / 0.7),
              inset 20px 15px 40px hsl(200 30% 20% / 0.15)
            `,
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${earthBgHQ})`,
              backgroundSize: '300% 100%',
              backgroundPosition: shouldAnimate ? undefined : '33% center',
              backgroundRepeat: 'repeat-x',
              animation: shouldAnimate 
                ? `globe-pan-left ${animationSpeed} linear infinite` 
                : 'none',
              willChange: shouldAnimate ? 'background-position' : 'auto',
            }}
          />
        </div>
        
        {/* Multi-layer atmospheric rim glow */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-500"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, 
                transparent 40%, 
                hsl(174 55% 50% / ${0.06 * glowIntensity}) 50%, 
                hsl(174 65% 45% / ${0.12 * glowIntensity}) 60%, 
                hsl(190 55% 40% / ${0.08 * glowIntensity}) 75%, 
                transparent 100%
              )
            `,
            boxShadow: isAnalyzing 
              ? `
                inset 0 0 100px hsl(174 60% 50% / 0.15),
                0 0 80px hsl(174 55% 48% / 0.3),
                0 0 150px hsl(174 50% 45% / 0.2),
                0 0 250px hsl(190 45% 40% / 0.12)
              `
              : `
                inset 0 0 70px hsl(174 55% 50% / 0.1),
                0 0 50px hsl(174 50% 45% / 0.18),
                0 0 100px hsl(190 45% 40% / 0.1),
                0 0 180px hsl(200 40% 35% / 0.06)
              `,
          }}
        />
        
        {/* Subtle fresnel rim light (edge highlight) */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 70% 30%, transparent 60%, hsl(200 50% 70% / 0.06) 75%, hsl(200 40% 60% / 0.1) 90%, transparent 100%)',
          }}
        />
      </div>
      
      {/* ========== ANALYZE STATE: WORLD SEARCH OVERLAYS ========== */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: analyzeTransition && shouldAnimate ? 1 : 0 }}
      >
        {/* Primary radar sweep */}
        <div 
          className="absolute"
          style={{
            top: '12%',
            left: '50%',
            width: '70vmax',
            height: '70vmax',
            transform: 'translate(-50%, -15%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 0deg, 
              transparent 0%, 
              transparent 82%, 
              hsl(174 65% 50% / 0.12) 88%, 
              hsl(174 75% 55% / 0.22) 94%, 
              hsl(174 80% 58% / 0.08) 98%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep 4s linear infinite' : 'none',
          }}
        />
        
        {/* Secondary sweep (counter-rotate, subtle) */}
        <div 
          className="absolute"
          style={{
            top: '14%',
            left: '50%',
            width: '65vmax',
            height: '65vmax',
            transform: 'translate(-50%, -15%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 180deg, 
              transparent 0%, 
              transparent 86%, 
              hsl(200 55% 50% / 0.08) 92%, 
              hsl(200 65% 55% / 0.14) 97%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-reverse 5.5s linear infinite' : 'none',
            opacity: 0.6,
          }}
        />
        
        {/* Latitude/longitude grid overlay */}
        <div 
          className="absolute"
          style={{
            top: '12%',
            left: '50%',
            width: '75vmax',
            height: '75vmax',
            transform: 'translate(-50%, -15%)',
            borderRadius: '50%',
            backgroundImage: `
              linear-gradient(0deg, hsl(174 45% 55% / 0.025) 1px, transparent 1px),
              linear-gradient(90deg, hsl(174 45% 55% / 0.025) 1px, transparent 1px)
            `,
            backgroundSize: '6% 6%',
            animation: isAnalyzing && shouldAnimate ? 'grid-pulse 2.5s ease-in-out infinite' : 'none',
            maskImage: 'radial-gradient(circle, white 40%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, white 40%, transparent 70%)',
          }}
        />
        
        {/* Network intelligence arcs */}
        <svg 
          className="absolute"
          style={{
            top: '8%',
            left: '50%',
            width: '60vmax',
            height: '60vmax',
            transform: 'translate(-50%, -10%)',
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Arc 1: Long intercontinental */}
          <path
            d="M 18 52 Q 50 12 82 48"
            fill="none"
            stroke="hsl(174 70% 55%)"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="2 4"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3s ease-in-out infinite' : 'none',
            }}
          />
          {/* Arc 2: Medium route */}
          <path
            d="M 28 68 Q 52 38 78 62"
            fill="none"
            stroke="hsl(200 60% 55%)"
            strokeWidth="0.28"
            strokeLinecap="round"
            strokeDasharray="1.5 3"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3.5s ease-in-out infinite' : 'none',
              animationDelay: '1s',
            }}
          />
          {/* Arc 3: Short regional */}
          <path
            d="M 22 38 Q 40 22 58 42"
            fill="none"
            stroke="hsl(174 55% 52%)"
            strokeWidth="0.22"
            strokeLinecap="round"
            strokeDasharray="1 2"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 2.8s ease-in-out infinite' : 'none',
              animationDelay: '1.8s',
            }}
          />
          
          {/* Node points at arc endpoints */}
          <circle cx="18" cy="52" r="1" fill="hsl(174 70% 60%)" opacity="0.5" />
          <circle cx="82" cy="48" r="1" fill="hsl(174 70% 60%)" opacity="0.5" />
          <circle cx="28" cy="68" r="0.8" fill="hsl(200 60% 58%)" opacity="0.4" />
          <circle cx="78" cy="62" r="0.8" fill="hsl(200 60% 58%)" opacity="0.4" />
        </svg>
        
        {/* Floating scan particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.isTeal ? 'hsl(174 70% 60%)' : 'hsl(200 60% 58%)',
                boxShadow: `0 0 ${p.size * 2}px ${p.isTeal ? 'hsl(174 65% 55%)' : 'hsl(200 55% 52%)'}`,
                top: `${p.y}%`,
                left: `${p.x}%`,
                animation: isAnalyzing && shouldAnimate 
                  ? `particle-float ${p.duration}s ease-in-out infinite` 
                  : 'none',
                animationDelay: `${p.delay}s`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
        
        {/* Expanding scan pulse rings */}
        <div 
          className="absolute"
          style={{
            top: '25%',
            left: '50%',
            width: '40vmax',
            height: '40vmax',
            transform: 'translate(-50%, -15%)',
            borderRadius: '50%',
            border: '1px solid hsl(174 55% 50% / 0.18)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring 2.5s ease-out infinite' : 'none',
          }}
        />
        <div 
          className="absolute"
          style={{
            top: '25%',
            left: '50%',
            width: '40vmax',
            height: '40vmax',
            transform: 'translate(-50%, -15%)',
            borderRadius: '50%',
            border: '1px solid hsl(200 50% 52% / 0.12)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring 2.5s ease-out infinite' : 'none',
            animationDelay: '1.25s',
          }}
        />
      </div>
      
      {/* ========== CINEMATIC OVERLAYS ========== */}
      
      {/* Premium multi-stop vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 110% 90% at 50% 25%, 
              transparent 25%, 
              hsl(235 30% 6% / 0.25) 50%, 
              hsl(240 30% 5% / 0.55) 70%, 
              hsl(245 28% 4% / 0.85) 100%
            )
          `,
        }}
      />
      
      {/* Filmic contrast overlay (very subtle) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(220 30% 8% / 0.15) 0%, transparent 30%, transparent 70%, hsl(240 25% 5% / 0.25) 100%)',
        }}
      />
      
      {/* Bottom fade for text readability */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '50%',
          background: `linear-gradient(to top, 
            hsl(240 30% 5% / 0.95) 0%, 
            hsl(240 30% 5% / 0.7) 25%,
            hsl(240 30% 5% / 0.35) 50%, 
            transparent 100%
          )`,
        }}
      />
      
      {/* Content area subtle blur/dim (behind text panels) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: hasResults 
            ? 'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(235 30% 6% / 0.3) 0%, transparent 70%)'
            : 'none',
          opacity: hasResults ? 1 : 0,
        }}
      />
    </div>
  );
});

AnimatedEarthBackground.displayName = 'AnimatedEarthBackground';