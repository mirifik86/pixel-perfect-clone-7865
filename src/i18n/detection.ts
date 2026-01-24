import { 
  SupportedLanguage, 
  DEFAULT_LANGUAGE, 
  TIMEZONE_LANGUAGE_MAP,
  isSupportedLanguage 
} from './config';

/**
 * Detects the user's preferred language using multiple strategies
 * Priority: navigator.languages > navigator.language > timezone heuristic > default
 */
export const detectBrowserLanguage = (): SupportedLanguage => {
  // Strategy 1: Check navigator.languages (array of preferred languages)
  if (typeof navigator !== 'undefined' && navigator.languages?.length > 0) {
    for (const lang of navigator.languages) {
      const code = normalizeLanguageCode(lang);
      if (isSupportedLanguage(code)) {
        return code;
      }
    }
  }

  // Strategy 2: Check navigator.language (single primary language)
  if (typeof navigator !== 'undefined' && navigator.language) {
    const code = normalizeLanguageCode(navigator.language);
    if (isSupportedLanguage(code)) {
      return code;
    }
  }

  // Strategy 3: Timezone heuristic
  const timezoneLanguage = detectFromTimezone();
  if (timezoneLanguage) {
    return timezoneLanguage;
  }

  // Fallback to default
  return DEFAULT_LANGUAGE;
};

/**
 * Normalize language codes (e.g., "en-US" -> "en", "fr-CA" -> "fr")
 */
const normalizeLanguageCode = (code: string): string => {
  return code.toLowerCase().split('-')[0];
};

/**
 * Detect language from timezone
 */
const detectFromTimezone = (): SupportedLanguage | null => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone && timezone in TIMEZONE_LANGUAGE_MAP) {
      return TIMEZONE_LANGUAGE_MAP[timezone];
    }
  } catch {
    // Timezone detection failed, return null
  }
  return null;
};

/**
 * Get a human-readable name for a detected language
 * Returns the native name for better UX in prompts
 */
export const getDetectedLanguageInfo = (): { 
  code: SupportedLanguage; 
  source: 'browser' | 'timezone' | 'default' 
} => {
  // Check browser preferences first
  if (typeof navigator !== 'undefined') {
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      const code = normalizeLanguageCode(lang);
      if (isSupportedLanguage(code)) {
        return { code, source: 'browser' };
      }
    }
  }

  // Check timezone
  const timezoneLanguage = detectFromTimezone();
  if (timezoneLanguage) {
    return { code: timezoneLanguage, source: 'timezone' };
  }

  // Default
  return { code: DEFAULT_LANGUAGE, source: 'default' };
};
