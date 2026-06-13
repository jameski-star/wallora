import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next 16 renamed `middleware` → `proxy` (Node.js runtime, no edge).
 *
 * Responsibilities:
 *  1. Refresh the Supabase auth session cookie on every matched request.
 *  2. Light gate for /admin-dash and /account (UX redirect only).
 *
 * IMPORTANT: this is defense-in-depth. Real authorization is enforced again in
 * Server Components / Server Actions (see lib/auth requireAdmin/requireUser),
 * because Server Functions can bypass proxy matchers (per Next.js docs).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PROTECTED = ["/admin-dash", "/account"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));

  // No Supabase → demo mode. Gate protected routes on the demo cookie's
  // presence; role checks still happen server-side.
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    if (needsAuth && !request.cookies.has("wallora_demo_user")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the session so it refreshes if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on everything except static assets and metadata files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
