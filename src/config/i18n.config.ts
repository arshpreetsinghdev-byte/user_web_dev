export const i18nConfig = {
  // Supported locales
  locales: ['en', 'es', 'fr', 'hi'] as const,
  
  // Default locale
  defaultLocale: 'en' as const,
  
  // Locale labels
  localeLabels: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    hi: 'हिन्दी',
  },
  
  // Locale flags
  localeFlags: {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    hi: '🇮🇳',
  },
} as const;

export type Locale = (typeof i18nConfig.locales)[number];
