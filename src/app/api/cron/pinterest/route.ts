import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { autopostWallpapersToPinterest } from "@/lib/pinterest";

/** Daily cron — autopost unposted wallpapers to Pinterest. */
export async function GET(request: NextRequest) {
  await headers();
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const countParam = searchParams.get("count");
  const count = countParam ? parseInt(countParam, 10) : 10;

  try {
    const result = await autopostWallpapersToPinterest(count);
    return NextResponse.json(
      {
        ok: result.ok,
        results: result.results,
      },
      { status: result.ok ? 200 : 500 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
