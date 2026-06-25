import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { refreshWallpaperOfDay } from "@/lib/featured";
import { features } from "@/lib/env";
import { runCloudinaryImport } from "@/lib/cloudinary-import";

/** Daily (midnight) — refresh the Wallpaper of the Day and import new Cloudinary assets. */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await refreshWallpaperOfDay();

  // Piggyback the Cloudinary import on the same daily cron slot
  // (Vercel Hobby caps at 2 crons). Non-fatal: the featured refresh
  // result is always returned, with import appended when configured.
  let importResult = null;
  if (features.cloudinaryAdmin) {
    try {
      importResult = await runCloudinaryImport();
    } catch {
      importResult = { ok: false, error: "Import threw unexpectedly" };
    }
  }

  return NextResponse.json({ ok: true, ...result, import: importResult });
}
