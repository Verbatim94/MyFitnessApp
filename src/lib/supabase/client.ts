import { createBrowserClient } from "@supabase/ssr";
import type { AppData } from "@/lib/types";
import { supabaseConfig } from "@/lib/supabase/config";

export type Database = {
  public: {
    Tables: {
      app_state: {
        Row: {
          id: string;
          payload: AppData;
          updated_at: string;
        };
        Insert: {
          id: string;
          payload: AppData;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payload?: AppData;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey);
}
