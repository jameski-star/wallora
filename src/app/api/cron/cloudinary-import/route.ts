import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { features } from "@/lib/env";
import { runCloudinaryImport } from "@/lib/cloudinary-import";

/**
 * Daily import — scan Cloudinary for unimported images, create wallpaper
 * entries, and mark them as picked.
 *
 * Trigger via Vercel Cron (Pro) or a free external service like cron-job.org:
 *   GET /api/cron/cloudinary-import?secret=CRON_SECRET
 *
 * Also runs automatically as part of the daily wallpaper-of-day cron.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!features.cloudinaryAdmin) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cloudinary Admin API not configured. Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await runCloudinaryImport();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Import failed",
      },
      { status: 500 },
    );
  }
}
