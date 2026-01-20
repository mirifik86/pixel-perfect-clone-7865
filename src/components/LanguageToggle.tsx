interface LanguageToggleProps {
  language: 'en' | 'fr';
  onLanguageChange: (lang: 'en' | 'fr') => void;
}

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div 
      className="inline-flex items-center rounded-full border border-primary/30 bg-secondary/60 backdrop-blur-md"
      style={{
        padding: 'var(--space-1)',
        boxShadow: '0 0 15px hsl(174 60% 45% / 0.1), inset 0 1px 1px hsl(0 0% 100% / 0.05)'
      }}
    >
      <button
        onClick={() => onLanguageChange('en')}
        className={`flex items-center justify-center rounded-full font-semibold uppercase tracking-wider transition-all duration-300 ${
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        style={{
          minWidth: '3rem',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-xs)',
          ...(language === 'en' ? {
            boxShadow: '0 0 12px hsl(174 60% 45% / 0.5), 0 2px 8px hsl(0 0% 0% / 0.3)'
          } : {})
        }}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('fr')}
        className={`flex items-center justify-center rounded-full font-semibold uppercase tracking-wider transition-all duration-300 ${
          language === 'fr'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        style={{
          minWidth: '3rem',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--text-xs)',
          ...(language === 'fr' ? {
            boxShadow: '0 0 12px hsl(174 60% 45% / 0.5), 0 2px 8px hsl(0 0% 0% / 0.3)'
          } : {})
        }}
      >
        FR
      </button>
    </div>
  );
};
