import { useLanguage } from '@/i18n/useLanguage';

export const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: '0ms' }}>
      {/* Brand Title */}
      <h1 
        className="font-semibold tracking-tight"
        style={{ 
          letterSpacing: '-0.02em', 
          fontSize: 'clamp(2.5rem, 2.5rem + 3vw, 5rem)',
          fontFamily: 'var(--font-display)',
        }}
      >
        <span 
          className="italic"
          style={{ color: 'hsl(174 65% 52%)' }}
        >
          Leen
        </span>
        <span 
          className="not-italic" 
          style={{ color: 'hsl(0 0% 98%)' }}
        >
          Score
        </span>
      </h1>
      
      {/* Tagline */}
      <p 
        className="tracking-widest uppercase mt-2"
        style={{ 
          fontSize: 'clamp(0.65rem, 0.55rem + 0.4vw, 0.9rem)',
          letterSpacing: '0.25em',
          color: 'hsl(0 0% 92%)',
        }}
      >
        {t('hero.tagline')}
      </p>
      
      {/* Premium divider */}
      <div className="flex items-center justify-center w-full max-w-[180px] mt-3">
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
      
      {/* Value Proposition */}
      <p 
        className="mt-6 max-w-lg px-4"
        style={{ 
          fontSize: 'clamp(0.9rem, 0.85rem + 0.3vw, 1.1rem)',
          lineHeight: 1.7,
          color: 'hsl(0 0% 80%)',
        }}
      >
        {t('hero.valueProp')}
      </p>
    </section>
  );
};
