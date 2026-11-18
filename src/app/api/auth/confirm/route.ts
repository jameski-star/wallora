import { NextResponse, type NextRequest } from "next/server";
import { features } from "@/lib/env";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * OAuth/email-confirmation/recovery callback.
 * Supabase redirects password-reset and email confirmation links here with either
 * a PKCE `code` or an OTP `token_hash` + `type`.
 * We exchange or verify it to set the auth session cookie, then forward the user
 * to `/verified` (for email confirmations) or the requested `next` destination.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Determine fallback destination: if it's email confirmation/signup verification, land on /verified
  const requestedNext = url.searchParams.get("next");
  const defaultNext = (type === "signup" || type === "email" || !requestedNext) ? "/verified" : "/account";
  const next = requestedNext ?? defaultNext;
  const safeNext = next.startsWith("/") ? next : defaultNext;

  if (errorParam) {
    console.error("[auth/confirm] Supabase returned error:", errorParam, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || errorParam)}`, url.origin),
    );
  }

  if (!features.supabase) {
    // Demo/offline mode: redirect directly to verified page
    return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();

  // Case 1: OTP Token Hash (standard Supabase email verification links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      console.error("[auth/confirm] verifyOtp error:", error.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
      );
    }
    return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  // Case 2: PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/confirm] exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(
        new URL("/forgot-password?error=expired", url.origin),
      );
    }
    return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  // If neither code nor token_hash was provided, redirect to /verified or /login
  return NextResponse.redirect(new URL("/login", url.origin));
}
