import { NextResponse } from "next/server";
import { isSupabaseServerConfigured, supabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/client";
import type { AppData } from "@/lib/types";

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_state")
    .select("id, payload, updated_at")
    .eq("id", supabaseConfig.appStateId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = data as Database["public"]["Tables"]["app_state"]["Row"] | null;

  return NextResponse.json({
    data: row?.payload ?? null,
    updatedAt: row?.updated_at ?? null
  });
}

export async function PUT(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const payload = (await request.json()) as { data?: AppData };
  if (!payload.data) {
    return NextResponse.json({ error: "Missing app data payload." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_state")
    .upsert({
      id: supabaseConfig.appStateId,
      payload: payload.data
    })
    .select("updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = data as Pick<Database["public"]["Tables"]["app_state"]["Row"], "updated_at"> | null;

  return NextResponse.json({ updatedAt: row?.updated_at ?? null });
}
