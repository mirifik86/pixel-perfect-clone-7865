import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  language: SupportedLanguage;
  onLanguageChange: (lang: LanguageMode) => void;
}

interface DropdownPosition {
  top: number;
  left: number;
}

export const LanguageToggle = ({ mode, language, onLanguageChange }: LanguageToggleProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position based on trigger button
  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 12,
        left: rect.left + rect.width / 2
      });
    }
  }, []);

  // Update position when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition();
    }
  }, [isDropdownOpen, updateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      
      if (isOutsideTrigger && isOutsideDropdown) {
        setIsDropdownOpen(false);
      }
    };
    
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

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

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDropdownOpen]);

  // Check if current mode is a secondary language or auto
  const isSecondaryActive = mode === 'auto' || SECONDARY_LANGUAGES.includes(mode as SupportedLanguage);

  // Calculate active index for sliding pill
  const getActiveIndex = () => {
    if (PRIMARY_LANGUAGES.includes(mode as SupportedLanguage)) {
      return PRIMARY_LANGUAGES.indexOf(mode as SupportedLanguage);
    }
    return 2; // Globe/Auto position
  };

  const activeIndex = getActiveIndex();

  // Portal dropdown content
  const dropdownContent = isDropdownOpen ? createPortal(
    <div 
      ref={dropdownRef}
      className="fixed rounded-2xl overflow-hidden animate-fade-in"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        transform: 'translateX(-50%)',
        zIndex: 99999,
        pointerEvents: 'auto',
        background: 'linear-gradient(180deg, hsl(220 15% 13% / 0.95) 0%, hsl(220 15% 10% / 0.98) 100%)',
        border: '1px solid hsl(0 0% 100% / 0.08)',
        backdropFilter: 'blur(20px)',
        boxShadow: `
          0 0 0 1px hsl(0 0% 0% / 0.3),
          0 20px 50px hsl(0 0% 0% / 0.5),
          0 0 40px hsl(174 60% 40% / 0.08),
          inset 0 1px 0 hsl(0 0% 100% / 0.05)
        `
      }}
    >
      {/* Auto option */}
      <button
        onClick={() => {
          onLanguageChange('auto');
          setIsDropdownOpen(false);
        }}
        className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 transition-all duration-200 group"
        style={{
          background: mode === 'auto' 
            ? 'linear-gradient(180deg, hsl(0 0% 100% / 0.08) 0%, hsl(0 0% 100% / 0.03) 100%)'
            : 'transparent'
        }}
      >
        <div 
          className="flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200"
          style={{
            background: mode === 'auto'
              ? 'linear-gradient(135deg, hsl(174 50% 45% / 0.8) 0%, hsl(180 45% 38% / 0.8) 100%)'
              : 'hsl(0 0% 100% / 0.1)',
            boxShadow: mode === 'auto' ? '0 0 8px hsl(174 50% 45% / 0.3)' : 'none'
          }}
        >
          <Globe className={`h-3 w-3 transition-colors duration-200 ${
            mode === 'auto' ? 'text-white' : 'text-white/50 group-hover:text-white/70'
          }`} />
        </div>
        <span className={`text-sm font-medium tracking-tight transition-colors duration-200 ${
          mode === 'auto' ? 'text-white' : 'text-white/60 group-hover:text-white/80'
        }`}>
          Auto
        </span>
        <span className="text-xs opacity-50">✦</span>
        {mode === 'auto' && (
          <Check className="h-3.5 w-3.5 text-white/70 ml-1" />
        )}
      </button>
      
      {/* Separator */}
      <div 
        className="h-px mx-4"
        style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.1) 50%, transparent 100%)' }}
      />
      
      {/* Language grid */}
      <div className="flex flex-wrap justify-center gap-1.5 p-3" style={{ maxWidth: '300px' }}>
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
              className="relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 group"
              style={{
                width: '85px',
                height: '64px',
                background: isActive 
                  ? 'linear-gradient(180deg, hsl(0 0% 100% / 0.1) 0%, hsl(0 0% 100% / 0.04) 100%)'
                  : 'transparent',
                border: isActive 
                  ? '1px solid hsl(0 0% 100% / 0.12)' 
                  : '1px solid transparent',
                boxShadow: isActive 
                  ? 'inset 0 1px 0 hsl(0 0% 100% / 0.08), 0 0 12px hsl(174 50% 45% / 0.1)' 
                  : 'none'
              }}
              title={config.nativeName}
            >
              <span 
                className="text-xl mb-0.5 transition-transform duration-200"
                style={{ 
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  filter: isActive ? 'drop-shadow(0 0 4px hsl(0 0% 100% / 0.2))' : 'none'
                }}
              >
                {config.flag}
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wide transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-white/50 group-hover:text-white/70'
              }`}>
                {lang.toUpperCase()}
              </span>
              {isActive && (
                <div 
                  className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, hsl(174 50% 50%) 0%, hsl(180 45% 42%) 100%)',
                    boxShadow: '0 0 6px hsl(174 50% 45% / 0.4)'
                  }}
                >
                  <Check className="h-2 w-2 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <style>{`
        @keyframes pill-glow {
          0%, 100% { box-shadow: 0 0 8px hsl(174 40% 45% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.1); }
          50% { box-shadow: 0 0 12px hsl(174 40% 45% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.12); }
        }
      `}</style>
      
      <div className="relative inline-flex items-center gap-3" style={{ zIndex: 9999 }}>
        {/* Main segmented control */}
        <div 
          className="relative inline-flex items-center rounded-full"
          style={{
            padding: '3px',
            background: 'linear-gradient(180deg, hsl(220 15% 15% / 0.9) 0%, hsl(220 15% 12% / 0.95) 100%)',
            border: '1px solid hsl(0 0% 100% / 0.08)',
            backdropFilter: 'blur(16px)',
            boxShadow: `
              0 0 0 1px hsl(0 0% 0% / 0.2),
              0 4px 16px hsl(0 0% 0% / 0.3),
              0 0 20px hsl(174 40% 40% / 0.05),
              inset 0 1px 0 hsl(0 0% 100% / 0.04)
            `
          }}
        >
          {/* Sliding glass pill indicator */}
          <div 
            className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-full transition-all duration-250 ease-out"
            style={{
              width: 'calc(33.333% - 2px)',
              left: `calc(${activeIndex * 33.333}% + 1px)`,
              background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.12) 0%, hsl(0 0% 100% / 0.05) 100%)',
              border: '1px solid hsl(0 0% 100% / 0.1)',
              boxShadow: `
                inset 0 1px 0 hsl(0 0% 100% / 0.08),
                inset 0 -1px 0 hsl(0 0% 0% / 0.1),
                0 0 8px hsl(174 40% 45% / 0.12)
              `,
              animation: 'pill-glow 3s ease-in-out infinite'
            }}
          />
          
          {/* EN and FR buttons */}
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
                className="relative z-10 flex items-center justify-center gap-1 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                style={{
                  minWidth: '56px',
                  height: '32px',
                  padding: '0 10px'
                }}
                title={config?.nativeName}
              >
                <span 
                  className="transition-all duration-200"
                  style={{ 
                    fontSize: '0.75rem', 
                    lineHeight: 1,
                    opacity: isActive ? 1 : 0.6,
                    filter: isActive ? 'saturate(1.1)' : 'saturate(0.8)'
                  }}
                >
                  {config?.flag}
                </span>
                <span 
                  className="transition-all duration-200"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.02em',
                    color: isActive ? 'hsl(0 0% 100%)' : 'hsl(0 0% 100% / 0.5)',
                    textTransform: 'uppercase'
                  }}
                >
                  {lang.toUpperCase()}
                </span>
              </button>
            );
          })}
          
          {/* Globe dropdown trigger */}
          <button
            ref={triggerRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative z-10 flex items-center justify-center gap-1 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            style={{
              minWidth: '56px',
              height: '32px',
              padding: '0 8px'
            }}
            title="More languages"
          >
            <Globe 
              className="transition-all duration-200"
              style={{
                width: '13px',
                height: '13px',
                color: isSecondaryActive ? 'hsl(0 0% 100%)' : 'hsl(0 0% 100% / 0.5)'
              }}
            />
            {isSecondaryActive && mode !== 'auto' && (
              <span 
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: 'hsl(0 0% 100%)',
                  textTransform: 'uppercase'
                }}
              >
                {mode.toUpperCase()}
              </span>
            )}
            <ChevronDown 
              className="transition-all duration-200"
              style={{
                width: '11px',
                height: '11px',
                color: isSecondaryActive ? 'hsl(0 0% 100% / 0.7)' : 'hsl(0 0% 100% / 0.4)',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>
        </div>
        
        {/* Active language badge */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300"
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100% / 0.06) 0%, hsl(0 0% 100% / 0.02) 100%)',
            border: '1px solid hsl(0 0% 100% / 0.08)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <span 
            className="transition-transform duration-200"
            style={{ fontSize: '0.9rem', lineHeight: 1 }}
          >
            {SUPPORTED_LANGUAGES[language]?.flag}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              color: 'hsl(174 40% 65%)',
              textTransform: 'uppercase'
            }}
          >
            {SUPPORTED_LANGUAGES[language]?.nativeName || language.toUpperCase()}
          </span>
          <div 
            className="w-1 h-1 rounded-full"
            style={{
              background: 'hsl(174 50% 55%)',
              boxShadow: '0 0 4px hsl(174 50% 55% / 0.5)'
            }}
          />
        </div>
      </div>
      
      {/* Portal dropdown */}
      {dropdownContent}
    </>
  );
};
