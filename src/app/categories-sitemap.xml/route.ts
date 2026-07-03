import { getRepo } from "@/lib/repo";
import { abs } from "@/lib/seo";

export async function GET() {
  const repo = await getRepo();
  const categories = await repo.listCategories();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories
    .map((c) => {
      const pageUrl = abs(`/wallpapers/${c.slug}`);
      return `  <url>
    <loc>${pageUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
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
