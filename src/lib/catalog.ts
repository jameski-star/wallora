import "server-only";
import { getRepo } from "./repo";
import { getViewer } from "./auth";
import { canView } from "./age";
import type { FeatureSlot, Wallpaper, WallpaperQuery } from "./types";

/**
 * Server-side catalog reads with age-gating baked in. Mature content is
 * excluded automatically unless the current viewer is an adult (or admin).
 */

async function fetchWallpapersFromRepo(query: WallpaperQuery, includeMature: boolean) {
  'use cache';
  const repo = await getRepo();
  return repo.listWallpapers({ ...query, includeMature });
}

export async function listWallpapers(
  query: WallpaperQuery = {},
): Promise<Wallpaper[]> {
  const viewer = await getViewer();
  const includeMature = viewer.isAdult || viewer.isAdmin;
  return fetchWallpapersFromRepo(query, includeMature);
}

async function fetchCountWallpapersFromRepo(query: WallpaperQuery, includeMature: boolean) {
  'use cache';
  const repo = await getRepo();
  return repo.countWallpapers({ ...query, includeMature });
}

export async function countWallpapers(
  query: WallpaperQuery = {},
): Promise<number> {
  const viewer = await getViewer();
  const includeMature = viewer.isAdult || viewer.isAdmin;
  return fetchCountWallpapersFromRepo(query, includeMature);
}

async function fetchWallpaperBySlugFromRepo(slug: string) {
  'use cache';
  const repo = await getRepo();
  return repo.getWallpaperBySlug(slug);
}

/** Fetch a wallpaper by slug, returning null if the viewer can't view it. */
export async function getViewableWallpaper(
  slug: string,
): Promise<Wallpaper | null> {
  const [w, viewer] = await Promise.all([
    fetchWallpaperBySlugFromRepo(slug),
    getViewer(),
  ]);
  if (!w) return null;
  if (viewer.isAdmin) return w;
  return canView(viewer, w.ageRating) ? w : null;
}

async function getCachedFeaturedWallpaper(slot: FeatureSlot) {
  'use cache';
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

export async function getFeaturedWallpaper(
  slot: FeatureSlot,
): Promise<{ wallpaper: Wallpaper; caption: string; title: string; description: string } | null> {
  return getCachedFeaturedWallpaper(slot);
}

export async function listCategories() {
  'use cache';
  return (await getRepo()).listCategories();
}

async function getCachedWallpapersByIds(ids: string[]) {
  'use cache';
  const repo = await getRepo();
  return repo.getWallpapersByIds(ids);
}

/** Fetch multiple wallpapers by id (for order/receipt rendering). No age-gate:
 *  these are items the viewer has already purchased. */
export async function getWallpapersByIds(ids: string[]): Promise<Wallpaper[]> {
  if (ids.length === 0) return [];
  return getCachedWallpapersByIds(ids);
}
