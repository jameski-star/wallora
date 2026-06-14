import { createHash } from "node:crypto";
import { env, features } from "./env";
import { isAbsolute, normalizeSource } from "./cloudinary-url";
import type { Wallpaper } from "./types";

// Re-export the client-safe helpers so existing server importers keep working.
export { probeImageUrl } from "./cloudinary-url";

/**
 * Cloudinary preview pipeline.
 *
 * Storage model:
 *  - FREE wallpapers live entirely on Cloudinary. The original is served both
 *    as the public display and as the download — no Supabase involved.
 *  - PREMIUM wallpapers display a clean (un-watermarked) but RESOLUTION-CAPPED
 *    preview derived on Cloudinary, while the full-resolution original lives in
 *    a private Supabase bucket and is only delivered via a short-lived signed
 *    URL after purchase (see lib/delivery.ts).
 *
 * The paywall is protected by the resolution cap, NOT by watermarks: the public
 * never receives a premium image large enough to substitute for the purchase.
 *
 * That cap is only meaningful if it can't be edited away. Every transformed
 * delivery URL below is therefore SIGNED (`s--sig--`) when an API secret is
 * configured: stripping `w_1600` to fetch the full-res original then returns
 * 401 (provided "Strict transformations" is enabled in the Cloudinary console).
 * Without a secret the URLs are unsigned and behave exactly as before.
 *
 * When Cloudinary isn't configured, `originalPublicId` is treated as an
 * absolute fallback URL (the mock seed uses picsum/unsplash) so the UI still
 * renders during local development.
 */

/**
 * Hard ceiling (px) on the width of a PREMIUM public preview. Originals are
 * often 4K (3840px); capping the preview keeps it unusable as a final asset so
 * buyers must purchase to get full resolution. Free wallpapers are not capped.
 */
const PREMIUM_PREVIEW_MAX_WIDTH = 1600;

type PreviewOptions = {
  /** Target width of the preview (px). Defaults to a gallery-friendly size. */
  width?: number;
  /** JPEG-ish quality bucket. */
  quality?: number;
};

/**
 * Cloudinary signed-delivery prefix (`s--sig--`) for a given transform + public
 * id, or "" when no secret is configured. The algorithm mirrors the Cloudinary
 * SDK exactly so signatures validate on their CDN:
 *   to_sign = "<transform>/<transform>/.../<publicId>"
 *   sig     = base64( sha1(to_sign + api_secret) )
 *             .slice(0, 8)  with  '/' → '_'  and  '+' → '-'
 * The prefix is inserted between the delivery type and the transforms:
 *   .../image/upload/s--sig--/<transforms>/<publicId>
 */
function signature(transforms: string[], id: string): string {
  if (!env.cloudinaryApiSecret) return "";
  const toSign = [...transforms, id].filter(Boolean).join("/");
  const digest = createHash("sha1")
    .update(toSign + env.cloudinaryApiSecret)
    .digest("base64");
  const sig = digest.slice(0, 8).replace(/\//g, "_").replace(/\+/g, "-");
  return `s--${sig}--`;
}

/**
 * Assemble a (signed) Cloudinary delivery URL. The signature — when present —
 * is computed over exactly the transform segments and public id that appear in
 * the path, so the two always agree.
 */
function deliveryUrl(
  resource: "image" | "video",
  delivery: "upload" | "fetch",
  transforms: string[],
  id: string,
): string {
  const base = `https://res.cloudinary.com/${env.cloudinaryCloud}/${resource}/${delivery}`;
  // filter(Boolean) drops the signature segment when signing is disabled.
  return [base, signature(transforms, id), ...transforms, id]
    .filter(Boolean)
    .join("/");
}

/**
 * Build a clean (un-watermarked) public preview URL for a wallpaper.
 *
 * For PREMIUM wallpapers the width is clamped to `PREMIUM_PREVIEW_MAX_WIDTH` so
 * the public never receives a full-resolution copy — this is what protects the
 * paywall now that watermarks are gone. FREE wallpapers are served at the
 * requested width (their original is downloadable anyway).
 */
export function previewUrl(
  wallpaper: Pick<
    Wallpaper,
    "previewPublicId" | "originalPublicId" | "isPremium"
  >,
  opts: PreviewOptions = {},
): string {
  const { quality = 70 } = opts;
  const width = wallpaper.isPremium
    ? Math.min(opts.width ?? 800, PREMIUM_PREVIEW_MAX_WIDTH)
    : opts.width ?? 800;
  const publicId = wallpaper.previewPublicId || wallpaper.originalPublicId;

  // Fallback (no Cloudinary): just return the seed URL, optionally sized.
  if (!features.cloudinary) {
    if (isAbsolute(publicId)) {
      // picsum supports /seed/x/WxH; unsplash supports ?w=
      if (publicId.includes("unsplash.com")) {
        return `${publicId}${publicId.includes("?") ? "&" : "?"}w=${width}&q=${quality}`;
      }
      return publicId;
    }
    return publicId;
  }

  const transforms = [`c_limit,w_${width}`, `q_${quality}`, "f_auto"];
  const { id, delivery } = normalizeSource(publicId);
  return deliveryUrl("image", delivery, transforms, id);
}

/**
 * Build a clean looping preview video URL for a LIVE wallpaper.
 *
 * Without Cloudinary, `videoPublicId` is treated as an absolute URL (the seed
 * uses public sample mp4s). With Cloudinary, we derive a short, downscaled clip
 * (capped at ~6s) so the public never receives the full original loop.
 */
export function videoPreviewUrl(
  wallpaper: Pick<Wallpaper, "videoPublicId">,
  opts: { width?: number } = {},
): string | null {
  const id = wallpaper.videoPublicId;
  if (!id) return null;

  if (!features.cloudinary) return id; // absolute sample URL

  const { width = 700 } = opts;
  const transforms = [
    `c_limit,w_${width}`,
    "q_auto:eco",
    "f_auto",
    "du_6", // cap the public loop at ~6s
  ];
  const { id: vid, delivery } = normalizeSource(id);
  return deliveryUrl("video", delivery, transforms, vid);
}

/**
 * A tiny, very-low-quality blurred placeholder for blur-up loading.
 */
export function placeholderUrl(
  wallpaper: Pick<Wallpaper, "previewPublicId" | "originalPublicId">,
): string {
  if (!features.cloudinary) {
    const id = wallpaper.previewPublicId || wallpaper.originalPublicId;
    return isAbsolute(id) ? id : "";
  }
  const { id, delivery } = normalizeSource(
    wallpaper.previewPublicId || wallpaper.originalPublicId,
  );
  const transforms = ["c_limit,w_24", "q_10", "e_blur:1000", "f_auto"];
  return deliveryUrl("image", delivery, transforms, id);
}

/**
 * Blog cover image. Accepts a Cloudinary public id or an absolute URL. Returns
 * an empty string when no cover is set (callers render a fallback).
 */
export function postImageUrl(
  coverImage: string,
  opts: { width?: number } = {},
): string {
  if (!coverImage) return "";
  const { width = 1200 } = opts;
  if (!features.cloudinary) {
    if (isAbsolute(coverImage)) {
      return coverImage.includes("unsplash.com")
        ? `${coverImage}${coverImage.includes("?") ? "&" : "?"}w=${width}&q=70`
        : coverImage;
    }
    return coverImage;
  }
  const { id, delivery } = normalizeSource(coverImage);
  const transforms = [`c_limit,w_${width}`, "q_auto", "f_auto"];
  return deliveryUrl("image", delivery, transforms, id);
}

/**
 * Open-Graph / social preview image (~1200px). Inherits the premium resolution
 * cap from `previewUrl`, so social cards never leak a full-res premium asset.
 */
export function ogImageUrl(
  wallpaper: Pick<
    Wallpaper,
    "previewPublicId" | "originalPublicId" | "isPremium"
  >,
): string {
  return previewUrl(wallpaper, { width: 1200, quality: 70 });
}

/**
 * Full-resolution download URL for a FREE wallpaper, served directly from
 * Cloudinary with `fl_attachment` so the browser saves it as a file rather than
 * navigating to it. Premium originals are NOT served this way — they come from
 * the private Supabase bucket via a signed URL after purchase (lib/delivery.ts).
 *
 * `fl_attachment` is itself a transformation, so this URL is signed too — under
 * "Strict transformations" an unsigned variant would 401.
 *
 * Without Cloudinary configured, falls back to the absolute seed URL.
 */
export function originalDownloadUrl(
  wallpaper: Pick<Wallpaper, "originalPublicId" | "slug">,
): string {
  const publicId = wallpaper.originalPublicId;

  if (!features.cloudinary) return publicId; // absolute seed URL (demo)

  const { id, delivery } = normalizeSource(publicId);
  const filename = `aurava-${wallpaper.slug}`;
  // fl_attachment:<name> sets Content-Disposition: attachment; filename=<name>.
  // No quality/format transform: free downloads get the true original asset.
  const transforms = [`fl_attachment:${encodeURIComponent(filename)}`];
  return deliveryUrl("image", delivery, transforms, id);
}
