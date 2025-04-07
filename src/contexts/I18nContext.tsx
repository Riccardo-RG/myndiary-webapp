"use client";

import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import HtmlLangSetter from "@/app/HtmlLangSetter";

interface I18nProviderProps {
  children: ReactNode;
}

const I18nProvider = ({ children }: I18nProviderProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      <HtmlLangSetter />
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;
