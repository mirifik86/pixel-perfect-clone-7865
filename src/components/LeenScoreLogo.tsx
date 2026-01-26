import { useLanguage } from '@/i18n/useLanguage';

export const LeenScoreLogo = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
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
              /* Inner light - top edge highlight */
              0 -2px 3px hsl(174 80% 75% / 0.4),
              /* Primary glow - close */
              0 0 20px hsl(174 75% 55% / 0.5),
              /* Secondary glow - mid */
              0 0 40px hsl(174 70% 50% / 0.35),
              /* Tertiary glow - far */
              0 0 80px hsl(174 65% 45% / 0.25),
              /* 3D depth shadows - layered */
              0 2px 0 hsl(174 60% 35% / 0.8),
              0 4px 0 hsl(174 55% 28% / 0.6),
              0 6px 0 hsl(174 50% 22% / 0.4),
              /* Soft drop shadow */
              0 8px 16px hsl(0 0% 0% / 0.4),
              0 12px 32px hsl(0 0% 0% / 0.25)
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
              /* Inner light - top edge highlight */
              0 -1px 2px hsl(0 0% 100% / 0.5),
              /* Subtle ambient glow */
              0 0 15px hsl(0 0% 100% / 0.12),
              0 0 30px hsl(0 0% 100% / 0.06),
              /* 3D depth shadows - layered */
              0 2px 0 hsl(220 15% 75% / 0.5),
              0 4px 0 hsl(220 20% 60% / 0.35),
              0 6px 0 hsl(220 25% 45% / 0.25),
              /* Soft drop shadow */
              0 8px 16px hsl(0 0% 0% / 0.35),
              0 12px 28px hsl(0 0% 0% / 0.2)
            `,
          }}
        >
          Score
        </span>
      </h1>
      
      {/* Tagline: premium 3D depth effect with subtle emboss */}
      <p 
        className="tracking-widest uppercase text-center -mt-1"
        style={{ 
          fontSize: 'clamp(0.7rem, 0.6rem + 0.5vw, 1rem)',
          letterSpacing: '0.25em',
          color: 'hsl(0 0% 94%)',
          textShadow: `
            /* Inner light highlight */
            0 -1px 1px hsl(0 0% 100% / 0.25),
            /* Teal accent glow */
            0 0 12px hsl(174 55% 50% / 0.2),
            0 0 25px hsl(174 50% 45% / 0.12),
            /* 3D depth - subtle layers */
            0 1px 0 hsl(220 15% 70% / 0.3),
            0 2px 0 hsl(220 20% 55% / 0.2),
            /* Soft drop shadow */
            0 3px 8px hsl(0 0% 0% / 0.3),
            0 5px 16px hsl(0 0% 0% / 0.15)
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
