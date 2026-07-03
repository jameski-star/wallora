import { NextResponse } from "next/server";
import { getRepo } from "@/lib/repo";
import { listWallpapers } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  if (!id && !slug) {
    return NextResponse.json(
      { error: "Missing 'id' or 'slug' parameter." },
      { status: 400 }
    );
  }

  const repo = await getRepo();
  let wallpaper = null;

  if (slug) {
    wallpaper = await repo.getWallpaperBySlug(slug);
  } else if (id) {
    wallpaper = await repo.getWallpaperById(id);
  }

  if (!wallpaper) {
    return NextResponse.json({ error: "Wallpaper not found." }, { status: 404 });
  }

  // Fetch wallpapers in the same category
  const related = await listWallpapers({
    category: wallpaper.categorySlug,
    limit: 12,
  });

  // Filter out the current wallpaper and sort by tag overlaps
  const currentTags = new Set(wallpaper.tags);
  const filtered = related
    .filter((w) => w.id !== wallpaper!.id)
    .map((w) => {
      const overlap = w.tags.filter((t) => currentTags.has(t)).length;
      return { wallpaper: w, score: overlap };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.wallpaper)
    .slice(0, 8);

  return NextResponse.json(
    filtered.map((w) => ({
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
