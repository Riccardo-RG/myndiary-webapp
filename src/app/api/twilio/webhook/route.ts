import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";
import { validateTwilioRequest, checkRateLimit } from "@/utils/twilio";

// Inizializza il client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Funzione per impostare il claim phone_number
async function setPhoneNumberClaim(phoneNumber: string) {
  await supabase.rpc("set_claim", {
    claim: "request.jwt.claims",
    value: JSON.stringify({ phone_number: phoneNumber }),
  });
}

// Funzione per ottenere il profilo utente o crearne uno nuovo basato sul numero di telefono
async function getOrCreateUserProfile(from: string) {
  /* TODO: Implementazione futura con WhatsApp Business API
   * 1. Rimuovere l'ID hardcoded
   * 2. Implementare la vera autenticazione degli utenti tramite WhatsApp
   * 3. Gestire la creazione del profilo con:
   *    - Verifica del numero di telefono
   *    - Gestione del profilo WhatsApp Business
   *    - Sincronizzazione con il profilo web
   *    - Gestione delle sessioni multiple (web + WhatsApp)
   * 4. Implementare la logica di mapping tra:
   *    - Numero WhatsApp Business
   *    - Email dell'utente
   *    - ID del profilo
   */
  return "10"; // ID hardcoded per testing
}

// Funzione per salvare il messaggio e creare una nota
async function saveMessageAndCreateNote(
  messageBody: string,
  from: string,
  profileId: string
) {
  // Imposta il claim phone_number prima di ogni operazione
  await setPhoneNumberClaim(from);

  // Imposta il phone_number corrente per le policy RLS
  await supabase.rpc("set_claim", {
    claim: "app.current_phone",
    value: from,
  });

  // Salva il messaggio
  const { error: messageError } = await supabase.from("messages").insert([
    {
      body: messageBody,
      from: from,
      type: "RECEIVED",
      created_at: new Date().toISOString(),
      user_id: profileId,
    },
  ]);

  if (messageError) {
    console.error("Errore nel salvare il messaggio:", messageError);
    throw new Error("Errore nel salvare il messaggio");
  }

  // Crea una nota
  const { error: entryError } = await supabase.from("diary_entries").insert([
    {
      content: messageBody,
      type: "TEXT",
      created_at: new Date().toISOString(),
      user_id: profileId,
    },
  ]);

  if (entryError) {
    console.error("Errore nel creare una nota dal messaggio:", entryError);
    throw new Error("Errore nel creare la nota");
  }
}

export async function POST(request: Request) {
  try {
    // Verifica la signature di Twilio
    const twilioSignature = request.headers.get("X-Twilio-Signature");
    if (!validateTwilioRequest(request, twilioSignature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Estrai i dati dal form
    const formData = await request.formData();
    const messageBody = formData.get("Body")?.toString() || "";
    const from = formData.get("From")?.toString() || "";

    // Log del payload ricevuto
    console.log("Ricevuto messaggio:", {
      from,
      body: messageBody,
      timestamp: new Date().toISOString(),
    });

    // Verifica rate limit
    if (!checkRateLimit(from)) {
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(
        "Hai inviato troppi messaggi. Per favore attendi qualche minuto prima di inviarne altri."
      );
      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Ottieni o crea profilo utente
    const profileId = await getOrCreateUserProfile(from);

    // Salva messaggio e crea nota
    await saveMessageAndCreateNote(messageBody, from, profileId);

    // Invia risposta TwiML
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(
      "✅ Nota creata con successo! Il tuo messaggio è stato salvato nel diario."
    );

    return new NextResponse(twiml.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Errore nel gestire il webhook:", error);

    // Invia una risposta di errore all'utente
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(
      "❌ Si è verificato un errore nel salvare il tuo messaggio. Per favore riprova più tardi."
    );

    return new NextResponse(twiml.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
