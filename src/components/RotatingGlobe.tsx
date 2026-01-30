import { memo } from 'react';

interface StaticGlobeProps {
  size: number;
  isAnalyzing?: boolean;
}

/**
 * Stylized Global Credibility Core
 * 
 * Premium symbolic globe - not photo-realistic:
 * - Dark minimal continent silhouettes
 * - Soft cyan/blue atmospheric glow
 * - Clean futuristic aesthetic
 * - Zero animation for performance
 */
export const RotatingGlobe = memo(({ size, isAnalyzing = false }: StaticGlobeProps) => {
  const globeSize = size * 0.78;
  
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
      {/* Outer atmospheric glow - soft cyan */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '140%',
          height: '140%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at center, 
            hsl(190 60% 50% / 0.08) 30%,
            hsl(195 55% 45% / 0.04) 50%,
            hsl(200 50% 40% / 0.02) 65%,
            transparent 80%
          )`,
          filter: 'blur(12px)',
          zIndex: -2,
        }}
      />
      
      {/* Inner atmospheric ring */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '115%',
          height: '115%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at center, 
            transparent 60%,
            hsl(190 50% 55% / 0.06) 75%,
            hsl(195 45% 50% / 0.03) 85%,
            transparent 100%
          )`,
          zIndex: -1,
        }}
      />
      
      {/* Globe sphere - stylized dark ocean */}
      <div 
        className="absolute rounded-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 35% 30%, 
            hsl(210 45% 18%) 0%,
            hsl(215 50% 12%) 40%,
            hsl(220 55% 8%) 70%,
            hsl(225 60% 5%) 100%
          )`,
          boxShadow: `
            inset 0 0 ${globeSize * 0.15}px hsl(220 50% 6%),
            0 0 ${globeSize * 0.08}px hsl(195 50% 50% / 0.15),
            0 0 ${globeSize * 0.2}px hsl(200 45% 45% / 0.08)
          `,
          opacity: isAnalyzing ? 0.9 : 0.8,
        }}
      >
        {/* Stylized continent shapes - abstract, minimal */}
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.35 }}
        >
          {/* North America - simplified */}
          <ellipse cx="28" cy="32" rx="12" ry="8" fill="hsl(200 30% 25%)" />
          <ellipse cx="22" cy="38" rx="6" ry="5" fill="hsl(200 30% 25%)" />
          
          {/* South America - simplified */}
          <ellipse cx="35" cy="62" rx="5" ry="10" fill="hsl(200 30% 25%)" />
          
          {/* Europe/Africa - simplified */}
          <ellipse cx="52" cy="35" rx="4" ry="5" fill="hsl(200 30% 25%)" />
          <ellipse cx="54" cy="52" rx="6" ry="12" fill="hsl(200 30% 25%)" />
          
          {/* Asia - simplified */}
          <ellipse cx="72" cy="35" rx="14" ry="10" fill="hsl(200 30% 25%)" />
          <ellipse cx="80" cy="50" rx="6" ry="8" fill="hsl(200 30% 25%)" />
          
          {/* Australia - simplified */}
          <ellipse cx="82" cy="68" rx="6" ry="4" fill="hsl(200 30% 25%)" />
        </svg>
        
        {/* Subtle grid lines - futuristic touch */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 9%,
                hsl(195 40% 50% / 0.03) 9%,
                hsl(195 40% 50% / 0.03) 10%
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 9%,
                hsl(195 40% 50% / 0.03) 9%,
                hsl(195 40% 50% / 0.03) 10%
              )
            `,
            opacity: 0.6,
          }}
        />
        
        {/* Atmospheric edge highlight */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(195 50% 60% / 0.08) 0%, 
                transparent 25%
              ),
              linear-gradient(315deg, 
                transparent 70%,
                hsl(220 45% 8% / 0.4) 100%
              )
            `,
          }}
        />
        
        {/* Rim light - top edge */}
        <div 
          className="absolute rounded-full"
          style={{
            top: '2%',
            left: '20%',
            width: '60%',
            height: '15%',
            background: `radial-gradient(ellipse 100% 100% at 50% 0%, 
              hsl(195 50% 60% / 0.12) 0%,
              transparent 70%
            )`,
          }}
        />
      </div>
      
      {/* Center overlay for text readability */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '55%',
          height: '30%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse 100% 100% at center, 
            hsl(225 40% 6% / 0.5) 0%, 
            transparent 100%
          )`,
          zIndex: 1,
        }}
      />
    </div>
  );
});

RotatingGlobe.displayName = 'RotatingGlobe';
