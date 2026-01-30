import { useEffect, useState, memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface GlobeBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * GlobeBackground - Centered Full-Circle Rotating Globe
 * 
 * Features:
 * - FULL circular globe, perfectly centered (no cropping, no drifting)
 * - Texture scrolls horizontally inside the circle (axial rotation)
 * - Shows complete world: Europe → Americas (Canada) → Asia (Japan) → back
 * - Premium realism: terminator shadow, atmospheric rim glow, optional clouds
 * - Idle: ~100s rotation / Analyze: ~28s (3.5x faster) + world search overlays
 * - Respects prefers-reduced-motion, pauses when tab hidden
 */
export const GlobeBackground = memo(({ 
  isAnalyzing, 
  hasContent, 
  hasResults 
}: GlobeBackgroundProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [analyzeActive, setAnalyzeActive] = useState(false);
  
  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Pause animation when tab is hidden
  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  
  // Smooth analyze transition
  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => setAnalyzeActive(true), 150);
      return () => clearTimeout(timer);
    } else {
      setAnalyzeActive(false);
    }
  }, [isAnalyzing]);
  
  const shouldAnimate = !prefersReducedMotion && isVisible;
  const rotationDuration = isAnalyzing ? '28s' : '100s'; // Idle ~100s, Analyze ~28s
  const cloudDuration = isAnalyzing ? '22s' : '85s'; // Clouds move slightly faster
  
  const globeOpacity = isAnalyzing ? 0.95 : (hasContent && !hasResults ? 0.85 : 0.9);
  const glowStrength = analyzeActive ? 1.5 : 1;
  
  // Static star field
  const stars = useMemo(() => 
    Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.2,
      opacity: 0.1 + Math.random() * 0.3,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 3,
    }))
  , []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* ========== DEEP SPACE BACKGROUND ========== */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 140% 120% at 50% 40%, 
            hsl(215 45% 8%) 0%, 
            hsl(228 40% 6%) 30%, 
            hsl(242 35% 4%) 60%, 
            hsl(255 30% 3%) 100%
          )`,
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
                ? `globe-star-twinkle ${star.duration}s ease-in-out infinite`
                : 'none',
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* ========== CENTERED GLOBE ========== */}
      {/* 
        Globe is positioned at exact center (50%, 50%) with translate(-50%, -50%)
        It's a perfect circle, NO cropping, NO masks that cut it
      */}
      <div 
        className="absolute transition-opacity duration-500"
        style={{
          top: '50%',
          left: '50%',
          // Responsive globe size
          width: 'clamp(380px, 55vmin, 800px)',
          height: 'clamp(380px, 55vmin, 800px)',
          // EXACT center positioning
          transform: 'translate(-50%, -50%)',
          opacity: globeOpacity,
        }}
      >
        {/* Globe circle container - perfectly round, no overflow hidden issues */}
        <div 
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            // Subtle 3D depth shadow
            boxShadow: `
              inset -20px -12px 40px hsl(220 50% 4% / 0.6),
              inset 12px 8px 30px hsl(200 30% 20% / 0.1)
            `,
          }}
        >
          {/* Earth texture - scrolls horizontally for rotation */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${earthBgHQ})`,
              // 200% width allows seamless looping
              backgroundSize: '200% 100%',
              backgroundRepeat: 'repeat-x',
              // Start with Europe roughly centered
              backgroundPosition: shouldAnimate ? undefined : '20% center',
              animation: shouldAnimate 
                ? `globe-rotate-texture ${rotationDuration} linear infinite` 
                : 'none',
              willChange: shouldAnimate ? 'background-position' : 'auto',
            }}
          />
          
          {/* Cloud layer - slightly faster rotation */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 35% 25% at 20% 30%, hsl(0 0% 100% / 0.07) 0%, transparent 70%),
                radial-gradient(ellipse 28% 18% at 55% 40%, hsl(0 0% 100% / 0.05) 0%, transparent 60%),
                radial-gradient(ellipse 40% 22% at 75% 25%, hsl(0 0% 100% / 0.06) 0%, transparent 65%),
                radial-gradient(ellipse 22% 14% at 35% 60%, hsl(0 0% 100% / 0.04) 0%, transparent 55%),
                radial-gradient(ellipse 30% 20% at 80% 55%, hsl(0 0% 100% / 0.05) 0%, transparent 60%)
              `,
              backgroundSize: '200% 100%',
              animation: shouldAnimate 
                ? `globe-rotate-texture ${cloudDuration} linear infinite` 
                : 'none',
              opacity: 0.65,
            }}
          />
          
          {/* Terminator shadow (night side) - gradient from left lit to right dark */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                100deg,
                transparent 0%,
                transparent 40%,
                hsl(220 55% 5% / 0.2) 55%,
                hsl(225 60% 4% / 0.45) 70%,
                hsl(230 65% 3% / 0.7) 85%,
                hsl(235 70% 2% / 0.85) 100%
              )`,
            }}
          />
          
          {/* Sun highlight (day side) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(
                ellipse 50% 60% at 25% 35%,
                hsl(50 35% 95% / 0.06) 0%,
                hsl(45 30% 90% / 0.03) 40%,
                transparent 70%
              )`,
            }}
          />
        </div>
        
        {/* Atmospheric rim glow - sits OUTSIDE the globe circle */}
        <div 
          className="absolute rounded-full pointer-events-none transition-all duration-500"
          style={{
            inset: '-3%',
            background: `radial-gradient(circle at 50% 50%, 
              transparent 44%, 
              hsl(174 55% 50% / ${0.06 * glowStrength}) 47%, 
              hsl(174 65% 48% / ${0.12 * glowStrength}) 49%, 
              hsl(190 55% 45% / ${0.08 * glowStrength}) 51%, 
              hsl(200 50% 42% / ${0.04 * glowStrength}) 53%,
              transparent 56%
            )`,
            boxShadow: isAnalyzing 
              ? `
                0 0 50px hsl(174 55% 50% / 0.2),
                0 0 100px hsl(174 50% 45% / 0.12),
                0 0 160px hsl(190 45% 42% / 0.06)
              `
              : `
                0 0 35px hsl(174 50% 48% / 0.12),
                0 0 70px hsl(174 45% 45% / 0.06),
                0 0 110px hsl(190 40% 40% / 0.03)
              `,
          }}
        />
        
        {/* ========== ANALYZE: WORLD SEARCH OVERLAYS ========== */}
        {analyzeActive && shouldAnimate && (
          <>
            {/* Radar sweep */}
            <div 
              className="absolute rounded-full"
              style={{
                inset: '-8%',
                background: `conic-gradient(
                  from 0deg, 
                  transparent 0%, 
                  transparent 78%, 
                  hsl(174 60% 50% / 0.1) 86%, 
                  hsl(174 70% 55% / 0.2) 93%, 
                  hsl(174 75% 58% / 0.06) 97%, 
                  transparent 100%
                )`,
                animation: 'globe-radar-sweep 4s linear infinite',
              }}
            />
            
            {/* Counter-rotating sweep */}
            <div 
              className="absolute rounded-full"
              style={{
                inset: '-5%',
                background: `conic-gradient(
                  from 180deg, 
                  transparent 0%, 
                  transparent 82%, 
                  hsl(200 55% 50% / 0.06) 90%, 
                  hsl(200 65% 55% / 0.12) 96%, 
                  transparent 100%
                )`,
                animation: 'globe-radar-sweep-reverse 5.5s linear infinite',
                opacity: 0.6,
              }}
            />
            
            {/* Grid overlay */}
            <div 
              className="absolute rounded-full overflow-hidden"
              style={{
                inset: '0',
                backgroundImage: `
                  linear-gradient(0deg, hsl(174 40% 55% / 0.025) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(174 40% 55% / 0.025) 1px, transparent 1px)
                `,
                backgroundSize: '10% 10%',
                animation: 'globe-grid-pulse 2.5s ease-in-out infinite',
              }}
            />
            
            {/* Network arcs */}
            <svg 
              className="absolute"
              style={{ inset: '5%' }}
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M 20 50 Q 50 18 80 50"
                fill="none"
                stroke="hsl(174 70% 55%)"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeDasharray="2 3"
                style={{ animation: 'globe-arc-fade 3s ease-in-out infinite' }}
              />
              <path
                d="M 25 65 Q 50 40 75 60"
                fill="none"
                stroke="hsl(200 55% 55%)"
                strokeWidth="0.4"
                strokeLinecap="round"
                strokeDasharray="1.5 2.5"
                style={{ animation: 'globe-arc-fade 3.5s ease-in-out infinite', animationDelay: '1s' }}
              />
              <path
                d="M 30 38 Q 48 25 65 40"
                fill="none"
                stroke="hsl(174 55% 52%)"
                strokeWidth="0.35"
                strokeLinecap="round"
                strokeDasharray="1 2"
                style={{ animation: 'globe-arc-fade 2.8s ease-in-out infinite', animationDelay: '1.8s' }}
              />
              {/* Nodes */}
              <circle cx="20" cy="50" r="1.5" fill="hsl(174 70% 60%)" opacity="0.5" />
              <circle cx="80" cy="50" r="1.5" fill="hsl(174 70% 60%)" opacity="0.5" />
              <circle cx="25" cy="65" r="1.2" fill="hsl(200 55% 58%)" opacity="0.4" />
              <circle cx="75" cy="60" r="1.2" fill="hsl(200 55% 58%)" opacity="0.4" />
            </svg>
            
            {/* Pulse rings */}
            <div 
              className="absolute rounded-full"
              style={{
                inset: '20%',
                border: '1px solid hsl(174 50% 50% / 0.2)',
                animation: 'globe-pulse-ring 2.5s ease-out infinite',
              }}
            />
            <div 
              className="absolute rounded-full"
              style={{
                inset: '20%',
                border: '1px solid hsl(200 45% 52% / 0.15)',
                animation: 'globe-pulse-ring 2.5s ease-out infinite',
                animationDelay: '1.25s',
              }}
            />
          </>
        )}
      </div>
      
      {/* ========== UI READABILITY OVERLAYS ========== */}
      
      {/* Top fade */}
      <div 
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '30%',
          background: `linear-gradient(to bottom, 
            hsl(235 35% 5% / 0.7) 0%,
            hsl(240 32% 5% / 0.35) 50%,
            transparent 100%
          )`,
        }}
      />
      
      {/* Bottom fade */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '45%',
          background: `linear-gradient(to top, 
            hsl(240 30% 5% / 0.95) 0%, 
            hsl(240 30% 5% / 0.7) 25%,
            hsl(240 30% 5% / 0.4) 55%, 
            transparent 100%
          )`,
        }}
      />
      
      {/* Radial vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 110% 100% at 50% 50%, 
            transparent 40%, 
            hsl(238 30% 5% / 0.25) 60%, 
            hsl(240 28% 4% / 0.5) 80%, 
            hsl(242 25% 4% / 0.7) 100%
          )`,
        }}
      />
      
      {/* Results dim overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: hasResults 
            ? 'radial-gradient(ellipse 80% 70% at 50% 50%, hsl(235 30% 6% / 0.25) 0%, transparent 55%)'
            : 'none',
          opacity: hasResults ? 1 : 0,
        }}
      />
    </div>
  );
});

GlobeBackground.displayName = 'GlobeBackground';