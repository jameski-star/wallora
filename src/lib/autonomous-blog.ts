import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getRepo } from "./repo";
import { generateBlogWithAi } from "./gemini";
import { notifyIndexNow } from "./indexnow";
import { env } from "./env";
import { abs } from "./seo";
import type { Post } from "./types";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Runs the autonomous content discovery, generation, linking, and publishing engine.
 * Selects a topic dynamically via Gemini, generates the article, inserts matching wallpapers,
 * saves to DB, revalidates next cache, and alerts Bing/IndexNow.
 */
export async function runAutonomousBlogEngine(): Promise<{ ok: boolean; message: string; post?: Post }> {
  if (!env.geminiApiKey) {
    return { ok: false, message: "Gemini is not configured. Set GEMINI_API_KEY." };
  }

  const repo = await getRepo();
  const [categories, wallpapers, existingPosts] = await Promise.all([
    repo.listCategories(),
    repo.listWallpapers({ includeMature: false, limit: 100 }),
    repo.listPosts({ includeUnpublished: true, limit: 1000 }),
  ]);

  const existingSlugs = existingPosts.map((p) => p.slug);

  // 1. Ask Gemini to propose a fresh, trending, non-duplicative topic
  let selectedTopic = "";
  try {
    const topicPrompt = [
      "You are the Editorial Director for Aurava, a premium wallpaper marketplace and personalization platform.",
      "Identify a fresh, high-demand search topic regarding display technology, wallpaper personalization, color science, gaming/minimal setups, or live backgrounds.",
      "We want to capture search queries that will drive organic downloads of desktop, phone, or tablet wallpapers.",
      "",
      "Existing Blog Article Slugs (Do NOT duplicate or write about these):",
      ...existingSlugs.map((s) => `- ${s}`),
      "",
      "Instructions:",
      "1. Propose 3 fresh, unique article topics.",
      "2. Select the single best topic from those 3 options.",
      "3. Return ONLY a JSON object containing the selected topic.",
      'Format: { "topic": "Proposed blog post topic title" }',
    ].join("\n");

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
              parts: [{ text: topicPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                topic: { type: "STRING" },
              },
              required: ["topic"],
            },
            temperature: 0.7,
          },
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Gemini topic selection failed with status ${res.status}`);
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No candidate text returned for topic selection.");
    
    const parsed = JSON.parse(text);
    selectedTopic = parsed.topic;
  } catch (err) {
    console.error("Autonomous topic selection failed, using fallback:", err);
    // Fallback topic if Gemini selection fails
    const fallbackTopics = [
      "The Ultimate Guide to OLED Wallpapers and Battery Saving Tips",
      "How Resolution and PPI Affect Your Wallpaper Quality on High-DPI Displays",
      "Minimalist Workspace Aesthetics: Curation Guide for Developers and Creators",
      "Understanding Color Science in Digital Art and Screen Calibration",
    ];
    // Find one that isn't duplicated
    selectedTopic = fallbackTopics.find(t => {
      const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return !existingSlugs.includes(slug);
    }) || fallbackTopics[0];
  }

  console.log(`Autonomous Content Engine selected topic: "${selectedTopic}"`);

  // 2. Query wallpapers that might match the selected topic keywords to pass as candidate entities
  const searchTerms = selectedTopic.split(/\s+/).filter((w) => w.length > 4).slice(0, 3).join(" ");
  let candidateWallpapers = await repo.listWallpapers({
    search: searchTerms || undefined,
    limit: 25,
  });

  if (candidateWallpapers.length === 0) {
    candidateWallpapers = await repo.listWallpapers({ limit: 35 });
  }

  // 3. Generate the actual article body and metadata using the Master Prompt guidelines
  const generated = await generateBlogWithAi(selectedTopic, categories, candidateWallpapers);

  // 4. Save and Publish immediately
  const id = `post_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  
  const post: Post = {
    id,
    slug: generated.slug,
    title: generated.title,
    excerpt: generated.excerpt || generated.body.slice(0, 160).replace(/\n/g, " "),
    body: generated.body,
    coverImage: generated.coverImage || "",
    author: generated.author || "Aurava Editorial Team",
    tags: generated.tags,
    published: true, // Autonomous engine always publishes directly
    seoTitle: generated.seoTitle || `${generated.title} | Aurava Blog`,
    seoDescription: generated.seoDescription || generated.excerpt,
    createdAt: now,
    updatedAt: now,
  };

  await repo.upsertPost(post);

  // 5. Revalidate cache
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/");

  // 6. Notify search engines via IndexNow
  const articleUrl = abs(`/blog/${post.slug}`);
  const sitemapUrl = abs("/blog-sitemap.xml");
  await notifyIndexNow([articleUrl, sitemapUrl]);

  return {
    ok: true,
    message: `Autonomously generated and published post: "${post.title}"`,
    post,
  };
}
