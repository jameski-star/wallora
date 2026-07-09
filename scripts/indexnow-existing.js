const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Manually parse .env.local to avoid needing @next/env
const env = {};
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  console.log("Reading environment variables from .env.local...");
  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.substring(0, idx).trim();
    let value = trimmed.substring(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
}

const siteUrl = (env.NEXT_PUBLIC_SITE_URL || "https://www.auravaw.tech").replace(/\/$/, "");
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const indexnowKey = (env.INDEXNOW_KEY || "auravaindexnowkey2026").trim();

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local!");
    process.exit(1);
  }

  console.log("Initializing Supabase client...");
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const urls = [];

  // Static/Main pages
  console.log("Adding static/main pages...");
  urls.push(`${siteUrl}/`);
  urls.push(`${siteUrl}/about`);
  urls.push(`${siteUrl}/license`);
  urls.push(`${siteUrl}/privacy`);
  urls.push(`${siteUrl}/refund`);
  urls.push(`${siteUrl}/terms`);
  urls.push(`${siteUrl}/blog`);
  urls.push(`${siteUrl}/wallpapers`);

  // Sitemap pages
  console.log("Adding sitemap URLs...");
  urls.push(`${siteUrl}/sitemap.xml`);
  urls.push(`${siteUrl}/blog-sitemap.xml`);
  urls.push(`${siteUrl}/premium-sitemap.xml`);
  urls.push(`${siteUrl}/free-sitemap.xml`);
  urls.push(`${siteUrl}/categories-sitemap.xml`);
  urls.push(`${siteUrl}/live-wallpaper-sitemap.xml`);

  // Fetch wallpapers
  console.log("Fetching wallpapers from Supabase...");
  const { data: wallpapers, error: wpError } = await supabase
    .from("wallpapers")
    .select("slug");

  if (wpError) {
    console.error("Error fetching wallpapers:", wpError);
  } else if (wallpapers) {
    console.log(`Found ${wallpapers.length} wallpapers.`);
    for (const wp of wallpapers) {
      urls.push(`${siteUrl}/wallpapers/${wp.slug}`);
    }
  }

  // Fetch categories
  console.log("Fetching categories from Supabase...");
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("slug");

  if (catError) {
    console.error("Error fetching categories:", catError);
  } else if (categories) {
    console.log(`Found ${categories.length} categories.`);
    for (const cat of categories) {
      urls.push(`${siteUrl}/wallpapers?category=${cat.slug}`);
    }
  }

  // Fetch blog posts
  console.log("Fetching published blog posts from Supabase...");
  const { data: posts, error: postError } = await supabase
    .from("posts")
    .select("slug")
    .eq("published", true);

  if (postError) {
    console.error("Error fetching posts:", postError);
  } else if (posts) {
    console.log(`Found ${posts.length} published blog posts.`);
    for (const post of posts) {
      urls.push(`${siteUrl}/blog/${post.slug}`);
    }
  }

  console.log(`Total URLs compiled: ${urls.length}`);

  if (urls.length === 0) {
    console.log("No URLs to submit.");
    return;
  }

  const host = new URL(siteUrl).host;
  const keyLocation = `${siteUrl}/${indexnowKey}.txt`;

  console.log(`Submitting ${urls.length} URLs to IndexNow (Bing/Yandex/etc.) for host: ${host}...`);
  
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host,
        key: indexnowKey,
        keyLocation,
        urlList: urls,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`IndexNow submission failed with status ${res.status}: ${detail}`);
      process.exit(1);
    }

    console.log("IndexNow submission successful!");
  } catch (err) {
    console.error("IndexNow submission error:", err);
    process.exit(1);
  }
}

main().catch(console.error);
