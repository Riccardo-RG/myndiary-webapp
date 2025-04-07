import { NextResponse } from "next/server";
import { sendTemplateMessage, checkRateLimit } from "@/utils/twilio";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, variables } = body;

    if (!to || !variables) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400 }
      );
    }

    // Optional rate limiting check
    if (!checkRateLimit(to)) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429 }
      );
    }

    const message = await sendTemplateMessage(to, variables);

    return new NextResponse(
      JSON.stringify({ success: true, messageSid: message.sid }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending template message:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
