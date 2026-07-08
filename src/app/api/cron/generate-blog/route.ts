import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { runAutonomousBlogEngine } from "@/lib/autonomous-blog";

/**
 * Autonomous Content Cron Job.
 * Triggered periodically (e.g. weekly or bi-weekly) to dynamically select a topic,
 * generate, internally-link, validate, and publish a detailed display-tech or customization article.
 */
export async function GET(request: NextRequest) {
  await headers();
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAutonomousBlogEngine();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Autonomous blog generation cron failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate blog post autonomously." },
      { status: 500 }
    );
  }
}
