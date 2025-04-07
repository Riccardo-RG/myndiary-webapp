"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEntry, uploadFile } from "@/services/entryService";
import type { CreateEntryData } from "@/services/entryService";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  type: "image" | "audio" | "video";
  url?: string;
}

export default function NewEntryPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      files.forEach((file) => {
        const fileType = file.type.split("/")[0];
        let type: UploadingFile["type"] = "image";

        if (fileType === "audio") type = "audio";
        else if (fileType === "video") type = "video";
        else if (!file.type.startsWith("image/")) return; // Unsupported file type

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && uploadingFiles.length === 0) return;

    setIsSubmitting(true);

    try {
      // Upload all files first
      const uploadedFiles = await Promise.all(
        uploadingFiles.map(async (uploadingFile) => {
          try {
            const bucket =
              uploadingFile.type === "image" ? "images" : uploadingFile.type;
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

      // Prepare entry data with all fields
      const entryData: CreateEntryData = {
        content: content.trim(),
        type: "text", // Default type
      };

      // Add file URLs if present
      const files = uploadedFiles.filter((f) => f.url);
      if (files.length > 0) {
        const file = files[0]; // Use the first file
        if (file.type === "image") {
          entryData.image_url = file.url;
          entryData.type = "image";
        } else if (file.type === "audio") {
          entryData.audio_url = file.url;
          entryData.type = "audio";
        } else if (file.type === "video") {
          entryData.video_url = file.url;
          entryData.type = "video";
        }
      }

      const newEntry = await createEntry(entryData);
      if (!newEntry) {
        throw new Error("Failed to create entry");
      }

      // Redirect to diary list after successful creation
      router.push("/diary");
      router.refresh(); // Force refresh to show the new entry
    } catch (error) {
      console.error("Failed to create entry:", error);
      alert("Failed to create entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">New Journal Entry</h1>
          <Link
            href="/diary"
            className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
          >
            Cancel
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <textarea
              rows={6}
              className="w-full resize-none bg-gray-800 text-gray-100 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

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

            {uploadingFiles.length > 0 && (
              <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300">
                  Files to Upload
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

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={
                isSubmitting || (!content && uploadingFiles.length === 0)
              }
              className="button min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
