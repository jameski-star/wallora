import "server-only";
import { previewUrl, placeholderUrl, videoPreviewUrl } from "@/lib/cloudinary";
import type { Wallpaper } from "@/lib/types";
import type { CardWallpaper } from "@/components/wallpaper-card";

/**
 * Map a full {@link Wallpaper} to the slimmer {@link CardWallpaper} a grid tile
 * needs. Server-only — it resolves (and signs) Cloudinary delivery URLs, so the
 * result is safe to hand to Client Components (the grid, the "Load more" action)
 * without exposing the signing secret.
 */
export function toCardWallpaper(w: Wallpaper): CardWallpaper {
  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    device: w.device,
    categorySlug: w.categorySlug,
    width: w.width,
    height: w.height,
    priceCents: w.priceCents,
    isPremium: w.isPremium,
    isMature: w.isMature,
    previewSrc: previewUrl(w, { width: 700 }),
    placeholder: placeholderUrl(w) || undefined,
    kind: w.kind,
    videoSrc: videoPreviewUrl(w, { width: 700 }) ?? undefined,
  };
}
