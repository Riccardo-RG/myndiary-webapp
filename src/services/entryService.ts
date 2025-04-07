import { supabase } from "@/lib/supabase";
import { DiaryEntry } from "@/types/diary";
import { format } from "date-fns";

export type CreateEntryData = {
  content: string;
  type: DiaryEntry["type"];
  image_url?: string;
  audio_url?: string;
  video_url?: string;
};

// Fetch all entries ordered by created_at
export async function fetchEntries() {
  try {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }

    // Converti i tipi in minuscolo per compatibilità con il frontend
    const formattedData = (data || []).map((entry) => ({
      ...entry,
      type: entry.type.toLowerCase(),
    }));

    return formattedData || [];
  } catch (error) {
    console.error("Failed to fetch entries:", error);
    throw error;
  }
}

// Fetch entries grouped by day
export async function fetchEntriesByDay() {
  try {
    const entries = await fetchEntries();

    return entries.reduce((acc, entry) => {
      const date = format(new Date(entry.created_at), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, DiaryEntry[]>);
  } catch (error) {
    console.error("Failed to group entries by day:", error);
    throw error;
  }
}

// Create a new entry
export async function createEntry(data: CreateEntryData) {
  try {
    // Validate entry data
    if (
      !data.content &&
      !data.image_url &&
      !data.audio_url &&
      !data.video_url
    ) {
      throw new Error("Entry must have content or media");
    }

    // Validate media URLs if present
    if (data.type === "image" && !data.image_url) {
      throw new Error("Image entry must have an image URL");
    }
    if (data.type === "audio" && !data.audio_url) {
      throw new Error("Audio entry must have an audio URL");
    }
    if (data.type === "video" && !data.video_url) {
      throw new Error("Video entry must have a video URL");
    }

    // Ensure user has a profile and get profile ID
    const profileId = await ensureUserProfile();
    console.log("Creating entry with user_id:", profileId);

    // Convertire il tipo in maiuscolo per rispettare il vincolo SQL
    const entryType = data.type.toUpperCase();
    console.log("Entry type:", entryType);

    const { data: entry, error } = await supabase
      .from("diary_entries")
      .insert({
        content: data.content || null,
        type: entryType, // Usiamo il tipo in maiuscolo
        image_url: data.image_url || null,
        audio_url: data.audio_url || null,
        video_url: data.video_url || null,
        user_id: profileId, // Usiamo l'ID numerico del profilo
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating entry:", error);
      throw error;
    }

    if (!entry) {
      throw new Error("No entry returned after creation");
    }

    return entry;
  } catch (error) {
    console.error("Failed to create entry:", error);
    throw error;
  }
}

// Delete an entry
export async function deleteEntry(id: number) {
  try {
    if (!id) {
      throw new Error("No entry ID provided for deletion");
    }

    // Ensure user has a profile and get profile ID
    const profileId = await ensureUserProfile();
    console.log("Checking entry ownership for profile:", profileId);

    // Verify ownership before deletion
    const { data: entry } = await supabase
      .from("diary_entries")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!entry) {
      throw new Error("Entry not found");
    }

    if (entry.user_id !== profileId) {
      console.error(
        "Authorization error - Entry user_id:",
        entry.user_id,
        "Profile id:",
        profileId
      );
      throw new Error("Not authorized to delete this entry");
    }

    const { error } = await supabase
      .from("diary_entries")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    // If we get here, deletion was successful (204 No Content is expected)
    return true;
  } catch (error) {
    console.error("Failed to delete entry:", error);
    throw error;
  }
}

// Upload a file to Supabase storage
export async function uploadFile(
  file: File,
  bucket: "images" | "audio" | "video"
) {
  try {
    // Get the file's real MIME type from the File object
    const actualType = file.type || "";

    // Extra validation for images to prevent application/json issue
    if (bucket === "images") {
      // Check if it's actually an image using the File API
      if (!actualType.startsWith("image/")) {
        throw new Error(
          `File "${file.name}" is not a valid image. Got type: ${actualType}`
        );
      }

      // Additional check for common image extensions
      const validExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
      ];
      const fileExt = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));
      if (!validExtensions.includes(fileExt)) {
        throw new Error(
          `Invalid image extension: ${fileExt}. Allowed: ${validExtensions.join(
            ", "
          )}`
        );
      }
    }

    // Strict MIME type validation
    const allowedTypes = {
      images: new Set([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ]),
      audio: new Set(["audio/mpeg", "audio/mp4", "audio/wav"]),
      video: new Set(["video/mp4", "video/quicktime", "video/webm"]),
    };

    if (!allowedTypes[bucket].has(actualType.toLowerCase())) {
      throw new Error(
        `Invalid file type for ${bucket}. Allowed types: ${Array.from(
          allowedTypes[bucket]
        ).join(", ")}. Got: ${actualType}`
      );
    }

    // Validate file size
    const maxSize = bucket === "images" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(
        `File too large. Maximum size is ${
          bucket === "images" ? "5MB" : "10MB"
        }`
      );
    }

    // Get correct extension from MIME type
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/svg+xml": "svg",
      "audio/mpeg": "mp3",
      "audio/mp4": "m4a",
      "audio/wav": "wav",
      "video/mp4": "mp4",
      "video/quicktime": "mov",
      "video/webm": "webm",
    };

    const fileExt =
      mimeToExt[actualType.toLowerCase() as keyof typeof mimeToExt] ||
      actualType.split("/")[1];
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // Debug log before upload
    console.log("Preparing to upload file:", {
      originalName: file.name,
      newFileName: fileName,
      contentType: actualType,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      bucket,
    });

    // Upload with explicit content type
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: actualType,
        upsert: true,
        cacheControl: "3600",
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get the public URL without transformation options
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(
      fileName,
      bucket === "images"
        ? {
            transform: {
              width: 800,
              quality: 80,
              format: "origin",
            },
          }
        : undefined
    );

    if (!publicData?.publicUrl) {
      throw new Error("Failed to get public URL");
    }

    // Verifica l'accessibilità dell'URL
    try {
      const response = await fetch(publicData.publicUrl, { method: "HEAD" });
      if (!response.ok) {
        console.warn(
          `Warning: File may not be accessible (${response.status}):`,
          publicData.publicUrl
        );
      }
    } catch (error) {
      console.warn("Failed to verify file accessibility:", error);
    }

    // Log success
    console.log("File uploaded successfully:", {
      fileName,
      contentType: actualType,
      publicUrl: publicData.publicUrl,
    });

    return publicData.publicUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
// Get dates with entries for calendar
export async function fetchDatesWithEntries() {
  try {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("created_at");

    if (error) {
      console.error("Error fetching dates with entries:", error);
      throw error;
    }

    // Use yyyy-MM-dd format consistently for dates
    return new Set(
      (data || []).map((entry) =>
        format(new Date(entry.created_at), "yyyy-MM-dd")
      )
    );
  } catch (error) {
    console.error("Failed to fetch dates with entries:", error);
    throw error;
  }
}

// Ensure user has a profile
export async function ensureUserProfile() {
  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Use email as identifier for web users
    const identifier = user.email;
    if (!identifier) {
      throw new Error("No email found for user");
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone_number", identifier)
      .single();

    if (profile) {
      return profile.id;
    }

    // Create new profile
    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert({
        phone_number: identifier,
        username: identifier.split("@")[0],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }

    return newProfile.id;
  } catch (error) {
    console.error("Failed to ensure user profile:", error);
    throw error;
  }
}
