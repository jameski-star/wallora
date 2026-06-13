import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { refreshWallpaperOfDay } from "@/lib/featured";

/** Daily (midnight) — refresh the Wallpaper of the Day. */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await refreshWallpaperOfDay();
  return NextResponse.json({ ok: true, ...result });
}
