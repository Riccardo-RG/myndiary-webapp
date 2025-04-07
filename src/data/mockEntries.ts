import { DiaryEntry } from "@/types/diary";

export const mockEntries: DiaryEntry[] = [
  {
    id: 1,
    type: "text",
    content:
      "I felt light today, like a weight had been lifted off my shoulders.",
    date: "2024-03-25T12:00:00Z",
    created_at: "2024-03-25T12:00:00Z",
    updated_at: "2024-03-25T12:00:00Z",
  },
  {
    id: 2,
    type: "emoji",
    content: "😄",
    date: "2024-03-25T14:30:00Z",
    created_at: "2024-03-25T14:30:00Z",
    updated_at: "2024-03-25T14:30:00Z",
  },
  {
    id: 3,
    type: "voice",
    content: "/audio/sample.mp3",
    date: "2024-03-25T16:45:00Z",
    created_at: "2024-03-25T16:45:00Z",
    updated_at: "2024-03-25T16:45:00Z",
  },
  {
    id: 4,
    type: "text",
    content: "Had a productive meeting with the team. New ideas flowing!",
    date: "2024-03-26T10:15:00Z",
    created_at: "2024-03-26T10:15:00Z",
    updated_at: "2024-03-26T10:15:00Z",
  },
  {
    id: 5,
    type: "emoji",
    content: "🎯",
    date: "2024-03-26T15:20:00Z",
    created_at: "2024-03-26T15:20:00Z",
    updated_at: "2024-03-26T15:20:00Z",
  },
];
