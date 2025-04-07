/**
 * NOTA IMPORTANTE: Implementazione temporanea per sviluppo
 *
 * Questa implementazione usa Twilio SOLO per testing in sviluppo.
 * In produzione useremo direttamente WhatsApp Business API che offre:
 * - Nessuna necessità di opt-in iniziale
 * - Nessun limite di messaggi
 * - Template personalizzabili
 * - Numero WhatsApp Business dedicato
 *
 * Per la produzione sarà necessario:
 * 1. Account WhatsApp Business
 * 2. Verifica del business con Meta
 * 3. Approvazione dei template
 *
 * La migrazione richiederà:
 * - Rimozione completa di Twilio
 * - Implementazione diretta delle API WhatsApp Business
 * - Aggiornamento della gestione dei template
 */

import twilio, { Twilio } from "twilio";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { formatPhoneNumber } from "@/services/whatsappService";

// Constants
const TEMPLATE_SID = "HXb5b62575e6e4ff6129ad7c8efe1f983e";
const FROM_NUMBER = "whatsapp:+14155238886";
const MIN_INTERVAL = 60000; // 1 minute in milliseconds
const TEST_INTERVAL = 60 * 1000; // 1 minute in milliseconds

// Types
interface MessageVariables {
  [key: string]: string;
}

// Environment validation
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error(
    "Missing required Twilio credentials in environment variables"
  );
}

// Initialize Twilio client
const client: Twilio = twilio(accountSid, authToken);

// Rate limiting
const lastMessageTime = new Map<string, number>();

export function checkRateLimit(to: string): boolean {
  const now = Date.now();
  const lastTime = lastMessageTime.get(to) || 0;

  if (now - lastTime < MIN_INTERVAL) {
    console.warn(`Rate limit hit for number ${to}`);
    return false;
  }

  lastMessageTime.set(to, now);
  return true;
}

/**
 * Formats a phone number to include WhatsApp prefix if not present
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number with WhatsApp prefix
 */
function formatWhatsAppNumber(phoneNumber: string): string {
  // Usa la funzione di formattazione da whatsappService
  const formattedNumber = formatPhoneNumber(phoneNumber);

  // Add WhatsApp prefix if not present
  return formattedNumber.startsWith("whatsapp:")
    ? formattedNumber
    : `whatsapp:${formattedNumber}`;
}

/**
 * Sends a template message via WhatsApp using Twilio
 * @param to Recipient phone number
 * @param variables Template variables
 * @returns Promise with message instance
 */
export async function sendTemplateMessage(
  to: string,
  variables: MessageVariables
): Promise<MessageInstance> {
  try {
    const formattedTo = formatWhatsAppNumber(to);
    console.log("Sending template message to:", formattedTo);
    console.log("Using template SID:", TEMPLATE_SID);
    console.log("With variables:", variables);

    if (!checkRateLimit(formattedTo)) {
      console.warn("Rate limit hit, waiting before sending next message");
      throw new Error("Rate limit exceeded for this number");
    }

    console.log("Creating message with Twilio client...");
    const message = await client.messages.create({
      from: FROM_NUMBER,
      to: formattedTo,
      contentSid: TEMPLATE_SID,
      contentVariables: JSON.stringify(variables),
    });

    console.log("Message sent successfully!");
    console.log("Message SID:", message.sid);
    console.log("Message status:", message.status);
    console.log("Full message response:", message);
    return message;
  } catch (error: any) {
    console.error("Detailed error sending template message:", error);
    if (error.code) {
      console.error("Twilio error code:", error.code);
      console.error("Twilio error message:", error.message);
    }
    throw error;
  }
}

/**
 * Starts automatic test messages in development environment
 * @param testNumber The phone number to send test messages to
 * @returns The interval ID for later cancellation
 */
export function startAutomaticMessages(testNumber: string): NodeJS.Timeout {
  if (process.env.NODE_ENV !== "development") {
    console.warn(
      "Automatic messages can only be started in development environment"
    );
    return setTimeout(() => {}, 0); // Dummy timeout in case of non-development environment
  }

  console.log(
    `Starting automatic messages to ${formatWhatsAppNumber(testNumber)}`
  );

  const intervalId = setInterval(async () => {
    try {
      await sendTemplateMessage(testNumber, {
        "1": "Test automatico",
        "2": new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error("Error in automatic message cycle:", error);
    }
  }, TEST_INTERVAL);

  return intervalId;
}

/**
 * Stops automatic test messages
 * @param intervalId The interval ID returned by startAutomaticMessages
 */
export function stopAutomaticMessages(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId);
  console.log("Automatic messages stopped");
}

// Funzione per inviare un messaggio WhatsApp
export async function sendWhatsAppMessage(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
    });

    console.log("Messaggio inviato con successo:", message.sid);
    return message;
  } catch (error) {
    console.error("Errore nell'invio del messaggio:", error);
    throw error;
  }
}

// Funzione per validare la richiesta Twilio
export function validateTwilioRequest(
  request: Request,
  twilioSignature: string | null
) {
  // Skip validation in development
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken || !twilioSignature) return false;

  const url = process.env.WEBHOOK_URL;
  const params = new URLSearchParams(request.url.split("?")[1]);

  return twilio.validateRequest(
    authToken,
    twilioSignature,
    url!,
    Object.fromEntries(params)
  );
}

// Funzione per generare un messaggio di test casuale
export function generateTestMessage(): string {
  const prompts = [
    "Come stai oggi?",
    "Raccontami la tua giornata",
    "Qual è il tuo obiettivo per oggi?",
    "Cosa ti ha reso felice oggi?",
    "Hai imparato qualcosa di nuovo oggi?",
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}
