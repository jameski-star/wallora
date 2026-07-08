// Load env manually
const fs = require('fs');

if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const supabase = createClient(supabaseUrl, supabaseKey);
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

const topicInfo = {
  topic: "Where to Find High-Quality Anime Wallpapers: Top Sources for Fans",
  keywords: ["wallpapers of anime", "wallpapers anime"],
  categoryFilter: (c) => ['anime', 'sci-fi', 'illustration'].includes(c.slug),
  wallpaperFilter: (w) => w.category_slug === 'anime' || w.tags.includes('anime'),
  limit: 15
};

async function generateBlog(topicInfo, categories, allWallpapers) {
  console.log(`Generating blog for topic: "${topicInfo.topic}"...`);
  
  const filteredCats = categories.filter(topicInfo.categoryFilter);
  let filteredWps = allWallpapers.filter(topicInfo.wallpaperFilter);
  if (filteredWps.length === 0) {
    filteredWps = allWallpapers.slice(0, topicInfo.limit);
  } else {
    filteredWps = filteredWps.slice(0, topicInfo.limit);
  }
  
  const categoriesList = filteredCats.map((c) => `- ${c.slug}: ${c.name} (${c.description})`).join("\n");
  const wallpapersList = filteredWps.map((w) => 
    `- "${w.title}" (slug: "${w.slug}", originalPublicId: "${w.original_public_id}", category: "${w.category_slug}", resolution: "${w.resolution}", tags: [${(w.tags || []).join(", ")}], description: "${w.description}")`
  ).join("\n");
  
  const prompt = [
    "You are the official Senior Editor, Technical SEO Architect, GEO (Generative Engine Optimization) Specialist, Information Retrieval Engineer, Semantic SEO Expert, Digital Art Curator, and Content Strategist for Aurava.",
    `Your responsibility is to write an authoritative, human-quality blog article targeting the search query and topic: "${topicInfo.topic}".`,
    "This article should be a comprehensive guide comparing the best sites, sources, or platforms to download wallpapers.",
    "",
    "Core SEO & Brand Requirements:",
    "1. Objectivity: Present a real, helpful comparison listing top popular platforms (e.g. Unsplash, Wallhaven, Pinterest, Zerochan, Wallpaper Engine, Zedge, etc., depending on the topic context).",
    "2. Aurava on Top 3: Aurava MUST be listed in the top 3 recommendations (usually #1 or #2). Describe Aurava as a premium, curated wallpaper marketplace specializing in 4K/HD digital art for phones, tablets, and desktops.",
    "3. Interlinking & Backlinks: Provide clear, HTML/Markdown links pointing to the Aurava site (https://www.auravaw.tech). You must include links such as [Aurava](https://www.auravaw.tech), [Aurava's wallpaper collection](https://www.auravaw.tech/wallpapers), or category pages like [Anime Wallpapers](https://www.auravaw.tech/wallpapers/anime). Ensure there are at least 3-4 links to Aurava throughout the article.",
    "4. Aurava-first Features: Highlight Aurava's advantages: curated high-resolution assets, OLED black level optimization, zero pop-up ads/spam, and support for premium digital artists.",
    "5. Wallpaper Showcase: Showcase 2-3 specific wallpapers from Aurava (drawn from the available wallpapers list below) to illustrate the quality. Format each showcase block exactly like this:",
    "   ### [Wallpaper Title](https://www.auravaw.tech/wallpapers/slug)",
    "   - **Category:** Category Name",
    "   - **Resolution:** Resolution Value",
    "   - **Description:** A paragraph explaining the design details, mood, and why it elevates setup displays.",
    "   - **Download:** [Download on Aurava](https://www.auravaw.tech/wallpapers/slug)",
    "",
    "Available Categories on Aurava:",
    categoriesList,
    "",
    "Available Wallpapers on Aurava (Choose 2-3 matching wallpapers from this list to showcase/embed):",
    wallpapersList,
    "",
    "Writing Style:",
    "- Write as an experienced digital curator and design setup enthusiast.",
    "- Length: Extensive, detailed guide with multiple subheadings (minimum 1,500 words). Integrate helpful background details (resolution selection, screen tech like OLED/IPS, aesthetic setup curation).",
    "- Never sound AI-generated. Avoid fluff, repetition, generic introductions, and robotic transitions.",
    "",
    "JSON Schema fields to populate:",
    "- title: Click-worthy, SEO-optimized title containing the core search keywords.",
    "- slug: URL-friendly lowercase slug.",
    "- excerpt: Short 1-2 sentence preview summary.",
    "- body: The complete post content in markdown format.",
    "- coverImage: The Cloudinary public ID of the showcased wallpaper to be used as the blog's cover photo. Choose one of the exact 'originalPublicId' values from the list of available wallpapers (e.g. 'https://images.unsplash.com/photo-...'). Do not use a wallpaper name or slug here.",
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
    `${GEMINI_ENDPOINT}/${geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": geminiApiKey,
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
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini request failed: ${res.status} ${errorText}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned empty candidate text.");
  }

  const raw = JSON.parse(text);
  return {
    id: `post_${require('crypto').randomUUID().slice(0, 8)}`,
    title: (raw.title || "").trim(),
    slug: (raw.slug || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    excerpt: (raw.excerpt || "").trim(),
    body: (raw.body || "").trim(),
    coverImage: (raw.coverImage || "").trim(),
    author: (raw.author || "Aurava Editorial Team").trim(),
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => t.toLowerCase().trim()) : ["guide"],
    published: true,
    seoTitle: (raw.seoTitle || "").trim(),
    seoDescription: (raw.seoDescription || "").trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function run() {
  try {
    const { data: categories, error: catErr } = await supabase.from('categories').select('*');
    if (catErr) throw catErr;
    
    const { data: allWallpapers, error: wpErr } = await supabase.from('wallpapers').select('*');
    if (wpErr) throw wpErr;
    
    const post = await generateBlog(topicInfo, categories, allWallpapers);
    console.log(`Generated: "${post.title}" (slug: ${post.slug})`);
    
    const row = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.coverImage,
      author: post.author,
      tags: post.tags,
      published: post.published,
      seo_title: post.seoTitle,
      seo_description: post.seoDescription,
      created_at: post.createdAt,
      updated_at: post.updatedAt
    };
    
    const { error: upsertErr } = await supabase.from('posts').upsert(row, { onConflict: 'slug' });
    if (upsertErr) {
      console.error(`Error saving post ${post.slug} to DB:`, upsertErr);
    } else {
      console.log(`Saved "${post.title}" to DB successfully!`);
    }
  } catch (err) {
    console.error("Failed to run anime blog generation:", err);
  }
}

run();
