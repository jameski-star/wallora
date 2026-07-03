import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const crawlers = [
    "*",
    "Googlebot",
    "Googlebot-Image",
    "Googlebot-News",
    "Google-Extended",
    "GPTBot",
    "OAI-SearchBot",
    "ClaudeBot",
    "PerplexityBot",
    "Bingbot",
    "Applebot",
    "DuckAssistBot",
    "CCBot",
    "Amazonbot",
    "FacebookExternalHit",
    "Slackbot",
    "LinkedInBot",
    "PinterestBot",
  ];

  const sitemaps = [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/image-sitemap.xml`,
    `${SITE_URL}/blog-sitemap.xml`,
    `${SITE_URL}/collections-sitemap.xml`,
    `${SITE_URL}/categories-sitemap.xml`,
    `${SITE_URL}/premium-sitemap.xml`,
    `${SITE_URL}/free-sitemap.xml`,
    `${SITE_URL}/authors-sitemap.xml`,
    `${SITE_URL}/live-wallpaper-sitemap.xml`,
  ];

  return {
    rules: crawlers.map((crawler) => ({
      userAgent: crawler,
      allow: "/",
      disallow: ["/admin-dash", "/account", "/checkout", "/cart", "/api/"],
    })),
    sitemap: sitemaps,
    host: SITE_URL,
  };
}
