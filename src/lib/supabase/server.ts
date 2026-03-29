import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/client";
import { supabaseConfig } from "@/lib/supabase/config";

export function createSupabaseServerClient() {
  return createClient<Database>(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
