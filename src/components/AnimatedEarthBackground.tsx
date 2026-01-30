import { useEffect, useState, memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface AnimatedEarthBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * Pro Premium MAX Earth Background - Full Bleed Edition
 * 
 * Features:
 * - FULL-BLEED background (no circular mask, no hard edges)
 * - Soft gradient vignettes for cinematic depth
 * - Seamless horizontal pan animation
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
      const timer = setTimeout(() => setAnalyzeTransition(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnalyzeTransition(false);
    }
  }, [isAnalyzing]);
  
  // Animation control
  const shouldAnimate = !prefersReducedMotion && isVisible;
  const animationSpeed = isAnalyzing ? '28s' : '100s';
  
  // Intensity levels
  const globeOpacity = isAnalyzing ? 0.92 : (hasContent && !hasResults ? 0.78 : 0.85);
  const glowIntensity = analyzeTransition ? 1.4 : 1;
  
  // Generate star positions (memoized)
  const stars = useMemo(() => 
    Array.from({ length: 35 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.2,
      opacity: 0.12 + Math.random() * 0.35,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
    }))
  , []);
  
  // Particle positions for analyze state
  const particles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      x: 20 + (i * 8) % 60,
      y: 25 + (i * 9) % 40,
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
      {/* ========== DEEP SPACE BASE (full viewport) ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 150% 130% at 50% 15%, 
              hsl(210 50% 8%) 0%, 
              hsl(225 40% 6%) 30%, 
              hsl(240 35% 5%) 55%, 
              hsl(250 30% 4%) 75%,
              hsl(260 25% 3%) 100%
            )
          `,
        }}
      />
      
      {/* ========== FULL-BLEED EARTH BACKGROUND (no circular mask) ========== */}
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: globeOpacity,
          filter: `brightness(${hasContent && !isAnalyzing && !hasResults ? 0.9 : 1}) contrast(1.08) saturate(1.1)`,
        }}
      >
        {/* Earth panorama - full viewport, seamless horizontal pan */}
        <div 
          className="absolute"
          style={{
            top: '-20%',
            left: '-10%',
            right: '-10%',
            bottom: '-20%',
            backgroundImage: `url(${earthBgHQ})`,
            backgroundSize: '200% auto',
            backgroundPosition: shouldAnimate ? undefined : '25% 55%',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate 
              ? `earth-pan-seamless ${animationSpeed} linear infinite` 
              : 'none',
            willChange: shouldAnimate ? 'background-position' : 'auto',
          }}
        />
        
        {/* Atmospheric color overlay - teal/cyan tint */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 50% 30%,
                hsl(174 50% 45% / ${0.08 * glowIntensity}) 0%,
                hsl(190 45% 40% / ${0.05 * glowIntensity}) 40%,
                transparent 70%
              )
            `,
          }}
        />
      </div>
      
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
      
      {/* ========== SOFT TOP VIGNETTE (feathered fade to space) ========== */}
      <div 
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '45%',
          background: `linear-gradient(to bottom, 
            hsl(235 35% 5% / 0.95) 0%,
            hsl(240 32% 5% / 0.75) 20%,
            hsl(245 30% 5% / 0.45) 45%,
            hsl(250 28% 5% / 0.2) 70%,
            transparent 100%
          )`,
        }}
      />
      
      {/* ========== SOFT SIDE VIGNETTES ========== */}
      <div 
        className="absolute inset-y-0 left-0 pointer-events-none"
        style={{
          width: '25%',
          background: `linear-gradient(to right, 
            hsl(240 30% 4% / 0.7) 0%,
            hsl(240 30% 4% / 0.3) 50%,
            transparent 100%
          )`,
        }}
      />
      <div 
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{
          width: '25%',
          background: `linear-gradient(to left, 
            hsl(240 30% 4% / 0.7) 0%,
            hsl(240 30% 4% / 0.3) 50%,
            transparent 100%
          )`,
        }}
      />
      
      {/* ========== ATMOSPHERIC GLOW LAYER ========== */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: isAnalyzing
            ? `radial-gradient(ellipse 100% 80% at 50% 40%,
                hsl(174 55% 50% / 0.12) 0%,
                hsl(190 50% 45% / 0.06) 30%,
                transparent 60%
              )`
            : `radial-gradient(ellipse 100% 80% at 50% 40%,
                hsl(174 50% 48% / 0.06) 0%,
                hsl(190 45% 42% / 0.03) 30%,
                transparent 55%
              )`,
        }}
      />
      
      {/* ========== ANALYZE STATE: WORLD SEARCH OVERLAYS ========== */}
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
            width: '90vmax',
            height: '90vmax',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 0deg, 
              transparent 0%, 
              transparent 80%, 
              hsl(174 60% 50% / 0.1) 87%, 
              hsl(174 70% 55% / 0.18) 93%, 
              hsl(174 75% 58% / 0.06) 97%, 
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
            width: '80vmax',
            height: '80vmax',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 180deg, 
              transparent 0%, 
              transparent 84%, 
              hsl(200 50% 50% / 0.06) 90%, 
              hsl(200 60% 55% / 0.12) 96%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-center-reverse 6s linear infinite' : 'none',
            opacity: 0.5,
          }}
        />
        
        {/* Latitude/longitude grid overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, hsl(174 40% 55% / 0.02) 1px, transparent 1px),
              linear-gradient(90deg, hsl(174 40% 55% / 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '5% 5%',
            animation: isAnalyzing && shouldAnimate ? 'grid-pulse 2.5s ease-in-out infinite' : 'none',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, white 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, white 20%, transparent 70%)',
          }}
        />
        
        {/* Network intelligence arcs */}
        <svg 
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Arc 1: Long intercontinental */}
          <path
            d="M 15 55 Q 50 20 85 50"
            fill="none"
            stroke="hsl(174 70% 55%)"
            strokeWidth="0.25"
            strokeLinecap="round"
            strokeDasharray="1.5 3"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3.2s ease-in-out infinite' : 'none',
            }}
          />
          {/* Arc 2: Medium route */}
          <path
            d="M 25 70 Q 50 42 80 65"
            fill="none"
            stroke="hsl(200 55% 55%)"
            strokeWidth="0.2"
            strokeLinecap="round"
            strokeDasharray="1 2.5"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3.8s ease-in-out infinite' : 'none',
              animationDelay: '1.2s',
            }}
          />
          {/* Arc 3: Short regional */}
          <path
            d="M 20 40 Q 38 28 55 42"
            fill="none"
            stroke="hsl(174 55% 52%)"
            strokeWidth="0.18"
            strokeLinecap="round"
            strokeDasharray="0.8 2"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3s ease-in-out infinite' : 'none',
              animationDelay: '2s',
            }}
          />
          
          {/* Node points */}
          <circle cx="15" cy="55" r="0.6" fill="hsl(174 70% 60%)" opacity="0.4" />
          <circle cx="85" cy="50" r="0.6" fill="hsl(174 70% 60%)" opacity="0.4" />
          <circle cx="25" cy="70" r="0.5" fill="hsl(200 55% 58%)" opacity="0.35" />
          <circle cx="80" cy="65" r="0.5" fill="hsl(200 55% 58%)" opacity="0.35" />
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
                background: p.isTeal ? 'hsl(174 65% 58%)' : 'hsl(200 55% 55%)',
                boxShadow: `0 0 ${p.size * 2}px ${p.isTeal ? 'hsl(174 60% 52%)' : 'hsl(200 50% 50%)'}`,
                top: `${p.y}%`,
                left: `${p.x}%`,
                animation: isAnalyzing && shouldAnimate 
                  ? `particle-float ${p.duration}s ease-in-out infinite` 
                  : 'none',
                animationDelay: `${p.delay}s`,
                opacity: 0.45,
              }}
            />
          ))}
        </div>
        
        {/* Expanding scan pulse rings */}
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: '50vmax',
            height: '50vmax',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px solid hsl(174 50% 50% / 0.15)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring-center 2.8s ease-out infinite' : 'none',
          }}
        />
        <div 
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            width: '50vmax',
            height: '50vmax',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px solid hsl(200 45% 52% / 0.1)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring-center 2.8s ease-out infinite' : 'none',
            animationDelay: '1.4s',
          }}
        />
      </div>
      
      {/* ========== SOFT BOTTOM VIGNETTE (text readability) ========== */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '55%',
          background: `linear-gradient(to top, 
            hsl(240 30% 5% / 0.98) 0%, 
            hsl(240 30% 5% / 0.85) 15%,
            hsl(240 30% 5% / 0.6) 35%,
            hsl(240 30% 5% / 0.3) 55%, 
            transparent 100%
          )`,
        }}
      />
      
      {/* ========== RADIAL VIGNETTE (soft cinematic edges) ========== */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 40%, 
              transparent 30%, 
              hsl(238 30% 5% / 0.2) 55%, 
              hsl(240 28% 4% / 0.45) 75%, 
              hsl(242 25% 4% / 0.7) 100%
            )
          `,
        }}
      />
      
      {/* Content dim overlay when showing results */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: hasResults 
            ? 'radial-gradient(ellipse 90% 70% at 50% 50%, hsl(235 30% 6% / 0.25) 0%, transparent 65%)'
            : 'none',
          opacity: hasResults ? 1 : 0,
        }}
      />
    </div>
  );
});

AnimatedEarthBackground.displayName = 'AnimatedEarthBackground';