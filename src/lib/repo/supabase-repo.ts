import type { SupabaseClient } from "@supabase/supabase-js";
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
import { createServerSupabase } from "../supabase/server";
import { createAdminSupabase } from "../supabase/admin";

/* ── Row ↔ domain mapping ─────────────────────────────────────────────── */

type WallpaperRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  original_public_id: string;
  original_storage_path: string;
  preview_public_id: string;
  kind: Wallpaper["kind"];
  video_public_id: string | null;
  duration_sec: number | null;
  category_slug: string;
  tags: string[];
  device: Wallpaper["device"];
  resolution: string;
  width: number;
  height: number;
  age_rating: Wallpaper["ageRating"];
  is_mature: boolean;
  price_cents: number;
  is_premium: boolean;
  seo_title: string;
  seo_description: string;
  is_featured: boolean;
  holiday_tags: Wallpaper["holidayTags"];
  downloads: number;
  created_at: string;
};

function toWallpaper(r: WallpaperRow): Wallpaper {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    originalPublicId: r.original_public_id,
    originalStoragePath: r.original_storage_path,
    previewPublicId: r.preview_public_id,
    kind: r.kind ?? "image",
    videoPublicId: r.video_public_id ?? undefined,
    durationSec: r.duration_sec ?? undefined,
    categorySlug: r.category_slug,
    tags: r.tags ?? [],
    device: r.device,
    resolution: r.resolution,
    width: r.width,
    height: r.height,
    ageRating: r.age_rating,
    isMature: r.is_mature,
    priceCents: r.price_cents,
    isPremium: r.is_premium,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    isFeatured: r.is_featured,
    holidayTags: r.holiday_tags ?? ["none"],
    downloads: r.downloads,
    createdAt: r.created_at,
  };
}

function fromWallpaper(w: Wallpaper): WallpaperRow {
  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    description: w.description,
    original_public_id: w.originalPublicId,
    original_storage_path: w.originalStoragePath,
    preview_public_id: w.previewPublicId,
    kind: w.kind ?? "image",
    video_public_id: w.videoPublicId ?? null,
    duration_sec: w.durationSec ?? null,
    category_slug: w.categorySlug,
    tags: w.tags,
    device: w.device,
    resolution: w.resolution,
    width: w.width,
    height: w.height,
    age_rating: w.ageRating,
    is_mature: w.isMature,
    price_cents: w.priceCents,
    is_premium: w.isPremium,
    seo_title: w.seoTitle,
    seo_description: w.seoDescription,
    is_featured: w.isFeatured,
    holiday_tags: w.holidayTags,
    downloads: w.downloads,
    created_at: w.createdAt,
  };
}

function toPost(r: Record<string, unknown>): Post {
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    excerpt: (r.excerpt as string) ?? "",
    body: (r.body as string) ?? "",
    coverImage: (r.cover_image as string) ?? "",
    author: (r.author as string) ?? "",
    tags: (r.tags as string[]) ?? [],
    published: Boolean(r.published),
    seoTitle: (r.seo_title as string) ?? "",
    seoDescription: (r.seo_description as string) ?? "",
    createdAt: r.created_at as string,
    updatedAt: (r.updated_at as string) ?? (r.created_at as string),
  };
}

function fromPost(p: Post): Record<string, unknown> {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    cover_image: p.coverImage,
    author: p.author,
    tags: p.tags,
    published: p.published,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

function toOrder(r: Record<string, unknown>): Order {
  return {
    id: r.id as string,
    userId: (r.user_id as string) ?? null,
    email: r.email as string,
    items: (r.items as Order["items"]) ?? [],
    totalCents: r.total_cents as number,
    currency: r.currency as string,
    status: r.status as Order["status"],
    pesapalTrackingId: (r.pesapal_tracking_id as string) ?? null,
    pesapalMerchantRef: r.pesapal_merchant_ref as string,
    createdAt: r.created_at as string,
    paidAt: (r.paid_at as string) ?? null,
  };
}

/* ── Repo ──────────────────────────────────────────────────────────────── */

async function db(): Promise<SupabaseClient> {
  return (await createServerSupabase()) as unknown as SupabaseClient;
}
function admin(): SupabaseClient {
  return createAdminSupabase() as unknown as SupabaseClient;
}

function buildQuery(
  client: SupabaseClient,
  q: WallpaperQuery & { includeMature?: boolean },
  count = false,
) {
  let query = client
    .from("wallpapers")
    .select("*", count ? { count: "exact", head: true } : {});
  if (!q.includeMature) query = query.eq("is_mature", false);
  if (q.category) query = query.eq("category_slug", q.category);
  if (q.device) query = query.eq("device", q.device);
  if (q.kind) query = query.eq("kind", q.kind);
  if (q.tag) query = query.contains("tags", [q.tag]);
  if (typeof q.premium === "boolean") query = query.eq("is_premium", q.premium);
  if (q.search) {
    query = query.or(
      `title.ilike.%${q.search}%,description.ilike.%${q.search}%`,
    );
  }
  switch (q.sort) {
    case "popular":
      query = query.order("downloads", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_cents", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }
  return query;
}

export const supabaseRepo: Repository = {
  async listCategories() {
    const { data } = await (await db()).from("categories").select("*").order("name");
    return (data ?? []) as Category[];
  },
  async getCategory(slug) {
    const { data } = await (await db())
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Category) ?? null;
  },
  async upsertCategory(category) {
    const { data, error } = await admin()
      .from("categories")
      .upsert(category, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },
  async deleteCategory(slug) {
    const { error } = await admin().from("categories").delete().eq("slug", slug);
    if (error) throw error;
  },

  async listWallpapers(q) {
    let query = buildQuery(await db(), q);
    const offset = q.offset ?? 0;
    const limit = q.limit ?? 60;
    query = query.range(offset, offset + limit - 1);
    const { data } = await query;
    return ((data as WallpaperRow[]) ?? []).map(toWallpaper);
  },
  async countWallpapers(q) {
    const { count } = await buildQuery(await db(), q, true);
    return count ?? 0;
  },
  async getWallpaperBySlug(slug) {
    const { data } = await (await db())
      .from("wallpapers")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? toWallpaper(data as WallpaperRow) : null;
  },
  async getWallpaperById(id) {
    const { data } = await (await db())
      .from("wallpapers")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? toWallpaper(data as WallpaperRow) : null;
  },
  async getWallpapersByIds(ids) {
    if (ids.length === 0) return [];
    const { data } = await (await db())
      .from("wallpapers")
      .select("*")
      .in("id", ids);
    return ((data as WallpaperRow[]) ?? []).map(toWallpaper);
  },

  async upsertWallpaper(input) {
    const { data, error } = await admin()
      .from("wallpapers")
      .upsert(fromWallpaper(input))
      .select()
      .single();
    if (error) throw error;
    return toWallpaper(data as WallpaperRow);
  },
  async deleteWallpaper(id) {
    await admin().from("wallpapers").delete().eq("id", id);
  },
  async incrementDownloads(id) {
    await admin().rpc("increment_downloads", { wp_id: id });
  },

  async getFeatured(slot) {
    const { data } = await (await db())
      .from("featured")
      .select("*")
      .eq("slot", slot)
      .maybeSingle();
    if (!data) return null;
    const r = data as Record<string, unknown>;
    return {
      slot: r.slot as FeatureSlot,
      wallpaperId: r.wallpaper_id as string,
      title: r.title as string,
      caption: r.caption as string,
      description: r.description as string,
      displayDate: r.display_date as string,
      holidayType: r.holiday_type as FeaturedItem["holidayType"],
      adminOverride: r.admin_override as boolean,
    };
  },
  async deleteFeatured(slot) {
    await admin().from("featured").delete().eq("slot", slot);
  },
  async setFeatured(item) {
    await admin().from("featured").upsert({
      slot: item.slot,
      wallpaper_id: item.wallpaperId,
      title: item.title,
      caption: item.caption,
      description: item.description,
      display_date: item.displayDate,
      holiday_type: item.holidayType,
      admin_override: item.adminOverride,
    });
  },

  async createOrder(order) {
    const { data, error } = await admin()
      .from("orders")
      .insert({
        id: order.id,
        user_id: order.userId,
        email: order.email,
        items: order.items,
        total_cents: order.totalCents,
        currency: order.currency,
        status: order.status,
        pesapal_tracking_id: order.pesapalTrackingId,
        pesapal_merchant_ref: order.pesapalMerchantRef,
        created_at: order.createdAt,
        paid_at: order.paidAt,
      })
      .select()
      .single();
    if (error) throw error;
    return toOrder(data as Record<string, unknown>);
  },
  async getOrder(id) {
    const { data } = await admin().from("orders").select("*").eq("id", id).maybeSingle();
    return data ? toOrder(data as Record<string, unknown>) : null;
  },
  async getOrderByMerchantRef(ref) {
    const { data } = await admin()
      .from("orders")
      .select("*")
      .eq("pesapal_merchant_ref", ref)
      .maybeSingle();
    return data ? toOrder(data as Record<string, unknown>) : null;
  },
  async updateOrder(id, patch) {
    const row: Record<string, unknown> = {};
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.paidAt !== undefined) row.paid_at = patch.paidAt;
    if (patch.pesapalTrackingId !== undefined)
      row.pesapal_tracking_id = patch.pesapalTrackingId;
    const { data } = await admin()
      .from("orders")
      .update(row)
      .eq("id", id)
      .select()
      .maybeSingle();
    return data ? toOrder(data as Record<string, unknown>) : null;
  },
  async listOrders(opts) {
    let query = admin().from("orders").select("*").order("created_at", { ascending: false });
    if (opts?.userId) query = query.eq("user_id", opts.userId);
    if (opts?.limit) query = query.limit(opts.limit);
    const { data } = await query;
    return ((data as Record<string, unknown>[]) ?? []).map(toOrder);
  },

  async listPosts(opts) {
    let query = (await db())
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!opts?.includeUnpublished) query = query.eq("published", true);
    if (opts?.limit) query = query.limit(opts.limit);
    const { data } = await query;
    return ((data as Record<string, unknown>[]) ?? []).map(toPost);
  },
  async getPostBySlug(slug) {
    const { data } = await (await db())
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? toPost(data as Record<string, unknown>) : null;
  },
  async getPostById(id) {
    const { data } = await (await db())
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? toPost(data as Record<string, unknown>) : null;
  },
  async upsertPost(post) {
    const { data, error } = await admin()
      .from("posts")
      .upsert(fromPost(post), { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return toPost(data as Record<string, unknown>);
  },
  async deletePost(id) {
    const { error } = await admin().from("posts").delete().eq("id", id);
    if (error) throw error;
  },
};
