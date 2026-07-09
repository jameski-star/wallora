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
    (pick("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000").replace(/\/$/, ""),

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
  // Admin API key + secret used for asset search/context updates (import cron).
  // Separate from the signing secret — Cloudinary generates distinct key/secret
  // pairs for the Admin API vs. URL signing, though they can be the same when
  // "Auto-populate signing secret to API secret" is enabled in dashboard.
  cloudinaryApiKey: pick("CLOUDINARY_API_KEY"),
  // Server-only secret used to sign delivery URLs (NOT NEXT_PUBLIC — never
  // shipped to the client). On the client this resolves to undefined, so URL
  // builders simply produce unsigned URLs there (which is fine — the signed
  // ones are always built in Server Components).
  cloudinaryApiSecret: pick("CLOUDINARY_API_SECRET"),

  // Google Gemini — powers the admin "Auto-fill from image" feature. Server-only
  // (NOT NEXT_PUBLIC): the key is never shipped to the client; analysis runs in a
  // Server Action. Grab a free key at https://aistudio.google.com/apikey.
  geminiApiKey: pick("GEMINI_API_KEY"),
  // Overridable so you can move to a newer/cheaper flash model without a deploy.
  geminiModel: pick("GEMINI_MODEL") ?? "gemini-2.5-flash",

  // PesaPal v3
  pesapalConsumerKey: pick("PESAPAL_CONSUMER_KEY"),
  pesapalConsumerSecret: pick("PESAPAL_CONSUMER_SECRET"),
  pesapalIpnId: pick("PESAPAL_IPN_ID"),
  pesapalBaseUrl:
    pick("PESAPAL_BASE_URL") ?? "https://pay.pesapal.com/v3",
  pesapalCurrency: pick("PESAPAL_CURRENCY") ?? "KES",

  // Resend
  resendKey: pick("RESEND_API_KEY"),
  // Must be an address on a domain VERIFIED in your Resend dashboard, or every
  // send is rejected with a 403. Override per-deploy via EMAIL_FROM.
  emailFrom: pick("EMAIL_FROM") ?? "Aurava <noreply@auravaw.tech>",

  // Cron auth
  cronSecret: pick("CRON_SECRET"),

  // Pinterest
  pinterestAccessToken: pick("PINTEREST_ACCESS_TOKEN"),
  pinterestRefreshToken: pick("PINTEREST_REFRESH_TOKEN"),
  pinterestClientId: pick("PINTEREST_CLIENT_ID"),
  pinterestClientSecret: pick("PINTEREST_CLIENT_SECRET"),
  pinterestBoardId: pick("PINTEREST_BOARD_ID"),
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
  /** Cloudinary Admin API (search + context write for import cron). */
  cloudinaryAdmin: Boolean(env.cloudinaryCloud && env.cloudinaryApiKey && env.cloudinaryApiSecret),
  /** Gemini-powered admin auto-fill from an uploaded image. */
  gemini: Boolean(env.geminiApiKey),
  /** PesaPal live payment processing. */
  pesapal: Boolean(env.pesapalConsumerKey && env.pesapalConsumerSecret),
  /** Resend transactional email. */
  resend: Boolean(env.resendKey),
  /** Pinterest auto-posting. */
  pinterest: Boolean(
    pick("PINTEREST_BOARD_ID") &&
      (pick("PINTEREST_ACCESS_TOKEN") ||
        (pick("PINTEREST_REFRESH_TOKEN") &&
          pick("PINTEREST_CLIENT_ID") &&
          pick("PINTEREST_CLIENT_SECRET")))
  ),
} as const;

export type FeatureFlags = typeof features;
