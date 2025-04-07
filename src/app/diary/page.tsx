"use client";

import { useEffect, useState, useRef } from "react";
import { DiaryEntry } from "@/types/diary";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchEntriesByDay, deleteEntry } from "@/services/entryService";
import { useAuth } from "@/contexts/AuthContext";
import ImageComponent from "@/components/Image";

export default function DiaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<Record<string, DiaryEntry[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const selectedDateRef = useRef<HTMLDivElement>(null);

  // Check authentication and load entries if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log("No authenticated user found, redirecting to login...");
      router.push("/login");
      return;
    }

    if (user) {
      loadEntries();
    }
  }, [user, loading, router]);

  // Scroll automatico alla data selezionata (se presente)
  useEffect(() => {
    const selectedDate = searchParams.get("date");
    if (selectedDate && entries[selectedDate] && selectedDateRef.current) {
      selectedDateRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams, entries]);

  // Funzione per caricare le note
  async function loadEntries() {
    try {
      const groupedEntries = await fetchEntriesByDay();
      setEntries(groupedEntries);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Funzione per eliminare una nota
  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      setDeletingId(id);
      await deleteEntry(id);
      await loadEntries(); // Ricarica le note dopo eliminazione
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert("Failed to delete entry. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  // Gestione stato di caricamento e autenticazione
  if (loading || isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 text-gray-400 text-center">
        Loading entries...
      </main>
    );
  }

  if (!user) return null; // Sicurezza aggiuntiva per evitare render senza utente autenticato

  const selectedDate = searchParams.get("date");
  // Preview image

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); // Create a URL for the file
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Journal</h1>

      {Object.keys(entries).length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <p>No entries yet. Start writing your first entry!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(entries).map(([date, dayEntries]) => (
            <div
              key={date}
              ref={selectedDate === date ? selectedDateRef : null}
              className={`card transition-colors ${
                selectedDate === date ? "ring-2 ring-primary" : ""
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">
                {format(new Date(date), "MMMM d, yyyy")}
              </h2>
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="group pt-4 first:pt-0 border-t border-border"
                >
                  <Link
                    href={`/diary/${entry.id}`}
                    className="block hover:opacity-75 transition-opacity space-y-2"
                  >
                    <p className="text-foreground">{entry.content}</p>
                    {entry.type === "image" && entry.image_url && (
                      <div className="relative w-full">
                        <ImageComponent
                          src={entry.image_url}
                          alt={entry.content || "Entry image"}
                          className="w-full max-h-[300px] rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), "HH:mm")}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        disabled={deletingId === entry.id}
                        className="text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        🗑️
                      </button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <Link href="/new" className="button fixed bottom-6 right-6">
        + New Entry
      </Link>
    </main>
  );
}
