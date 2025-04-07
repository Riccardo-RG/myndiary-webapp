const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "lvwxnmziosumfdnxlpxx";

export default function supabaseLoader({ src, width, quality }) {
  // Se l'URL inizia con uno slash, è un'immagine locale
  if (src.startsWith("/")) {
    return src;
  }

  // Per ora, poiché le trasformazioni non sono abilitate, restituiamo l'URL diretto
  if (src.includes("supabase.co/storage/v1/object/public/")) {
    return src;
  }

  // Costruisci l'URL diretto all'oggetto
  return `https://${projectId}.supabase.co/storage/v1/object/public/${src}`;
}
