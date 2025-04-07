"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getWhatsAppTemplates,
  createWhatsAppTemplate,
  sendTemplateMessage,
} from "@/services/whatsappService";
import { WhatsAppTemplate } from "@/types/whatsapp";
import { EntryType } from "@/types/diary";

export default function WhatsAppTemplatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    content: string;
    type: "question" | "notification";
    entry_type: EntryType;
  }>({
    name: "",
    content: "",
    type: "question",
    entry_type: "text",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchTemplates();
    }
  }, [user, loading, router]);

  const fetchTemplates = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await getWhatsAppTemplates(user.id);
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        setError("Impossibile caricare i template di WhatsApp");
      }
    } catch (error) {
      console.error("Errore durante il caricamento dei template:", error);
      setError("Si è verificato un errore durante il caricamento dei template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await createWhatsAppTemplate(user.id, newTemplate);

      if (response.success) {
        setTemplates((prev) => [response.data, ...prev]);
        setSuccessMessage("Template creato con successo");
        setIsCreating(false);
        setNewTemplate({
          name: "",
          content: "",
          type: "question",
          entry_type: "text",
        });
      } else {
        setError("Impossibile creare il template");
      }
    } catch (error) {
      console.error("Errore durante la creazione del template:", error);
      setError("Si è verificato un errore durante la creazione del template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTemplate = async (templateId: string) => {
    if (!user?.id) return;

    try {
      const response = await sendTemplateMessage(user.id, templateId);

      if (response.success) {
        setSuccessMessage("Messaggio inviato con successo");
      } else {
        setError("Impossibile inviare il messaggio");
      }
    } catch (error) {
      console.error("Errore durante l'invio del messaggio:", error);
      setError("Si è verificato un errore durante l'invio del messaggio");
    }
  };

  if (loading || isLoading) {
    return (
      <main className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Template Messaggi WhatsApp
          </h1>
          <Link
            href="/settings/whatsapp"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Torna alle impostazioni
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 text-green-400 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              I tuoi template
            </h2>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Crea nuovo template
            </button>
          </div>

          {isCreating && (
            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Nuovo template
              </h3>

              <form onSubmit={handleCreateTemplate}>
                <div className="mb-4">
                  <label
                    className="block text-gray-300 mb-2"
                    htmlFor="template-name"
                  >
                    Nome del template
                  </label>
                  <input
                    id="template-name"
                    type="text"
                    className="w-full p-3 bg-gray-600 text-white rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Domanda quotidiana"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-300 mb-2"
                    htmlFor="template-content"
                  >
                    Contenuto del messaggio
                  </label>
                  <textarea
                    id="template-content"
                    className="w-full p-3 bg-gray-600 text-white rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="es. Come ti senti oggi?"
                    value={newTemplate.content}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        content: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      className="block text-gray-300 mb-2"
                      htmlFor="template-type"
                    >
                      Tipo di template
                    </label>
                    <select
                      id="template-type"
                      className="w-full p-3 bg-gray-600 text-white rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTemplate.type}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          type: e.target.value as "question" | "notification",
                        })
                      }
                    >
                      <option value="question">Domanda</option>
                      <option value="notification">Notifica</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-300 mb-2"
                      htmlFor="entry-type"
                    >
                      Tipo di nota prevista
                    </label>
                    <select
                      id="entry-type"
                      className="w-full p-3 bg-gray-600 text-white rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTemplate.entry_type}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          entry_type: e.target.value as EntryType,
                        })
                      }
                    >
                      <option value="text">Testo</option>
                      <option value="emoji">Emoji</option>
                      <option value="image">Immagine</option>
                      <option value="audio">Audio</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                    disabled={isLoading}
                  >
                    Salva template
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          )}

          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Non hai ancora creato nessun template.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                      Nome
                    </th>
                    <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                      Tipo
                    </th>
                    <th className="py-3 px-4 text-left text-gray-300 font-semibold">
                      Risposta
                    </th>
                    <th className="py-3 px-4 text-right text-gray-300 font-semibold">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-650">
                      <td className="py-4 px-4 text-white">{template.name}</td>
                      <td className="py-4 px-4 text-white">
                        {template.type === "question" ? "Domanda" : "Notifica"}
                      </td>
                      <td className="py-4 px-4 text-white">
                        {template.entry_type}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleSendTemplate(template.id)}
                          className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          title="Invia messaggio"
                        >
                          Invia
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Come funzionano i template
          </h2>

          <div className="space-y-4 text-gray-300">
            <p>
              I template ti permettono di inviare messaggi preimpostati ai tuoi
              utenti tramite WhatsApp. Ci sono due principali tipi di template:
            </p>

            <div className="pl-4">
              <h3 className="text-lg font-medium text-white">Domande</h3>
              <p className="mb-2">
                Le domande sono messaggi che richiedono una risposta. Quando un
                utente risponde a una domanda, la risposta viene salvata come
                una nuova nota nel tuo diario.
              </p>

              <h3 className="text-lg font-medium text-white">Notifiche</h3>
              <p>
                Le notifiche sono messaggi informativi che non richiedono
                necessariamente una risposta. Puoi usarle per ricordare
                all'utente di aggiungere una nota o per inviare promemoria.
              </p>
            </div>

            <p>
              Per ogni template, puoi specificare che tipo di risposta ti
              aspetti (testo, immagine, audio, ecc.). Questo aiuta l'app a
              processare correttamente le risposte quando arrivano.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
