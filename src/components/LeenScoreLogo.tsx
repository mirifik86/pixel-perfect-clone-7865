import { useLanguage } from '@/i18n/useLanguage';

export const LeenScoreLogo = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      {/* Title - clean, no background overlay */}
      <h1 
        className="brand-text font-normal tracking-tight"
        style={{ letterSpacing: '-0.03em', fontSize: 'clamp(3rem, 3rem + 4vw, 6.5rem)' }}
      >
        <span 
          className="brand-accent italic"
          style={{
            color: 'hsl(174 65% 52%)',
            textShadow: '0 0 40px hsl(174 60% 45% / 0.4)'
          }}
        >
          Leen
        </span>
        <span 
          className="font-semibold not-italic" 
          style={{
            color: 'hsl(0 0% 98%)',
            textShadow: '0 0 30px hsl(0 0% 100% / 0.15)'
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
      
      {/* Value proposition */}
      <p 
        className="text-center max-w-xs md:max-w-md"
        style={{ 
          fontSize: 'clamp(0.8rem, 0.75rem + 0.3vw, 0.95rem)',
          lineHeight: 1.5,
          color: 'hsl(0 0% 70%)',
        }}
      >
        {t('hero.valueProp')}
      </p>
    </div>
  );
};
