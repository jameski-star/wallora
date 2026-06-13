import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "../env";

/**
 * Server-side Supabase client bound to the request's cookies.
 * Next 16: `cookies()` is async and must be awaited.
 *
 * Note: when called from a Server Component (read-only cookie store), `setAll`
 * can throw — we swallow it because session refresh is handled in proxy.ts.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore; proxy refreshes.
        }
      },
    },
  });
}
