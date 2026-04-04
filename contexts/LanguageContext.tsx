'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Language, translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function mergeDeep<T>(target: T, source: Partial<T>): T {
  const output = { ...target } as any;

  if (source && typeof source === 'object') {
    for (const key of Object.keys(source) as Array<keyof typeof source>) {
      const sourceValue = source[key];
      const targetValue = (target as any)[key];

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        output[key] = mergeDeep(targetValue ?? {}, sourceValue as any);
      } else if (sourceValue !== undefined) {
        output[key] = sourceValue;
      }
    }
  }

  return output;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language from localStorage with error handling
    try {
      const saved = (localStorage.getItem('lang') || localStorage.getItem('language')) as Language;
      const initialLanguage = saved && ['en', 'fr', 'ar'].includes(saved) ? saved : 'ar';
      setLanguageState(initialLanguage);
    } catch (error) {
      // Fallback to Arabic if localStorage fails
      console.warn('Failed to load language from localStorage:', error);
      setLanguageState('ar');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Update document attributes for language and RTL support
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;

      // Set language attribute
      htmlElement.lang = language;

      // Set direction attribute for RTL support
      htmlElement.dir = language === 'ar' ? 'rtl' : 'ltr';

      // Update body class for additional styling if needed
      const bodyElement = document.body;
      bodyElement.classList.remove('lang-en', 'lang-fr', 'lang-ar');
      bodyElement.classList.add(`lang-${language}`);
    }
  }, [language, mounted]);

  const changeLanguage = (lang: Language) => {
    if (!['en', 'fr', 'ar'].includes(lang)) {
      console.warn(`Invalid language: ${lang}. Defaulting to 'ar'.`);
      lang = 'ar';
    }

    setLanguageState(lang);

    // Save to localStorage with error handling
    try {
      localStorage.setItem('lang', lang);
      localStorage.setItem('language', lang);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  };

  const isRTL = language === 'ar';

  const t = useMemo(() => mergeDeep(translations.en, translations[language]), [language]);

  // Don't render children until mounted to prevent hydration mismatches
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
