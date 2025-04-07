"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function HtmlLangSetter() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Imposta l'attributo lang del documento HTML quando cambia la lingua
    document.documentElement.lang = i18n.language || "en";
  }, [i18n.language]);

  return null; // Questo componente non renderizza nulla
}
