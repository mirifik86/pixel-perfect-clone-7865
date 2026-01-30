import { useEffect, useState, useRef, memo } from 'react';
import earthBg from '@/assets/earth-cosmic-bg.jpg';

interface AnimatedEarthBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * Premium animated Earth globe background with:
 * - Idle state: Ultra-slow rotation (~90s per cycle)
 * - Analyze state: Faster rotation + radar sweep + grid overlay
 * - Respects prefers-reduced-motion
 * - Pauses when tab is not visible
 */
export const AnimatedEarthBackground = memo(({ 
  isAnalyzing, 
  hasContent, 
  hasResults 
}: AnimatedEarthBackgroundProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
  
  // Determine animation state
  const shouldAnimate = !prefersReducedMotion && isVisible;
  const animationSpeed = isAnalyzing ? '25s' : '90s'; // Faster during analysis
  
  // Opacity based on state
  const baseOpacity = hasContent && !isAnalyzing && !hasResults ? 0.72 : 0.80;
  
  return (
    <div 
      ref={containerRef}
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Deep space gradient base */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 30%, hsl(220 40% 8%) 0%, hsl(240 30% 4%) 70%, hsl(260 25% 3%) 100%)',
        }}
      />
      
      {/* Subtle star field */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, hsl(0 0% 100% / 0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 70%, hsl(0 0% 100% / 0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 20%, hsl(0 0% 100% / 0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 85%, hsl(0 0% 100% / 0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 60%, hsl(0 0% 100% / 0.28) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 50%, hsl(0 0% 100% / 0.22) 0%, transparent 100%)
          `,
          opacity: 0.8,
        }}
      />
      
      {/* Main Earth globe with rotation */}
      <div 
        className="absolute transition-all duration-700 ease-out"
        style={{
          top: '25%',
          left: '50%',
          width: '140vmax',
          height: '140vmax',
          transform: 'translate(-50%, -30%)',
          opacity: baseOpacity,
          filter: hasContent && !isAnalyzing && !hasResults ? 'brightness(0.94)' : 'brightness(1)',
        }}
      >
        {/* Globe container with rotation */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            animation: shouldAnimate ? `globe-rotate ${animationSpeed} linear infinite` : 'none',
            willChange: shouldAnimate ? 'transform' : 'auto',
          }}
        >
          {/* Earth image - doubled for seamless loop */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${earthBg})`,
              backgroundSize: '200% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat-x',
            }}
          />
        </div>
        
        {/* Atmosphere glow - teal/cyan rim */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 30%, transparent 45%, hsl(174 60% 50% / 0.08) 55%, hsl(174 70% 45% / 0.15) 65%, hsl(200 60% 40% / 0.1) 80%, transparent 100%)',
            boxShadow: isAnalyzing 
              ? 'inset 0 0 80px hsl(174 60% 50% / 0.2), 0 0 120px hsl(174 55% 45% / 0.25), 0 0 200px hsl(200 50% 40% / 0.15)'
              : 'inset 0 0 60px hsl(174 60% 50% / 0.12), 0 0 80px hsl(174 55% 45% / 0.15), 0 0 150px hsl(200 50% 40% / 0.08)',
            transition: 'box-shadow 0.5s ease-out',
          }}
        />
      </div>
      
      {/* === ANALYZE STATE OVERLAYS === */}
      {isAnalyzing && shouldAnimate && (
        <>
          {/* Radar sweep arc */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: '20%',
              left: '50%',
              width: '80vmax',
              height: '80vmax',
              transform: 'translate(-50%, -25%)',
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0%, transparent 85%, hsl(174 70% 50% / 0.15) 92%, hsl(174 80% 55% / 0.25) 97%, transparent 100%)',
              animation: 'radar-sweep 3s linear infinite',
              opacity: 0.7,
            }}
          />
          
          {/* Secondary radar sweep (counter-rotate) */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: '22%',
              left: '50%',
              width: '75vmax',
              height: '75vmax',
              transform: 'translate(-50%, -25%)',
              borderRadius: '50%',
              background: 'conic-gradient(from 180deg, transparent 0%, transparent 88%, hsl(200 60% 50% / 0.1) 94%, hsl(200 70% 55% / 0.18) 98%, transparent 100%)',
              animation: 'radar-sweep-reverse 4.5s linear infinite',
              opacity: 0.5,
            }}
          />
          
          {/* World grid overlay */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: '20%',
              left: '50%',
              width: '90vmax',
              height: '90vmax',
              transform: 'translate(-50%, -25%)',
              borderRadius: '50%',
              backgroundImage: `
                linear-gradient(0deg, hsl(174 50% 50% / 0.03) 1px, transparent 1px),
                linear-gradient(90deg, hsl(174 50% 50% / 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '8% 8%',
              animation: 'grid-pulse 2s ease-in-out infinite',
              opacity: 0.6,
            }}
          />
          
          {/* Network route arcs */}
          <svg 
            className="absolute pointer-events-none"
            style={{
              top: '15%',
              left: '50%',
              width: '70vmax',
              height: '70vmax',
              transform: 'translate(-50%, -20%)',
              opacity: 0.4,
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Arc 1 */}
            <path
              d="M 20 50 Q 50 15 80 50"
              fill="none"
              stroke="hsl(174 70% 55%)"
              strokeWidth="0.3"
              strokeLinecap="round"
              style={{
                animation: 'arc-fade 2.5s ease-in-out infinite',
                animationDelay: '0s',
              }}
            />
            {/* Arc 2 */}
            <path
              d="M 30 70 Q 50 40 75 65"
              fill="none"
              stroke="hsl(200 60% 55%)"
              strokeWidth="0.25"
              strokeLinecap="round"
              style={{
                animation: 'arc-fade 3s ease-in-out infinite',
                animationDelay: '0.8s',
              }}
            />
            {/* Arc 3 */}
            <path
              d="M 15 40 Q 45 25 60 45"
              fill="none"
              stroke="hsl(174 60% 50%)"
              strokeWidth="0.2"
              strokeLinecap="round"
              style={{
                animation: 'arc-fade 2.8s ease-in-out infinite',
                animationDelay: '1.5s',
              }}
            />
          </svg>
          
          {/* Floating scan particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: '3px',
                  height: '3px',
                  background: i % 2 === 0 ? 'hsl(174 70% 60%)' : 'hsl(200 60% 55%)',
                  boxShadow: `0 0 6px ${i % 2 === 0 ? 'hsl(174 70% 55%)' : 'hsl(200 60% 50%)'}`,
                  top: `${25 + (i * 7) % 40}%`,
                  left: `${20 + (i * 11) % 60}%`,
                  animation: `particle-float ${2.5 + (i * 0.3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
          
          {/* Scanning pulse rings */}
          <div 
            className="absolute pointer-events-none"
            style={{
              top: '35%',
              left: '50%',
              width: '50vmax',
              height: '50vmax',
              transform: 'translate(-50%, -30%)',
              borderRadius: '50%',
              border: '1px solid hsl(174 60% 50% / 0.2)',
              animation: 'scan-ring 2s ease-out infinite',
            }}
          />
          <div 
            className="absolute pointer-events-none"
            style={{
              top: '35%',
              left: '50%',
              width: '50vmax',
              height: '50vmax',
              transform: 'translate(-50%, -30%)',
              borderRadius: '50%',
              border: '1px solid hsl(200 50% 50% / 0.15)',
              animation: 'scan-ring 2s ease-out infinite',
              animationDelay: '1s',
            }}
          />
        </>
      )}
      
      {/* Vignette overlay - always present for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 50% 30%, transparent 30%, hsl(240 30% 5% / 0.4) 70%, hsl(240 30% 4% / 0.8) 100%)',
        }}
      />
      
      {/* Bottom fade for text readability */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '40%',
          background: 'linear-gradient(to top, hsl(240 30% 5% / 0.9) 0%, hsl(240 30% 5% / 0.5) 40%, transparent 100%)',
        }}
      />
      
      {/* Content blur layer - subtle depth behind panels */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          backdropFilter: hasResults ? 'blur(2px)' : 'none',
          opacity: hasResults ? 0.3 : 0,
        }}
      />
    </div>
  );
});

AnimatedEarthBackground.displayName = 'AnimatedEarthBackground';
