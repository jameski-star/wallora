import { env, features } from "./env";
import type { Wallpaper } from "./types";

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

function isAbsolute(src: string): boolean {
  return /^https?:\/\//.test(src);
}

function isCloudinary(src: string): boolean {
  return src.includes("res.cloudinary.com/");
}

/**
 * Extract the bare public id from a Cloudinary `upload` delivery URL (any
 * cloud). Returns null if the URL isn't an upload URL.
 *
 * Cloudinary upload paths look like:
 *   .../image/upload/<transforms...>/v<digits>/<folder>/<name>.<ext>
 * The version segment (`v123…`) is the reliable boundary before the public id.
 */
function uploadPublicId(url: string): string | null {
  const m = url.match(
    /res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/(.+)$/,
  );
  if (!m) return null;
  const rest = m[1];
  // The version segment (`v123…`) — whether after transforms or first in the
  // path — is the reliable boundary before the public id.
  const afterVersion = rest.match(/(?:^|\/)v\d+\/(.+)$/);
  if (afterVersion) return afterVersion[1];
  // No version present: drop a leading run of transformation segments
  // (these always contain a `_` or `,`, e.g. `q_auto`, `c_limit,w_700`).
  const segs = rest.split("/");
  while (segs.length > 1 && /[,_]/.test(segs[0])) segs.shift();
  return segs.join("/");
}

/**
 * Normalize an arbitrary stored image reference into a `(source, delivery)`
 * pair that we can safely apply our own transforms to.
 *
 * Admins — or buggy imports — sometimes store a *fully-formed* Cloudinary
 * delivery URL, occasionally one that's already `fetch`-wrapping ANOTHER
 * Cloudinary URL. Naively `fetch`-wrapping such a value again makes Cloudinary
 * recursively fetch itself, which times out (the `TimeoutError` seen in prod).
 * So we unwrap to the innermost real asset first:
 *   - `.../image/fetch/<transforms>/<remoteUrl>` → peel to <remoteUrl> (repeat)
 *   - `.../image/upload/<transforms>/<publicId>` → bare <publicId>, delivered
 *     via `upload` (no point re-fetching an asset already on Cloudinary)
 *   - external URL (Unsplash, etc.) → `fetch`
 *   - bare public id → `upload`
 */
function normalizeSource(raw: string): {
  id: string;
  delivery: "upload" | "fetch";
} {
  let src = raw.trim();
  // Peel nested Cloudinary `fetch` wrappers to reach the innermost source.
  for (let i = 0; i < 6 && isCloudinary(src); i++) {
    const m = src.match(
      /res\.cloudinary\.com\/[^/]+\/(?:image|video)\/fetch\/(.+)$/,
    );
    if (!m) break;
    const httpIdx = m[1].search(/https?:\/\//);
    if (httpIdx === -1) break;
    src = decodeURIComponent(m[1].slice(httpIdx));
  }
  // Landed on a Cloudinary upload URL → use its bare public id via `upload`.
  const pid = uploadPublicId(src);
  if (pid) return { id: pid, delivery: "upload" };
  // Otherwise: remote URL → fetch; bare id → upload.
  return { id: src, delivery: isAbsolute(src) ? "fetch" : "upload" };
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
  const base = `https://res.cloudinary.com/${env.cloudinaryCloud}/image/${delivery}`;
  return `${base}/${transforms.join("/")}/${id}`;
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
  const base = `https://res.cloudinary.com/${env.cloudinaryCloud}/video/${delivery}`;
  return `${base}/${transforms.join("/")}/${vid}`;
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
  const base = `https://res.cloudinary.com/${env.cloudinaryCloud}/image/${delivery}`;
  return `${base}/c_limit,w_24/q_10/e_blur:1000/f_auto/${id}`;
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
  const base = `https://res.cloudinary.com/${env.cloudinaryCloud}/image/${delivery}`;
  return `${base}/c_limit,w_${width}/q_auto/f_auto/${id}`;
}

/**
 * Loadable URL of the UNTRANSFORMED original, for client-side dimension
 * probing in the admin form. Returns the absolute URL as-is (mock/dev mode), or
 * a transform-free Cloudinary delivery URL so `naturalWidth/Height` reflect the
 * true asset resolution. Returns "" for a bare public id with no Cloudinary
 * configured (nothing loadable).
 */
export function probeImageUrl(publicId: string): string {
  const raw = publicId.trim();
  if (!raw) return "";
  if (!features.cloudinary) return isAbsolute(raw) ? raw : "";
  const { id, delivery } = normalizeSource(raw);
  return `https://res.cloudinary.com/${env.cloudinaryCloud}/image/${delivery}/${id}`;
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
 * Without Cloudinary configured, falls back to the absolute seed URL.
 */
export function originalDownloadUrl(
  wallpaper: Pick<Wallpaper, "originalPublicId" | "slug">,
): string {
  const publicId = wallpaper.originalPublicId;

  if (!features.cloudinary) return publicId; // absolute seed URL (demo)

  const { id, delivery } = normalizeSource(publicId);
  const filename = `wallora-${wallpaper.slug}`;
  const base = `https://res.cloudinary.com/${env.cloudinaryCloud}/image/${delivery}`;
  // fl_attachment:<name> sets Content-Disposition: attachment; filename=<name>.
  // No quality/format transform: free downloads get the true original asset.
  return `${base}/fl_attachment:${encodeURIComponent(filename)}/${id}`;
}
