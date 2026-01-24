import { useLanguage } from '@/i18n/useLanguage';

export const LeenScoreLogo = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-1 md:gap-2">
      {/* Premium icon with layered glow effects - compact */}
      <div className="relative">
        {/* Outer glow ring */}
        <div 
          className="absolute -inset-3 rounded-2xl"
          style={{
            background: 'radial-gradient(circle, hsl(174 60% 45% / 0.2) 0%, transparent 70%)',
            filter: 'blur(8px)'
          }}
        />
        
        {/* Icon container with premium styling - compact size */}
        <div 
          className="relative rounded-lg border border-primary/40 backdrop-blur-md"
          style={{
            padding: 'var(--space-2)',
            background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.15) 0%, hsl(240 20% 10% / 0.8) 100%)',
            boxShadow: '0 0 15px hsl(174 60% 45% / 0.2), inset 0 1px 1px hsl(0 0% 100% / 0.1), 0 6px 24px hsl(0 0% 0% / 0.4)'
          }}
        >
          <div className="relative" style={{ width: '1.75rem', height: '1.75rem' }}>
            {/* Document icon - white with subtle shadow */}
            <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full drop-shadow-lg" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="hsl(0 0% 95%)" stroke="hsl(0 0% 85%)" strokeWidth="0.5" />
              <polyline points="14 2 14 8 20 8" fill="hsl(0 0% 90%)" stroke="hsl(0 0% 80%)" strokeWidth="0.5" />
              <line x1="8" y1="13" x2="16" y2="13" stroke="hsl(220 10% 60%)" strokeWidth="1.2" />
              <line x1="8" y1="17" x2="13" y2="17" stroke="hsl(220 10% 70%)" strokeWidth="1.2" />
            </svg>
            
            {/* Magnifying glass - premium teal with glow */}
            <svg 
              viewBox="0 0 24 24" 
              className="absolute" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                bottom: '-0.25rem',
                right: '-0.25rem',
                width: '1.125rem',
                height: '1.125rem',
                filter: 'drop-shadow(0 2px 4px hsl(0 0% 0% / 0.3)) drop-shadow(0 0 6px hsl(174 60% 45% / 0.4))'
              }}
            >
              {/* Glass fill with gradient */}
              <defs>
                <radialGradient id="glassGradient" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="hsl(174 70% 65%)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(174 60% 45%)" stopOpacity="0.2" />
                </radialGradient>
              </defs>
              <circle cx="10" cy="10" r="6" fill="url(#glassGradient)" />
              <circle cx="10" cy="10" r="6" stroke="hsl(174 70% 55%)" strokeWidth="2.5" />
              {/* Shine effect */}
              <path d="M7 7.5 Q8.5 6 9.5 7" stroke="hsl(0 0% 100%)" strokeWidth="1.5" opacity="0.7" fill="none" />
              {/* Handle with glow */}
              <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="hsl(174 60% 50%)" strokeWidth="3" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="hsl(174 80% 70%)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Title with solar halo reflection effect */}
      <div className="relative overflow-hidden">
        {/* Solar halo glow behind title - constrained to prevent overflow */}
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
          style={{ letterSpacing: '-0.03em', fontSize: 'clamp(2.75rem, 2.5rem + 4vw, 6.5rem)' }}
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
        
        {/* Tagline - MOBILE: tighter spacing */}
        <p 
          className="relative tracking-widest uppercase text-center mt-1 md:mt-3"
          style={{ 
            fontSize: 'clamp(0.625rem, 0.55rem + 0.5vw, 1rem)',
            letterSpacing: '0.2em',
            color: 'hsl(0 0% 92%)',
            textShadow: '0 0 20px hsl(0 0% 100% / 0.2)'
          }}
        >
          {t('hero.tagline')}
        </p>
      </div>
    </div>
  );
};