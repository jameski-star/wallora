import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo";

export async function GET() {
  return NextResponse.json({
    message: "Welcome to the Aurava AI Agent API.",
    documentation: `${SITE_URL}/api/openapi.json`,
    endpoints: {
      search: `${SITE_URL}/api/search?q={query}`,
      wallpapers: `${SITE_URL}/api/wallpapers`,
      categories: `${SITE_URL}/api/categories`,
      collections: `${SITE_URL}/api/collections`,
      blog: `${SITE_URL}/api/blog`,
      trending: `${SITE_URL}/api/trending`,
      latest: `${SITE_URL}/api/latest`,
      colors: `${SITE_URL}/api/colors`,
      styles: `${SITE_URL}/api/styles`,
      tags: `${SITE_URL}/api/tags`,
      related: `${SITE_URL}/api/related?slug={wallpaper_slug}`,
    },
  });
}
