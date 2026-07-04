import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../utils/translations';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'] | string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('wattrack_lang');
    if (saved === 'fr' || saved === 'en') {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('wattrack_lang', lang);
  };

  const t = (key: keyof typeof translations['en'] | string, variables?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations['en'];
    // Try to get key from active language, fallback to English dictionary, fallback to the key itself
    let translated = (langDict as any)[key] || (translations['en'] as any)[key] || key;

    if (variables) {
      Object.entries(variables).forEach(([vKey, vVal]) => {
        translated = translated.replace(`{${vKey}}`, String(vVal));
      });
    }

    return translated;
  };

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
