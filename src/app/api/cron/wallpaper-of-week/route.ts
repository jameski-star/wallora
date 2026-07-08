import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { refreshWallpaperOfWeek } from "@/lib/featured";

/** Weekly (Monday) — refresh the Wallpaper of the Week. */
export async function GET(request: NextRequest) {
  await headers();
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await refreshWallpaperOfWeek();
  return NextResponse.json({ ok: true, ...result });
}
