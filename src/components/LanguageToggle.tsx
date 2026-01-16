import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: 'en' | 'fr';
  onLanguageChange: (lang: 'en' | 'fr') => void;
}

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div 
      className="inline-flex items-center rounded-full border border-primary/30 bg-secondary/60 p-1 backdrop-blur-md md:p-1.5"
      style={{
        boxShadow: '0 0 15px hsl(174 60% 45% / 0.1), inset 0 1px 1px hsl(0 0% 100% / 0.05)'
      }}
    >
      <button
        onClick={() => onLanguageChange('en')}
        className={`flex min-w-[44px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 md:min-w-[56px] md:px-4 md:py-2 md:text-sm ${
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        style={language === 'en' ? {
          boxShadow: '0 0 12px hsl(174 60% 45% / 0.5), 0 2px 8px hsl(0 0% 0% / 0.3)'
        } : {}}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('fr')}
        className={`flex min-w-[44px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 md:min-w-[56px] md:px-4 md:py-2 md:text-sm ${
          language === 'fr'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        style={language === 'fr' ? {
          boxShadow: '0 0 12px hsl(174 60% 45% / 0.5), 0 2px 8px hsl(0 0% 0% / 0.3)'
        } : {}}
      >
        FR
      </button>
    </div>
  );
};
