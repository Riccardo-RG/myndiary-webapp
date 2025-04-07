"use client";
import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        console.log("Checking initial session...");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(
          "Initial session check:",
          session ? "Session found" : "No session"
        );
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error checking initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);

      // Remove automatic redirects to prevent conflicts with page-level navigation
    });

    return () => {
      console.log("Cleaning up auth subscriptions");
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
      } else {
        console.log("Sign in successful:", data.user?.email);
      }

      return { error };
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting sign up for:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Sign up error:", error);
      } else {
        console.log("Sign up successful:", data.user?.email);
      }

      return { error };
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting sign out...");
      await supabase.auth.signOut();
      console.log("Sign out successful");
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      console.log("Sending magic link to:", email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Magic link error:", error);
      } else {
        console.log("Magic link sent successfully");
      }

      return { error };
    } catch (error) {
      console.error("Unexpected error sending magic link:", error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    sendMagicLink,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
