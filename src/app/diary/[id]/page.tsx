"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DiaryEntry } from "@/types/diary";
import { format } from "date-fns";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { deleteEntry, uploadFile } from "@/services/entryService";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  type: "image" | "audio" | "video";
  url?: string;
}

export default function DiaryEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  useEffect(() => {
    loadEntry();
  }, [params.id]);

  async function loadEntry() {
    try {
      const { data, error } = await supabase
        .from("diary_entries")
        .select(
          "id, content, type, created_at, image_url, audio_url, video_url"
        )
        .eq("id", parseInt(params.id))
        .single();

      if (error) throw error;
      setEntry(data);
      setEditedContent(data.content);
    } catch (error) {
      console.error("Error loading entry:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const file = files[0];

      if (!file) return;

      console.log("📦 File selezionato:", file);
      console.log("📦 instanceof File:", file instanceof File);
      console.log("📦 File type:", file.type);
      console.log("📦 File.constructor.name:", file.constructor.name);

      files.forEach((originalFile) => {
        let file = originalFile;

        // Forza MIME type se è application/json ma l'estensione è immagine
        if (
          file.type === "application/json" &&
          (file.name.endsWith(".png") ||
            file.name.endsWith(".jpg") ||
            file.name.endsWith(".jpeg"))
        ) {
          const forcedType = file.name.endsWith(".png")
            ? "image/png"
            : "image/jpeg";
          file = new File([file], file.name, { type: forcedType });
          console.warn(
            `⚠️ Forzato il tipo MIME da "application/json" a "${forcedType}" per ${file.name}`
          );
        }

        // Blocca i file non supportati
        if (!file || !file.type || !file.type.startsWith("image/")) {
          alert(
            `"${file.name}" is not a valid image. Detected type: ${file.type}`
          );
          return;
        }

        const fileType = file.type.split("/")[0];
        let type: UploadingFile["type"];

        if (fileType === "image") type = "image";
        else if (fileType === "audio") type = "audio";
        else if (fileType === "video") type = "video";
        else {
          alert(
            `"${file.name}" has unsupported file type: ${file.type}. Only image, audio and video files are allowed.`
          );
          return;
        }

        setUploadingFiles((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            file,
            progress: 0,
            type,
          },
        ]);
      });

      // Reset input
      event.target.value = "";
    },
    []
  );

  const removeFile = (fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  async function handleSave() {
    if (!entry) return;

    try {
      setIsSaving(true);

      // Upload all files first
      await Promise.all(
        uploadingFiles.map(async (uploadingFile) => {
          try {
            const bucket =
              uploadingFile.type === "image" ? "images" : uploadingFile.type;
            console.log(">>> FILE TYPE:", typeof uploadingFile.file);
            console.log(">>> IS BLOB:", uploadingFile.file instanceof Blob);
            console.log(">>> IS FILE:", uploadingFile.file instanceof File);
            const url = await uploadFile(uploadingFile.file, bucket);
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadingFile.id ? { ...f, progress: 100, url } : f
              )
            );
            return { ...uploadingFile, url }; // Return the updated file info
          } catch (error) {
            console.error(
              `Failed to upload ${uploadingFile.file.name}:`,
              error
            );
            throw error;
          }
        })
      );

      // Prepare update data with all fields
      const updateData: Partial<DiaryEntry> = {
        content: editedContent.trim(),
        type: entry.type, // Keep existing type by default
        image_url: entry.image_url, // Keep existing URLs by default
        audio_url: entry.audio_url,
        video_url: entry.video_url,
      };

      // Add new file URLs if present
      const files = uploadingFiles.filter((f) => f.url);
      if (files.length > 0) {
        const file = files[0]; // Use the first file
        if (file.type === "image") {
          updateData.image_url = file.url;
          updateData.type = "image";
        } else if (file.type === "audio") {
          updateData.audio_url = file.url;
          updateData.type = "audio";
        } else if (file.type === "video") {
          updateData.video_url = file.url;
          updateData.type = "video";
        }
      }

      const { data: updatedEntry, error } = await supabase
        .from("diary_entries")
        .update(updateData)
        .eq("id", entry.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state with the updated entry
      setEntry(updatedEntry);
      setIsEditing(false);
      setUploadingFiles([]);
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Failed to update entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !entry ||
      !window.confirm("Are you sure you want to delete this entry?")
    ) {
      return;
    }

    try {
      console.log("Deleting entry with id:", entry.id);
      setIsDeleting(true);
      await deleteEntry(entry.id);

      // If we get here, deletion was successful
      router.replace("/diary");
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">Loading entry...</div>
      </main>
    );
  }

  if (!entry) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">Entry not found</div>
        <Link
          href="/diary"
          className="block mt-4 text-center text-blue-400 hover:text-blue-300"
        >
          Back to Diary
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/diary" className="text-gray-400 hover:text-gray-300">
            ← Back to Diary
          </Link>
          <div className="text-sm text-gray-500">
            {format(new Date(entry.created_at), "HH:mm • d MMMM yyyy")}
          </div>
        </div>

        <div className="card">
          <div className="space-y-6">
            <div className="space-y-4">
              <textarea
                value={isEditing ? editedContent : entry.content}
                onChange={(e) => isEditing && setEditedContent(e.target.value)}
                className="w-full min-h-[120px] bg-gray-800 text-gray-100 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75"
                placeholder="Write your thoughts..."
                disabled={!isEditing}
              />

              {isEditing && (
                <div className="flex flex-wrap gap-4">
                  <div className="flex-grow">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      <span>📎 Add Files</span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                </div>
              )}

              {uploadingFiles.length > 0 && (
                <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300">
                    New Files
                  </h3>
                  <div className="space-y-2">
                    {uploadingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <span>
                          {file.type === "image" && "🖼️"}
                          {file.type === "audio" && "🎵"}
                          {file.type === "video" && "🎬"}
                        </span>
                        <span className="flex-grow truncate">
                          {file.file.name}
                        </span>
                        {file.progress > 0 && file.progress < 100 && (
                          <div className="w-20 bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Media Display */}
            <div className="space-y-6">
              {entry.type === "image" && entry.image_url && (
                <div className="space-y-2">
                  <img
                    src={
                      entry.image_url.replace(
                        "/storage/v1/object/public/",
                        "/storage/v1/render/image/public/"
                      ) + "?width=800&quality=80"
                    }
                    alt={entry.content || "Entry image"}
                    className="rounded-lg max-h-96 w-full object-cover bg-gray-800"
                    loading="lazy"
                    onError={(e) => {
                      console.error("Failed to load image:", entry.image_url);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {entry.type === "audio" && entry.audio_url && (
                <div className="space-y-2">
                  <audio controls className="w-full">
                    <source src={entry.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {entry.type === "video" && entry.video_url && (
                <div className="space-y-2">
                  <video controls className="w-full rounded-lg">
                    <source src={entry.video_url} type="video/mp4" />
                    Your browser does not support the video element.
                  </video>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(entry.content);
                      setUploadingFiles([]);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
