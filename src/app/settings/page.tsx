"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/"
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

      <h1 className="text-3xl font-bold mb-8">{t("settings.title")}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/settings/language"
          className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-4">🌐</div>
            <div>
              <h2 className="text-xl font-semibold mb-1">
                {t("settings.language")}
              </h2>
              <p className="text-gray-400">
                {t(
                  "settings.changeLanguage",
                  "Change the application language"
                )}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/settings/whatsapp"
          className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            <div className="text-2xl mr-4">📱</div>
            <div>
              <h2 className="text-xl font-semibold mb-1">
                {t("nav.whatsapp")}
              </h2>
              <p className="text-gray-400">
                {t("settings.whatsapp.description")}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
