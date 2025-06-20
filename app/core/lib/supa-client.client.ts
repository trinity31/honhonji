import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "database.types";

export const createSupabaseBrowserClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided in VITE_ environment variables.");
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
  );
};
