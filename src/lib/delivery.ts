import "server-only";
import { env, features } from "./env";
import type { Wallpaper } from "./types";

/** Seconds a download link stays valid. */
export const SIGNED_URL_TTL = 60;

/**
 * Produce a short-lived download URL for a PREMIUM original asset.
 *  - Supabase configured → 60s signed URL from the PRIVATE premium bucket.
 *  - Otherwise           → fall back to the seed original URL (demo only).
 *
 * Only premium downloads go through here — they're delivered after purchase
 * (see the order/receipt routes and lib/orders.ts). FREE wallpapers do NOT use
 * Supabase; they're served directly from Cloudinary via `originalDownloadUrl`
 * (lib/cloudinary.ts). The premium original is NEVER a public URL in
 * production; only this signed link grants temporary access, and it expires.
 */
export async function signedDownloadUrl(w: Wallpaper): Promise<string> {
  if (features.supabaseAdmin) {
    const { createAdminSupabase } = await import("./supabase/admin");
    const admin = createAdminSupabase();
    const { data, error } = await admin.storage
      .from(env.supabasePremiumBucket)
      .createSignedUrl(w.originalStoragePath, SIGNED_URL_TTL, {
        download: `${w.id}.jpg`,
      });
    if (error || !data) {
      // Include the offending wallpaper + path so the log is actionable: this
      // almost always means the original was never uploaded to the bucket.
      throw new Error(
        `Signed URL failed for wallpaper ${w.id} ` +
          `(${env.supabasePremiumBucket}/${w.originalStoragePath}): ` +
          `${error?.message ?? "no data"}`,
      );
    }
    return data.signedUrl;
  }
  // Demo fallback: the seed "original" is a public image host URL.
  return w.originalPublicId;
}
