import { getRepo } from "@/lib/repo";
import { abs } from "@/lib/seo";

export async function GET() {
  const repo = await getRepo();
  const [categories, wallpapers] = await Promise.all([
    repo.listCategories(),
    repo.listWallpapers({ includeMature: false, limit: 1000 }),
  ]);

  // Extract unique tags from wallpapers
  const tags = Array.from(new Set(wallpapers.flatMap((w) => w.tags))).filter(Boolean);

  const urls: string[] = [];
  categories.forEach((c) => {
    urls.push(abs(`/wallpapers/${c.slug}`));
  });
  tags.forEach((t) => {
    urls.push(abs(`/wallpapers?tag=${encodeURIComponent(t)}`));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map((url) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`)
    .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
