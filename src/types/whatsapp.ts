import { DiaryEntry, EntryType } from "./diary";
import { User } from "@supabase/supabase-js";

export interface WhatsAppConfig {
  id: string;
  user_id: string;
  phone_number: string;
  webhook_token: string;
  webhook_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  type: "question" | "notification";
  entry_type: EntryType;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  media_url?: string;
  media_type?: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  status: "received" | "sent" | "delivered" | "read" | "failed";
  entry_id?: string;
  template_id?: string;
}

export interface WhatsAppPayload {
  SmsMessageSid: string;
  NumMedia: string;
  ProfileName: string;
  SmsSid: string;
  WaId: string;
  SmsStatus: string;
  Body: string;
  To: string;
  NumSegments: string;
  MessageSid: string;
  AccountSid: string;
  From: string;
  ApiVersion: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}

export interface WhatsAppServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}
