export type EntryType =
  | "text"
  | "emoji"
  | "image"
  | "audio"
  | "video"
  | "voice";

export interface DiaryEntry {
  id: number;
  type: EntryType;
  content: string;
  image_url?: string;
  audio_url?: string;
  video_url?: string;
  created_at: string;
  updated_at?: string;
  date?: string;
}

export interface DayEntries {
  date: string; // ISO string
  entries: DiaryEntry[];
}
