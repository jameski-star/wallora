import { NextResponse } from "next/server";
import { listWallpapers } from "@/lib/catalog";
import type { DeviceType, WallpaperKind, WallpaperQuery } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const device = (searchParams.get("device") as DeviceType) || undefined;
  const kind = (searchParams.get("kind") as WallpaperKind) || undefined;
  const search = searchParams.get("search") || undefined;
  const premiumVal = searchParams.get("premium");
  const premium = premiumVal === "true" ? true : premiumVal === "false" ? false : undefined;
  const sort = (searchParams.get("sort") as WallpaperQuery["sort"]) || "newest";
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const wallpapers = await listWallpapers({
    category,
    tag,
    device,
    kind,
    search,
    premium,
    sort,
    limit,
    offset,
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
