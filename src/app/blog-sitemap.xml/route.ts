import { getRepo } from "@/lib/repo";
import { abs } from "@/lib/seo";

export async function GET() {
  const repo = await getRepo();
  const posts = await repo.listPosts({ limit: 1000 });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts
    .map((p) => {
      const pageUrl = abs(`/blog/${p.slug}`);
      const lastMod = p.updatedAt || p.createdAt;
      return `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${new Date(lastMod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
