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
import type { AgeRating, Category, HolidayType, Wallpaper } from "./types";

const HOLIDAY_VALUES: HolidayType[] = [
  "christmas",
  "easter",
  "valentines",
  "new-year",
  "halloween",
  "independence",
  "thanksgiving",
  "st-patricks",
  "diwali",
  "lunar-new-year",
  "eid",
  "hanukkah",
  "mothers-day",
  "fathers-day",
  "pride",
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
    "- holidayTags: tag any holidays the image genuinely evokes through its subject, theme, colours or season. Only tag a holiday when the imagery clearly supports it — when nothing fits, return ['none'] (do NOT force a holiday). Visual cues:",
    "    · snow / pine / ornaments / red-green lights → christmas",
    "    · hearts / roses / pink-red → valentines",
    "    · pumpkins / spooky / orange-black → halloween",
    "    · fireworks / countdown / champagne → new-year",
    "    · flags / red-white-blue / patriotic → independence",
    "    · pastel eggs / spring blooms / bunnies → easter",
    "    · autumn leaves / turkey / harvest / cornucopia → thanksgiving",
    "    · shamrocks / four-leaf clover / leprechaun / emerald green → st-patricks",
    "    · oil lamps (diya) / rangoli / marigolds / festive Indian lights → diwali",
    "    · red lanterns / dragons / Chinese zodiac animal / red-gold → lunar-new-year",
    "    · crescent moon + star / mosque / lanterns / Ramadan-Eid motifs → eid",
    "    · menorah / dreidel / blue-white / Star of David → hanukkah",
    "    · floral 'Mom' / Mother's Day tribute themes → mothers-day",
    "    · 'Dad' / Father's Day tribute themes → fathers-day",
    "    · rainbow flag / LGBTQ+ pride colours → pride",
    "  You may return MORE THAN ONE when several clearly apply.",
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

export interface ParsedSemanticSearch {
  categorySlug: string;
  device: string; // "desktop" | "phone" | "tablet" | "any"
  kind: string; // "image" | "live" | "any"
  premium: string; // "true" | "false" | "any"
  tags: string[];
  refinedQuery: string;
  explanation: string;
}

/** Parses natural language search queries into structured database query parameters. */
export async function parseSemanticSearchQuery(
  rawQuery: string,
  categories: Category[],
): Promise<ParsedSemanticSearch> {
  if (!env.geminiApiKey) {
    return {
      categorySlug: "any",
      device: "any",
      kind: "any",
      premium: "any",
      tags: [],
      refinedQuery: rawQuery,
      explanation: `Keyword search: "${rawQuery}"`,
    };
  }

  const slugs = categories.map((c) => c.slug);
  const prompt = [
    "You are a semantic search query parser for Aurava, a premium wallpaper marketplace.",
    "Analyze the user's natural language search query and extract structured query parameters.",
    "",
    "Database Taxonomy:",
    `- Categories (choose the best matching slug, or "any"):`,
    ...categories.map((c) => `  * ${c.slug}: ${c.name} (${c.description})`),
    `- Devices (choose exactly one: "desktop", "phone", "tablet", or "any"):`,
    `  * Choose "desktop" if the user mentions PC, laptop, monitor, ultrawide, Mac, iMac, computer, desktop, background, etc.`,
    `  * Choose "phone" if the user mentions phone, iPhone, Android, lockscreen, mobile, smartphone, etc.`,
    `  * Choose "tablet" if the user mentions iPad, tablet, etc.`,
    `- Media Kind (choose exactly one: "image", "live", or "any"):`,
    `  * Choose "live" if the user mentions live, video, animated, motion, loop, moving, etc.`,
    `  * Otherwise default to "any".`,
    `- Premium Status (choose exactly one: "true" for paid/premium, "false" for free, or "any"):`,
    `  * Choose "true" if the user mentions premium, paid, buy, purchase, exclusive, etc.`,
    `  * Choose "false" if the user mentions free, no-cost, download free, etc.`,
    `  * Otherwise default to "any".`,
    `- Tags (extract 1 to 5 descriptive semantic tags as an array of lowercase strings):`,
    `  * Extract visual descriptors, moods, art styles, color names, and subject matters (e.g., "minimalist", "nature", "blue", "sunrise", "mountains", "peaceful", "cyberpunk", "vaporwave").`,
    `  * Use synonyms if appropriate to increase the likelihood of matching existing tags.`,
    `- Refined Query: Rewrite the search query into a simplified keyword string containing only the essential visual terms (e.g. "blue mountains sunrise minimalist").`,
    `- Explanation: Write a short, editorially-polished sentence explaining the parsed intent (e.g. "Search for minimalist landscape wallpapers featuring blue mountains at sunrise.").`,
    "",
    `Parse this user query: "${rawQuery}"`,
  ].join("\n");

  const responseSchema = {
    type: "OBJECT",
    properties: {
      categorySlug: { type: "STRING" },
      device: { type: "STRING", enum: ["desktop", "phone", "tablet", "any"] },
      kind: { type: "STRING", enum: ["image", "live", "any"] },
      premium: { type: "STRING", enum: ["true", "false", "any"] },
      tags: { type: "ARRAY", items: { type: "STRING" } },
      refinedQuery: { type: "STRING" },
      explanation: { type: "STRING" },
    },
    required: [
      "categorySlug",
      "device",
      "kind",
      "premium",
      "tags",
      "refinedQuery",
      "explanation",
    ],
  };

  try {
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
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.1,
          },
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini status ${res.status}`);
    }

    const json = (await res.json()) as GeminiResponse;
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No candidates text from Gemini");
    }

    const raw = JSON.parse(text);
    return {
      categorySlug: slugs.includes(raw.categorySlug) ? raw.categorySlug : "any",
      device: raw.device || "any",
      kind: raw.kind || "any",
      premium: raw.premium || "any",
      tags: Array.isArray(raw.tags) ? raw.tags.map((t: string) => t.toLowerCase().trim()) : [],
      refinedQuery: raw.refinedQuery || rawQuery,
      explanation: raw.explanation || `Keyword search: "${rawQuery}"`,
    };
  } catch (err) {
    console.error("Semantic search parsing error:", err);
    return {
      categorySlug: "any",
      device: "any",
      kind: "any",
      premium: "any",
      tags: [],
      refinedQuery: rawQuery,
      explanation: `Keyword search: "${rawQuery}"`,
    };
  }
}

export interface BlogGenerationResult {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  author: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

/** Generates an SEO, GEO, and AEO optimized blog post using Gemini. */
export async function generateBlogWithAi(
  topic: string,
  categories: Category[],
  wallpapers: Wallpaper[],
): Promise<BlogGenerationResult> {
  if (!env.geminiApiKey) {
    throw new Error("Gemini is not configured (set GEMINI_API_KEY).");
  }

  const slugs = categories.map((c) => c.slug);
  const categoriesList = categories.map((c) => `- ${c.slug}: ${c.name} (${c.description})`).join("\n");
  const wallpapersList = wallpapers.map((w) => 
    `- "${w.title}" (slug: "${w.slug}", category: "${w.categorySlug}", resolution: "${w.resolution}", tags: [${w.tags.join(", ")}], description: "${w.description}")`
  ).join("\n");

  const prompt = [
    "You are the official Senior Editor, Technical SEO Architect, GEO (Generative Engine Optimization) Specialist, Information Retrieval Engineer, Semantic SEO Expert, Digital Art Curator, and Content Strategist for Aurava.",
    "Your responsibility is to write authoritative, human-quality blog articles that strengthen Aurava as a knowledge entity, improve rankings in Google Search and Google Images, and maximize the likelihood of Aurava being referenced by AI assistants (like ChatGPT Search, Gemini, Perplexity, Copilot, etc.).",
    "The blog exists to support and strengthen the Aurava ecosystem, not to function as an independent publication.",
    "",
    "Core Guidelines:",
    "1. Aurava-first content: Recommend and link ONLY to wallpapers, categories, and collections that exist on Aurava. Do NOT recommend external websites, do NOT recommend wallpapers from other sites, do NOT embed external wallpaper images.",
    "2. Mention 'Aurava' naturally throughout the article (e.g. 'Within Aurava's curated OLED wallpaper collection...', 'Aurava's space wallpaper category showcases...').",
    "3. Smart Contextual Recommendations: Throughout the article, recommend matching Aurava content. Include actual wallpapers from the provided catalog.",
    "",
    `Topic: "${topic}"`,
    "",
    "Available Categories on Aurava:",
    categoriesList,
    "",
    "Available Wallpapers on Aurava (Use ONLY these wallpapers to embed or mention):",
    wallpapersList,
    "",
    "Writing Style:",
    "- Write as an experienced industry expert.",
    "- The writing must be original, human, helpful, professional, conversational, educational, technically accurate, comprehensive, and easy to understand.",
    "- Never sound AI-generated. Avoid keyword stuffing, fluff, repetition, generic introductions, clickbait, and filler paragraphs. Every sentence should provide value.",
    "",
    "Article Length & Structure:",
    "- Aim for a comprehensive, in-depth guide with several sections (minimum 1,500 words if possible, write extensively).",
    "- Integrate 'What', 'Why', 'How', 'When', 'Who', 'Benefits', and 'Limitations' naturally into sections.",
    "- Incorporate Wallpaper Showcase blocks for the wallpapers you select in this EXACT format:",
    "  ### [Wallpaper Title](/wallpapers/slug)",
    "  - **Category:** Category Name",
    "  - **Resolution:** Resolution Value (e.g. 3840x2160)",
    "  - **Description:** A paragraph explaining why this wallpaper is a great choice and its design features.",
    "  - **Download:** [View and Download on Aurava](/wallpapers/slug)",
    "",
    "JSON Schema fields to populate:",
    "- title: Evocative, professional, and click-worthy title.",
    "- slug: URL-friendly lowercase slug.",
    "- excerpt: Short 1-2 sentence summary shown in listings and search results.",
    "- body: The entire post content written in markdown format. Must have clean headers (##, ###), showcase blocks, bullet lists, bold text, and no HTML tags.",
    "- coverImage: Suggested cover image slug or path.",
    "- author: 'Aurava Editorial Team'",
    "- tags: Array of 2 to 5 relevant lowercase tags.",
    "- seoTitle: Under 60 characters, compelling title ending with ' | Aurava'.",
    "- seoDescription: Under 155 characters, meta description.",
  ].join("\n");

  const responseSchema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      slug: { type: "STRING" },
      excerpt: { type: "STRING" },
      body: { type: "STRING" },
      coverImage: { type: "STRING" },
      author: { type: "STRING" },
      tags: { type: "ARRAY", items: { type: "STRING" } },
      seoTitle: { type: "STRING" },
      seoDescription: { type: "STRING" },
    },
    required: [
      "title",
      "slug",
      "excerpt",
      "body",
      "coverImage",
      "author",
      "tags",
      "seoTitle",
      "seoDescription",
    ],
  };

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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.7,
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini request failed with status ${res.status}`);
  }

  const json = (await res.json()) as GeminiResponse;
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned empty candidate text.");
  }

  const raw = JSON.parse(text);
  return {
    title: (raw.title || "").trim(),
    slug: (raw.slug || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    excerpt: (raw.excerpt || "").trim(),
    body: (raw.body || "").trim(),
    coverImage: (raw.coverImage || "").trim(),
    author: (raw.author || "Aurava Editorial Team").trim(),
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: string) => t.toLowerCase().trim()) : ["guide"],
    seoTitle: (raw.seoTitle || "").trim(),
    seoDescription: (raw.seoDescription || "").trim(),
  };
}
