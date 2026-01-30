import { memo } from 'react';
import earthImage from '@/assets/earth-sunrise-space.jpg';

interface StaticGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Static Earth Globe - Maximum Mobile Performance
 * 
 * Premium cinematic Earth with zero animations:
 * - High-res static image (no rotation)
 * - Soft blue outer glow
 * - Smooth shadow fade into space
 * - Zero GPU overhead, no continuous rendering
 */
export const RotatingGlobe = memo(({ size, isAnalyzing = false }: StaticGlobeProps) => {
  // Globe size with clean gap from gauge ring
  const globeSize = size * 0.80;
  
  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        width: globeSize,
        height: globeSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
      }}
    >
      {/* Soft blue outer glow - static, no animation */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '130%',
          height: '130%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at center, 
            hsl(200 60% 50% / 0.08) 30%,
            hsl(210 50% 40% / 0.04) 50%,
            transparent 70%
          )`,
          zIndex: -1,
        }}
      />
      
      {/* Shadow fade into space */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '150%',
          height: '150%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at center, 
            transparent 35%,
            hsl(225 30% 3% / 0.6) 60%,
            hsl(225 30% 2% / 0.9) 80%
          )`,
          zIndex: -2,
        }}
      />
      
      {/* Static Earth Globe Image */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          opacity: isAnalyzing ? 0.85 : 0.75,
          boxShadow: `
            0 0 30px hsl(200 50% 40% / 0.15),
            0 0 60px hsl(210 40% 30% / 0.08),
            inset 0 0 40px hsl(220 30% 10% / 0.3)
          `,
        }}
      >
        {/* High-res Earth image - static, no animation */}
        <img 
          src={earthImage}
          alt=""
          className="w-full h-full object-cover"
          style={{
            filter: 'saturate(1.1) brightness(1.0) contrast(1.05)',
          }}
          loading="eager"
          decoding="async"
        />
        
        {/* Subtle atmospheric edge highlight */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(200 60% 70% / 0.08) 0%, 
                transparent 30%
              ),
              linear-gradient(315deg, 
                transparent 60%,
                hsl(220 40% 10% / 0.25) 100%
              )
            `,
          }}
        />
      </div>
      
      {/* Center overlay for text readability */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '60%',
          height: '35%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse 100% 100% at center, 
            hsl(225 30% 6% / 0.4) 0%, 
            transparent 100%
          )`,
          zIndex: 1,
        }}
      />
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
