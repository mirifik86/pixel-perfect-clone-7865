import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Globe, ChevronDown, Check, Sparkles } from 'lucide-react';
import { 
  type LanguageMode, 
  type SupportedLanguage, 
  SUPPORTED_LANGUAGES,
  isSupportedLanguage
} from '@/i18n/config';

interface LanguageToggleProps {
  mode: LanguageMode;
  language: SupportedLanguage;
  onLanguageChange: (lang: LanguageMode) => void;
}

interface DropdownPosition {
  top: number;
  left: number;
}

// All languages in display order
const ALL_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'pt', 'it', 'ja', 'ko'];

export const LanguageToggle = ({ mode, language, onLanguageChange }: LanguageToggleProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position based on trigger button
  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 220;
      
      // Check if dropdown would go off-screen on the right
      let leftPosition = rect.left;
      if (leftPosition + dropdownWidth > window.innerWidth - 16) {
        leftPosition = window.innerWidth - dropdownWidth - 16;
      }
      
      setDropdownPosition({
        top: rect.bottom + 8,
        left: leftPosition
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

  const isAutoMode = mode === 'auto';
  const activeConfig = SUPPORTED_LANGUAGES[language];

  // Portal dropdown content
  const dropdownContent = isDropdownOpen ? createPortal(
    <div 
      ref={dropdownRef}
      className="fixed rounded-xl overflow-hidden animate-fade-in"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: '220px',
        zIndex: 99999,
        pointerEvents: 'auto',
        background: 'linear-gradient(180deg, hsl(220 15% 13% / 0.97) 0%, hsl(220 15% 10% / 0.99) 100%)',
        border: '1px solid hsl(0 0% 100% / 0.1)',
        backdropFilter: 'blur(24px)',
        boxShadow: `
          0 0 0 1px hsl(0 0% 0% / 0.3),
          0 16px 48px hsl(0 0% 0% / 0.5),
          0 0 32px hsl(174 60% 40% / 0.06),
          inset 0 1px 0 hsl(0 0% 100% / 0.06)
        `
      }}
    >
      {/* Auto option */}
      <button
        onClick={() => {
          onLanguageChange('auto');
          setIsDropdownOpen(false);
        }}
        className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 group hover:bg-white/[0.04]"
        style={{
          background: isAutoMode 
            ? 'linear-gradient(90deg, hsl(174 50% 45% / 0.12) 0%, transparent 100%)'
            : 'transparent'
        }}
      >
        <div 
          className="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150"
          style={{
            background: isAutoMode
              ? 'linear-gradient(135deg, hsl(174 50% 45% / 0.25) 0%, hsl(180 45% 38% / 0.15) 100%)'
              : 'hsl(0 0% 100% / 0.06)',
            border: isAutoMode ? '1px solid hsl(174 50% 50% / 0.3)' : '1px solid transparent'
          }}
        >
          <Sparkles className={`h-3.5 w-3.5 transition-colors duration-150 ${
            isAutoMode ? 'text-teal-400' : 'text-white/40 group-hover:text-white/60'
          }`} />
        </div>
        <div className="flex flex-col items-start">
          <span className={`text-sm font-medium transition-colors duration-150 ${
            isAutoMode ? 'text-white' : 'text-white/70 group-hover:text-white/90'
          }`}>
            Auto
          </span>
          <span className="text-[10px] text-white/40">
            Recommended
          </span>
        </div>
        {isAutoMode && (
          <Check className="h-4 w-4 text-teal-400 ml-auto" />
        )}
      </button>
      
      {/* Separator */}
      <div 
        className="h-px mx-3"
        style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.08) 50%, transparent 100%)' }}
      />
      
      {/* Language list */}
      <div className="py-1.5">
        {ALL_LANGUAGES.map((lang) => {
          const config = SUPPORTED_LANGUAGES[lang];
          const isActive = mode === lang;
          
          return (
            <button
              key={lang}
              onClick={() => {
                onLanguageChange(lang);
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group hover:bg-white/[0.04]"
              style={{
                background: isActive 
                  ? 'linear-gradient(90deg, hsl(174 50% 45% / 0.12) 0%, transparent 100%)'
                  : 'transparent'
              }}
            >
              <span 
                className="text-base transition-transform duration-150 w-6 text-center"
                style={{ 
                  filter: isActive ? 'saturate(1.1)' : 'saturate(0.9)',
                  opacity: isActive ? 1 : 0.8
                }}
              >
                {config.flag}
              </span>
              <span className={`text-sm font-medium transition-colors duration-150 flex-1 text-left ${
                isActive ? 'text-white' : 'text-white/70 group-hover:text-white/90'
              }`}>
                {config.nativeName}
              </span>
              {isActive && (
                <Check className="h-4 w-4 text-teal-400" />
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
      {/* Premium trigger button with glow effects */}
      <button
        ref={triggerRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="group relative inline-flex items-center gap-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 hover:scale-[1.02]"
        style={{
          padding: '10px 16px 10px 14px',
          background: 'linear-gradient(180deg, hsl(220 18% 16% / 0.95) 0%, hsl(220 18% 11% / 0.98) 100%)',
          border: '1px solid hsl(174 50% 50% / 0.15)',
          backdropFilter: 'blur(20px)',
          boxShadow: `
            0 0 0 1px hsl(0 0% 0% / 0.25),
            0 6px 24px hsl(0 0% 0% / 0.35),
            0 0 30px hsl(174 50% 45% / 0.08),
            inset 0 1px 0 hsl(0 0% 100% / 0.08),
            inset 0 -1px 0 hsl(0 0% 0% / 0.1)
          `
        }}
      >
        {/* Outer glow ring on hover */}
        <div 
          className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(174 60% 50% / 0.15), transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
        
        {/* Inner shimmer effect */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        >
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, hsl(174 60% 60% / 0.1) 50%, transparent 60%)',
              animation: isDropdownOpen ? 'none' : undefined,
            }}
          />
        </div>
        
        {/* Flag with subtle glow */}
        <span 
          className="relative text-lg transition-all duration-200 group-hover:scale-110"
          style={{ 
            lineHeight: 1,
            filter: 'drop-shadow(0 0 4px hsl(0 0% 100% / 0.2))',
          }}
        >
          {activeConfig?.flag}
        </span>
        
        {/* Language name with gradient text on hover */}
        <span 
          className="relative text-sm font-semibold transition-all duration-200"
          style={{ 
            letterSpacing: '0.02em',
            color: 'hsl(0 0% 95%)',
            textShadow: '0 1px 2px hsl(0 0% 0% / 0.3)',
          }}
        >
          {activeConfig?.nativeName}
        </span>
        
        {/* Premium chevron with glow */}
        <div className="relative flex items-center justify-center">
          <ChevronDown 
            className="relative transition-all duration-300"
            style={{
              width: '16px',
              height: '16px',
              color: 'hsl(174 50% 60%)',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              filter: 'drop-shadow(0 0 3px hsl(174 60% 50% / 0.5))',
            }}
          />
        </div>
        
        {/* Animated border glow when open */}
        {isDropdownOpen && (
          <div 
            className="absolute -inset-px rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, hsl(174 60% 50% / 0.3), hsl(200 60% 55% / 0.2), hsl(174 60% 50% / 0.3))',
              animation: 'toggle-border-glow 2s ease-in-out infinite',
            }}
          />
        )}
      </button>
      
      {/* Portal dropdown */}
      {dropdownContent}
      
      {/* CSS for animations */}
      <style>{`
        @keyframes toggle-border-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
};
