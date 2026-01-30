import { useEffect, useState, memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface AnimatedEarthBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * Pro Premium MAX Earth Background - Centered Axial Rotation Edition
 * 
 * Features:
 * - CENTERED GLOBE fixed in place (no drift/pan)
 * - Axial rotation via horizontal texture animation inside the globe
 * - Terminator shadow (night side), specular highlight, atmospheric rim glow
 * - Optional cloud layer rotating slightly faster
 * - Static starfield in deep space background
 * - Idle: 90-120s per rotation | Analyze: 3-4x faster
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
  const cloudSpeed = isAnalyzing ? '22s' : '85s'; // Clouds slightly faster
  
  // Intensity levels
  const globeOpacity = isAnalyzing ? 0.95 : (hasContent && !hasResults ? 0.82 : 0.88);
  const glowIntensity = analyzeTransition ? 1.5 : 1;
  
  // Globe sizing - "far camera" cinematic look
  const globeSize = 'min(75vw, 75vh, 480px)';
  
  // Generate star positions (memoized) - outside globe area
  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.4 + Math.random() * 1.3,
      opacity: 0.1 + Math.random() * 0.4,
      delay: Math.random() * 5,
      duration: 2.5 + Math.random() * 4,
    }))
  , []);
  
  // Particle positions for analyze state
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * 360,
      distance: 52 + (i % 3) * 8,
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
            radial-gradient(ellipse 140% 120% at 50% 35%, 
              hsl(215 45% 7%) 0%, 
              hsl(225 40% 5%) 25%, 
              hsl(238 35% 4%) 50%, 
              hsl(250 30% 3%) 75%,
              hsl(260 25% 2%) 100%
            )
          `,
        }}
      />
      
      {/* ========== STATIC STARFIELD ========== */}
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
      
      {/* ========== CENTERED GLOBE CONTAINER ========== */}
      <div
        className="absolute transition-all duration-700"
        style={{
          left: '50%',
          top: '48%',
          width: globeSize,
          height: globeSize,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          overflow: 'hidden',
          opacity: globeOpacity,
        }}
      >
        {/* ===== EARTH SURFACE TEXTURE (axial rotation) ===== */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${earthBgHQ})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% center',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate 
              ? `globe-axial-rotate ${rotationSpeed} linear infinite` 
              : 'none',
            willChange: shouldAnimate ? 'background-position' : 'auto',
            filter: 'contrast(1.08) saturate(1.12)',
          }}
        />
        
        {/* ===== CLOUD LAYER (slightly faster rotation) ===== */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${earthBgHQ})`,
            backgroundSize: '200% 100%',
            backgroundPosition: '50% center',
            backgroundRepeat: 'repeat-x',
            animation: shouldAnimate 
              ? `globe-axial-rotate ${cloudSpeed} linear infinite` 
              : 'none',
            opacity: 0.12,
            mixBlendMode: 'overlay',
            filter: 'blur(2px) brightness(1.4)',
          }}
        />
        
        {/* ===== TERMINATOR SHADOW (night side) ===== */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              105deg,
              transparent 0%,
              transparent 35%,
              hsl(230 40% 8% / 0.3) 45%,
              hsl(230 45% 5% / 0.6) 55%,
              hsl(235 50% 3% / 0.85) 70%,
              hsl(240 50% 2% / 0.95) 100%
            )`,
          }}
        />
        
        {/* ===== SPECULAR HIGHLIGHT ===== */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              ellipse 40% 50% at 28% 32%,
              hsl(200 30% 90% / 0.15) 0%,
              hsl(200 25% 85% / 0.06) 40%,
              transparent 70%
            )`,
          }}
        />
        
        {/* ===== ATMOSPHERIC RIM GLOW (teal/cyan) ===== */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            boxShadow: `
              inset 0 0 ${40 * glowIntensity}px hsl(174 60% 50% / ${0.25 * glowIntensity}),
              inset 0 0 ${80 * glowIntensity}px hsl(190 55% 45% / ${0.15 * glowIntensity}),
              inset 0 0 ${120 * glowIntensity}px hsl(200 50% 40% / ${0.08 * glowIntensity})
            `,
            borderRadius: '50%',
          }}
        />
        
        {/* ===== OUTER RIM GLOW (atmosphere edge) ===== */}
        <div 
          className="absolute pointer-events-none transition-all duration-500"
          style={{
            inset: '-4%',
            borderRadius: '50%',
            boxShadow: `
              0 0 ${50 * glowIntensity}px hsl(174 65% 55% / ${0.3 * glowIntensity}),
              0 0 ${100 * glowIntensity}px hsl(190 60% 48% / ${0.18 * glowIntensity}),
              0 0 ${150 * glowIntensity}px hsl(200 55% 42% / ${0.08 * glowIntensity})
            `,
          }}
        />
        
        {/* ===== FRESNEL EDGE HIGHLIGHT ===== */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: '50%',
            border: `2px solid hsl(174 50% 60% / ${0.2 * glowIntensity})`,
            boxShadow: `inset 0 0 20px hsl(174 45% 55% / ${0.1 * glowIntensity})`,
          }}
        />
      </div>
      
      {/* ========== ANALYZE STATE: WORLD SEARCH OVERLAYS ========== */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: analyzeTransition && shouldAnimate ? 1 : 0 }}
      >
        {/* Centered radar sweep */}
        <div 
          className="absolute"
          style={{
            top: '48%',
            left: '50%',
            width: `calc(${globeSize} * 1.1)`,
            height: `calc(${globeSize} * 1.1)`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 0deg, 
              transparent 0%, 
              transparent 75%, 
              hsl(174 60% 50% / 0.12) 85%, 
              hsl(174 70% 55% / 0.22) 93%, 
              hsl(174 75% 58% / 0.08) 97%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-center 4s linear infinite' : 'none',
          }}
        />
        
        {/* Secondary sweep (counter-rotate) */}
        <div 
          className="absolute"
          style={{
            top: '48%',
            left: '50%',
            width: `calc(${globeSize} * 0.95)`,
            height: `calc(${globeSize} * 0.95)`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `conic-gradient(
              from 180deg, 
              transparent 0%, 
              transparent 80%, 
              hsl(200 50% 50% / 0.08) 88%, 
              hsl(200 60% 55% / 0.15) 95%, 
              transparent 100%
            )`,
            animation: isAnalyzing && shouldAnimate ? 'radar-sweep-center-reverse 5.5s linear infinite' : 'none',
            opacity: 0.6,
          }}
        />
        
        {/* Latitude/longitude grid overlay (inside globe) */}
        <div 
          className="absolute"
          style={{
            top: '48%',
            left: '50%',
            width: globeSize,
            height: globeSize,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(0deg, hsl(174 45% 55% / 0.04) 1px, transparent 1px),
                linear-gradient(90deg, hsl(174 45% 55% / 0.04) 1px, transparent 1px)
              `,
              backgroundSize: '10% 10%',
              animation: isAnalyzing && shouldAnimate ? 'grid-pulse 2.2s ease-in-out infinite' : 'none',
            }}
          />
        </div>
        
        {/* Network intelligence arcs (around globe) */}
        <svg 
          className="absolute"
          style={{
            top: '48%',
            left: '50%',
            width: `calc(${globeSize} * 1.4)`,
            height: `calc(${globeSize} * 1.4)`,
            transform: 'translate(-50%, -50%)',
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Arc 1 */}
          <path
            d="M 20 55 Q 50 15 80 50"
            fill="none"
            stroke="hsl(174 70% 55%)"
            strokeWidth="0.35"
            strokeLinecap="round"
            strokeDasharray="2 4"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3s ease-in-out infinite' : 'none',
            }}
          />
          {/* Arc 2 */}
          <path
            d="M 25 72 Q 50 40 78 68"
            fill="none"
            stroke="hsl(200 55% 55%)"
            strokeWidth="0.28"
            strokeLinecap="round"
            strokeDasharray="1.5 3.5"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 3.5s ease-in-out infinite' : 'none',
              animationDelay: '1s',
            }}
          />
          {/* Arc 3 */}
          <path
            d="M 18 38 Q 40 20 58 40"
            fill="none"
            stroke="hsl(174 55% 52%)"
            strokeWidth="0.22"
            strokeLinecap="round"
            strokeDasharray="1 2.5"
            style={{
              animation: isAnalyzing && shouldAnimate ? 'arc-fade 2.8s ease-in-out infinite' : 'none',
              animationDelay: '1.8s',
            }}
          />
          
          {/* Node points */}
          <circle cx="20" cy="55" r="0.8" fill="hsl(174 70% 60%)" opacity="0.5" />
          <circle cx="80" cy="50" r="0.8" fill="hsl(174 70% 60%)" opacity="0.5" />
          <circle cx="25" cy="72" r="0.65" fill="hsl(200 55% 58%)" opacity="0.4" />
          <circle cx="78" cy="68" r="0.65" fill="hsl(200 55% 58%)" opacity="0.4" />
        </svg>
        
        {/* Orbital scan particles */}
        <div 
          className="absolute"
          style={{
            top: '48%',
            left: '50%',
            width: globeSize,
            height: globeSize,
            transform: 'translate(-50%, -50%)',
          }}
        >
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
                  opacity: 0.5,
                }}
              />
            );
          })}
        </div>
        
        {/* Expanding scan pulse rings */}
        <div 
          className="absolute"
          style={{
            top: '48%',
            left: '50%',
            width: `calc(${globeSize} * 0.6)`,
            height: `calc(${globeSize} * 0.6)`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1.5px solid hsl(174 55% 52% / 0.2)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring-center 2.5s ease-out infinite' : 'none',
          }}
        />
        <div 
          className="absolute"
          style={{
            top: '48%',
            left: '50%',
            width: `calc(${globeSize} * 0.6)`,
            height: `calc(${globeSize} * 0.6)`,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px solid hsl(200 50% 55% / 0.12)',
            animation: isAnalyzing && shouldAnimate ? 'scan-ring-center 2.5s ease-out infinite' : 'none',
            animationDelay: '1.25s',
          }}
        />
      </div>
      
      {/* ========== SOFT TOP VIGNETTE ========== */}
      <div 
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '40%',
          background: `linear-gradient(to bottom, 
            hsl(235 35% 4% / 0.9) 0%,
            hsl(240 32% 4% / 0.65) 25%,
            hsl(245 30% 4% / 0.35) 55%,
            transparent 100%
          )`,
        }}
      />
      
      {/* ========== SOFT BOTTOM VIGNETTE ========== */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '50%',
          background: `linear-gradient(to top, 
            hsl(240 30% 4% / 0.98) 0%, 
            hsl(240 30% 4% / 0.85) 20%,
            hsl(240 30% 4% / 0.55) 45%,
            hsl(240 30% 4% / 0.2) 70%, 
            transparent 100%
          )`,
        }}
      />
      
      {/* ========== RADIAL VIGNETTE (cinematic edges) ========== */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 110% 95% at 50% 48%, 
              transparent 25%, 
              hsl(238 30% 4% / 0.15) 50%, 
              hsl(240 28% 3% / 0.4) 75%, 
              hsl(242 25% 3% / 0.7) 100%
            )
          `,
        }}
      />
      
      {/* Content dim overlay when showing results */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: hasResults 
            ? 'radial-gradient(ellipse 80% 65% at 50% 48%, hsl(235 30% 5% / 0.3) 0%, transparent 60%)'
            : 'none',
          opacity: hasResults ? 1 : 0,
        }}
      />
    </div>
  );
});

AnimatedEarthBackground.displayName = 'AnimatedEarthBackground';
