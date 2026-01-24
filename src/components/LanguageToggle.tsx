interface LanguageToggleProps {
  language: 'en' | 'fr';
  onLanguageChange: (lang: 'en' | 'fr') => void;
}

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div className="relative inline-flex items-center">
      {/* Subtle outer glow - reduced for discretion */}
      <div 
        className="pointer-events-none absolute -inset-1 rounded-full opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(174 60% 45% / 0.15) 0%, transparent 70%)',
          filter: 'blur(6px)'
        }}
      />
      
      {/* PRO border glow ring */}
      <div 
        className="pointer-events-none absolute -inset-[1px] rounded-full"
        style={{
          background: 'linear-gradient(135deg, hsl(174 65% 55% / 0.5) 0%, hsl(180 55% 45% / 0.2) 50%, hsl(174 65% 55% / 0.5) 100%)',
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />
      
      {/* Main container - larger touch targets on mobile */}
      <div 
        className="relative inline-flex items-center rounded-full border border-primary/25 bg-secondary/70 backdrop-blur-xl"
        style={{
          padding: '4px',
          boxShadow: `
            0 0 16px hsl(174 60% 45% / 0.12),
            0 0 4px hsl(174 60% 45% / 0.15),
            inset 0 1px 1px hsl(0 0% 100% / 0.08),
            inset 0 -1px 1px hsl(0 0% 0% / 0.1)
          `
        }}
      >
        {/* Sliding indicator */}
        <div 
          className="pointer-events-none absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out"
          style={{
            width: 'calc(50% - 4px)',
            left: language === 'en' ? '4px' : 'calc(50%)',
            background: 'linear-gradient(135deg, hsl(174 65% 48%) 0%, hsl(180 55% 40%) 100%)',
            boxShadow: `
              0 0 10px hsl(174 60% 45% / 0.4),
              0 2px 6px hsl(0 0% 0% / 0.25),
              inset 0 1px 1px hsl(0 0% 100% / 0.15)
            `
          }}
        />
        
        {/* EN Button - larger touch area */}
        <button
          onClick={() => onLanguageChange('en')}
          className={`relative z-10 flex items-center justify-center rounded-full font-medium uppercase tracking-wider transition-all duration-300 ${
            language === 'en'
              ? 'text-primary-foreground'
              : 'text-muted-foreground/60 hover:text-foreground/80'
          }`}
          style={{
            minWidth: '2.75rem',
            minHeight: '2.25rem',
            padding: '0.5rem 0.75rem',
            fontSize: 'clamp(0.65rem, 2vw, 0.7rem)',
            letterSpacing: '0.08em',
            textShadow: language === 'en' ? '0 1px 2px hsl(0 0% 0% / 0.25)' : 'none'
          }}
        >
          EN
        </button>
        
        {/* FR Button - larger touch area */}
        <button
          onClick={() => onLanguageChange('fr')}
          className={`relative z-10 flex items-center justify-center rounded-full font-medium uppercase tracking-wider transition-all duration-300 ${
            language === 'fr'
              ? 'text-primary-foreground'
              : 'text-muted-foreground/60 hover:text-foreground/80'
          }`}
          style={{
            minWidth: '2.75rem',
            minHeight: '2.25rem',
            padding: '0.5rem 0.75rem',
            fontSize: 'clamp(0.65rem, 2vw, 0.7rem)',
            letterSpacing: '0.08em',
            textShadow: language === 'fr' ? '0 1px 2px hsl(0 0% 0% / 0.25)' : 'none'
          }}
        >
          FR
        </button>
      </div>
    </div>
  );
};
