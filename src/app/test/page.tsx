"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getWhatsAppConfig } from "@/services/whatsappService";

export default function TestPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadWhatsAppConfig();
    }
  }, [user]);

  const loadWhatsAppConfig = async () => {
    setIsConfigLoading(true);
    try {
      const response = await getWhatsAppConfig(user!.id);
      if (response.success && response.data?.phone_number) {
        setPhoneNumber(response.data.phone_number);
      }
    } catch (error) {
      console.error("Error loading WhatsApp config:", error);
    } finally {
      setIsConfigLoading(false);
    }
  };

  const startTest = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Errore",
        description:
          "Configura prima il tuo numero WhatsApp nelle impostazioni",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/test-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testNumber: phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Test avviato",
          description: "I messaggi di test verranno inviati ogni minuto",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore",
          description: data.error || "Errore durante l'avvio del test",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore di connessione",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="rounded-lg border p-6 space-y-4">
          <h1 className="text-2xl font-bold">Test WhatsApp</h1>
          <p className="text-muted-foreground">
            Clicca il pulsante sotto per avviare l&apos;invio automatico di
            messaggi WhatsApp di test. I messaggi verranno inviati ogni minuto
            {phoneNumber
              ? ` al numero ${phoneNumber}`
              : " al tuo numero configurato"}
            .
          </p>
          <div className="space-y-2">
            {!phoneNumber && !isConfigLoading ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                Devi prima configurare il tuo numero WhatsApp nelle{" "}
                <a href="/settings/whatsapp" className="underline font-medium">
                  impostazioni
                </a>
                .
              </div>
            ) : (
              <Button
                onClick={startTest}
                disabled={isLoading || !phoneNumber}
                className="w-full"
              >
                {isLoading ? "Avvio in corso..." : "Avvia Test WhatsApp"}
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              Nota: assicurati di aver prima inviato un messaggio al numero
              Twilio (+14155238886)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
