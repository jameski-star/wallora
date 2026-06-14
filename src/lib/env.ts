/**
 * Centralized environment access + feature-detection.
 *
 * Aurava is designed to RUN with zero external credentials: when a service's
 * env vars are missing, the app falls back to a mock/in-memory implementation
 * so the full UI is browsable locally. Add keys to `.env.local` to switch each
 * subsystem over to the real service.
 */

function pick(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.length > 0) return v;
  }
  return undefined;
}

export const env = {
  siteUrl:
    pick("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",

  // Google Search Console verification token. When set, `baseMetadata` emits the
  // <meta name="google-site-verification"> tag so Google can verify ownership
  // and index the site. Copy the token from Search Console → Settings →
  // Ownership verification → "HTML tag" (the content="..." value only).
  googleSiteVerification: pick("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"),

  // Supabase
  supabaseUrl: pick("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: pick("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceKey: pick("SUPABASE_SERVICE_ROLE_KEY"),
  supabasePremiumBucket: pick("SUPABASE_PREMIUM_BUCKET") ?? "premium-wallpapers",

  // Cloudinary
  cloudinaryCloud: pick("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
  // Server-only secret used to sign delivery URLs (NOT NEXT_PUBLIC — never
  // shipped to the client). On the client this resolves to undefined, so URL
  // builders simply produce unsigned URLs there (which is fine — the signed
  // ones are always built in Server Components).
  cloudinaryApiSecret: pick("CLOUDINARY_API_SECRET"),

  // PesaPal v3
  pesapalConsumerKey: pick("PESAPAL_CONSUMER_KEY"),
  pesapalConsumerSecret: pick("PESAPAL_CONSUMER_SECRET"),
  pesapalIpnId: pick("PESAPAL_IPN_ID"),
  pesapalBaseUrl:
    pick("PESAPAL_BASE_URL") ?? "https://pay.pesapal.com/v3",
  pesapalCurrency: pick("PESAPAL_CURRENCY") ?? "KES",

  // Resend
  resendKey: pick("RESEND_API_KEY"),
  emailFrom: pick("EMAIL_FROM") ?? "Aurava <noreply@aurava.app>",

  // Cron auth
  cronSecret: pick("CRON_SECRET"),
} as const;

export const features = {
  /** Real Supabase DB + auth wired up. */
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  /** Service-role operations (signed URLs, admin writes from server). */
  supabaseAdmin: Boolean(env.supabaseUrl && env.supabaseServiceKey),
  /** Cloudinary preview transformations. */
  cloudinary: Boolean(env.cloudinaryCloud),
  /**
   * Signed delivery URLs are available (cloud + secret present). When true,
   * transformed URLs carry an `s--sig--` segment so the resolution cap can't be
   * tampered with — but enforcement also requires "Strict transformations" to
   * be enabled in the Cloudinary console (Settings → Security). Until then the
   * signatures are simply ignored, so turning this on is safe at any time.
   */
  cloudinarySigned: Boolean(env.cloudinaryCloud && env.cloudinaryApiSecret),
  /** PesaPal live payment processing. */
  pesapal: Boolean(env.pesapalConsumerKey && env.pesapalConsumerSecret),
  /** Resend transactional email. */
  resend: Boolean(env.resendKey),
} as const;

export type FeatureFlags = typeof features;
