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
      {/* Value proposition - premium glassmorphic card */}
      <div 
        className="relative px-5 py-3.5 md:px-7 md:py-4 max-w-xs md:max-w-md overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.04) 0%, hsl(174 50% 45% / 0.06) 50%, hsl(0 0% 100% / 0.03) 100%)',
          borderRadius: '12px',
          border: '1px solid hsl(174 40% 60% / 0.12)',
          boxShadow: `
            inset 0 1px 0 hsl(0 0% 100% / 0.08),
            inset 0 -1px 0 hsl(0 0% 0% / 0.1),
            0 4px 24px hsl(0 0% 0% / 0.2),
            0 0 40px hsl(174 50% 50% / 0.06)
          `,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Subtle top highlight */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(174 60% 60% / 0.25), transparent)',
          }}
        />
        
        <p 
          className="text-center relative z-10"
          style={{ 
            fontSize: 'clamp(0.85rem, 0.8rem + 0.5vw, 1rem)',
            lineHeight: 1.65,
            color: 'hsl(0 0% 88%)',
            fontWeight: 400,
            textShadow: '0 1px 2px hsl(0 0% 0% / 0.3)',
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
