export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  appStateId: process.env.PHASE_APP_STATE_ID ?? "primary"
};

export function isSupabaseClientConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.publishableKey);
}

export function isSupabaseServerConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.serviceRoleKey);
}
