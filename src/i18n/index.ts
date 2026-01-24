/**
 * Centralized i18n exports
 * All language-related utilities should be imported from this file
 */
export { LanguageProvider, useLanguage, getLanguageNativeName } from './useLanguage';
export { 
  type SupportedLanguage, 
  type LanguageMode,
  SUPPORTED_LANGUAGES,
  PRIMARY_LANGUAGES,
  SECONDARY_LANGUAGES,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  getLanguageConfig
} from './config';
export { detectBrowserLanguage, getDetectedLanguageInfo } from './detection';
export { getTranslation, getTranslationArray, hasTranslation } from './translations';
