import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

const LEGACY_SESSION_KEY = "showroom-admin-session";

export type AuthState = {
  configured: boolean;
  session: Session | null;
  user: User | null;
};

const clearLegacyLocalPasswordSession = () => {
  try {
    localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // localStorage may be unavailable in unusual browser privacy modes.
  }
};

export const getAdminAuthState = async (): Promise<AuthState> => {
  clearLegacyLocalPasswordSession();

  if (!isSupabaseConfigured || !supabase) {
    return {
      configured: false,
      session: null,
      user: null,
    };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    return {
      configured: true,
      session: null,
      user: null,
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  return {
    configured: true,
    session: sessionData.session,
    user: userError ? sessionData.session.user : userData.user,
  };
};

export const isAdminAuthenticated = async () => {
  const authState = await getAdminAuthState();
  return Boolean(authState.configured && authState.session && authState.user);
};

export const loginAdmin = async (email: string, password: string) => {
  clearLegacyLocalPasswordSession();

  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session || !data.user) {
    throw new Error("Login did not return a Supabase session.");
  }

  return data;
};

export const logoutAdmin = async () => {
  clearLegacyLocalPasswordSession();

  if (supabase) {
    await supabase.auth.signOut();
  }
};

export const subscribeAdminAuth = (onChange: (state: AuthState, event: AuthChangeEvent) => void) => {
  if (!isSupabaseConfigured || !supabase) {
    return () => undefined;
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    onChange(
      {
        configured: true,
        session,
        user: session?.user ?? null,
      },
      event,
    );
  });

  return () => {
    data.subscription.unsubscribe();
  };
};
