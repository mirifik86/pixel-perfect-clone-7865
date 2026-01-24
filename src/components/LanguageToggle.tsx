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
      {/* Single trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative inline-flex items-center gap-2.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
        style={{
          padding: '8px 14px 8px 12px',
          background: 'linear-gradient(180deg, hsl(220 15% 15% / 0.9) 0%, hsl(220 15% 12% / 0.95) 100%)',
          border: '1px solid hsl(0 0% 100% / 0.1)',
          backdropFilter: 'blur(16px)',
          boxShadow: `
            0 0 0 1px hsl(0 0% 0% / 0.2),
            0 4px 16px hsl(0 0% 0% / 0.25),
            0 0 20px hsl(174 40% 40% / 0.04),
            inset 0 1px 0 hsl(0 0% 100% / 0.05)
          `
        }}
      >
        {/* Globe or flag */}
        {isAutoMode ? (
          <Globe 
            className="text-teal-400 transition-all duration-200"
            style={{ width: '16px', height: '16px' }}
          />
        ) : (
          <span 
            className="text-base transition-transform duration-200"
            style={{ lineHeight: 1 }}
          >
            {activeConfig?.flag}
          </span>
        )}
        
        {/* Language name */}
        <span 
          className="text-sm font-medium text-white/90 transition-colors duration-200"
          style={{ letterSpacing: '-0.01em' }}
        >
          {isAutoMode ? 'Auto' : activeConfig?.nativeName}
        </span>
        
        {/* Chevron */}
        <ChevronDown 
          className="transition-all duration-200 text-white/50"
          style={{
            width: '14px',
            height: '14px',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: '-2px'
          }}
        />
      </button>
      
      {/* Portal dropdown */}
      {dropdownContent}
    </>
  );
};
