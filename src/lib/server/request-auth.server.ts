/**
 * Build a per-request Supabase client that uses the caller's bearer token.
 * Use ONLY inside server route handlers (src/routes/api/**).
 *
 * Returns null when no Authorization header is present or the token is
 * invalid — the caller should respond with 401.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function getRequestSupabase(
  request: Request,
): Promise<{ supabase: SupabaseClient<Database>; userId: string } | null> {
  const auth = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return { supabase, userId: data.user.id };
}

export function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, data: null, error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function jsonOk<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data, error: null }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
