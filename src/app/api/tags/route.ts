import { NextResponse } from "next/server";
import { listWallpapers } from "@/lib/catalog";

export async function GET() {
  const wallpapers = await listWallpapers({ limit: 1000 });
  
  const tagCounts: Record<string, number> = {};
  wallpapers.forEach((w) => {
    w.tags.forEach((tag) => {
      const formatted = tag.toLowerCase().trim();
      if (formatted) {
        tagCounts[formatted] = (tagCounts[formatted] || 0) + 1;
      }
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(sortedTags);
}
