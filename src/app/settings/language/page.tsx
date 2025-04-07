"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";

// Definizione delle lingue disponibili
const languages = [
  { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "it", name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
];

export default function LanguageSettingsPage() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState("");
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentLang(i18n.language || "en");
  }, [i18n.language]);

  if (isClient && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isClient && !user) {
    redirect("/login");
  }

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setCurrentLang(code);
    localStorage.setItem("i18nextLng", code);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/settings"
          className="inline-flex items-center text-blue-400 hover:text-blue-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {t("common.back")}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">{t("settings.language")}</h1>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <p className="text-gray-300 mb-6">
          {t("settings.selectLanguage", "Select your preferred language:")}
        </p>

        <div className="space-y-4">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`flex items-center w-full p-4 rounded-lg transition-colors ${
                currentLang === language.code
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
              onClick={() => changeLanguage(language.code)}
            >
              <span className="text-2xl mr-4">{language.flag}</span>
              <div className="flex flex-col text-left">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-sm opacity-70">{language.name}</span>
              </div>
              {currentLang === language.code && (
                <svg
                  className="ml-auto h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
