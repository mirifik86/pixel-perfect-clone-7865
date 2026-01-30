import { memo } from 'react';

interface RotatingGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Simple rotating globe using a repeating world-map texture.
 * - Centered, never pans vertically
 * - Idle: 100s per rotation (very slow)
 * - Analyzing: 3x faster (~33s)
 * - Fallback: solid subtle globe color if texture fails
 */
export const RotatingGlobe = memo(({ size, isAnalyzing = false }: RotatingGlobeProps) => {
  const animationDuration = isAnalyzing ? '30s' : '100s';
  
  // Use a public domain equirectangular world map texture
  // Fallback to a gradient if it fails to load
  const textureUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_der_Grinten_projection_SW.jpg/1280px-Van_der_Grinten_projection_SW.jpg';
  
  return (
    <div 
      className="absolute rounded-full overflow-hidden pointer-events-none"
      style={{
        width: size * 0.52,
        height: size * 0.52,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0, // Behind all other center content
        opacity: isAnalyzing ? 0.85 : 0.7,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Globe base with gradient fallback */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 35% 35%, 
              hsl(200 40% 30%) 0%, 
              hsl(210 35% 20%) 50%, 
              hsl(220 30% 12%) 100%
            )
          `,
        }}
      />
      
      {/* Rotating texture layer */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: `url(${textureUrl})`,
          backgroundSize: '200% 100%',
          backgroundPosition: '0% 50%',
          backgroundRepeat: 'repeat-x',
          animation: `globe-rotate ${animationDuration} linear infinite`,
          opacity: 0.7,
          filter: 'saturate(0.6) brightness(0.8) contrast(1.1)',
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Second layer for depth */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: `url(${textureUrl})`,
          backgroundSize: '200% 100%',
          backgroundPosition: '0% 50%',
          backgroundRepeat: 'repeat-x',
          animation: `globe-rotate ${animationDuration} linear infinite`,
          opacity: 0.35,
          filter: 'saturate(0.4) brightness(0.7)',
        }}
      />
      
      {/* Atmospheric glow overlay */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, 
              hsl(174 50% 60% / 0.15) 0%, 
              transparent 50%
            ),
            radial-gradient(circle at 70% 70%, 
              hsl(240 30% 10% / 0.4) 0%, 
              transparent 60%
            )
          `,
        }}
      />
      
      {/* Edge shadow for 3D effect */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `
            inset -8px -6px 20px hsl(240 30% 5% / 0.6),
            inset 4px 3px 12px hsl(174 40% 50% / 0.1)
          `,
        }}
      />
      
      {/* Analyzing state: subtle glow pulse */}
      {isAnalyzing && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 15px hsl(174 60% 50% / 0.3), 0 0 30px hsl(174 50% 45% / 0.15)',
            animation: 'globe-analyze-pulse 2s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
