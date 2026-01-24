interface LanguageToggleProps {
  language: 'en' | 'fr';
  onLanguageChange: (lang: 'en' | 'fr') => void;
}

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div className="relative inline-flex items-center">
      {/* Outer glow effect */}
      <div 
        className="pointer-events-none absolute -inset-1 rounded-full opacity-60"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(174 60% 45% / 0.2) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />
      
      {/* Main container with premium glassmorphism */}
      <div 
        className="relative inline-flex items-center rounded-full border border-primary/20 bg-secondary/80 backdrop-blur-xl"
        style={{
          padding: '3px',
          boxShadow: `
            0 0 20px hsl(174 60% 45% / 0.08),
            inset 0 1px 1px hsl(0 0% 100% / 0.08),
            inset 0 -1px 1px hsl(0 0% 0% / 0.1)
          `
        }}
      >
        {/* Sliding indicator background */}
        <div 
          className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-full transition-all duration-300 ease-out"
          style={{
            width: 'calc(50% - 2px)',
            left: language === 'en' ? '3px' : 'calc(50% - 1px)',
            background: 'linear-gradient(135deg, hsl(174 65% 48%) 0%, hsl(180 55% 40%) 100%)',
            boxShadow: `
              0 0 16px hsl(174 60% 45% / 0.5),
              0 2px 8px hsl(0 0% 0% / 0.3),
              inset 0 1px 1px hsl(0 0% 100% / 0.2)
            `
          }}
        />
        
        {/* EN Button */}
        <button
          onClick={() => onLanguageChange('en')}
          className={`relative z-10 flex items-center justify-center rounded-full font-semibold uppercase tracking-widest transition-all duration-300 ${
            language === 'en'
              ? 'text-primary-foreground'
              : 'text-muted-foreground/70 hover:text-foreground/90'
          }`}
          style={{
            minWidth: '3.25rem',
            padding: '0.5rem 0.875rem',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textShadow: language === 'en' ? '0 1px 2px hsl(0 0% 0% / 0.3)' : 'none'
          }}
        >
          EN
        </button>
        
        {/* FR Button */}
        <button
          onClick={() => onLanguageChange('fr')}
          className={`relative z-10 flex items-center justify-center rounded-full font-semibold uppercase tracking-widest transition-all duration-300 ${
            language === 'fr'
              ? 'text-primary-foreground'
              : 'text-muted-foreground/70 hover:text-foreground/90'
          }`}
          style={{
            minWidth: '3.25rem',
            padding: '0.5rem 0.875rem',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textShadow: language === 'fr' ? '0 1px 2px hsl(0 0% 0% / 0.3)' : 'none'
          }}
        >
          FR
        </button>
      </div>
    </div>
  );
};
