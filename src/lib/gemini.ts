/**
 * Gemini-powered wallpaper analysis (admin "Auto-fill from image").
 *
 * Server-only. Given a Cloudinary public id (or absolute URL), this fetches the
 * image bytes, sends them inline to Gemini Flash, and asks for SEO-friendly
 * catalog metadata as STRUCTURED JSON. We constrain the model with a
 * `responseSchema` (enums for category / age rating / holidays) so the output
 * always validates against our `Wallpaper` shape — no brittle text parsing.
 *
 * Deliberately NOT handled here (these are pixel-independent business choices):
 *   - price / premium / featured
 *   - device + resolution → derived deterministically from aspect ratio on the
 *     client; an LLM is the wrong tool for arithmetic.
 *
 * When `GEMINI_API_KEY` is unset, callers should gate on `features.gemini`
 * before invoking this — it throws rather than guessing.
 */

import { z } from "zod";
import { env } from "./env";
import { probeImageUrl } from "./cloudinary-url";
import { AGE_RATINGS } from "./constants";
import type { AgeRating, Category, HolidayType } from "./types";

const HOLIDAY_VALUES: HolidayType[] = [
  "christmas",
  "easter",
  "valentines",
  "new-year",
  "halloween",
  "independence",
  "none",
];

/** The fields Gemini fills in. Mirrors the descriptive half of `Wallpaper`. */
export interface WallpaperAnalysis {
  title: string;
  description: string;
  tags: string[];
  categorySlug: string;
  ageRating: AgeRating;
  isMature: boolean;
  holidayTags: HolidayType[];
  seoTitle: string;
  seoDescription: string;
}

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/** Bound how large an inline image we send (Gemini caps requests at ~20MB; we
 *  stay well under to keep latency and quota use low). */
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

/**
 * Analyse a wallpaper image and return catalog metadata.
 *
 * @throws if Gemini isn't configured, the image can't be loaded, or the model
 *         returns something that doesn't validate.
 */
export async function analyzeWallpaperImage({
  publicId,
  imageUrl,
  categories,
}: {
  publicId: string;
  /**
   * Pre-resolved, ready-to-fetch image URL. When given, it's fetched as-is
   * instead of deriving one from `publicId` — used for live wallpapers, where
   * the analysed image is a SIGNED frame extracted from the video (passing it
   * through `probeImageUrl` would strip that frame transform).
   */
  imageUrl?: string;
  categories: Category[];
}): Promise<WallpaperAnalysis> {
  if (!env.geminiApiKey) {
    throw new Error("Gemini is not configured (set GEMINI_API_KEY).");
  }

  const slugs = categories.map((c) => c.slug);
  if (slugs.length === 0) throw new Error("No categories to choose from.");

  const { data: imageBase64, mimeType } = await loadImageInline(
    imageUrl || probeImageUrl(publicId),
  );

  const prompt = buildPrompt(categories);
  const responseSchema = buildSchema(slugs);

  const res = await fetch(
    `${GEMINI_ENDPOINT}/${env.geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": env.geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.4,
        },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Gemini request failed (${res.status}). ${truncate(detail, 300)}`,
    );
  }

  const json = (await res.json()) as GeminiResponse;
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const blocked = json.promptFeedback?.blockReason;
    throw new Error(
      blocked
        ? `Gemini blocked the image (${blocked}).`
        : "Gemini returned no content.",
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned malformed JSON.");
  }

  return validate(raw, slugs);
}

/** Fetch the (untransformed) original and base64-encode it for inline upload.
 *  Untransformed delivery is always allowed even under Cloudinary "Strict
 *  transformations", so this never 401s the way a tampered transform would.
 *  Receives a fully-resolved URL — callers resolve it from a public id (still
 *  image) or a signed video-frame URL (live wallpaper). */
async function loadImageInline(
  url: string,
): Promise<{ data: string; mimeType: string }> {
  if (!url) {
    throw new Error("Couldn't resolve a loadable image URL from that link.");
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Couldn't load the image (${res.status}).`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`That link isn't an image (got ${contentType || "?"}).`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(
      `Image is too large to analyse (${Math.round(buf.byteLength / 1e6)}MB).`,
    );
  }

  return { data: buf.toString("base64"), mimeType: contentType };
}

function buildPrompt(categories: Category[]): string {
  const list = categories.map((c) => `- ${c.slug}: ${c.name}`).join("\n");
  return [
    "You are a metadata writer for Aurava, a premium 4K/HD wallpaper store.",
    "Look at the wallpaper image and produce SEO-friendly catalog metadata.",
    "",
    "Rules:",
    "- title: 3-7 words, evocative and specific to what's shown. No 'wallpaper' suffix.",
    "- description: 1-2 SHORT sentences. Describe the scene, mood and colours, then end with a brief 'Best for …' note naming who or what setup it suits most (e.g. gamers, minimalist desktops, phone lock screens, cosy bedrooms). Keep it tight — do NOT pad, repeat, or stretch the wording.",
    "- tags: ALWAYS return 6-10 lowercase, single-or-two-word search terms (no '#', no duplicates). Never leave this empty — cover subject, colours, mood and style.",
    "- categorySlug: choose the SINGLE best fit from this list (use the slug only):",
    list,
    "- ageRating: 'everyone' unless the image is suggestive/violent; '18+' only for explicit content.",
    "- isMature: true only when ageRating is '18+'.",
    "- holidayTags: tag any holidays the image evokes through its theme, colours or season — e.g. snow/pine/lights → christmas, hearts/roses/pink-red → valentines, pumpkins/spooky/orange → halloween, fireworks/countdown → new-year, flags/patriotic → independence, pastel eggs/spring blooms → easter. Use ['none'] only when nothing fits.",
    "- seoTitle: <=60 chars, ends with ' | Aurava'.",
    "- seoDescription: <=155 chars, compelling meta description.",
    "Return ONLY the JSON object matching the schema.",
  ].join("\n");
}

/** Gemini structured-output schema (OpenAPI subset) with enum constraints so the
 *  model can't invent a category, rating, or holiday outside our taxonomy. */
function buildSchema(slugs: string[]) {
  return {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      description: { type: "STRING" },
      tags: { type: "ARRAY", items: { type: "STRING" } },
      categorySlug: { type: "STRING", enum: slugs },
      ageRating: { type: "STRING", enum: AGE_RATINGS },
      isMature: { type: "BOOLEAN" },
      holidayTags: {
        type: "ARRAY",
        items: { type: "STRING", enum: HOLIDAY_VALUES },
      },
      seoTitle: { type: "STRING" },
      seoDescription: { type: "STRING" },
    },
    required: [
      "title",
      "description",
      "tags",
      "categorySlug",
      "ageRating",
      "isMature",
      "holidayTags",
      "seoTitle",
      "seoDescription",
    ],
    propertyOrdering: [
      "title",
      "description",
      "tags",
      "categorySlug",
      "ageRating",
      "isMature",
      "holidayTags",
      "seoTitle",
      "seoDescription",
    ],
  };
}

/** Defensive validation — the schema makes this mostly belt-and-braces, but a
 *  bad category slug or empty holiday array still gets normalised here. */
function validate(raw: unknown, slugs: string[]): WallpaperAnalysis {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().default(""),
    tags: z.array(z.string()).default([]),
    categorySlug: z.string(),
    ageRating: z.enum(["everyone", "13+", "16+", "18+"]),
    isMature: z.boolean().default(false),
    holidayTags: z
      .array(z.enum(HOLIDAY_VALUES as [HolidayType, ...HolidayType[]]))
      .default([]),
    seoTitle: z.string().default(""),
    seoDescription: z.string().default(""),
  });

  const d = schema.parse(raw);

  const categorySlug = slugs.includes(d.categorySlug)
    ? d.categorySlug
    : slugs[0];

  const tags = dedupe(
    d.tags.map((t) => t.trim().toLowerCase().replace(/^#/, "")).filter(Boolean),
  );

  const holidayTags = d.holidayTags.filter((h) => h !== "none");

  return {
    title: d.title.trim(),
    description: d.description.trim(),
    tags,
    categorySlug,
    ageRating: d.ageRating,
    isMature: d.isMature || d.ageRating === "18+",
    holidayTags: holidayTags.length ? dedupe(holidayTags) : ["none"],
    seoTitle: d.seoTitle.trim(),
    seoDescription: d.seoDescription.trim(),
  };
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
  promptFeedback?: { blockReason?: string };
}
