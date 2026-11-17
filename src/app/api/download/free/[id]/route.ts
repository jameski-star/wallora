import { NextResponse, type NextRequest } from "next/server";
import { getRepo } from "@/lib/repo";
import { getViewer } from "@/lib/auth";
import { canView } from "@/lib/age";
import { originalDownloadUrl } from "@/lib/cloudinary";

/**
 * Download a FREE wallpaper. Age-gated; premium items are rejected here.
 *
 * Free originals are served straight from Cloudinary (no Supabase): we redirect
 * to a `fl_attachment` URL so the browser saves the full-resolution file.
 * Live wallpapers have no still original — their original is the looping video,
 * which `originalDownloadUrl` handles via the same `fl_attachment` mechanism.
 */
export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const [repo, viewer] = await Promise.all([getRepo(), getViewer()]);
  const w = await repo.getWallpaperById(id);

  if (!w)
    return NextResponse.json(
      { error: "This wallpaper is no longer available." },
      { status: 404 },
    );
  if (w.isPremium)
    return NextResponse.json({ error: "Purchase required" }, { status: 402 });
  if (!viewer.isAdmin && !canView(viewer, w.ageRating))
    return NextResponse.json({ error: "Age restricted" }, { status: 403 });

  const url = originalDownloadUrl(w);
  if (!url)
    return NextResponse.json(
      { error: "This file is temporarily unavailable. Please contact support." },
      { status: 502 },
    );

  await repo.incrementDownloads(w.id);
  return NextResponse.redirect(url);
}
