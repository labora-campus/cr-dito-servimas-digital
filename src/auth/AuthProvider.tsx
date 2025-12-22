import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (args: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      console.log("[AuthProvider] onAuthStateChange:", event, nextSession?.user?.email);

      if (cancelled) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    // Also try to get session directly
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("[AuthProvider] getSession result:", data?.session?.user?.email, error);
      if (cancelled) return;

      if (!error && data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setLoading(false);
      } else if (!data.session) {
        setLoading(false);
      }
    }).catch((err) => {
      console.error("[AuthProvider] getSession error:", err);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      loading,
      signInWithPassword: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
