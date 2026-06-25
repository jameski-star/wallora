import "server-only";
import { randomUUID } from "node:crypto";
import { features } from "./env";
import { searchImages, setAssetContext } from "./cloudinary-admin";
import { getRepo } from "./repo";
import { slugify } from "./utils";
import { analyzeWallpaperImage } from "./gemini";
import type { WallpaperAnalysis } from "./gemini";
import type { Category, DeviceType, HolidayType } from "./types";

export interface ImportResult {
  ok: boolean;
  summary: {
    total: number;
    imported: number;
    skippedDb: number;
    retriesExhausted: number;
    errors: number;
  };
  imported: string[];
  retriesExhausted: string[];
  errors: { publicId: string; error: string }[];
}

/**
 * Maximum attempts per image when Gemini returns a retryable error (rate limit,
 * model busy, quota exhausted). After this the image is SKIPPED — not imported,
 * not marked as picked — so the next cron run will retry it fresh.
 */
const MAX_GEMINI_RETRIES = 5;

/**
 * The raw text of a Gemini error is searched for these signals to decide how
 * long to wait before retrying. "Busy" (model overload) clears faster than
 * "quota" (daily usage cap), so we give the former a shorter delay.
 */
const RETRYABLE_MESSAGES = [
  { signal: /429|RESOURCE_EXHAUSTED|quota/i, delayMs: 60_000 },
  { signal: /busy|unavailable|overloaded|too many requests|try again/i, delayMs: 30_000 },
];

/**
 * Scan Cloudinary for unmarked images. For each, call Gemini — retrying on
 * rate-limit / busy / quota errors with appropriate delays — and only import
 * once AI metadata is in hand. Images whose Gemini retries are exhausted are
 * skipped (not marked as picked) so they are retried on the next cron run.
 *
 * Because retry delays can be long (up to 60s per attempt), each cron run may
 * only process a handful of images before the serverless timeout. That's fine:
 * every successfully-imported image is marked with `wallora_imported` context
 * in Cloudinary and will never be touched again.
 */
export async function runCloudinaryImport(): Promise<ImportResult> {
  const repo = await getRepo();
  const categories = await repo.listCategories();
  const categorySlugs = categories.map((c) => c.slug);

  const [existingWallpapers, cloudinaryAssets] = await Promise.all([
    repo.listWallpapers({ includeMature: true, limit: 10_000 }),
    searchImages({
      excludeContextKey: "wallora_imported",
      maxResults: 500,
    }),
  ]);

  const existingIds = new Set(existingWallpapers.map((w) => w.originalPublicId));

  const imported: string[] = [];
  const retriesExhausted: string[] = [];
  const errors: { publicId: string; error: string }[] = [];

  for (const asset of cloudinaryAssets) {
    if (existingIds.has(asset.publicId)) {
      continue;
    }

    // ── Step 1: Gemini metadata (required — no fallback) ──────────────
    let meta: WallpaperAnalysis;

    if (features.gemini && categories.length > 0) {
      try {
        meta = await callGeminiWithRetry(asset.publicId, categories);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        // If Gemini failed after all retries, skip the image entirely.
        // It is NOT marked as imported, so the next cron run will retry it.
        retriesExhausted.push(asset.publicId);
        errors.push({ publicId: asset.publicId, error: msg });
        continue;
      }
    } else {
      // Gemini not configured or no categories — can't get AI metadata,
      // and the user wants AI metadata. Skip without importing.
      retriesExhausted.push(asset.publicId);
      errors.push({
        publicId: asset.publicId,
        error: features.gemini
          ? "No categories available for classification."
          : "Gemini not configured — set GEMINI_API_KEY.",
      });
      continue;
    }

    // ── Step 2: Create the wallpaper entry ────────────────────────────
    try {
      const device = detectDevice(asset.width, asset.height);
      const resolution = `${asset.width}x${asset.height}`;
      const slug = slugify(
        `${meta.title}-${asset.width >= 3840 ? "4k" : "hd"}-${device}`,
      );
      const now = new Date().toISOString();

      await repo.upsertWallpaper({
        id: `wp_${randomUUID().slice(0, 8)}`,
        slug,
        title: meta.title,
        description: meta.description,
        originalPublicId: asset.publicId,
        originalStoragePath:
          `originals/${asset.publicId.split("/").pop()}.${asset.format}`,
        previewPublicId: asset.publicId,
        kind: "image",
        categorySlug: meta.categorySlug,
        tags: meta.tags,
        device,
        resolution,
        width: asset.width,
        height: asset.height,
        ageRating: meta.ageRating,
        isMature: meta.isMature,
        priceCents: 0,
        isPremium: false,
        seoTitle: meta.seoTitle,
        seoDescription: meta.seoDescription,
        isFeatured: false,
        holidayTags: meta.holidayTags as HolidayType[],
        downloads: 0,
        createdAt: now,
      });

      await setAssetContext(asset.publicId, "wallora_imported", "true");
      imported.push(asset.publicId);
    } catch (e) {
      errors.push({
        publicId: asset.publicId,
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return {
    ok: true,
    summary: {
      total: cloudinaryAssets.length,
      imported: imported.length,
      skippedDb: cloudinaryAssets.length - imported.length - retriesExhausted.length - errors.length,
      retriesExhausted: retriesExhausted.length,
      errors: errors.length,
    },
    imported,
    retriesExhausted,
    errors,
  };
}

/**
 * Call Gemini with retry logic. Only retries on signals that indicate the model
 * is temporarily unavailable (busy, rate-limited, quota-exhausted). All other
 * errors (blocked content, invalid image, etc.) throw immediately.
 *
 * Delays:
 *   "busy / overloaded / too many requests" → 30 s
 *   "quota / 429 / RESOURCE_EXHAUSTED"      → 60 s
 */
async function callGeminiWithRetry(
  publicId: string,
  categories: Category[],
): Promise<WallpaperAnalysis> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_GEMINI_RETRIES; attempt++) {
    try {
      return await analyzeWallpaperImage({ publicId, categories });
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Unknown error");
      const msg = lastError.message;

      let delay = 0;
      for (const rule of RETRYABLE_MESSAGES) {
        if (rule.signal.test(msg)) {
          delay = rule.delayMs;
          break;
        }
      }

      if (delay === 0) {
        // Non-retryable error — throw immediately (blocked content, etc.)
        throw lastError;
      }

      // Wait before the next attempt.
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("Gemini failed after all retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectDevice(width: number, height: number): DeviceType {
  if (height > width) return "phone";
  if (width / height >= 1.6) return "desktop";
  return "tablet";
}
