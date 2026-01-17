import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: 'en' | 'fr';
  onLanguageChange: (lang: 'en' | 'fr') => void;
}

export const LanguageToggle = ({ language, onLanguageChange }: LanguageToggleProps) => {
  return (
    <div className="relative inline-flex">
      {/* Outer glow effect */}
      <div 
        className="absolute -inset-[1px] rounded-full"
        style={{
          background: 'linear-gradient(135deg, hsl(174 60% 50% / 0.3), hsl(174 60% 40% / 0.1), hsl(174 60% 50% / 0.2))',
          filter: 'blur(1px)',
        }}
      />
      
      {/* Premium border container with shimmer */}
      <div 
        className="relative overflow-hidden rounded-full"
        style={{
          background: 'linear-gradient(135deg, hsl(174 50% 45% / 0.4), hsl(174 40% 35% / 0.2), hsl(174 50% 45% / 0.3))',
          padding: '1px',
        }}
      >
        {/* Shimmer animation overlay */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, hsl(174 70% 60% / 0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
        
        {/* Inner content container */}
        <div 
          className="relative flex items-center rounded-full bg-gradient-to-b from-black/80 to-black/90 p-1 backdrop-blur-xl md:p-1.5"
          style={{
            boxShadow: 'inset 0 1px 0 hsl(0 0% 100% / 0.08), inset 0 -1px 0 hsl(0 0% 0% / 0.3)',
          }}
        >
          <button
            onClick={() => onLanguageChange('en')}
            className={`flex min-w-[44px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 md:min-w-[56px] md:px-4 md:py-2 md:text-sm ${
              language === 'en'
                ? 'bg-primary text-primary-foreground'
                : 'text-white/50 hover:text-white/80'
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
                ? 'bg-primary text-primary-foreground'
                : 'text-white/50 hover:text-white/80'
            }`}
            style={language === 'fr' ? {
              boxShadow: '0 0 12px hsl(174 60% 45% / 0.5), 0 2px 8px hsl(0 0% 0% / 0.3)'
            } : {}}
          >
            FR
          </button>
        </div>
      </div>
    </div>
  );
};
