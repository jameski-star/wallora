import type { MetadataRoute } from "next";
import { getRepo } from "@/lib/repo";
import { abs } from "@/lib/seo";
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
    // Strip any query string from the image URL before it lands in <image:loc>.
    // Some preview images are Unsplash URLs whose `?auto=format&fit=crop` carries
    // a bare `&` — invalid XML that makes Google reject the entire sitemap. Query
    // params aren't needed for image indexing; Cloudinary URLs have none, so this
    // is a no-op for real wallpapers.
    images: [w.previewPublicId.split("?")[0]],
  }));

  return [...staticPages, ...legalPages, ...categoryPages, ...wallpaperPages, ...postPages];
}
