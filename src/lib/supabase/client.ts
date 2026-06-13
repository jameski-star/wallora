"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "../env";

/** Browser-side Supabase client (anon key). Safe to call in Client Components. */
export function createClient() {
  return createBrowserClient(env.supabaseUrl!, env.supabaseAnonKey!);
}
