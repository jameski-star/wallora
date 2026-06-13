import "server-only";
import { getRepo } from "./repo";
import { getViewer } from "./auth";
import { canView } from "./age";
import type { FeatureSlot, Wallpaper, WallpaperQuery } from "./types";

/**
 * Server-side catalog reads with age-gating baked in. Mature content is
 * excluded automatically unless the current viewer is an adult (or admin).
 */

export async function listWallpapers(
  query: WallpaperQuery = {},
): Promise<Wallpaper[]> {
  const [repo, viewer] = await Promise.all([getRepo(), getViewer()]);
  const includeMature = viewer.isAdult || viewer.isAdmin;
  return repo.listWallpapers({ ...query, includeMature });
}

export async function countWallpapers(
  query: WallpaperQuery = {},
): Promise<number> {
  const [repo, viewer] = await Promise.all([getRepo(), getViewer()]);
  const includeMature = viewer.isAdult || viewer.isAdmin;
  return repo.countWallpapers({ ...query, includeMature });
}

/** Fetch a wallpaper by slug, returning null if the viewer can't view it. */
export async function getViewableWallpaper(
  slug: string,
): Promise<Wallpaper | null> {
  const [repo, viewer] = await Promise.all([getRepo(), getViewer()]);
  const w = await repo.getWallpaperBySlug(slug);
  if (!w) return null;
  if (viewer.isAdmin) return w;
  return canView(viewer, w.ageRating) ? w : null;
}

export async function getFeaturedWallpaper(
  slot: FeatureSlot,
): Promise<{ wallpaper: Wallpaper; caption: string; title: string; description: string } | null> {
  const repo = await getRepo();
  const feat = await repo.getFeatured(slot);
  if (!feat) return null;
  const wallpaper = await repo.getWallpaperById(feat.wallpaperId);
  if (!wallpaper) return null;
  return {
    wallpaper,
    caption: feat.caption,
    title: feat.title,
    description: feat.description,
  };
}

export async function listCategories() {
  return (await getRepo()).listCategories();
}
