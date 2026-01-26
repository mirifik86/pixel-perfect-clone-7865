import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  SupportedLanguage, 
  LanguageMode, 
  DEFAULT_LANGUAGE, 
  PRIMARY_LANGUAGES,
  STORAGE_KEYS,
  SUPPORTED_LANGUAGES,
  isSupportedLanguage
} from './config';
import { detectBrowserLanguage } from './detection';
import { getTranslation, getTranslationArray } from './translations';

interface LanguageContextValue {
  // Current effective language (resolved from 'auto' if needed)
  language: SupportedLanguage;
  // Current mode ('auto', 'en', 'fr', etc.)
  mode: LanguageMode;
  // Change language/mode
  setLanguage: (lang: LanguageMode) => void;
  // Translation function
  t: (key: string, interpolations?: Record<string, string>) => string;
  // Translation array function
  tArray: (key: string) => string[];
  // Whether to show the language prompt
  shouldShowPrompt: boolean;
  // Detected language info for prompt
  detectedLanguage: SupportedLanguage | null;
  // Handle prompt response
  handlePromptResponse: (accept: boolean) => void;
  // Dismiss prompt
  dismissPrompt: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [mode, setMode] = useState<LanguageMode>(() => {
    // Initialize from localStorage or default to 'auto'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.selectedLanguage);
      if (stored && (isSupportedLanguage(stored) || stored === 'auto')) {
        return stored as LanguageMode;
      }
    }
    return 'auto';
  });

  const [resolvedLanguage, setResolvedLanguage] = useState<SupportedLanguage>(() => {
    // Initialize resolved language
    if (mode !== 'auto') {
      return mode;
    }
    return detectBrowserLanguage();
  });

  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguage | null>(null);

  // Resolve language when mode changes
  useEffect(() => {
    if (mode === 'auto') {
      const detected = detectBrowserLanguage();
      setResolvedLanguage(detected);
    } else {
      setResolvedLanguage(mode);
    }
  }, [mode]);

  // Check if we should show the language prompt (first visit only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const promptSeen = localStorage.getItem(STORAGE_KEYS.languagePromptSeen);
    const storedLanguage = localStorage.getItem(STORAGE_KEYS.selectedLanguage);

    // Only show prompt on first visit (no stored preference and prompt not seen)
    if (!promptSeen && !storedLanguage) {
      const detected = detectBrowserLanguage();
      
      // Show prompt only if detected language is NOT a primary language (EN/FR)
      if (!PRIMARY_LANGUAGES.includes(detected)) {
        setDetectedLanguage(detected);
        setShouldShowPrompt(true);
      } else {
        // Mark as seen since we're not showing the prompt
        localStorage.setItem(STORAGE_KEYS.languagePromptSeen, 'true');
      }
    }
  }, []);

  // Save mode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.selectedLanguage, mode);
    }
  }, [mode]);

  const setLanguage = useCallback((lang: LanguageMode) => {
    setMode(lang);
    // Mark that user has made a manual choice (prevents future prompts)
    if (lang !== 'auto') {
      localStorage.setItem(STORAGE_KEYS.languagePromptSeen, 'true');
    }
  }, []);

  const handlePromptResponse = useCallback((accept: boolean) => {
    if (accept && detectedLanguage) {
      setMode(detectedLanguage);
    }
    // Mark prompt as seen
    localStorage.setItem(STORAGE_KEYS.languagePromptSeen, 'true');
    setShouldShowPrompt(false);
    setDetectedLanguage(null);
  }, [detectedLanguage]);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.languagePromptSeen, 'true');
    setShouldShowPrompt(false);
    setDetectedLanguage(null);
  }, []);

  const t = useCallback((key: string, interpolations?: Record<string, string>): string => {
    return getTranslation(resolvedLanguage, key, interpolations);
  }, [resolvedLanguage]);

  const tArray = useCallback((key: string): string[] => {
    return getTranslationArray(resolvedLanguage, key);
  }, [resolvedLanguage]);

  const value: LanguageContextValue = {
    language: resolvedLanguage,
    mode,
    setLanguage,
    t,
    tArray,
    shouldShowPrompt,
    detectedLanguage,
    handlePromptResponse,
    dismissPrompt
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access language context
 * Returns a fallback during Vite HMR desync to prevent crashes
 */
export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  
  // Fallback for Vite HMR desync - prevents crash during hot reload
  if (!context) {
    const fallbackLanguage: SupportedLanguage = 'en';
    return {
      language: fallbackLanguage,
      mode: 'auto',
      setLanguage: () => {},
      t: (key: string) => key,
      tArray: () => [],
      shouldShowPrompt: false,
      detectedLanguage: null,
      handlePromptResponse: () => {},
      dismissPrompt: () => {},
    };
  }
  
  return context;
};

/**
 * Get native name for a language (for display in prompts)
 */
export const getLanguageNativeName = (code: SupportedLanguage): string => {
  return SUPPORTED_LANGUAGES[code]?.nativeName || code.toUpperCase();
};
