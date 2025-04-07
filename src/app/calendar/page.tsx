"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { fetchDatesWithEntries } from "@/services/entryService";
import { useAuth } from "@/contexts/AuthContext";

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datesWithEntries, setDatesWithEntries] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log("No authenticated user found, redirecting to login...");
      router.push("/login");
      return;
    }

    if (user) {
      loadDatesWithEntries();
    }
  }, [user, authLoading, router]);

  async function loadDatesWithEntries() {
    try {
      const dates = await fetchDatesWithEntries();
      setDatesWithEntries(dates);
    } catch (error) {
      console.error("Failed to load dates with entries:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  function handlePreviousMonth() {
    setCurrentDate(subMonths(currentDate, 1));
  }

  function handleNextMonth() {
    setCurrentDate(addMonths(currentDate, 1));
  }

  function handleDayClick(date: Date) {
    const formattedDate = format(date, "yyyy-MM-dd");
    if (datesWithEntries.has(formattedDate)) {
      router.push(`/diary?date=${encodeURIComponent(formattedDate)}`);
    }
  }

  if (authLoading || isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Loading calendar...
        </div>
      </main>
    );
  }

  if (!user) return null; // Security check to prevent rendering without authenticated user

  return (
    <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      <div className="h-full max-w-5xl mx-auto flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Calendar
          </h1>
          <div className="flex items-center gap-4 bg-card rounded-full px-3 shadow-lg border border-border/50">
            <button
              onClick={handlePreviousMonth}
              className="p-3 rounded-full hover:bg-teal-500/10 text-foreground transition-all duration-200 hover:scale-110"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="text-2xl font-semibold text-foreground px-3">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-3 rounded-full hover:bg-teal-500/10 text-foreground transition-all duration-200 hover:scale-110"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-7 gap-2 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 p-4 shadow-xl border border-teal-200/50 dark:border-teal-800/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-4 text-center text-base font-medium text-muted-foreground bg-white/50 dark:bg-background/50 rounded-xl first:text-teal-600 last:text-teal-600"
            >
              {day}
            </div>
          ))}
          {days.map((day) => {
            const formattedDate = format(day, "yyyy-MM-dd");
            const hasEntries = datesWithEntries.has(formattedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                disabled={!hasEntries}
                className={`
                  relative aspect-square flex items-center justify-center transition-all duration-200 rounded-xl
                  backdrop-blur-sm text-lg
                  ${
                    isCurrentMonth
                      ? "bg-white/80 dark:bg-background/80"
                      : "bg-teal-50/50 dark:bg-teal-950/20"
                  }
                  ${
                    hasEntries
                      ? "cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:scale-105 hover:shadow-lg"
                      : "cursor-default"
                  }
                  ${
                    isCurrentDay
                      ? "border-2 border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 font-bold"
                      : isCurrentMonth
                      ? "text-foreground hover:text-teal-700 dark:hover:text-teal-300 shadow-sm"
                      : "text-muted-foreground"
                  }
                `}
              >
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <span className="relative z-10">{format(day, "d")}</span>
                  {hasEntries && (
                    <div className="absolute inset-2 border-2 border-teal-400/30 dark:border-teal-500/30 rounded-lg bg-gradient-to-br from-teal-100/50 to-transparent dark:from-teal-800/20" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
