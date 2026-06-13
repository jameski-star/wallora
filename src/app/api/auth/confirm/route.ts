import { NextResponse, type NextRequest } from "next/server";
import { features } from "@/lib/env";

/**
 * OAuth/recovery callback. Supabase redirects password-reset (and email
 * confirmation) links here with a `code`. We exchange it for a session — which
 * sets the auth cookies — then forward the user to `next` (e.g. /reset-password).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") ? next : "/account";

  if (!features.supabase || !code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/forgot-password?error=expired", url.origin),
    );
  }
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
