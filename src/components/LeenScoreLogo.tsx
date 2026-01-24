import { useLanguage } from '@/i18n/useLanguage';

export const LeenScoreLogo = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      {/* Title with solar halo reflection effect */}
      <div className="relative overflow-hidden">
        {/* Solar halo glow behind title - constrained */}
        <div 
          className="pointer-events-none absolute inset-0" 
          style={{
            background: 'radial-gradient(ellipse 80% 60% at center, hsl(40 100% 60% / 0.15) 0%, hsl(30 100% 50% / 0.08) 30%, transparent 70%)'
          }} 
        />
        
        {/* Subtle dark vignette for contrast */}
        <div 
          className="pointer-events-none absolute inset-0" 
          style={{
            background: 'radial-gradient(ellipse at center, hsl(240 20% 4% / 0.6) 0%, transparent 70%)'
          }} 
        />
        
        <h1 
          className="relative brand-text font-normal tracking-tight"
          style={{ letterSpacing: '-0.03em', fontSize: 'clamp(3rem, 3rem + 4vw, 6.5rem)' }}
        >
          <span 
            className="brand-accent italic"
            style={{
              color: 'hsl(174 65% 52%)',
              textShadow: '0 0 60px hsl(174 60% 45% / 0.6), 0 0 120px hsl(40 100% 60% / 0.3), 0 4px 40px hsl(30 90% 55% / 0.25)'
            }}
          >
            Leen
          </span>
          <span 
            className="font-semibold not-italic" 
            style={{
              color: 'hsl(0 0% 98%)',
              textShadow: '0 0 50px hsl(40 100% 70% / 0.35), 0 4px 25px hsl(30 90% 55% / 0.2)'
            }}
          >
            Score
          </span>
        </h1>
      </div>
      
      {/* Tagline: "Credibility, measured." */}
      <p 
        className="relative tracking-widest uppercase text-center"
        style={{ 
          fontSize: 'clamp(0.7rem, 0.6rem + 0.5vw, 1rem)',
          letterSpacing: '0.2em',
          color: 'hsl(0 0% 92%)',
          textShadow: '0 0 20px hsl(0 0% 100% / 0.2)'
        }}
      >
        {t('hero.tagline')}
      </p>
      
      {/* Value proposition - single sentence */}
      <p 
        className="relative text-center max-w-xs md:max-w-md"
        style={{ 
          fontSize: 'clamp(0.8rem, 0.75rem + 0.3vw, 0.95rem)',
          lineHeight: 1.5,
          color: 'hsl(0 0% 70%)',
          marginTop: 'var(--space-1)',
        }}
      >
        {t('hero.valueProp')}
      </p>
    </div>
  );
};
