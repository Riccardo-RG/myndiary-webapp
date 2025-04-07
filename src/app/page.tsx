"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isClient && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isClient && !user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 fade-in">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -right-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-8 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <h1 className="text-4xl font-bold mb-2 text-center relative">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary to-accent pb-1 inline-block">
          {t("home.welcome")}
        </span>
      </h1>
      <p className="text-xl text-center text-muted-foreground mb-12 max-w-2xl">
        {t("home.description")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link
          href="/diary"
          className="card flex flex-col items-center p-6 bg-primary/10 dark:bg-primary/5 hover:bg-primary/20 dark:hover:bg-primary/10 hover:shadow-soft-xl light:hover:bg-white transition-all scale-in group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
            📖
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("nav.diary")}</h2>
          <p className="text-center text-muted-foreground">{t("home.diary")}</p>
        </Link>

        <Link
          href="/new"
          className="card flex flex-col items-center p-6 bg-secondary-500/10 dark:bg-secondary-600/5 hover:bg-secondary-500/20 dark:hover:bg-secondary-600/10 hover:shadow-soft-xl light:hover:bg-white transition-all scale-in group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
            ✏️
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("entry.new")}</h2>
          <p className="text-center text-muted-foreground">
            {t("home.newEntry")}
          </p>
        </Link>

        <Link
          href="/calendar"
          className="card flex flex-col items-center p-6 bg-primary-300/10 dark:bg-primary-600/5 hover:bg-primary-300/20 dark:hover:bg-primary-600/10 hover:shadow-soft-xl light:hover:bg-white transition-all scale-in group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
            📅
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("nav.calendar")}</h2>
          <p className="text-center text-muted-foreground">
            {t("home.calendar")}
          </p>
        </Link>

        <Link
          href="/settings/whatsapp"
          className="card flex flex-col items-center p-6 bg-secondary-300/10 dark:bg-secondary-700/5 hover:bg-secondary-300/20 dark:hover:bg-secondary-700/10 hover:shadow-soft-xl light:hover:bg-white transition-all scale-in group"
        >
          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
            📱
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("nav.whatsapp")}</h2>
          <p className="text-center text-muted-foreground">
            {t("home.connectWhatsapp")}
          </p>
        </Link>
      </div>

      <div className="mt-16 w-full max-w-4xl slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-medium flex items-center relative">
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary/80 rounded-full"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 mr-2 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                clipRule="evenodd"
              />
            </svg>
            <span>{t("settings.preferences")}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-background/50 dark:bg-background/20 border-border/50 hover:border-primary/30 transition-all group">
            <div className="flex items-start mb-4">
              <div className="bg-primary/10 rounded-full p-2.5 mr-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-soft">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-primary"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2.25a.75.75 0 01.75.75v1.506a49.38 49.38 0 015.343.371.75.75 0 11-.186 1.489c-.66-.083-1.323-.151-1.99-.206a18.67 18.67 0 01-2.969 6.323c.317.384.65.753.998 1.107a.75.75 0 11-1.07 1.052A18.902 18.902 0 019 13.687a18.823 18.823 0 01-5.656 4.482.75.75 0 11-.688-1.333 17.323 17.323 0 005.396-4.353A18.72 18.72 0 015.89 8.598a.75.75 0 011.388-.568A17.21 17.21 0 009 11.224a17.17 17.17 0 002.391-5.165 48.038 48.038 0 00-8.298.307.75.75 0 01-.186-1.489 49.159 49.159 0 015.343-.371V3A.75.75 0 019 2.25zM15.75 9a.75.75 0 01.68.433l5.25 11.25a.75.75 0 01-1.36.634l-1.198-2.567h-6.744l-1.198 2.567a.75.75 0 01-1.36-.634l5.25-11.25A.75.75 0 0115.75 9zm-2.672 8.25h5.344l-2.672-5.726-2.672 5.726z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">{t("settings.language")}</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  {t("settings.chooseLanguage")}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="card bg-background/50 dark:bg-background/20 border-border/50 hover:border-primary/30 transition-all group">
            <div className="flex items-start mb-4">
              <div className="bg-primary/10 rounded-full p-2.5 mr-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-soft">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-primary"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">{t("settings.account")}</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  {t("settings.manageAccount")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/settings/profile"
                className="button-outline py-1.5 inline-flex items-center space-x-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
              >
                <span>{t("settings.profile")}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="/settings/security"
                className="button-outline py-1.5 inline-flex items-center space-x-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
              >
                <span>{t("settings.security")}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
