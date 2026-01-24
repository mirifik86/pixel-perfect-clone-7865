// Supported languages configuration
export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'it' | 'ja' | 'ko';
export type LanguageMode = SupportedLanguage | 'auto';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
}

// All supported languages with their metadata
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷'
  }
};

// Primary languages always shown in toggle (not in dropdown)
export const PRIMARY_LANGUAGES: SupportedLanguage[] = ['en', 'fr'];

// Secondary languages shown in dropdown menu
export const SECONDARY_LANGUAGES: SupportedLanguage[] = ['es', 'de', 'pt', 'it', 'ja', 'ko'];

// Default fallback language
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

// localStorage keys
export const STORAGE_KEYS = {
  selectedLanguage: 'leenscore_selected_language',
  languagePromptSeen: 'leenscore_language_prompt_seen'
} as const;

// Timezone to language mapping for detection heuristic
export const TIMEZONE_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  // Japanese timezones
  'Asia/Tokyo': 'ja',
  'Asia/Osaka': 'ja',
  
  // Korean timezones
  'Asia/Seoul': 'ko',
  
  // French timezones
  'Europe/Paris': 'fr',
  'Europe/Brussels': 'fr',
  'Europe/Luxembourg': 'fr',
  'Africa/Algiers': 'fr',
  'Africa/Casablanca': 'fr',
  'America/Montreal': 'fr',
  
  // Spanish timezones
  'Europe/Madrid': 'es',
  'Atlantic/Canary': 'es',
  'America/Mexico_City': 'es',
  'America/Buenos_Aires': 'es',
  'America/Bogota': 'es',
  'America/Lima': 'es',
  'America/Santiago': 'es',
  
  // German timezones
  'Europe/Berlin': 'de',
  'Europe/Vienna': 'de',
  'Europe/Zurich': 'de',
  
  // Portuguese timezones
  'Europe/Lisbon': 'pt',
  'America/Sao_Paulo': 'pt',
  'Atlantic/Azores': 'pt',
  
  // Italian timezones
  'Europe/Rome': 'it',
  
  // English timezones (explicit, though it's the default)
  'America/New_York': 'en',
  'America/Chicago': 'en',
  'America/Los_Angeles': 'en',
  'America/Denver': 'en',
  'Europe/London': 'en',
  'Australia/Sydney': 'en',
  'Australia/Melbourne': 'en'
};

// Check if a language code is supported
export const isSupportedLanguage = (code: string): code is SupportedLanguage => {
  return code in SUPPORTED_LANGUAGES;
};

// Get language config safely
export const getLanguageConfig = (code: SupportedLanguage): LanguageConfig => {
  return SUPPORTED_LANGUAGES[code];
};
