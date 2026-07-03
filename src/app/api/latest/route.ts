import { NextResponse } from "next/server";
import { listWallpapers } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  const wallpapers = await listWallpapers({
    sort: "newest",
    limit,
  });

  return NextResponse.json(
    wallpapers.map((w) => ({
      id: w.id,
      slug: w.slug,
      title: w.title,
      description: w.description,
      device: w.device,
      resolution: w.resolution,
      isPremium: w.isPremium,
      priceCents: w.priceCents,
      category: w.categorySlug,
      tags: w.tags,
      kind: w.kind ?? "image",
      downloads: w.downloads,
      createdAt: w.createdAt,
    }))
  );
}
