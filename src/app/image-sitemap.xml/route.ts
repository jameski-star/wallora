import { getRepo } from "@/lib/repo";
import { abs } from "@/lib/seo";
import { previewUrl } from "@/lib/cloudinary";

export async function GET() {
  const repo = await getRepo();
  const wallpapers = await repo.listWallpapers({ includeMature: false, limit: 2000 });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${wallpapers
    .map((w) => {
      const pageUrl = abs(`/wallpapers/${w.slug}`);
      const imageUrl = previewUrl(w, { width: 1200, quality: 80 }).split("?")[0];
      return `  <url>
    <loc>${pageUrl}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${escapeXml(w.seoTitle || w.title)}</image:title>
      <image:caption>${escapeXml(w.seoDescription || w.description)}</image:caption>
    </image:image>
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
