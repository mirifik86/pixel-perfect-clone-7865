import { useLanguage } from '@/i18n/useLanguage';
import { useEffect, useState, useRef } from 'react';

export const LeenScoreLogo = () => {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Subtle parallax values - title moves slower than scroll (creates depth)
  const parallaxOffset = scrollY * 0.15;
  const opacityFade = Math.max(0, 1 - scrollY * 0.002);
  const scaleEffect = Math.max(0.95, 1 - scrollY * 0.0003);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center gap-2 md:gap-3"
      style={{
        transform: `translateY(${parallaxOffset}px) scale(${scaleEffect})`,
        opacity: opacityFade,
        transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
        willChange: 'transform, opacity',
      }}
    >
      {/* Title - ultra-premium 3D depth effect with embossed look */}
      <h1 
        className="font-semibold tracking-tight"
        style={{ 
          letterSpacing: '-0.02em', 
          fontSize: 'clamp(3rem, 3rem + 4vw, 6.5rem)',
          fontFamily: 'var(--font-display)',
        }}
      >
        <span 
          className="italic"
          style={{
            color: 'hsl(174 65% 52%)',
            textShadow: `
              0 0 25px hsl(174 70% 50% / 0.4),
              0 0 50px hsl(174 65% 45% / 0.2),
              0 2px 4px hsl(0 0% 0% / 0.35)
            `,
          }}
        >
          Leen
        </span>
        <span 
          className="not-italic" 
          style={{
            color: 'hsl(0 0% 98%)',
            textShadow: `
              0 0 12px hsl(0 0% 100% / 0.1),
              0 2px 4px hsl(0 0% 0% / 0.3)
            `,
          }}
        >
          Score
        </span>
      </h1>
      
      {/* Tagline: clean subtle depth */}
      <p 
        className="tracking-widest uppercase text-center -mt-1"
        style={{ 
          fontSize: 'clamp(0.7rem, 0.6rem + 0.5vw, 1rem)',
          letterSpacing: '0.25em',
          color: 'hsl(0 0% 94%)',
          textShadow: `
            0 0 10px hsl(174 50% 50% / 0.15),
            0 1px 3px hsl(0 0% 0% / 0.25)
          `,
        }}
      >
        {t('hero.tagline')}
      </p>
      
      {/* Premium divider with glowing Leen teal dot */}
      <div className="flex items-center justify-center w-full max-w-[180px] md:max-w-[220px] -mt-0.5">
        <div 
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(to right, transparent, hsl(174 50% 55% / 0.5))' }}
        />
        <div 
          className="w-1.5 h-1.5 rounded-full mx-3"
          style={{ 
            background: 'hsl(174 65% 52%)',
            boxShadow: '0 0 8px hsl(174 70% 55% / 0.8), 0 0 16px hsl(174 70% 55% / 0.4)',
          }}
        />
        <div 
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(to left, transparent, hsl(174 50% 55% / 0.5))' }}
        />
      </div>
    </div>
  );
};

interface ValuePropositionProps {
  children?: React.ReactNode;
}

export const ValueProposition = ({ children }: ValuePropositionProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center gap-4 md:gap-5 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
      {/* Value proposition - premium "instruction manual" style */}
      <div 
        className="relative px-7 py-5 md:px-10 md:py-6 max-w-sm md:max-w-lg overflow-hidden"
        style={{
          background: `
            linear-gradient(180deg, 
              hsl(200 20% 12% / 0.45) 0%, 
              hsl(210 25% 10% / 0.5) 100%
            )
          `,
          borderRadius: '4px',
          border: '1px solid hsl(0 0% 100% / 0.1)',
          boxShadow: `
            inset 0 1px 0 hsl(0 0% 100% / 0.06),
            inset 0 0 30px hsl(174 40% 50% / 0.05),
            0 8px 40px hsl(0 0% 0% / 0.3),
            0 2px 8px hsl(0 0% 0% / 0.15)
          `,
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* Subtle corner brackets - top left */}
        <div 
          className="absolute top-2 left-2 w-4 h-4 pointer-events-none"
          style={{
            borderTop: '1px solid hsl(174 50% 55% / 0.35)',
            borderLeft: '1px solid hsl(174 50% 55% / 0.35)',
          }}
        />
        {/* Top right bracket */}
        <div 
          className="absolute top-2 right-2 w-4 h-4 pointer-events-none"
          style={{
            borderTop: '1px solid hsl(174 50% 55% / 0.35)',
            borderRight: '1px solid hsl(174 50% 55% / 0.35)',
          }}
        />
        {/* Bottom left bracket */}
        <div 
          className="absolute bottom-2 left-2 w-4 h-4 pointer-events-none"
          style={{
            borderBottom: '1px solid hsl(174 50% 55% / 0.35)',
            borderLeft: '1px solid hsl(174 50% 55% / 0.35)',
          }}
        />
        {/* Bottom right bracket */}
        <div 
          className="absolute bottom-2 right-2 w-4 h-4 pointer-events-none"
          style={{
            borderBottom: '1px solid hsl(174 50% 55% / 0.35)',
            borderRight: '1px solid hsl(174 50% 55% / 0.35)',
          }}
        />
        
        {/* Top center accent line */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(174 50% 55% / 0.4), transparent)',
          }}
        />
        
        <p 
          className="text-center relative z-10"
          style={{ 
            fontSize: 'clamp(0.8rem, 0.75rem + 0.5vw, 0.95rem)',
            lineHeight: 1.8,
            color: 'hsl(0 0% 80%)',
            fontWeight: 400,
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {t('hero.valueProp')}
        </p>
      </div>
      
      {/* Language selector slot */}
      {children}
    </div>
  );
};
