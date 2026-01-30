import { memo, useMemo } from 'react';
import earthBgHQ from '@/assets/earth-cosmic-bg-hq.jpg';

interface AnimatedEarthBackgroundProps {
  isAnalyzing: boolean;
  hasContent: boolean;
  hasResults: boolean;
}

/**
 * Centered rotating globe with static starfield.
 * - Full circular globe, centered
 * - Rotation via background-position-x animation
 * - Static stars outside globe
 * - No masks, no horizon, no panning
 */
export const AnimatedEarthBackground = memo(({ 
  isAnalyzing, 
  hasResults 
}: AnimatedEarthBackgroundProps) => {
  const rotationSpeed = isAnalyzing ? '25s' : '90s';
  const globeOpacity = hasResults ? 0.7 : 0.85;
  
  // Static starfield
  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.15 + Math.random() * 0.35,
    }))
  , []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Deep space background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(220 40% 6%) 0%, hsl(240 30% 4%) 50%, hsl(250 25% 2%) 100%)',
        }}
      />
      
      {/* Static starfield */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
      
      {/* Centered rotating globe */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          top: '50%',
          left: '50%',
          width: 'min(70vw, 70vh)',
          height: 'min(70vw, 70vh)',
          transform: 'translate(-50%, -50%)',
          opacity: globeOpacity,
          boxShadow: '0 0 80px hsl(200 50% 30% / 0.3), inset -20px -10px 40px hsl(220 40% 5% / 0.6)',
        }}
      >
        {/* Rotating texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${earthBgHQ})`,
            backgroundSize: '200% 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: '0% 50%',
            animation: `globe-rotate-texture ${rotationSpeed} linear infinite`,
          }}
        />
        
        {/* Spherical shading */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, transparent 30%, hsl(220 40% 5% / 0.4) 60%, hsl(230 35% 4% / 0.8) 100%)',
          }}
        />
      </div>
      
      {/* Bottom fade for text readability */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '40%',
          background: 'linear-gradient(to top, hsl(240 30% 4% / 0.95) 0%, transparent 100%)',
        }}
      />
    </div>
  );
});

AnimatedEarthBackground.displayName = 'AnimatedEarthBackground';
