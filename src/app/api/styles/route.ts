import { NextResponse } from "next/server";
import { listWallpapers } from "@/lib/catalog";

const STYLE_TAXONOMY = [
  "minimalist", "vector", "3d render", "fantasy", "abstract", "pixel art", 
  "vintage", "line art", "watercolor", "cyberpunk", "vaporwave", "photography", 
  "flat design", "scifi", "retro", "cinematic", "futuristic", "cosy", "nature",
  "moody", "aesthetic"
];

export async function GET() {
  const wallpapers = await listWallpapers({ limit: 1000 });
  
  const counts: Record<string, number> = {};
  STYLE_TAXONOMY.forEach((s) => {
    counts[s] = 0;
  });

  wallpapers.forEach((w) => {
    w.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase().trim();
      if (STYLE_TAXONOMY.includes(lowerTag)) {
        counts[lowerTag]++;
      }
    });
  });

  const styles = STYLE_TAXONOMY.map((name) => ({
    name,
    tag: name,
    count: counts[name] || 0,
  })).sort((a, b) => b.count - a.count);

  return NextResponse.json(styles);
}
