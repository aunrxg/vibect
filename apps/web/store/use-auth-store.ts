// import { User } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { syncUserToDB } from "@/lib/syncUserToDB";
import { Identity } from "@/lib/types";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const generateGuestName = () => {
  const adjectives = [
    "Hidden",
    "Rogue",
    "Sage",
    "Shadow",
    "Crimson",
    "Noble",
    "Pirate",
    "Jolly",
    "Grand",
    "Supernova",
    "Brave",
    "Wandering",
  ];

  const characters = [
    // Naruto
    "Naruto",
    "Sasuke",
    "Kakashi",
    "Itachi",
    "Hinata",
    "Gaara",
    "Jiraiya",
    // One Piece
    "Luffy",
    "Zoro",
    "Nami",
    "Sanji",
    "Robin",
    "Law",
    "Ace",
    "Sabo",
  ];

  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomChar = characters[Math.floor(Math.random() * characters.length)];
  const guestId = Math.floor(1000 + Math.random() * 9000); // 4-digit suffix for uniqueness

  return `${randomAdj} ${randomChar} #${guestId}`;
};

function createAnonymousUser() {
  // create anon user
  return {
    id: `anon_${crypto.randomUUID()}`,
    name: generateGuestName(),
    isAnonymous: true as const,
  };
}

interface AuthState {
  identity: Identity | null;
  // user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // derived
  isAuthenticated: () => boolean;

  getAuthToken: () => string | null;
  identityKey: () => string;

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
      identity: null,
      user: null,
      session: null,
      loading: true,
      error: null,

      isAuthenticated: () =>
        !!get().session && get().identity?.isAnonymous === false,

      getAuthToken: () => {
        const { session, identity } = get();
        if (session?.access_token) return session.access_token;
        if (identity?.isAnonymous) return identity.id;
        return null;
      },

      identityKey: () => {
        const i = get().identity;
        return i ? `${i.isAnonymous ? "anon" : "user"}:${i.id}` : "public";
      },

      init: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await syncUserToDB(session.user);
          set({
            session,
            identity: {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name,
              avatarUrl: session.user.user_metadata?.avatar_url,
              isAnonymous: false,
            },
            // user: session?.user ?? null,
            loading: false,
          });
        } else {
          // no session found - enusre anon identity
          const existing = get().identity;
          set({
            identity: existing ?? createAnonymousUser(),
            session: null,
            loading: false,
          });
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            await syncUserToDB(session.user);
            set({
              session,
              identity: {
                id: session.user.id,
                name: session.user.user_metadata?.name,
                email: session.user.email!,
                avatarUrl: session.user.user_metadata?.avatar_url,
                isAnonymous: false,
              },
              // user: session?.user ?? null,
              loading: false,
            });
          } else {
            set((state) => ({
              session: null,
              identity:
                state.identity && state.identity.isAnonymous
                  ? state.identity
                  : createAnonymousUser(),
              loading: false,
            }));
          }
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
          throw error;
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
          throw error;
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
          throw error;
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
          throw error;
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
          // user: null,
          identity: createAnonymousUser(),
          session: null,
          loading: false,
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.identity,
        session: state.session,
      }),
    },
  ),
);
