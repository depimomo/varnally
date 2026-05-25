import React, { createContext, useContext, useState } from 'react';
import en from '../locales/en.json';
import id from '../locales/id.json';

// Use TypeScript type inference to ensure exact synchronization
export type Language = 'en' | 'id';
export type Translations = typeof en;

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
} | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check URL parameters first for automated workflow or SEO entry
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryLang = params.get('lang');
      if (queryLang === 'id' || queryLang === 'en') {
        localStorage.setItem('varnally_language', queryLang);
        return queryLang as Language;
      }
    }
    const saved = localStorage.getItem('varnally_language');
    return (saved === 'id' ? 'id' : 'en') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('varnally_language', lang);
  };

  // Safe fallback to English for any missing keys in other locales
  const t = (language === 'id' ? id : en) as Translations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
