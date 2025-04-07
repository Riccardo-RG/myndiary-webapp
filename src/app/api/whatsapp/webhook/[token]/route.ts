import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { processIncomingMessage } from "@/services/whatsappService";
import { WhatsAppPayload } from "@/types/whatsapp";

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Verifica che il token sia valido
    const { data: config, error } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("webhook_token", token)
      .eq("active", true)
      .single();

    if (error || !config) {
      console.error("Invalid webhook token or inactive configuration:", token);
      return NextResponse.json(
        { error: "Invalid webhook token" },
        { status: 401 }
      );
    }

    // Processa il payload del webhook
    const formData = await request.formData();
    const payload: Partial<WhatsAppPayload> = {};

    // Converte FormData in oggetto in modo compatibile
    Array.from(formData.keys()).forEach((key) => {
      // @ts-ignore
      payload[key] = formData.get(key);
    });

    // Verifica che ci siano i campi necessari
    if (!payload.From || !payload.To || !payload.Body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Processa il messaggio
    const result = await processIncomingMessage(payload as WhatsAppPayload);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Messaggio processato con successo
    return NextResponse.json({
      message: "Message received and processed successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Gestisce le richieste di verifica del webhook
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Verifica che il token sia valido
    const { data: config, error } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("webhook_token", token)
      .single();

    if (error || !config) {
      console.error("Invalid webhook token:", token);
      return NextResponse.json(
        { error: "Invalid webhook token" },
        { status: 401 }
      );
    }

    // Se qui, il webhook è valido
    return NextResponse.json({
      message: "Webhook configured correctly",
      status: "active",
      webhook_url: config.webhook_url,
    });
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
