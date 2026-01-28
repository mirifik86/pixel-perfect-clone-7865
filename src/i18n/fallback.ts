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
 *
 * Additionally:
 * - If a translation object exists for the selected language but is missing keys,
 *   we merge in fallbacks (EN, then FR) so callers never see undefined labels.
 * - Empty strings are treated as "missing" and will not override fallback values.
 */
export function getTranslationWithFallback<T extends Record<string, unknown>>(
  translations: T,
  language: SupportedLanguage
): T[keyof T] {
  const selected = (language in translations ? translations[language as keyof T] : undefined) as unknown;
  const en = ('en' in translations ? translations['en' as keyof T] : undefined) as unknown;
  const fr = ('fr' in translations ? translations['fr' as keyof T] : undefined) as unknown;

  const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);

  const isMeaningful = (v: unknown): boolean => {
    if (v === undefined || v === null) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  };

  const mergeDeep = (base: unknown, override: unknown): unknown => {
    if (!isPlainObject(base) || !isPlainObject(override)) return isMeaningful(override) ? override : base;
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(override)) {
      const existing = out[k];
      if (isPlainObject(existing) && isPlainObject(v)) {
        out[k] = mergeDeep(existing, v);
        continue;
      }
      if (isMeaningful(v)) {
        out[k] = v;
      }
    }
    return out;
  };

  // If translations are objects, merge (FR → EN → selected) so missing keys fall back.
  if (isPlainObject(en) || isPlainObject(fr) || isPlainObject(selected)) {
    const base = mergeDeep(fr ?? {}, en ?? {});
    const merged = mergeDeep(base, selected ?? {});
    return merged as T[keyof T];
  }

  // Primitive fallbacks (non-object translations)
  if (isMeaningful(selected)) return selected as T[keyof T];
  if (isMeaningful(en)) return en as T[keyof T];
  if (isMeaningful(fr)) return fr as T[keyof T];

  const keys = Object.keys(translations);
  if (keys.length > 0) return translations[keys[0] as keyof T];
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
