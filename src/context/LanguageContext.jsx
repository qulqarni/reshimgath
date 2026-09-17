import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('reshimgath_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('reshimgath_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = (selectedLang) => {
    if (selectedLang) {
      setLang(selectedLang);
    } else {
      setLang((prev) => (prev === 'en' ? 'mr' : 'en'));
    }
  };

  const t = (key) => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    // Fallback to EN if missing
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
