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
      
      {/* Tagline: brighter, more authoritative */}
      <p 
        className="tracking-widest uppercase text-center"
        style={{ 
          fontSize: 'clamp(0.7rem, 0.6rem + 0.5vw, 1rem)',
          letterSpacing: '0.25em',
          color: 'hsl(0 0% 94%)',
        }}
      >
        {t('hero.tagline')}
      </p>
      
      {/* Premium divider with centered dot */}
      <div className="flex items-center justify-center w-full max-w-[180px] md:max-w-[220px] my-1">
        <div 
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(to right, transparent, hsl(0 0% 50% / 0.4))' }}
        />
        <div 
          className="w-1 h-1 rounded-full mx-3"
          style={{ background: 'hsl(0 0% 60% / 0.6)' }}
        />
        <div 
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(to left, transparent, hsl(0 0% 50% / 0.4))' }}
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
    <div className="flex flex-col items-center gap-3 md:gap-4 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
      {/* Value proposition - premium glassmorphic card with stronger presence */}
      <div 
        className="relative px-6 py-4 md:px-8 md:py-5 max-w-xs md:max-w-md overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, 
              hsl(220 20% 12% / 0.85) 0%, 
              hsl(200 25% 10% / 0.9) 50%, 
              hsl(220 20% 12% / 0.85) 100%
            )
          `,
          borderRadius: '14px',
          border: '1px solid hsl(174 45% 55% / 0.18)',
          boxShadow: `
            inset 0 1px 0 hsl(0 0% 100% / 0.1),
            inset 0 -1px 0 hsl(0 0% 0% / 0.15),
            0 6px 32px hsl(0 0% 0% / 0.35),
            0 0 50px hsl(174 50% 45% / 0.08),
            0 0 80px hsl(174 60% 50% / 0.04)
          `,
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Top edge highlight */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(174 60% 55% / 0.35), transparent)',
          }}
        />
        
        {/* Subtle corner accents */}
        <div 
          className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top left, hsl(174 50% 50% / 0.1), transparent 70%)',
          }}
        />
        <div 
          className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, hsl(174 50% 50% / 0.1), transparent 70%)',
          }}
        />
        
        <p 
          className="text-center relative z-10"
          style={{ 
            fontSize: 'clamp(0.85rem, 0.8rem + 0.5vw, 1rem)',
            lineHeight: 1.7,
            color: 'hsl(0 0% 92%)',
            fontWeight: 400,
            textShadow: '0 1px 3px hsl(0 0% 0% / 0.4)',
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
