import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { 
  LanguageMode, 
  SupportedLanguage, 
  PRIMARY_LANGUAGES,
  SECONDARY_LANGUAGES,
  SUPPORTED_LANGUAGES 
} from '@/i18n';

interface LanguageToggleProps {
  mode: LanguageMode;
  language: SupportedLanguage; // Resolved language for display
  onLanguageChange: (lang: LanguageMode) => void;
}

export const LanguageToggle = ({ mode, language, onLanguageChange }: LanguageToggleProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDropdownOpen]);

  // Check if current mode is a secondary language or auto
  const isSecondaryActive = mode === 'auto' || SECONDARY_LANGUAGES.includes(mode as SupportedLanguage);

  // Get display info for the globe button
  const getGlobeLabel = () => {
    if (mode === 'auto') return 'Auto';
    if (SECONDARY_LANGUAGES.includes(mode as SupportedLanguage)) {
      return mode.toUpperCase();
    }
    return null;
  };

  const globeLabel = getGlobeLabel();

  return (
    <div className="relative inline-flex items-center z-[100]" ref={dropdownRef}>
      {/* Subtle outer glow */}
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
          0%, 100% { opacity: 0.6; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.3); }
        }
        @keyframes lang-glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes lang-dot-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      
      {/* Main container */}
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
            width: `calc(${100 / 3}% - 4px)`,
            left: PRIMARY_LANGUAGES.includes(mode as SupportedLanguage) 
              ? `calc(${(PRIMARY_LANGUAGES.indexOf(mode as SupportedLanguage) / 3) * 100}% + 2px)`
              : `calc(${(2 / 3) * 100}% + 2px)`,
            background: 'linear-gradient(135deg, hsl(174 65% 48%) 0%, hsl(180 55% 40%) 100%)',
            boxShadow: `
              0 0 10px hsl(174 60% 45% / 0.4),
              0 2px 6px hsl(0 0% 0% / 0.25),
              inset 0 1px 1px hsl(0 0% 100% / 0.15)
            `
          }}
        />
        
        {/* EN and FR buttons with flags */}
        {PRIMARY_LANGUAGES.map((lang) => {
          const isActive = mode === lang;
          const config = SUPPORTED_LANGUAGES[lang];
          
          return (
            <button
              key={lang}
              onClick={() => {
                onLanguageChange(lang);
                setIsDropdownOpen(false);
              }}
              className={`relative z-10 flex items-center justify-center gap-1 rounded-full font-medium uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground/60 hover:text-foreground/80'
              }`}
              style={{
                minWidth: '3.25rem',
                minHeight: '2.25rem',
                padding: '0.5rem 0.6rem',
                fontSize: 'clamp(0.65rem, 2vw, 0.7rem)',
                letterSpacing: '0.08em',
                textShadow: isActive ? '0 1px 2px hsl(0 0% 0% / 0.25)' : 'none'
              }}
              title={config?.nativeName}
            >
              <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>{config?.flag}</span>
              <span>{lang.toUpperCase()}</span>
            </button>
          );
        })}
        
        {/* Globe dropdown button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`relative z-10 flex items-center justify-center gap-1 rounded-full font-medium uppercase tracking-wider transition-all duration-300 ${
            isSecondaryActive
              ? 'text-primary-foreground'
              : 'text-muted-foreground/60 hover:text-foreground/80'
          }`}
          style={{
            minWidth: globeLabel ? '3rem' : '2.25rem',
            minHeight: '2.25rem',
            padding: '0.5rem',
            textShadow: isSecondaryActive ? '0 1px 2px hsl(0 0% 0% / 0.25)' : 'none'
          }}
          title="More languages"
        >
          <Globe className="h-3.5 w-3.5" />
          {globeLabel && (
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>
              {globeLabel}
            </span>
          )}
          <ChevronDown 
            className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>
      
      {/* Premium Horizontal Dropdown */}
      {isDropdownOpen && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[200] rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-xl animate-fade-in overflow-hidden"
          style={{
            boxShadow: `
              0 0 30px hsl(174 60% 45% / 0.2),
              0 15px 50px hsl(0 0% 0% / 0.4),
              inset 0 1px 1px hsl(0 0% 100% / 0.1)
            `
          }}
        >
          {/* Auto option - Top row */}
          <button
            onClick={() => {
              onLanguageChange('auto');
              setIsDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-sm transition-all duration-300 ${
              mode === 'auto' 
                ? 'text-foreground' 
                : 'text-foreground/70 hover:text-foreground hover:bg-primary/10'
            }`}
            style={{
              background: mode === 'auto' 
                ? 'linear-gradient(135deg, hsl(174 60% 45% / 0.2) 0%, hsl(180 55% 40% / 0.1) 100%)'
                : 'transparent'
            }}
          >
            <div 
              className="flex items-center justify-center w-6 h-6 rounded-full"
              style={{
                background: mode === 'auto'
                  ? 'linear-gradient(135deg, hsl(174 65% 48%) 0%, hsl(180 55% 40%) 100%)'
                  : 'hsl(174 60% 45% / 0.2)',
                boxShadow: mode === 'auto' ? '0 0 10px hsl(174 60% 45% / 0.4)' : 'none'
              }}
            >
              <Globe className={`h-3.5 w-3.5 ${mode === 'auto' ? 'text-white' : 'text-primary'}`} />
            </div>
            <span className="font-medium">Auto</span>
            <span className="text-xs" style={{ color: 'hsl(174 50% 55%)' }}>✨</span>
            {mode === 'auto' && <Check className="h-4 w-4 text-primary ml-1" />}
          </button>
          
          {/* Separator */}
          <div 
            className="h-px mx-4"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(174 60% 50% / 0.3) 50%, transparent 100%)'
            }}
          />
          
          {/* Horizontal language grid */}
          <div 
            className="flex flex-wrap justify-center gap-1 p-3"
            style={{ maxWidth: '320px' }}
          >
            {SECONDARY_LANGUAGES.map((lang) => {
              const config = SUPPORTED_LANGUAGES[lang];
              const isActive = mode === lang;
              
              return (
                <button
                  key={lang}
                  onClick={() => {
                    onLanguageChange(lang);
                    setIsDropdownOpen(false);
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/20 scale-105' 
                      : 'hover:bg-primary/10 hover:scale-102'
                  }`}
                  style={{
                    width: '90px',
                    height: '70px',
                    boxShadow: isActive 
                      ? '0 0 12px hsl(174 60% 45% / 0.3), inset 0 1px 1px hsl(0 0% 100% / 0.1)' 
                      : 'none',
                    border: isActive ? '1px solid hsl(174 60% 50% / 0.3)' : '1px solid transparent'
                  }}
                  title={config.nativeName}
                >
                  {/* Flag */}
                  <span 
                    className="text-2xl mb-1"
                    style={{ 
                      filter: isActive ? 'drop-shadow(0 0 6px hsl(174 60% 50% / 0.5))' : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {config.flag}
                  </span>
                  
                  {/* Language code */}
                  <span 
                    className={`text-xs font-medium uppercase tracking-wide ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    style={{
                      background: isActive 
                        ? 'linear-gradient(135deg, hsl(174 70% 65%) 0%, hsl(180 60% 75%) 100%)'
                        : 'none',
                      WebkitBackgroundClip: isActive ? 'text' : 'unset',
                      WebkitTextFillColor: isActive ? 'transparent' : 'inherit'
                    }}
                  >
                    {lang.toUpperCase()}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div 
                      className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, hsl(174 65% 48%) 0%, hsl(180 55% 40%) 100%)',
                        boxShadow: '0 0 6px hsl(174 60% 45% / 0.5)'
                      }}
                    >
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Premium language indicator - right side */}
      <div 
        className="ml-3 flex items-center gap-2 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, hsl(174 60% 45% / 0.15) 0%, hsl(180 55% 40% / 0.08) 100%)',
          borderRadius: '8px',
          padding: '6px 12px',
          border: '1px solid hsl(174 60% 50% / 0.25)',
          boxShadow: `
            0 0 12px hsl(174 60% 45% / 0.1),
            inset 0 1px 1px hsl(0 0% 100% / 0.05)
          `
        }}
      >
        {/* Flag with glow effect */}
        <div 
          className="relative flex items-center justify-center"
          style={{
            filter: 'drop-shadow(0 0 4px hsl(174 60% 50% / 0.4))'
          }}
        >
          <span 
            style={{ 
              fontSize: '1.1rem', 
              lineHeight: 1,
              animation: 'lang-dot-pulse 2s ease-in-out infinite'
            }}
          >
            {SUPPORTED_LANGUAGES[language]?.flag}
          </span>
        </div>
        
        {/* Language name with gradient */}
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, hsl(174 70% 65%) 0%, hsl(180 60% 75%) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase'
          }}
        >
          {SUPPORTED_LANGUAGES[language]?.nativeName || language.toUpperCase()}
        </span>
        
        {/* Subtle glow dot */}
        <div 
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: 'hsl(174 65% 55%)',
            boxShadow: '0 0 6px hsl(174 65% 55% / 0.6)',
            animation: 'lang-dot-pulse 2s ease-in-out infinite'
          }}
        />
      </div>
    </div>
  );
};
