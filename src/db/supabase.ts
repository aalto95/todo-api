import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
}

function supabaseAnonKey(): string | undefined {
  return process.env.SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
}

/** True when Supabase URL and anon key are set. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function getSupabase(): SupabaseClient {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY are required (or NEXT_PUBLIC_* equivalents)",
    );
  }
  if (!_client) {
    _client = createClient(url, key);
  }
  return _client;
}

export async function pingSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabase();
  const { error } = await supabase.from("todos").select("id", { count: "exact", head: true });
  if (error) throw error;
}

export async function closeSupabase(): Promise<void> {
  _client = null;
}
