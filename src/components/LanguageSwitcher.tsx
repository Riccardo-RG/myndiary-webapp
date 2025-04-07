"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Definizione delle lingue disponibili
const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentLang(i18n.language || "en");
    setMounted(true);
  }, [i18n.language]);

  const getCurrentLanguageInfo = () => {
    const lang =
      languages.find((lang) => lang.code === currentLang) || languages[0];
    return lang;
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    // Salva la preferenza nel localStorage
    localStorage.setItem("i18nextLng", code);
  };

  // Per evitare hydration mismatch
  if (!mounted) {
    return <div className="h-10"></div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 relative 
            ${
              currentLang === language.code
                ? "bg-primary/10 text-primary border-primary/30 dark:border-primary/40 font-medium"
                : "bg-background hover:bg-secondary border-border hover:border-primary/20"
            }
            group overflow-hidden`}
          aria-label={`Cambia lingua in ${language.name}`}
        >
          <div className="relative z-10 flex items-center gap-2">
            <span className="text-lg group-hover:scale-110 transition-transform duration-300">
              {language.flag}
            </span>
            <span className="relative">
              {language.name}
              {currentLang === language.code && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary/70 rounded-full"></span>
              )}
            </span>
          </div>

          {currentLang === language.code && (
            <svg
              className="ml-1 h-4 w-4 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          )}

          {/* Background gradient on hover */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-100/5 to-primary-300/5 dark:from-primary-600/5 dark:to-primary-900/5 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
