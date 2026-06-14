import { env, features } from "./env";

/**
 * Client-safe Cloudinary URL helpers.
 *
 * Everything here is pure string work — no secret, no `node:crypto` — so it is
 * safe to import from Client Components (e.g. the admin form's dimension probe).
 * The signing logic, which needs the server-only API secret, lives in
 * `./cloudinary.ts`, which imports the helpers below.
 */

export function isAbsolute(src: string): boolean {
  return /^https?:\/\//.test(src);
}

export function isCloudinary(src: string): boolean {
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
export function uploadPublicId(url: string): string | null {
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
export function normalizeSource(raw: string): {
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
 * Loadable URL of the UNTRANSFORMED original, for client-side dimension
 * probing in the admin form. Returns the absolute URL as-is (mock/dev mode), or
 * a transform-free Cloudinary delivery URL so `naturalWidth/Height` reflect the
 * true asset resolution. Returns "" for a bare public id with no Cloudinary
 * configured (nothing loadable).
 *
 * No signature is needed: an untransformed original delivery is always allowed,
 * even with "Strict transformations" enabled — only transformed URLs are gated.
 */
export function probeImageUrl(publicId: string): string {
  const raw = publicId.trim();
  if (!raw) return "";
  if (!features.cloudinary) return isAbsolute(raw) ? raw : "";
  const { id, delivery } = normalizeSource(raw);
  return `https://res.cloudinary.com/${env.cloudinaryCloud}/image/${delivery}/${id}`;
}
