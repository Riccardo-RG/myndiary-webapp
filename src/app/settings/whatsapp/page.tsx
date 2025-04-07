/**
 * NOTA: Configurazione WhatsApp - Versione Development
 *
 * Questa configurazione usa temporaneamente Twilio per il testing.
 * In produzione utilizzeremo:
 *
 * 1. WhatsApp Business API:
 *    - API native di WhatsApp
 *    - Template personalizzati approvati
 *    - Numero business verificato
 *    - Nessun intermediario
 *
 * 2. Configurazioni richieste:
 *    - Verifica business con Meta
 *    - Approvazione template
 *    - Setup webhook diretti
 *
 * 3. Vantaggi in produzione:
 *    - Comunicazione diretta con WhatsApp
 *    - Migliori performance
 *    - Costi ottimizzati
 *    - Funzionalità complete di business
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getWhatsAppConfig,
  updateWhatsAppConfig,
} from "@/services/whatsappService";
import { WhatsAppConfig } from "@/types/whatsapp";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function WhatsAppSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchWhatsAppConfig();
    }
  }, [user, loading, router]);

  const fetchWhatsAppConfig = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await getWhatsAppConfig(user.id);
      if (response.success && response.data) {
        setConfig(response.data);
        setPhoneNumber(response.data.phone_number || "");
        setIsActive(response.data.active || false);
      } else {
        setError("Impossibile caricare la configurazione di WhatsApp");
      }
    } catch (error) {
      console.error(
        "Errore durante il caricamento della configurazione:",
        error
      );
      setError(
        "Si è verificato un errore durante il caricamento della configurazione"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !config) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updateWhatsAppConfig(user.id, {
        phone_number: phoneNumber,
        active: isActive,
      });

      if (response.success) {
        setConfig(response.data);
        setSuccessMessage("Configurazione di WhatsApp aggiornata con successo");
      } else {
        setError("Impossibile aggiornare la configurazione di WhatsApp");
      }
    } catch (error) {
      console.error(
        "Errore durante l'aggiornamento della configurazione:",
        error
      );
      setError(
        "Si è verificato un errore durante l'aggiornamento della configurazione"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = async () => {
    if (!phoneNumber) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Configura e salva prima il tuo numero WhatsApp",
      });
      return;
    }

    setIsTestLoading(true);
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
          description: "I messaggi di test verranno inviati ogni 3 minuti",
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
      setIsTestLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <main className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Configurazione WhatsApp
        </h1>

        {/* Banner informativo versione development */}
        <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-200 p-4 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-2">
            ⚠️ Versione Development
          </h3>
          <p className="mb-2">
            Questa è una versione di sviluppo che utilizza Twilio per testare
            l'integrazione WhatsApp. In produzione, questa implementazione verrà
            sostituita con l'API WhatsApp Business che offrirà:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Comunicazione diretta con l'API WhatsApp Business</li>
            <li>Template di messaggi approvati da Meta</li>
            <li>Numero WhatsApp Business verificato</li>
            <li>Migliori performance e costi ottimizzati</li>
            <li>Funzionalità complete di business messaging</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Informazioni sul Webhook
            </h2>
            <p className="text-gray-300 mb-4">
              Per utilizzare l'integrazione con WhatsApp, dovrai configurare un
              webhook nella piattaforma WhatsApp Business API.
            </p>

            <div className="bg-gray-700 p-4 rounded-md mb-4">
              <div className="mb-2">
                <span className="text-gray-400">URL Webhook:</span>
                <code className="ml-2 p-1 bg-gray-900 rounded text-green-400">
                  {config?.webhook_url || "Non disponibile"}
                </code>
              </div>
              <div>
                <span className="text-gray-400">Token Webhook:</span>
                <code className="ml-2 p-1 bg-gray-900 rounded text-green-400">
                  {config?.webhook_token || "Non disponibile"}
                </code>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-md">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 text-green-400 rounded-md">
                {successMessage}
              </div>
            )}

            <div className="mb-4">
              <label
                className="block text-gray-300 mb-2"
                htmlFor="phone-number"
              >
                Numero di telefono WhatsApp
              </label>
              <input
                id="phone-number"
                type="text"
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+391234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <p className="mt-1 text-gray-400 text-sm">
                Inserisci il numero di telefono nel formato internazionale (es.
                +391234567890)
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="ml-2 text-gray-300">
                  Attiva integrazione WhatsApp
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Salvataggio in corso..." : "Salva configurazione"}
            </button>
          </form>
        </div>

        {/* Sezione Test */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Test dell'Integrazione
          </h2>
          <p className="text-gray-300 mb-4">
            Puoi testare l'integrazione WhatsApp inviando messaggi automatici al
            tuo numero. I messaggi verranno inviati ogni 3 minuti per verificare
            la corretta configurazione.
          </p>

          <div className="space-y-4">
            <button
              onClick={startTest}
              disabled={isTestLoading || !phoneNumber || !isActive}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isTestLoading ? "Avvio test in corso..." : "Avvia Test WhatsApp"}
            </button>

            <div className="bg-gray-700 p-4 rounded-md text-sm text-gray-300">
              <h3 className="font-medium text-white mb-2">
                Prima di iniziare:
              </h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Assicurati di aver salvato la configurazione con il tuo numero
                </li>
                <li>Invia un messaggio al numero Twilio (+14155238886)</li>
                <li>Attendi la conferma di avvio del test</li>
                <li>Per fermare i test, riavvia il server di sviluppo</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Istruzioni per la configurazione
          </h2>

          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">
                1. Registrati per la WhatsApp Business API
              </h3>
              <p>
                Per utilizzare questa integrazione, avrai bisogno di accesso
                alla WhatsApp Business API. Puoi registrarti tramite un provider
                come Twilio o direttamente da Meta Business.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-1">
                2. Configura il webhook
              </h3>
              <p>
                Nella dashboard del tuo provider, imposta l'URL del webhook
                fornito sopra come endpoint per ricevere i messaggi in entrata
                da WhatsApp.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-1">
                3. Attiva l'integrazione
              </h3>
              <p>
                Una volta configurato il webhook, attiva l'integrazione usando
                l'interruttore sopra e inserisci il numero di telefono che hai
                registrato con WhatsApp Business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
