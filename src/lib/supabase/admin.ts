import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

/**
 * Service-role client. SERVER-ONLY — bypasses RLS. Never import into a Client
 * Component. Used for signed-URL generation, fulfillment, and admin writes.
 */
export function createAdminSupabase() {
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    throw new Error("Supabase service role not configured");
  }
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
