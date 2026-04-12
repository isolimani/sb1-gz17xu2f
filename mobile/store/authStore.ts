import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UserRow {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  has_worker_profile: boolean;
  has_business_profile: boolean;
  active_role: string;
  is_admin: boolean;
}

interface WorkerRow {
  user_id: string;
  bio?: string;
  skills: string[];
  hourly_rate_min: number;
  suburb?: string;
  state?: string;
  vetting_status: string;
  avg_rating?: number;
  total_shifts_completed: number;
  completion_rate: number;
  karma: number;
  stripe_account_id?: string;
}

interface AuthStore {
  user: User | null;
  session: Session | null;
  userRow: UserRow | null;
  worker: WorkerRow | null;
  isLoading: boolean;

  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  refreshUserRow: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  userRow: null,
  worker: null,
  isLoading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null });

    if (session?.user) {
      await get().refreshUserRow();
    }

    set({ isLoading: false });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        await get().refreshUserRow();
      } else {
        set({ userRow: null, worker: null });
      }
    });
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  refreshUserRow: async () => {
    const user = get().user;
    if (!user) return;

    const { data: userRow } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    set({ userRow });

    if (userRow?.has_worker_profile) {
      const { data: worker } = await supabase
        .from("worker_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      set({ worker });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, userRow: null, worker: null });
  },
}));
