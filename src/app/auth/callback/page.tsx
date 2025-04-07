"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get("code");

      if (code) {
        try {
          console.log("Processing auth callback with code");
          await supabase.auth.exchangeCodeForSession(code);
          console.log("Auth callback successful, redirecting to diary");
          router.push("/diary");
        } catch (error) {
          console.error("Error processing auth callback:", error);
          router.push("/login?error=auth_callback_failed");
        }
      } else {
        console.log("No auth code found, redirecting to login");
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Completing authentication...</p>
      </div>
    </main>
  );
}
