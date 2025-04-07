/**
 * NOTA: Endpoint temporaneo per testing
 *
 * Questo endpoint usa Twilio solo per testing in sviluppo.
 * In produzione, useremo direttamente le WhatsApp Business API
 * e l'invio dei messaggi sarà gestito tramite:
 * - API ufficiali di WhatsApp
 * - Template approvati da Meta
 * - Webhook diretti da WhatsApp
 */

import { NextResponse } from "next/server";
import { startAutomaticMessages, stopAutomaticMessages } from "@/utils/twilio";
import { formatPhoneNumber } from "@/services/whatsappService";

let isTestingStarted = false;
let currentTestNumber = "";
let intervalId: NodeJS.Timeout | null = null;

// Validate Italian phone number format
function isValidItalianPhoneNumber(number: string): boolean {
  const cleaned = number.replace(/\s+/g, "");
  return /^(\+39)?3\d{9}$/.test(cleaned);
}

export async function POST(request: Request) {
  try {
    // Check environment
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse(
        JSON.stringify({
          error: "Test endpoint is only available in development environment",
          environment: process.env.NODE_ENV,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    let { testNumber } = body;

    // Validate request
    if (!testNumber) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing required parameter: testNumber",
          example: { testNumber: "+393511234567" },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Formatta il numero in modo coerente
    testNumber = formatPhoneNumber(testNumber);

    // Validate phone number format
    if (!isValidItalianPhoneNumber(testNumber)) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid Italian phone number format",
          received: testNumber,
          example: "+393511234567",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if test is already running
    if (isTestingStarted) {
      // If the same number is provided, return a message
      if (currentTestNumber === testNumber) {
        return new NextResponse(
          JSON.stringify({
            success: true,
            message: "Test messages are already running for this number",
            testNumber: testNumber,
            interval: "1 minute",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // If a different number is provided, stop the current test and start a new one
      if (intervalId) {
        stopAutomaticMessages(intervalId);
      }

      intervalId = startAutomaticMessages(testNumber);
      currentTestNumber = testNumber;

      return new NextResponse(
        JSON.stringify({
          success: true,
          message: "Test restarted with new number",
          testNumber: testNumber,
          interval: "1 minute",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Start automatic messages if not already started
    intervalId = startAutomaticMessages(testNumber);
    isTestingStarted = true;
    currentTestNumber = testNumber;

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Automatic testing started",
        testNumber: testNumber,
        interval: "1 minute",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error starting automatic messages:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
