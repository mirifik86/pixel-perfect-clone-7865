// Main i18n exports
export { LanguageProvider, useLanguage, getLanguageNativeName } from './useLanguage';
export { 
  type SupportedLanguage, 
  type LanguageMode,
  SUPPORTED_LANGUAGES,
  PRIMARY_LANGUAGES,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  getLanguageConfig
} from './config';
export { detectBrowserLanguage, getDetectedLanguageInfo } from './detection';
export { getTranslation, getTranslationArray, hasTranslation } from './translations';
