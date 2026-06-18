import { ImageOff } from "lucide-react";
import { WallpaperCard, type CardWallpaper } from "./wallpaper-card";
import { ScrollReveal } from "./motion";
import { previewUrl, placeholderUrl, videoPreviewUrl } from "@/lib/cloudinary";
import type { Wallpaper } from "@/lib/types";

function toCard(w: Wallpaper): CardWallpaper {
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
    previewSrc: previewUrl(w, { width: 600, quality: 55 }),
    placeholder: placeholderUrl(w) || undefined,
    kind: w.kind,
    videoSrc: videoPreviewUrl(w, { width: 500 }) ?? undefined,
  };
}

export function MasonryGrid({ wallpapers }: { wallpapers: Wallpaper[] }) {
  if (wallpapers.length === 0) {
    return (
      <div className="grid place-items-center rounded-card border border-dashed border-border bg-surface/50 py-24 text-center">
        <ImageOff className="mb-3 text-muted" size={40} />
        <p className="text-lg font-medium">No wallpapers found</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Try clearing filters or searching for something else.
        </p>
      </div>
    );
  }

  return (
    <div className="masonry">
      {wallpapers.map((w, i) => (
        <ScrollReveal key={w.id} index={i}>
          <WallpaperCard w={toCard(w)} />
        </ScrollReveal>
      ))}
    </div>
  );
}

/** Skeleton placeholder grid for loading states. */
export function MasonrySkeleton({ count = 12 }: { count?: number }) {
  const heights = [220, 320, 260, 380, 300, 240];
  return (
    <div className="masonry">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton rounded-card"
          style={{ height: heights[i % heights.length] }}
        />
      ))}
    </div>
  );
}
