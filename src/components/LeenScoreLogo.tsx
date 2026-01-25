import { useLanguage } from '@/i18n/useLanguage';

export const LeenScoreLogo = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      {/* Title - clean, editorial, no decorative effects */}
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
          }}
        >
          Leen
        </span>
        <span 
          className="not-italic" 
          style={{
            color: 'hsl(0 0% 98%)',
          }}
        >
          Score
        </span>
      </h1>
      
      {/* Tagline: brighter, more authoritative - positioned closer */}
      <p 
        className="tracking-widest uppercase text-center -mt-1"
        style={{ 
          fontSize: 'clamp(0.7rem, 0.6rem + 0.5vw, 1rem)',
          letterSpacing: '0.25em',
          color: 'hsl(0 0% 94%)',
        }}
      >
        {t('hero.tagline')}
      </p>
      
      {/* Premium divider with glowing Leen teal dot - breathing pulse */}
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
            animation: 'teal-dot-pulse 3s ease-in-out infinite',
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
              hsl(200 20% 10% / 0.55) 0%, 
              hsl(210 25% 8% / 0.6) 100%
            )
          `,
          borderRadius: '4px',
          border: '1px solid hsl(0 0% 100% / 0.08)',
          boxShadow: `
            inset 0 1px 0 hsl(0 0% 100% / 0.05),
            inset 0 0 30px hsl(174 40% 50% / 0.04),
            0 8px 40px hsl(0 0% 0% / 0.35),
            0 2px 8px hsl(0 0% 0% / 0.2)
          `,
          backdropFilter: 'blur(8px)',
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
