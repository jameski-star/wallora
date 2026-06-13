import type {
  Category,
  FeaturedItem,
  FeatureSlot,
  Order,
  Post,
  Wallpaper,
  WallpaperQuery,
} from "../types";

/**
 * The data-access contract. Two implementations exist:
 *  - `mock`     — in-memory, seeded, no external deps (default).
 *  - `supabase` — backed by Postgres + Storage (when env is configured).
 *
 * Age-gating is applied at the call site (server components/actions) via the
 * `includeMature` flag rather than baked in here, so the admin can still see
 * everything.
 */
export interface Repository {
  // Catalog
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  upsertCategory(category: Category): Promise<Category>;
  deleteCategory(slug: string): Promise<void>;

  listWallpapers(
    query: WallpaperQuery & { includeMature?: boolean },
  ): Promise<Wallpaper[]>;
  countWallpapers(
    query: WallpaperQuery & { includeMature?: boolean },
  ): Promise<number>;
  getWallpaperBySlug(slug: string): Promise<Wallpaper | null>;
  getWallpaperById(id: string): Promise<Wallpaper | null>;
  getWallpapersByIds(ids: string[]): Promise<Wallpaper[]>;

  // Admin writes
  upsertWallpaper(input: Wallpaper): Promise<Wallpaper>;
  deleteWallpaper(id: string): Promise<void>;
  incrementDownloads(id: string): Promise<void>;

  // Featured (wallpaper of day/week)
  getFeatured(slot: FeatureSlot): Promise<FeaturedItem | null>;
  setFeatured(item: FeaturedItem): Promise<void>;
  deleteFeatured(slot: FeatureSlot): Promise<void>;

  // Orders
  createOrder(order: Order): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  getOrderByMerchantRef(ref: string): Promise<Order | null>;
  updateOrder(id: string, patch: Partial<Order>): Promise<Order | null>;
  listOrders(opts?: { userId?: string; limit?: number }): Promise<Order[]>;

  // Blog
  listPosts(opts?: { includeUnpublished?: boolean; limit?: number }): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getPostById(id: string): Promise<Post | null>;
  upsertPost(post: Post): Promise<Post>;
  deletePost(id: string): Promise<void>;
}
