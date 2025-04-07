"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { signIn, signUp, sendMagicLink, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (!loading && user && pathname === "/login") {
      const returnUrl = searchParams.get("returnUrl") || "/";
      router.push(returnUrl);
    }
  }, [user, loading, router, pathname, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log(`Attempting ${mode} with email:`, email);

      if (mode === "magic") {
        const { error } = await sendMagicLink(email);
        if (error) throw error;
        console.log("Magic link sent successfully");
        setMagicLinkSent(true);
      } else {
        const { error } =
          mode === "signin"
            ? await signIn(email, password)
            : await signUp(email, password);

        if (error) {
          console.error(`${mode} error:`, error);
          throw error;
        }

        // Note: No need to manually redirect here as AuthContext will handle it
        console.log(`${mode} successful, AuthContext will handle redirect`);
      }
    } catch (error: any) {
      console.error(`${mode} error:`, error);
      setError(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Myndiary</h1>
          <p className="mt-2 text-gray-400">
            {mode === "signin" && "Welcome back! Sign in to continue."}
            {mode === "signup" && "Create an account to get started."}
            {mode === "magic" && "Get a magic link sent to your email."}
          </p>
        </div>

        {magicLinkSent ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center space-y-4">
            <div className="text-2xl mb-2">✨</div>
            <h2 className="text-xl font-semibold text-white">
              Check your email
            </h2>
            <p className="text-gray-400">We've sent a magic link to {email}</p>
            <button
              onClick={() => {
                setMagicLinkSent(false);
                setEmail("");
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6"
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                    text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              {mode !== "magic" && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                      text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                rounded-lg text-white font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : mode === "signup"
                ? "Create Account"
                : "Send Magic Link"}
            </button>

            <div className="space-y-2">
              {mode === "signin" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="block w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Don't have an account? Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("magic")}
                    className="block w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Sign in with magic link
                  </button>
                </>
              )}
              {mode === "signup" && (
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="block w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Already have an account? Sign in
                </button>
              )}
              {mode === "magic" && (
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="block w-full text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Sign in with password
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
