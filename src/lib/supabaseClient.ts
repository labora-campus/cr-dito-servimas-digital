import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[supabaseClient] URL:", supabaseUrl);
console.log("[supabaseClient] Key exists:", !!supabaseAnonKey);
console.log("[supabaseClient] Key length:", supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "servimas_auth_token_v1", // Custom key to bypass potentially corrupt default storage
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
