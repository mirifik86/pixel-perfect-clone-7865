/**
 * Translation fallback utility
 * Provides safe access to component-level translations with fallback chain:
 * selectedLanguage → English → first available language
 */
import { type SupportedLanguage } from './config';

/**
 * Get translation with fallback chain
 * If the selected language is not available, falls back to English ('en'),
 * then to French ('fr'), then to the first available key.
 */
export function getTranslationWithFallback<T extends Record<string, unknown>>(
  translations: T,
  language: SupportedLanguage
): T[keyof T] {
  // Try selected language first
  if (language in translations) {
    return translations[language as keyof T];
  }
  
  // Fallback to English
  if ('en' in translations) {
    return translations['en' as keyof T];
  }
  
  // Fallback to French
  if ('fr' in translations) {
    return translations['fr' as keyof T];
  }
  
  // Fallback to first available key
  const keys = Object.keys(translations);
  if (keys.length > 0) {
    return translations[keys[0] as keyof T];
  }
  
  // Return empty object as last resort (shouldn't happen)
  return {} as T[keyof T];
}

/**
 * Type-safe helper to pick between 'en' and 'fr' labels
 * with automatic fallback for other languages
 */
export function pickLabel(
  language: SupportedLanguage, 
  labelEn: string, 
  labelFr: string
): string {
  return language === 'fr' ? labelFr : labelEn;
}
