import { Globe } from 'lucide-react';
import { 
  LanguageMode, 
  SupportedLanguage, 
  PRIMARY_LANGUAGES,
  SUPPORTED_LANGUAGES 
} from '@/i18n';

interface LanguageToggleProps {
  mode: LanguageMode;
  language: SupportedLanguage; // Resolved language for display
  onLanguageChange: (lang: LanguageMode) => void;
}

type ToggleOption = {
  value: LanguageMode;
  label: string | React.ReactNode;
  isIcon?: boolean;
};

export const LanguageToggle = ({ mode, language, onLanguageChange }: LanguageToggleProps) => {
  // Build toggle options: EN | FR | Auto(🌐)
  const options: ToggleOption[] = [
    ...PRIMARY_LANGUAGES.map(lang => ({
      value: lang as LanguageMode,
      label: lang.toUpperCase()
    })),
    {
      value: 'auto' as LanguageMode,
      label: <Globe className="h-3.5 w-3.5" />,
      isIcon: true
    }
  ];

  // Find active index for slider positioning
  const activeIndex = options.findIndex(opt => opt.value === mode);
  const optionCount = options.length;

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
      
      {/* PRO border glow ring with pulse animation */}
      <div 
        className="pointer-events-none absolute -inset-[1px] rounded-full"
        style={{
          background: 'linear-gradient(135deg, hsl(174 65% 55% / 0.5) 0%, hsl(180 55% 45% / 0.2) 50%, hsl(174 65% 55% / 0.5) 100%)',
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animation: 'lang-border-pulse 3s ease-in-out infinite'
        }}
      />
      
      {/* Animated glow aura */}
      <div 
        className="pointer-events-none absolute -inset-1 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(174 60% 50% / 0.2) 0%, transparent 70%)',
          animation: 'lang-glow-pulse 3s ease-in-out infinite',
          filter: 'blur(4px)'
        }}
      />
      
      <style>{`
        @keyframes lang-border-pulse {
          0%, 100% {
            opacity: 0.6;
            filter: brightness(1);
          }
          50% {
            opacity: 1;
            filter: brightness(1.3);
          }
        }
        @keyframes lang-glow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
      `}</style>
      
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
            width: `calc(${100 / optionCount}% - 4px)`,
            left: `calc(${(activeIndex / optionCount) * 100}% + 2px)`,
            background: 'linear-gradient(135deg, hsl(174 65% 48%) 0%, hsl(180 55% 40%) 100%)',
            boxShadow: `
              0 0 10px hsl(174 60% 45% / 0.4),
              0 2px 6px hsl(0 0% 0% / 0.25),
              inset 0 1px 1px hsl(0 0% 100% / 0.15)
            `
          }}
        />
        
        {/* Option buttons */}
        {options.map((option, index) => {
          const isActive = mode === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onLanguageChange(option.value)}
              className={`relative z-10 flex items-center justify-center rounded-full font-medium uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground/60 hover:text-foreground/80'
              }`}
              style={{
                minWidth: option.isIcon ? '2.25rem' : '2.75rem',
                minHeight: '2.25rem',
                padding: option.isIcon ? '0.5rem' : '0.5rem 0.75rem',
                fontSize: option.isIcon ? undefined : 'clamp(0.65rem, 2vw, 0.7rem)',
                letterSpacing: option.isIcon ? undefined : '0.08em',
                textShadow: isActive ? '0 1px 2px hsl(0 0% 0% / 0.25)' : 'none'
              }}
              title={option.value === 'auto' 
                ? `Auto (${SUPPORTED_LANGUAGES[language]?.nativeName || language.toUpperCase()})` 
                : SUPPORTED_LANGUAGES[option.value as SupportedLanguage]?.nativeName
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
      
      {/* Auto mode indicator - shows resolved language */}
      {mode === 'auto' && (
        <div 
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center animate-fade-in"
          style={{
            fontSize: '0.6rem',
            color: 'hsl(174 60% 55%)',
            letterSpacing: '0.05em'
          }}
        >
          {SUPPORTED_LANGUAGES[language]?.nativeName || language.toUpperCase()}
        </div>
      )}
    </div>
  );
};
