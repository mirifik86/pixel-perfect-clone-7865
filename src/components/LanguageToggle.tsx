import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: 'en' | 'fr';
  onLanguageChange: (lang: 'en' | 'fr') => void;
}

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-muted bg-secondary/50 p-1 backdrop-blur-sm">
      <Globe className="ml-2 h-4 w-4 text-muted-foreground" />
      <button
        onClick={() => onLanguageChange('en')}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-card text-card-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        English
      </button>
      <button
        onClick={() => onLanguageChange('fr')}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
          language === 'fr'
            ? 'bg-card text-card-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Français
      </button>
    </div>
  );
};
