"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { slugify } from "@/lib/utils";
import { refreshWallpaperOfDay, refreshWallpaperOfWeek } from "@/lib/featured";
import { features } from "@/lib/env";
import { registerIpn } from "@/lib/pesapal";
import { videoPosterUrl } from "@/lib/cloudinary";
import { analyzeWallpaperImage, type WallpaperAnalysis, generateBlogWithAi, type BlogGenerationResult } from "@/lib/gemini";
import {
  SEED_CATEGORIES,
  SEED_FEATURED,
  SEED_POSTS,
  SEED_WALLPAPERS,
} from "@/lib/repo/seed";
import type { Category, FeatureSlot, HolidayType, Post, Wallpaper } from "@/lib/types";

/** Result shape for the one-click Setup actions (consumed via useActionState). */
export type SetupResult = { ok: boolean; message: string };

const csv = (v: FormDataEntryValue | null): string[] =>
  String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true";

const wallpaperSchema = z.object({
  title: z.string().min(2),
  description: z.string().default(""),
  categorySlug: z.string().min(1),
  device: z.enum(["desktop", "phone", "tablet"]),
  resolution: z.string().regex(/^\d+x\d+$/, "Use WIDTHxHEIGHT, e.g. 3840x2160"),
  ageRating: z.enum(["everyone", "13+", "16+", "18+"]),
  priceCents: z.coerce.number().int().min(0),
  // Optional at the schema level: live wallpapers may omit the still and have
  // their poster auto-derived from the video. The conditional requirement
  // (still required for normal wallpapers) is enforced below, once we know
  // whether `isLive` is set.
  originalPublicId: z.string().default(""),
});

export async function saveWallpaper(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = await getRepo();

  const parsed = wallpaperSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    categorySlug: formData.get("categorySlug"),
    device: formData.get("device"),
    resolution: formData.get("resolution"),
    ageRating: formData.get("ageRating"),
    priceCents: formData.get("priceCents"),
    originalPublicId: formData.get("originalPublicId"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid wallpaper");
  }
  const d = parsed.data;
  const [width, height] = d.resolution.split("x").map(Number);

  const isLive = bool(formData.get("isLive"));
  const videoPublicId =
    String(formData.get("videoPublicId") ?? "").trim() || undefined;

  // A still image is required for normal wallpapers. Live wallpapers may skip it
  // — the poster is auto-derived from the video frame — but then they must have
  // a video to derive it from.
  if (!isLive && !d.originalPublicId.trim()) {
    throw new Error("Original image is required");
  }
  if (isLive && !d.originalPublicId.trim() && !videoPublicId) {
    throw new Error("Live wallpapers need a video (or a still image).");
  }

  const durationSec = isLive
    ? Math.min(60, Math.max(1, Number(formData.get("durationSec") ?? 6) || 6))
    : undefined;

  const existingId = String(formData.get("id") ?? "").trim();
  const id = existingId || `wp_${randomUUID().slice(0, 8)}`;
  const slug =
    String(formData.get("slug") ?? "").trim() ||
    slugify(`${d.title}-${width >= 3840 ? "4k" : "hd"}-${d.device}`);

  const isPremium = bool(formData.get("isPremium")) || d.priceCents > 0;
  const previewPublicId =
    String(formData.get("previewPublicId") ?? "").trim() || d.originalPublicId;
  const ageRating = d.ageRating;

  const wallpaper: Wallpaper = {
    id,
    slug,
    title: d.title,
    description: d.description,
    originalPublicId: d.originalPublicId,
    originalStoragePath:
      String(formData.get("originalStoragePath") ?? "").trim() ||
      `originals/${id}.${isLive ? "mp4" : "jpg"}`,
    previewPublicId,
    kind: isLive ? "live" : "image",
    videoPublicId,
    durationSec,
    categorySlug: d.categorySlug,
    tags: csv(formData.get("tags")),
    device: d.device,
    resolution: d.resolution,
    width,
    height,
    ageRating,
    isMature: bool(formData.get("isMature")) || ageRating === "18+",
    priceCents: isPremium ? d.priceCents : 0,
    isPremium,
    seoTitle:
      String(formData.get("seoTitle") ?? "").trim() ||
      `${d.title} Wallpaper | Aurava`,
    seoDescription:
      String(formData.get("seoDescription") ?? "").trim() || d.description,
    isFeatured: bool(formData.get("isFeatured")),
    holidayTags: (csv(formData.get("holidayTags")) as HolidayType[]).length
      ? (csv(formData.get("holidayTags")) as HolidayType[])
      : ["none"],
    downloads: Number(formData.get("downloads") ?? 0) || 0,
    createdAt:
      String(formData.get("createdAt") ?? "").trim() ||
      new Date().toISOString(),
  };

  await repo.upsertWallpaper(wallpaper);
  revalidatePath("/admin-dash/wallpapers");
  revalidatePath("/wallpapers");
  redirect("/admin-dash/wallpapers");
}

/** Result of the admin "Auto-fill from image" action (consumed in the form). */
export type AnalyzeResult =
  | { ok: true; data: WallpaperAnalysis }
  | { ok: false; message: string };

/**
 * Analyse a wallpaper image with Gemini and return descriptive metadata for the
 * admin form to pre-fill. Admin-only; never writes — the admin reviews and saves.
 */
export async function analyzeWallpaper(input: {
  originalPublicId: string;
  previewPublicId?: string;
  videoPublicId?: string;
}): Promise<AnalyzeResult> {
  await requireAdmin();

  if (!features.gemini) {
    return {
      ok: false,
      message: "Auto-fill is off — set GEMINI_API_KEY to enable it.",
    };
  }

  // Prefer the preview source when present (smaller), else the original.
  const source =
    (input.previewPublicId ?? "").trim() || (input.originalPublicId ?? "").trim();

  // Live wallpaper with no still → analyse a SIGNED frame extracted from the
  // video. Passed as a ready-to-fetch URL so Gemini reads the frame, not an
  // (impossible) untransformed image delivery of a video asset.
  const videoId = (input.videoPublicId ?? "").trim();
  const imageUrl =
    !source && videoId
      ? videoPosterUrl({ videoPublicId: videoId, isPremium: false }, { width: 1200 })
      : undefined;

  if (!source && !imageUrl) {
    return { ok: false, message: "Add the Cloudinary image or video link first." };
  }

  try {
    const repo = await getRepo();
    const categories = await repo.listCategories();
    const data = await analyzeWallpaperImage({
      publicId: source,
      imageUrl,
      categories,
    });
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Analysis failed.",
    };
  }
}

export async function deleteWallpaper(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const repo = await getRepo();
    await repo.deleteWallpaper(id);
    revalidatePath("/admin-dash/wallpapers");
    revalidatePath("/wallpapers");
  }
}

/* ── Categories ─────────────────────────────────────────────────────────── */

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(40),
  description: z.string().max(200).default(""),
});

export async function saveCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = await getRepo();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid category");
  }
  const { name, description } = parsed.data;

  // Slug is immutable once set (it's an FK target for wallpapers); on create we
  // derive it from the name, on edit we keep the hidden original.
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);

  const category: Category = {
    id: `cat_${slug}`,
    slug,
    name,
    description,
  };

  await repo.upsertCategory(category);
  revalidatePath("/admin-dash/categories");
  revalidatePath("/wallpapers");
  redirect("/admin-dash/categories");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;
  const repo = await getRepo();
  // Refuse to delete a category that still holds wallpapers — it would orphan
  // them (and violate the DB foreign key in Supabase mode).
  const count = await repo.countWallpapers({ category: slug, includeMature: true });
  if (count > 0) {
    throw new Error(
      `“${slug}” still has ${count} wallpaper${count === 1 ? "" : "s"}. Move or delete them first.`,
    );
  }
  await repo.deleteCategory(slug);
  revalidatePath("/admin-dash/categories");
  revalidatePath("/wallpapers");
}

/* ── Blog ───────────────────────────────────────────────────────────────── */

const postSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  excerpt: z.string().max(280).default(""),
  body: z.string().min(1, "Post body is required"),
});

export async function savePost(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = await getRepo();

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") ?? "",
    body: formData.get("body"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid post");
  }
  const d = parsed.data;

  const existingId = String(formData.get("id") ?? "").trim();
  const id = existingId || `post_${randomUUID().slice(0, 8)}`;
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(d.title);
  const now = new Date().toISOString();
  const createdAt = String(formData.get("createdAt") ?? "").trim() || now;

  const post: Post = {
    id,
    slug,
    title: d.title,
    excerpt: d.excerpt || d.body.slice(0, 160),
    body: d.body,
    coverImage: String(formData.get("coverImage") ?? "").trim(),
    author: String(formData.get("author") ?? "").trim() || "Aurava",
    tags: csv(formData.get("tags")),
    published: bool(formData.get("published")),
    seoTitle:
      String(formData.get("seoTitle") ?? "").trim() || `${d.title} | Aurava Blog`,
    seoDescription:
      String(formData.get("seoDescription") ?? "").trim() ||
      (d.excerpt || d.body.slice(0, 160)),
    createdAt,
    updatedAt: now,
  };

  await repo.upsertPost(post);
  revalidatePath("/admin-dash/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin-dash/blog");
}

export async function deletePost(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const repo = await getRepo();
  await repo.deletePost(id);
  revalidatePath("/admin-dash/blog");
  revalidatePath("/blog");
}

export async function setFeaturedOverride(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = await getRepo();
  const slot = String(formData.get("slot")) as FeatureSlot;
  const wallpaperId = String(formData.get("wallpaperId") ?? "");
  const w = await repo.getWallpaperById(wallpaperId);
  if (!w) throw new Error("Wallpaper not found");

  await repo.setFeatured({
    slot,
    wallpaperId: w.id,
    title: String(formData.get("title") ?? "") || w.title,
    caption:
      String(formData.get("caption") ?? "") ||
      (slot === "day" ? "Wallpaper of the Day" : "Wallpaper of the Week"),
    description: String(formData.get("description") ?? "") || w.description,
    displayDate: new Date().toISOString(),
    holidayType: (String(formData.get("holidayType")) as HolidayType) || "none",
    adminOverride: bool(formData.get("adminOverride")),
  });
  revalidatePath("/");
  revalidatePath("/admin-dash/featured");
}

export async function runFeaturedAutomation(formData: FormData): Promise<void> {
  await requireAdmin();
  const which = String(formData.get("which"));
  if (which === "day") await refreshWallpaperOfDay();
  else if (which === "week") await refreshWallpaperOfWeek();
  revalidatePath("/");
  revalidatePath("/admin-dash/featured");
}

/**
 * Register the PesaPal IPN webhook once. PesaPal returns an `ipn_id` that must
 * be saved to the `PESAPAL_IPN_ID` env var (it can't be persisted from here —
 * env is read-only at runtime) and the app redeployed.
 */
export async function registerPesapalIpnAction(): Promise<SetupResult> {
  await requireAdmin();
  if (!features.pesapal) {
    return {
      ok: false,
      message:
        "Set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET (and redeploy) before registering the IPN.",
    };
  }
  try {
    const { ipn_id, url } = await registerIpn();
    if (!ipn_id) {
      return {
        ok: false,
        message:
          "PesaPal did not return an ipn_id. Check your keys and PESAPAL_BASE_URL (sandbox vs live).",
      };
    }
    return {
      ok: true,
      message: `Registered IPN at ${url}. Now set PESAPAL_IPN_ID=${ipn_id} in your environment and redeploy.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "RegisterIPN request failed.",
    };
  }
}

/**
 * Load the OPTIONAL demo content (sample categories, wallpapers, featured slots
 * and blog posts) into whatever repository is active — the in-memory store in
 * keyless mode, or Supabase when configured. The live catalog ships empty, so
 * this exists purely to let you preview the full experience with one click.
 * Idempotent: every row is upserted by primary key.
 */
export async function loadSampleContentAction(): Promise<SetupResult> {
  await requireAdmin();
  try {
    const repo = await getRepo();

    // Categories first — wallpapers.category_slug references them (FK in Supabase).
    for (const c of SEED_CATEGORIES) await repo.upsertCategory(c);
    for (const w of SEED_WALLPAPERS) await repo.upsertWallpaper(w);
    for (const f of SEED_FEATURED) await repo.setFeatured(f);
    for (const p of SEED_POSTS) await repo.upsertPost(p);

    revalidatePath("/");
    revalidatePath("/wallpapers");
    revalidatePath("/blog");
    revalidatePath("/admin-dash/wallpapers");
    return {
      ok: true,
      message: `Loaded ${SEED_WALLPAPERS.length} sample wallpapers, ${SEED_POSTS.length} posts and ${SEED_CATEGORIES.length} categories. ${
        features.supabaseAdmin
          ? "Upload originals to the premium-wallpapers bucket to enable paid downloads."
          : "This in-memory demo data resets when the server restarts."
      }`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Loading sample content failed.",
    };
  }
}

/**
 * Remove ALL wallpapers, featured slots and blog posts (categories are kept).
 * Use this to wipe the demo set before going live with your own content.
 */
export async function clearCatalogAction(): Promise<SetupResult> {
  await requireAdmin();
  try {
    const repo = await getRepo();

    // Featured rows reference wallpapers (FK) — clear them first.
    await repo.deleteFeatured("day");
    await repo.deleteFeatured("week");

    const wallpapers = await repo.listWallpapers({
      includeMature: true,
      limit: 10_000,
    });
    for (const w of wallpapers) await repo.deleteWallpaper(w.id);

    const posts = await repo.listPosts({ includeUnpublished: true, limit: 10_000 });
    for (const p of posts) await repo.deletePost(p.id);

    revalidatePath("/");
    revalidatePath("/wallpapers");
    revalidatePath("/blog");
    revalidatePath("/admin-dash/wallpapers");
    return {
      ok: true,
      message: `Cleared ${wallpapers.length} wallpapers and ${posts.length} posts. Categories were kept — manage them under Categories.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Clearing the catalog failed.",
    };
  }
}

export type GenerateBlogResult =
  | { ok: true; data: BlogGenerationResult }
  | { ok: false; message: string };

/**
 * Generates an SEO & GEO-optimized blog post using the AI Blog Generation Master Prompt.
 */
export async function generateAiBlog(topic: string): Promise<GenerateBlogResult> {
  await requireAdmin();

  if (!features.gemini) {
    return {
      ok: false,
      message: "AI Blog generation is off — set GEMINI_API_KEY to enable it.",
    };
  }

  if (!topic.trim()) {
    return { ok: false, message: "Please provide a topic for the blog post." };
  }

  try {
    const data = await generateBlogWithAi(topic);
    return { ok: true, data };
  } catch (err: any) {
    console.error("AI Blog generation action error:", err);
    return { ok: false, message: err?.message || "Failed to generate blog post." };
  }
}

