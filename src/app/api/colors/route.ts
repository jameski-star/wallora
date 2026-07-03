import { NextResponse } from "next/server";
import { listWallpapers } from "@/lib/catalog";

const COLOR_TAXONOMY = [
  "blue", "dark", "red", "green", "pink", "black", "orange", "gold", "purple", 
  "white", "yellow", "cyan", "neon", "pastel", "amber", "teal", "emerald", 
  "indigo", "crimson", "violet"
];

export async function GET() {
  const wallpapers = await listWallpapers({ limit: 1000 });
  
  const counts: Record<string, number> = {};
  COLOR_TAXONOMY.forEach((c) => {
    counts[c] = 0;
  });

  wallpapers.forEach((w) => {
    w.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase().trim();
      if (COLOR_TAXONOMY.includes(lowerTag)) {
        counts[lowerTag]++;
      }
    });
  });

  const colors = COLOR_TAXONOMY.map((name) => ({
    name,
    tag: name,
    count: counts[name] || 0,
  })).sort((a, b) => b.count - a.count);

  return NextResponse.json(colors);
}
