"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import ThemeSwitcher from "./ThemeSwitcher";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simplified scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-40 flex items-center justify-center px-4">
        <nav
          className={`
          w-full max-w-7xl mx-auto bg-background/70 backdrop-blur-lg rounded-2xl 
          transition-all duration-300 border
          ${
            hasScrolled
              ? "border-border/20 shadow-[0_0_0_1px_rgba(74,222,128,0.02),0_0_12px_rgba(74,222,128,0.08)] dark:shadow-[0_0_0_1px_rgba(74,222,128,0.03),0_0_12px_rgba(74,222,128,0.05)]"
              : "border-border/30"
          }
        `}
        >
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-xl font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-3 group relative z-50"
              >
                <div className="relative flex items-center justify-center p-1">
                  <Image
                    src="/images/mynda.png"
                    alt="Mynda Logo"
                    width={64}
                    height={64}
                    className="rounded-lg group-hover:scale-110 transition-all duration-300"
                    priority
                  />
                </div>
                <span className="group-hover:text-primary transition-all duration-300">
                  {t("app.title")}
                </span>
              </Link>

              {/* Desktop Menu con animazioni migliorate */}
              <div className="hidden lg:flex items-center space-x-2">
                {user ? (
                  <>
                    <Link
                      href="/"
                      className={`px-4 py-2 rounded-lg transition-all duration-200 hover:bg-secondary/80 ${
                        isActive("/")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:text-primary"
                      }`}
                    >
                      {t("nav.home")}
                    </Link>
                    <Link
                      href="/diary"
                      className={`px-4 py-2 rounded-lg transition-all duration-200 hover:bg-secondary/80 ${
                        isActive("/diary")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:text-primary"
                      }`}
                    >
                      {t("nav.diary")}
                    </Link>
                    <Link
                      href="/calendar"
                      className={`px-4 py-2 rounded-lg transition-all duration-200 hover:bg-secondary/80 ${
                        isActive("/calendar")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:text-primary"
                      }`}
                    >
                      {t("nav.calendar")}
                    </Link>
                    <Link
                      href="/settings/whatsapp"
                      className={`px-4 py-2 rounded-lg transition-all duration-200 hover:bg-secondary/80 ${
                        pathname.startsWith("/settings/whatsapp")
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:text-primary"
                      }`}
                    >
                      {t("nav.whatsapp")}
                    </Link>

                    {/* Separatore e Theme Switcher */}
                    <div className="flex items-center gap-2 border-l border-border/50 pl-4 ml-2">
                      <ThemeSwitcher />
                      <button
                        onClick={handleSignOut}
                        className="button-outline py-2 px-4 text-sm flex items-center gap-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all duration-200 rounded-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                            clipRule="evenodd"
                          />
                          <path
                            fillRule="evenodd"
                            d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{t("nav.signOut")}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center">
                    <ThemeSwitcher />
                  </div>
                )}
              </div>

              {/* Toggle Menu Mobile migliorato */}
              <div className="flex items-center gap-3 lg:hidden">
                <ThemeSwitcher />
                {user && (
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2.5 rounded-lg hover:bg-secondary/80 transition-all duration-300 relative z-50 group"
                    aria-label="Toggle menu"
                  >
                    <div className="w-5 h-4 flex flex-col justify-between overflow-hidden">
                      <span
                        className={`w-5 h-0.5 bg-foreground transform transition-all duration-300 ease-in-out ${
                          isOpen ? "translate-y-1.5 rotate-45" : ""
                        }`}
                      ></span>
                      <span
                        className={`w-5 h-0.5 bg-foreground transform transition-all duration-300 ease-in-out ${
                          isOpen ? "opacity-0 translate-x-2" : ""
                        }`}
                      ></span>
                      <span
                        className={`w-5 h-0.5 bg-foreground transform transition-all duration-300 ease-in-out ${
                          isOpen ? "-translate-y-1.5 -rotate-45" : ""
                        }`}
                      ></span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Menu Mobile migliorato */}
      {user && (
        <div
          className={`
            fixed inset-0 bg-background/50 lg:hidden z-40 transition-all duration-500
            ${
              isOpen
                ? "opacity-100 pointer-events-auto backdrop-blur-lg"
                : "opacity-0 pointer-events-none backdrop-blur-none"
            }
          `}
        >
          <div className="absolute inset-0 bg-background/80" />
          <div
            className={`
              absolute right-0 top-0 bottom-0 w-[min(100vw,420px)] bg-card shadow-2xl
              transform transition-all duration-500 ease-out z-10
              border-l border-border/50 backdrop-blur-xl flex flex-col
              ${isOpen ? "translate-x-0" : "translate-x-full"}
            `}
          >
            {/* Header with Logo and Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/mynda.png"
                  alt="Mynda Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  priority
                />
                <span className="text-lg font-medium">{t("app.title")}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 px-8 pt-6 overflow-y-auto">
              <div className="flex flex-col space-y-6">
                <div className="pb-6 mb-2 border-b border-border/50">
                  <Link
                    href="/"
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-xl ${
                      isActive("/")
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-6 h-6 flex-shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("nav.home")}
                  </Link>
                </div>

                <Link
                  href="/diary"
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-xl ${
                    isActive("/diary")
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-6 h-6 flex-shrink-0"
                  >
                    <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                  </svg>
                  {t("nav.diary")}
                </Link>

                <Link
                  href="/calendar"
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-xl ${
                    isActive("/calendar")
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-6 h-6 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("nav.calendar")}
                </Link>

                <Link
                  href="/settings/whatsapp"
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-xl ${
                    pathname.startsWith("/settings/whatsapp")
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-6 h-6 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.232 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("nav.whatsapp")}
                </Link>
              </div>
            </div>

            {/* User Info Box */}
            <div className="mt-auto border-t border-border/50">
              <div className="p-6 mx-6 my-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src="/images/mynda.png"
                    alt="Mynda Logo"
                    width={48}
                    height={48}
                    className="rounded-lg"
                    priority
                  />
                  <div className="flex flex-col">
                    <span className="text-lg font-medium">
                      {t("app.title")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-base text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("nav.signOut")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
