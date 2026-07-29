import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate required Supabase env vars early
const missingSupabaseEnv = !supabaseUrl || !supabaseAnonKey
if (missingSupabaseEnv) {
  console.error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  )
  // Terminate the process to avoid running with insecure config
  if (typeof process !== "undefined" && process?.exit) {
    process.exit(1)
  }
}

export const supabase = createClient<Database>(supabaseUrl ?? "", supabaseAnonKey ?? "")
