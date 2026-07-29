import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate required Supabase env vars early
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
  // Throw an error to stop initialization in the browser
  throw new Error(
    "Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient<Database>(supabaseUrl ?? "", supabaseAnonKey ?? "")
