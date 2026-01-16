import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: 'en' | 'fr';
  onLanguageChange: (lang: 'en' | 'fr') => void;
}

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-muted bg-secondary/50 p-0.5 backdrop-blur-sm md:p-1">
      <Globe className="ml-1.5 h-3 w-3 text-muted-foreground md:ml-2 md:h-4 md:w-4" />
      <button
        onClick={() => onLanguageChange('en')}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all md:px-4 md:py-1.5 md:text-sm ${
          language === 'en'
            ? 'bg-card text-card-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onLanguageChange('fr')}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all md:px-4 md:py-1.5 md:text-sm ${
          language === 'fr'
            ? 'bg-card text-card-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        FR
      </button>
    </div>
  );
};
