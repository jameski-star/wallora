import type { MetadataRoute } from "next";
import { getRepo } from "@/lib/repo";
import { abs } from "@/lib/seo";
import { previewUrl } from "@/lib/cloudinary";
import { LEGAL_LINKS } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getRepo();
  const [categories, wallpapers, posts] = await Promise.all([
    repo.listCategories(),
    repo.listWallpapers({ includeMature: false, limit: 1000 }),
    repo.listPosts({ limit: 1000 }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: abs("/"), changeFrequency: "daily", priority: 1 },
    { url: abs("/wallpapers"), changeFrequency: "daily", priority: 0.9 },
    { url: abs("/blog"), changeFrequency: "weekly", priority: 0.6 },
    { url: abs("/about"), changeFrequency: "monthly", priority: 0.5 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: abs(`/blog/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const legalPages: MetadataRoute.Sitemap = LEGAL_LINKS.map((l) => ({
    url: abs(l.href),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: abs(`/wallpapers/${c.slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const wallpaperPages: MetadataRoute.Sitemap = wallpapers.map((w) => ({
    url: abs(`/wallpapers/${w.slug}`),
    lastModified: w.createdAt,
    changeFrequency: "monthly",
    priority: 0.6,
    // Google requires full absolute URLs in image sitemap entries. Use the
    // Cloudinary preview URL so crawlers can discover and index every asset.
    images: [previewUrl(w, { width: 1200, quality: 70 }).split("?")[0]],
  }));

  return [...staticPages, ...legalPages, ...categoryPages, ...wallpaperPages, ...postPages];
}
