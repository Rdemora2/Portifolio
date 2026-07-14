export const locales = ['pt', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt';

const documentLanguages: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-MX",
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDocumentLanguage(locale: Locale): string {
  return documentLanguages[locale]
}
