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
      
      {/* Value proposition - premium framed */}
      <div 
        className="relative px-5 py-3 md:px-6 md:py-3.5 max-w-xs md:max-w-md"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.03) 0%, hsl(174 40% 50% / 0.04) 100%)',
          borderRadius: '8px',
          border: '1px solid hsl(0 0% 100% / 0.08)',
          boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / 0.05), 0 4px 20px hsl(0 0% 0% / 0.15)',
        }}
      >
        <p 
          className="text-center"
          style={{ 
            fontSize: 'clamp(0.85rem, 0.8rem + 0.5vw, 1rem)',
            lineHeight: 1.6,
            color: 'hsl(0 0% 85%)',
            fontWeight: 400,
          }}
        >
          {t('hero.valueProp')}
        </p>
      </div>
    </div>
  );
};
