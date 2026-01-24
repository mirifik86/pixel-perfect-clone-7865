import { SupportedLanguage, DEFAULT_LANGUAGE } from './config';

// Import all locale files
import en from './locales/en.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';

// Type for translation keys (nested object paths)
type TranslationValue = string | string[] | Record<string, unknown>;
type TranslationObject = Record<string, TranslationValue | Record<string, TranslationValue>>;

// All translations indexed by language code
const translations: Record<SupportedLanguage, TranslationObject> = {
  en,
  fr,
  ja
};

/**
 * Get a nested value from an object using dot notation
 * e.g., getNestedValue(obj, 'form.placeholder')
 */
const getNestedValue = (obj: TranslationObject, path: string): TranslationValue | undefined => {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return current as TranslationValue;
};

/**
 * Get a translation by key with fallback chain:
 * selected language → EN → key name
 */
export const getTranslation = (
  language: SupportedLanguage,
  key: string,
  interpolations?: Record<string, string>
): string => {
  // Try selected language
  let value = getNestedValue(translations[language], key);
  
  // Fallback to English if not found
  if (value === undefined && language !== DEFAULT_LANGUAGE) {
    value = getNestedValue(translations[DEFAULT_LANGUAGE], key);
  }
  
  // Final fallback to key name
  if (value === undefined) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  // Handle string value
  if (typeof value === 'string') {
    return interpolate(value, interpolations);
  }
  
  // If it's an array or object, return the key (caller should handle these cases)
  return key;
};

/**
 * Get a translation array (e.g., for loader messages)
 */
export const getTranslationArray = (
  language: SupportedLanguage,
  key: string
): string[] => {
  let value = getNestedValue(translations[language], key);
  
  if (!Array.isArray(value) && language !== DEFAULT_LANGUAGE) {
    value = getNestedValue(translations[DEFAULT_LANGUAGE], key);
  }
  
  if (Array.isArray(value)) {
    return value as string[];
  }
  
  console.warn(`Translation array missing for key: ${key}`);
  return [];
};

/**
 * Interpolate variables in translation strings
 * e.g., "Hello {{name}}" with {name: "World"} → "Hello World"
 */
const interpolate = (
  text: string, 
  interpolations?: Record<string, string>
): string => {
  if (!interpolations) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return interpolations[key] ?? match;
  });
};

/**
 * Get all translations for a language
 */
export const getAllTranslations = (language: SupportedLanguage): TranslationObject => {
  return translations[language] || translations[DEFAULT_LANGUAGE];
};

/**
 * Check if a translation key exists
 */
export const hasTranslation = (language: SupportedLanguage, key: string): boolean => {
  return getNestedValue(translations[language], key) !== undefined;
};
