import { getRepo } from "@/lib/repo";
import { abs } from "@/lib/seo";

export async function GET() {
  const repo = await getRepo();
  const wallpapers = await repo.listWallpapers({ includeMature: false, premium: true, limit: 1000 });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${wallpapers
    .map((w) => {
      const pageUrl = abs(`/wallpapers/${w.slug}`);
      return `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${new Date(w.createdAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
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
