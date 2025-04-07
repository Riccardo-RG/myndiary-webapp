"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Per evitare hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9"></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 w-9 h-9 rounded-lg transition-all duration-500 
                overflow-hidden group"
      aria-label={
        theme === "dark"
          ? "Passa alla modalità chiara"
          : "Passa alla modalità scura"
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-primary-300/10 dark:from-primary-600/20 dark:to-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
        <div className="relative z-10 transition-all duration-700 ease-spring transform scale-100 group-hover:scale-110 group-active:scale-95">
          {theme === "dark" ? (
            // Icona sole - per modalità chiara
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-yellow-300"
            >
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          ) : (
            // Icona luna - per modalità scura
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Animated rings for added effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute inset-[-3px] rounded-xl border border-primary/20 opacity-0 group-hover:opacity-100 group-hover:inset-[-1px] transition-all duration-500 ${
            theme === "dark" ? "border-yellow-300/30" : "border-primary/30"
          }`}
        ></div>
      </div>
    </button>
  );
}
