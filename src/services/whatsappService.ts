import { supabase } from "@/lib/supabase";
import {
  WhatsAppConfig,
  WhatsAppMessage,
  WhatsAppPayload,
  WhatsAppServiceResponse,
  WhatsAppTemplate,
} from "@/types/whatsapp";
import { createEntry } from "./entryService";
import { DiaryEntry } from "@/types/diary";

// Prefissi internazionali più comuni
const COUNTRY_PREFIXES = [
  { country: "Italy", prefix: "+39" },
  { country: "US", prefix: "+1" },
  { country: "UK", prefix: "+44" },
  { country: "Spain", prefix: "+34" },
  { country: "France", prefix: "+33" },
  { country: "Germany", prefix: "+49" },
];

// Funzioni di utilità
const generateWebhookToken = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Formatta il numero di telefono per assicurarsi che abbia il prefisso +39
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "";

  // Rimuovi spazi e caratteri speciali
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, "");

  // Se il numero ha già un prefisso internazionale, usalo
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Altrimenti, verifica se inizia con uno dei prefissi conosciuti (senza il +)
  for (const country of COUNTRY_PREFIXES) {
    const prefixWithoutPlus = country.prefix.replace("+", "");
    if (cleaned.startsWith(prefixWithoutPlus)) {
      return `+${cleaned}`;
    }
  }

  // Se non ha un prefisso e inizia con 3 (tipico per numeri italiani), aggiungi +39
  if (cleaned.startsWith("3") && cleaned.length === 10) {
    return `+39${cleaned}`;
  }

  // Altrimenti aggiungi comunque +39 come default per l'Italia
  return `+39${cleaned}`;
}

// Ottiene o crea la configurazione WhatsApp per l'utente
export async function getWhatsAppConfig(
  userId: string
): Promise<WhatsAppServiceResponse> {
  try {
    const { data, error } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error;
    }

    if (data) {
      return {
        success: true,
        message: "WhatsApp configuration found",
        data,
      };
    }

    // Crea una nuova configurazione
    const webhook_token = generateWebhookToken();
    const webhook_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook/${webhook_token}`;

    const { data: newConfig, error: insertError } = await supabase
      .from("whatsapp_config")
      .insert({
        user_id: userId,
        webhook_token,
        webhook_url,
        active: false,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      message: "WhatsApp configuration created",
      data: newConfig,
    };
  } catch (error) {
    console.error("Failed to get or create WhatsApp config:", error);
    return {
      success: false,
      message: "Failed to get or create WhatsApp configuration",
      error,
    };
  }
}

export async function updateWhatsAppConfig(
  userId: string,
  configData: Partial<WhatsAppConfig>
): Promise<WhatsAppServiceResponse> {
  try {
    // Formatta il numero di telefono se presente
    const updatedConfig = { ...configData };
    if (updatedConfig.phone_number) {
      updatedConfig.phone_number = formatPhoneNumber(
        updatedConfig.phone_number
      );
    }

    const { data, error } = await supabase
      .from("whatsapp_config")
      .update({
        ...updatedConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "WhatsApp configuration updated",
      data,
    };
  } catch (error) {
    console.error("Failed to update WhatsApp config:", error);
    return {
      success: false,
      message: "Failed to update WhatsApp configuration",
      error,
    };
  }
}

// Salva un messaggio WhatsApp ricevuto
export async function saveWhatsAppMessage(
  messageData: Partial<WhatsAppMessage>
): Promise<WhatsAppServiceResponse> {
  try {
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .insert({
        ...messageData,
        timestamp: messageData.timestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "WhatsApp message saved",
      data,
    };
  } catch (error) {
    console.error("Failed to save WhatsApp message:", error);
    return {
      success: false,
      message: "Failed to save WhatsApp message",
      error,
    };
  }
}

// Elabora un messaggio in arrivo da WhatsApp
export async function processIncomingMessage(
  payload: WhatsAppPayload
): Promise<WhatsAppServiceResponse> {
  try {
    // Estrai il numero di telefono rimuovendo il prefisso "whatsapp:"
    const phoneNumber = payload.To.replace("whatsapp:", "");

    // 1. Trova la configurazione utente in base al numero di telefono
    const { data: configData, error: configError } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("phone_number", phoneNumber)
      .eq("active", true)
      .single();

    if (configError) {
      throw new Error(
        `No active WhatsApp configuration found for number ${phoneNumber}`
      );
    }

    // 2. Salva il messaggio ricevuto
    const messageData: Partial<WhatsAppMessage> = {
      from: payload.From,
      to: payload.To,
      body: payload.Body,
      media_url: payload.MediaUrl0,
      media_type: payload.MediaContentType0,
      direction: "inbound",
      status: "received",
    };

    await saveWhatsAppMessage(messageData);

    // 3. Controlla se è una risposta a una domanda
    let entryType: DiaryEntry["type"] = "text";
    let entryData: any = { content: payload.Body, type: entryType };

    // 4. Se contiene media, elabora il file
    if (
      payload.NumMedia &&
      parseInt(payload.NumMedia) > 0 &&
      payload.MediaUrl0
    ) {
      if (payload.MediaContentType0?.startsWith("image/")) {
        entryType = "image";
        entryData.image_url = payload.MediaUrl0;
      } else if (payload.MediaContentType0?.startsWith("audio/")) {
        entryType = "audio";
        entryData.audio_url = payload.MediaUrl0;
      } else if (payload.MediaContentType0?.startsWith("video/")) {
        entryType = "video";
        entryData.video_url = payload.MediaUrl0;
      }
      entryData.type = entryType;
    }

    // 5. Crea una nuova nota
    const entry = await createEntry(entryData);

    // 6. Aggiorna il messaggio con l'ID della nota creata
    await supabase
      .from("whatsapp_messages")
      .update({ entry_id: entry.id })
      .eq("from", payload.From)
      .eq("body", payload.Body);

    return {
      success: true,
      message: "Message processed and entry created",
    };
  } catch (error) {
    console.error("Failed to process incoming WhatsApp message:", error);
    return {
      success: false,
      message: "Failed to process incoming WhatsApp message",
      error,
    };
  }
}

// Invia un messaggio WhatsApp (simulato per ora)
export async function sendWhatsAppMessage(
  to: string,
  body: string,
  mediaUrl?: string
): Promise<WhatsAppServiceResponse> {
  try {
    // Formatta il numero in modo consistente
    const formattedNumber = formatPhoneNumber(to);

    // In una vera implementazione, qui chiamiremmo l'API di WhatsApp
    console.log(`[WhatsApp] Sending message to ${formattedNumber}: ${body}`);

    // Registra il messaggio in uscita
    const messageData: Partial<WhatsAppMessage> = {
      from: "CONFIGURED_FROM_NUMBER", // Questo sarà configurato nelle impostazioni
      to: formattedNumber,
      body,
      media_url: mediaUrl,
      direction: "outbound",
      status: "sent",
      timestamp: new Date().toISOString(),
    };

    await saveWhatsAppMessage(messageData);

    return {
      success: true,
      message: "WhatsApp message sent",
      data: messageData,
    };
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return {
      success: false,
      message: "Failed to send WhatsApp message",
      error,
    };
  }
}

// Ottiene i messaggi WhatsApp per un utente
export async function getWhatsAppMessages(
  userId: string
): Promise<WhatsAppServiceResponse> {
  try {
    // Prima ottieni la configurazione per avere il numero di telefono
    const { data: config, error: configError } = await supabase
      .from("whatsapp_config")
      .select("phone_number")
      .eq("user_id", userId)
      .single();

    if (configError) {
      throw configError;
    }

    // Ottieni i messaggi per quel numero di telefono
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("to", config.phone_number)
      .order("timestamp", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "WhatsApp messages retrieved",
      data,
    };
  } catch (error) {
    console.error("Failed to get WhatsApp messages:", error);
    return {
      success: false,
      message: "Failed to get WhatsApp messages",
      error,
    };
  }
}

// Gestione dei template
export async function getWhatsAppTemplates(
  userId: string
): Promise<WhatsAppServiceResponse> {
  try {
    const { data, error } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "WhatsApp templates retrieved",
      data,
    };
  } catch (error) {
    console.error("Failed to get WhatsApp templates:", error);
    return {
      success: false,
      message: "Failed to get WhatsApp templates",
      error,
    };
  }
}

export async function createWhatsAppTemplate(
  userId: string,
  templateData: Partial<WhatsAppTemplate>
): Promise<WhatsAppServiceResponse> {
  try {
    const { data, error } = await supabase
      .from("whatsapp_templates")
      .insert({
        user_id: userId,
        ...templateData,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "WhatsApp template created",
      data,
    };
  } catch (error) {
    console.error("Failed to create WhatsApp template:", error);
    return {
      success: false,
      message: "Failed to create WhatsApp template",
      error,
    };
  }
}

export async function sendTemplateMessage(
  userId: string,
  templateId: string
): Promise<WhatsAppServiceResponse> {
  try {
    // 1. Ottieni il template
    const { data: template, error: templateError } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("id", templateId)
      .eq("user_id", userId)
      .single();

    if (templateError) {
      throw templateError;
    }

    // 2. Ottieni la configurazione WhatsApp
    const { data: config, error: configError } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (configError) {
      throw configError;
    }

    // Verifica che il numero sia formattato correttamente
    const formattedNumber = formatPhoneNumber(config.phone_number);

    // 3. Invia il messaggio
    const result = await sendWhatsAppMessage(formattedNumber, template.content);

    // 4. Aggiorna il messaggio con il templateId
    if (result.success && result.data) {
      await supabase
        .from("whatsapp_messages")
        .update({ template_id: templateId })
        .eq("id", result.data.id);
    }

    return result;
  } catch (error) {
    console.error("Failed to send template message:", error);
    return {
      success: false,
      message: "Failed to send template message",
      error,
    };
  }
}
