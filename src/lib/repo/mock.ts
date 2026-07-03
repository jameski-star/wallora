import type {
  Category,
  FeaturedItem,
  FeatureSlot,
  Order,
  Post,
  Wallpaper,
  WallpaperQuery,
} from "../types";
import type { Repository } from "./types";
import { SEED_CATEGORIES } from "./seed";

/**
 * In-memory repository. State lives at module scope so it survives across
 * requests within a single dev server process (it resets on restart — that's
 * fine for a keyless demo).
 *
 * It starts with the category taxonomy but an EMPTY catalog — no sample
 * wallpapers, featured slots, or posts are injected automatically. Admins add
 * real content from the dashboard, or load the optional demo set with one click
 * from Admin → Setup. This keeps the live site free of placeholder data.
 */

type Store = {
  wallpapers: Map<string, Wallpaper>;
  categories: Category[];
  featured: Map<FeatureSlot, FeaturedItem>;
  orders: Map<string, Order>;
  posts: Map<string, Post>;
};

// Persist across HMR reloads in dev via globalThis.
const g = globalThis as unknown as { __auravaStore?: Store };

function init(): Store {
  return {
    wallpapers: new Map(),
    categories: SEED_CATEGORIES.map((c) => ({ ...c })),
    featured: new Map(),
    orders: new Map(),
    posts: new Map(),
  };
}

const store: Store = (g.__auravaStore ??= init());

function applyFilter(
  all: Wallpaper[],
  q: WallpaperQuery & { includeMature?: boolean },
): Wallpaper[] {
  let items = all;
  if (!q.includeMature) items = items.filter((w) => !w.isMature);
  if (q.category) items = items.filter((w) => w.categorySlug === q.category);
  if (q.device) items = items.filter((w) => w.device === q.device);
  if (q.kind) items = items.filter((w) => (w.kind ?? "image") === q.kind);
  if (q.tag) items = items.filter((w) => w.tags.includes(q.tag!));
  else if (q.tags && q.tags.length > 0)
    items = items.filter((w) => w.tags.some((t) => q.tags!.includes(t)));
  if (typeof q.premium === "boolean")
    items = items.filter((w) => w.isPremium === q.premium);
  if (q.search) {
    const s = q.search.toLowerCase();
    items = items.filter(
      (w) =>
        w.title.toLowerCase().includes(s) ||
        w.description.toLowerCase().includes(s) ||
        w.tags.some((t) => t.includes(s)) ||
        w.categorySlug.includes(s),
    );
  }
  switch (q.sort) {
    case "popular":
      items = [...items].sort((a, b) => b.downloads - a.downloads);
      break;
    case "price-asc":
      items = [...items].sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price-desc":
      items = [...items].sort((a, b) => b.priceCents - a.priceCents);
      break;
    default: // newest
      items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return items;
}

export const mockRepo: Repository = {
  async listCategories() {
    return store.categories.map((c) => ({ ...c }));
  },
  async getCategory(slug) {
    return store.categories.find((c) => c.slug === slug) ?? null;
  },
  async upsertCategory(category) {
    const idx = store.categories.findIndex((c) => c.slug === category.slug);
    if (idx >= 0) store.categories[idx] = { ...category };
    else store.categories.push({ ...category });
    return { ...category };
  },
  async deleteCategory(slug) {
    store.categories = store.categories.filter((c) => c.slug !== slug);
  },

  async listWallpapers(q) {
    const filtered = applyFilter([...store.wallpapers.values()], q);
    const offset = q.offset ?? 0;
    const limit = q.limit ?? filtered.length;
    return filtered.slice(offset, offset + limit).map((w) => ({ ...w }));
  },
  async countWallpapers(q) {
    return applyFilter([...store.wallpapers.values()], q).length;
  },
  async getWallpaperBySlug(slug) {
    return (
      [...store.wallpapers.values()].find((w) => w.slug === slug) ?? null
    );
  },
  async getWallpaperById(id) {
    const w = store.wallpapers.get(id);
    return w ? { ...w } : null;
  },
  async getWallpapersByIds(ids) {
    return ids
      .map((id) => store.wallpapers.get(id))
      .filter((w): w is Wallpaper => Boolean(w))
      .map((w) => ({ ...w }));
  },

  async upsertWallpaper(input) {
    store.wallpapers.set(input.id, { ...input });
    return { ...input };
  },
  async deleteWallpaper(id) {
    store.wallpapers.delete(id);
  },
  async incrementDownloads(id) {
    const w = store.wallpapers.get(id);
    if (w) w.downloads += 1;
  },

  async getFeatured(slot) {
    return store.featured.get(slot) ?? null;
  },
  async setFeatured(item) {
    store.featured.set(item.slot, { ...item });
  },
  async deleteFeatured(slot) {
    store.featured.delete(slot);
  },

  async createOrder(order) {
    store.orders.set(order.id, { ...order });
    return { ...order };
  },
  async getOrder(id) {
    const o = store.orders.get(id);
    return o ? { ...o } : null;
  },
  async getOrderByMerchantRef(ref) {
    return (
      [...store.orders.values()].find((o) => o.pesapalMerchantRef === ref) ??
      null
    );
  },
  async updateOrder(id, patch) {
    const o = store.orders.get(id);
    if (!o) return null;
    const next = { ...o, ...patch };
    store.orders.set(id, next);
    return { ...next };
  },
  async listOrders(opts) {
    let items = [...store.orders.values()];
    if (opts?.userId) items = items.filter((o) => o.userId === opts.userId);
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (opts?.limit) items = items.slice(0, opts.limit);
    return items.map((o) => ({ ...o }));
  },

  async listPosts(opts) {
    let items = [...store.posts.values()];
    if (!opts?.includeUnpublished) items = items.filter((p) => p.published);
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (opts?.limit) items = items.slice(0, opts.limit);
    return items.map((p) => ({ ...p }));
  },
  async getPostBySlug(slug) {
    return (
      [...store.posts.values()].find((p) => p.slug === slug) ?? null
    );
  },
  async getPostById(id) {
    const p = store.posts.get(id);
    return p ? { ...p } : null;
  },
  async upsertPost(post) {
    store.posts.set(post.id, { ...post });
    return { ...post };
  },
  async deletePost(id) {
    store.posts.delete(id);
  },
};
