// import { User } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // derived
  isAuthenticated: () => boolean;

  init: () => Promise<void>;

  signInWithProvider: (
    provider: "google" | "github" | "discord",
  ) => Promise<void>;

  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;

  signInWithMagicLink: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      error: null,

      isAuthenticated: () => !!get().session,

      init: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        set({
          session,
          user: session?.user ?? null,
          loading: false,
        });

        supabase.auth.onAuthStateChange((_event, session) => {
          set({
            session,
            user: session?.user ?? null,
            loading: false,
          });
        });
      },

      signInWithProvider: async (provider) => {
        set({ loading: true, error: null });

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) {
          set({ error: error.message, loading: false });
        }
      },

      signUpWithEmail: async (email, password) => {
        set({ loading: true, error: null });

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          set({ error: error.message, loading: false });
          return;
        }

        set({ loading: false });
      },

      signInWithEmail: async (email, password) => {
        set({ loading: true, error: null });

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ error: error.message, loading: false });
          return;
        }

        set({ loading: false });
      },

      signInWithMagicLink: async (email) => {
        set({ loading: true, error: null });

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          set({ error: error.message, loading: false });
          return;
        }

        set({ loading: false });
      },

      resetPassword: async (email) => {
        set({ loading: true, error: null });

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          set({ error: error.message, loading: false });
          return;
        }

        set({ loading: false });
      },

      signOut: async () => {
        set({ loading: true });

        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          loading: false,
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    },
  ),
);
