import { NextResponse } from "next/server";
import { parseSemanticSearchQuery } from "@/lib/gemini";
import { listCategories, listWallpapers } from "@/lib/catalog";
import type { DeviceType, WallpaperKind } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({
      query: "",
      explanation: "Empty search query.",
      results: [],
    });
  }

  const categories = await listCategories();
  const parsed = await parseSemanticSearchQuery(q, categories);

  // Map parsed values to catalog query
  const queryParams: any = {
    limit: 30,
    sort: "popular",
  };

  if (parsed.categorySlug && parsed.categorySlug !== "any") {
    queryParams.category = parsed.categorySlug;
  }
  if (parsed.device && parsed.device !== "any") {
    queryParams.device = parsed.device as DeviceType;
  }
  if (parsed.kind && parsed.kind !== "any") {
    queryParams.kind = parsed.kind as WallpaperKind;
  }
  if (parsed.premium && parsed.premium !== "any") {
    queryParams.premium = parsed.premium === "true";
  }
  if (parsed.tags && parsed.tags.length > 0) {
    queryParams.tags = parsed.tags;
  }
  if (parsed.refinedQuery) {
    queryParams.search = parsed.refinedQuery;
  }

  const results = await listWallpapers(queryParams);

  return NextResponse.json({
    query: q,
    parsed,
    explanation: parsed.explanation,
    results: results.map((w) => ({
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
    })),
  });
}
