'use client';

import { createContext, useContext, ReactNode } from 'react';

type Translations = {
  [key: string]: any;
};

const TranslationsContext = createContext<Translations>({});

export function TranslationsProvider({
  children,
  translations,
}: {
  children: ReactNode;
  translations: Translations;
}) {
  return (
    <TranslationsContext.Provider value={translations}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslations() {
  const translations = useContext(TranslationsContext);

  const t = (key: string): string => {
    if (!key || typeof key !== 'string') return key || '';

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t };
}
