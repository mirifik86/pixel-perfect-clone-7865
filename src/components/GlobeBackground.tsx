import { useEffect, useState, memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface GlobeBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * GlobeBackground - FULL Centered Rotating Globe
 * 
 * NON-NEGOTIABLE:
 * - FULL visible circle (100% round, NO cropping, NO masks)
 * - Perfectly centered at viewport center
 * - Axial rotation via texture scroll (no drifting)
 * - Starfield background behind globe
 * - BIGGER size for premium hero effect
 */
export const GlobeBackground = memo(({ 
  isAnalyzing, 
  hasContent, 
  hasResults 
}: GlobeBackgroundProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [analyzeActive, setAnalyzeActive] = useState(false);
  
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
      const timer = setTimeout(() => setAnalyzeActive(true), 150);
      return () => clearTimeout(timer);
    } else {
      setAnalyzeActive(false);
    }
  }, [isAnalyzing]);
  
  const shouldAnimate = !prefersReducedMotion && isVisible;
  const rotationDuration = isAnalyzing ? '28s' : '100s';
  const cloudDuration = isAnalyzing ? '22s' : '85s';
  
  const globeOpacity = isAnalyzing ? 1 : (hasContent && !hasResults ? 0.88 : 0.95);
  const glowStrength = analyzeActive ? 1.6 : 1;
  
  // Static star field
  const stars = useMemo(() => 
    Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.4,
      opacity: 0.15 + Math.random() * 0.4,
      delay: Math.random() * 6,
      duration: 3 + Math.random() * 4,
    }))
  , []);

  return (
    <>
      {/* ===== LAYER 1: FULL-BLEED SPACE BACKGROUND ===== */}
      <div 
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 0 }}
      >
        {/* Deep space gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 150% 130% at 50% 50%, 
              hsl(220 50% 8%) 0%, 
              hsl(235 45% 6%) 30%, 
              hsl(250 40% 4%) 60%, 
              hsl(265 35% 3%) 100%
            )`,
          }}
        />
        
        {/* Star field - always visible */}
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'white',
              opacity: star.opacity,
              animation: shouldAnimate 
                ? `globe-star-twinkle ${star.duration}s ease-in-out infinite`
                : 'none',
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* ===== LAYER 2: CENTERED FULL GLOBE ===== */}
      {/* 
        CRITICAL: This is positioned at EXACT center of viewport.
        NO overflow:hidden on this container.
        The globe is a FULL VISIBLE CIRCLE.
      */}
      <div 
        className="pointer-events-none fixed"
        style={{
          zIndex: 1,
          // EXACT center positioning
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          // BIGGER SIZE for premium hero effect
          // Desktop: 780-980px, Mobile: 420-560px
          width: 'clamp(440px, 70vmin, 900px)',
          height: 'clamp(440px, 70vmin, 900px)',
          opacity: globeOpacity,
          transition: 'opacity 0.5s ease',
        }}
      >
        {/* Globe circle - FULL VISIBLE, no cropping */}
        <div 
          className="relative w-full h-full rounded-full"
          style={{
            overflow: 'hidden', // Only THIS element clips the texture
            boxShadow: `
              inset -25px -18px 50px hsl(220 55% 4% / 0.7),
              inset 18px 12px 40px hsl(200 35% 25% / 0.12)
            `,
          }}
        >
          {/* Earth surface texture - scrolls horizontally for rotation */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${earthBgHQ})`,
              backgroundSize: '200% 100%',
              backgroundRepeat: 'repeat-x',
              backgroundPosition: shouldAnimate ? undefined : '15% center',
              animation: shouldAnimate 
                ? `globe-rotate-texture ${rotationDuration} linear infinite` 
                : 'none',
              willChange: shouldAnimate ? 'background-position' : 'auto',
            }}
          />
          
          {/* Cloud layer - moves slightly faster */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 40% 30% at 18% 28%, hsl(0 0% 100% / 0.08) 0%, transparent 70%),
                radial-gradient(ellipse 32% 22% at 52% 38%, hsl(0 0% 100% / 0.06) 0%, transparent 65%),
                radial-gradient(ellipse 45% 28% at 78% 22%, hsl(0 0% 100% / 0.07) 0%, transparent 60%),
                radial-gradient(ellipse 28% 18% at 38% 62%, hsl(0 0% 100% / 0.05) 0%, transparent 55%),
                radial-gradient(ellipse 35% 25% at 85% 58%, hsl(0 0% 100% / 0.06) 0%, transparent 60%)
              `,
              backgroundSize: '200% 100%',
              animation: shouldAnimate 
                ? `globe-rotate-texture ${cloudDuration} linear infinite` 
                : 'none',
              opacity: 0.6,
            }}
          />
          
          {/* Terminator shadow (night side on the right) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                105deg,
                transparent 0%,
                transparent 38%,
                hsl(220 60% 5% / 0.18) 52%,
                hsl(225 65% 4% / 0.4) 66%,
                hsl(230 70% 3% / 0.65) 80%,
                hsl(235 75% 2% / 0.82) 100%
              )`,
            }}
          />
          
          {/* Sun highlight (day side on the left) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(
                ellipse 55% 65% at 22% 32%,
                hsl(50 40% 96% / 0.07) 0%,
                hsl(45 35% 92% / 0.03) 45%,
                transparent 75%
              )`,
            }}
          />
        </div>
        
        {/* Atmospheric rim glow - sits OUTSIDE the globe */}
        <div 
          className="absolute rounded-full pointer-events-none transition-all duration-500"
          style={{
            inset: '-4%', // Extends beyond globe
            background: `radial-gradient(circle at 50% 50%, 
              transparent 43%, 
              hsl(174 55% 52% / ${0.05 * glowStrength}) 46%, 
              hsl(174 65% 50% / ${0.12 * glowStrength}) 48.5%, 
              hsl(190 60% 48% / ${0.08 * glowStrength}) 51%, 
              hsl(200 55% 45% / ${0.04 * glowStrength}) 54%,
              transparent 58%
            )`,
            boxShadow: isAnalyzing 
              ? `
                0 0 60px hsl(174 60% 52% / 0.25),
                0 0 120px hsl(174 55% 48% / 0.15),
                0 0 180px hsl(190 50% 45% / 0.08)
              `
              : `
                0 0 40px hsl(174 55% 50% / 0.15),
                0 0 80px hsl(174 50% 46% / 0.08),
                0 0 130px hsl(190 45% 42% / 0.04)
              `,
          }}
        />
        
        {/* ===== ANALYZE STATE OVERLAYS ===== */}
        {analyzeActive && shouldAnimate && (
          <>
            {/* Radar sweep */}
            <div 
              className="absolute rounded-full"
              style={{
                inset: '-10%',
                background: `conic-gradient(
                  from 0deg, 
                  transparent 0%, 
                  transparent 76%, 
                  hsl(174 65% 52% / 0.12) 84%, 
                  hsl(174 75% 56% / 0.22) 92%, 
                  hsl(174 80% 60% / 0.08) 97%, 
                  transparent 100%
                )`,
                animation: 'globe-radar-sweep 4.5s linear infinite',
              }}
            />
            
            {/* Counter-rotating sweep */}
            <div 
              className="absolute rounded-full"
              style={{
                inset: '-6%',
                background: `conic-gradient(
                  from 180deg, 
                  transparent 0%, 
                  transparent 80%, 
                  hsl(200 60% 52% / 0.08) 88%, 
                  hsl(200 70% 56% / 0.14) 95%, 
                  transparent 100%
                )`,
                animation: 'globe-radar-sweep-reverse 6s linear infinite',
                opacity: 0.55,
              }}
            />
            
            {/* Faint grid */}
            <div 
              className="absolute rounded-full"
              style={{
                inset: '0',
                overflow: 'hidden',
                backgroundImage: `
                  linear-gradient(0deg, hsl(174 45% 58% / 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(174 45% 58% / 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '12% 12%',
                animation: 'globe-grid-pulse 2.5s ease-in-out infinite',
              }}
            />
            
            {/* Network arcs */}
            <svg 
              className="absolute"
              style={{ inset: '8%' }}
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M 18 50 Q 50 15 82 50"
                fill="none"
                stroke="hsl(174 72% 56%)"
                strokeWidth="0.55"
                strokeLinecap="round"
                strokeDasharray="2.5 3.5"
                style={{ animation: 'globe-arc-fade 3.2s ease-in-out infinite' }}
              />
              <path
                d="M 24 66 Q 50 38 76 62"
                fill="none"
                stroke="hsl(200 58% 56%)"
                strokeWidth="0.45"
                strokeLinecap="round"
                strokeDasharray="2 3"
                style={{ animation: 'globe-arc-fade 3.8s ease-in-out infinite', animationDelay: '1.1s' }}
              />
              <path
                d="M 28 36 Q 46 22 64 38"
                fill="none"
                stroke="hsl(174 58% 54%)"
                strokeWidth="0.38"
                strokeLinecap="round"
                strokeDasharray="1.5 2.5"
                style={{ animation: 'globe-arc-fade 3s ease-in-out infinite', animationDelay: '2s' }}
              />
              {/* Endpoint nodes */}
              <circle cx="18" cy="50" r="1.8" fill="hsl(174 72% 62%)" opacity="0.55" />
              <circle cx="82" cy="50" r="1.8" fill="hsl(174 72% 62%)" opacity="0.55" />
              <circle cx="24" cy="66" r="1.4" fill="hsl(200 58% 60%)" opacity="0.45" />
              <circle cx="76" cy="62" r="1.4" fill="hsl(200 58% 60%)" opacity="0.45" />
            </svg>
            
            {/* Pulse rings */}
            <div 
              className="absolute rounded-full"
              style={{
                inset: '22%',
                border: '1.5px solid hsl(174 55% 54% / 0.22)',
                animation: 'globe-pulse-ring 2.8s ease-out infinite',
              }}
            />
            <div 
              className="absolute rounded-full"
              style={{
                inset: '22%',
                border: '1.5px solid hsl(200 50% 55% / 0.16)',
                animation: 'globe-pulse-ring 2.8s ease-out infinite',
                animationDelay: '1.4s',
              }}
            />
          </>
        )}
      </div>
      
      {/* ===== LAYER 3: UI READABILITY OVERLAYS ===== */}
      {/* These do NOT crop the globe - they're just gradients on top */}
      <div 
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 2 }}
      >
        {/* Subtle top fade for header readability */}
        <div 
          className="absolute inset-x-0 top-0"
          style={{
            height: '25%',
            background: `linear-gradient(to bottom, 
              hsl(235 40% 5% / 0.6) 0%,
              hsl(240 35% 5% / 0.3) 50%,
              transparent 100%
            )`,
          }}
        />
        
        {/* Bottom fade for content readability */}
        <div 
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '40%',
            background: `linear-gradient(to top, 
              hsl(240 35% 5% / 0.9) 0%, 
              hsl(240 35% 5% / 0.65) 30%,
              hsl(240 35% 5% / 0.3) 60%, 
              transparent 100%
            )`,
          }}
        />
        
        {/* Results overlay - dims when showing results */}
        <div 
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: hasResults 
              ? 'radial-gradient(ellipse 85% 75% at 50% 50%, hsl(235 35% 6% / 0.3) 0%, transparent 60%)'
              : 'none',
            opacity: hasResults ? 1 : 0,
          }}
        />
      </div>
    </>
  );
});

GlobeBackground.displayName = 'GlobeBackground';