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
      
      {/* Tagline: authoritative, prominent */}
      <p 
        className="uppercase text-center font-semibold"
        style={{ 
          fontSize: 'clamp(0.8rem, 0.7rem + 0.6vw, 1.15rem)',
          letterSpacing: '0.18em',
          color: 'hsl(0 0% 97%)',
          marginTop: 'var(--space-1)',
        }}
      >
        {t('hero.tagline')}
      </p>
      
      {/* Premium divider with centered dot - extra spacing */}
      <div 
        className="flex items-center justify-center w-full max-w-[160px] md:max-w-[200px]"
        style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}
      >
        <div 
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(to right, transparent, hsl(0 0% 55% / 0.35))' }}
        />
        <div 
          className="w-1 h-1 rounded-full mx-3"
          style={{ background: 'hsl(0 0% 65% / 0.5)' }}
        />
        <div 
          className="flex-1 h-px"
          style={{ background: 'linear-gradient(to left, transparent, hsl(0 0% 55% / 0.35))' }}
        />
      </div>
      
      {/* Value proposition - secondary, subdued */}
      <p 
        className="text-center max-w-xs md:max-w-sm"
        style={{ 
          fontSize: 'clamp(0.7rem, 0.65rem + 0.25vw, 0.82rem)',
          lineHeight: 1.5,
          color: 'hsl(0 0% 100% / 0.72)',
        }}
      >
        {t('hero.valueProp')}
      </p>
    </div>
  );
};
