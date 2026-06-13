import { NextResponse, type NextRequest } from "next/server";
import { getRepo } from "@/lib/repo";
import { getViewer } from "@/lib/auth";
import { signedDownloadUrl } from "@/lib/delivery";

/**
 * Re-download a purchased wallpaper. Generates a fresh 60s signed URL on each
 * request. Authorization: the order must belong to the signed-in user (or an
 * admin), be paid, and contain the requested wallpaper.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: orderId } = await ctx.params;
  const wallpaperId = request.nextUrl.searchParams.get("wp");
  if (!wallpaperId)
    return NextResponse.json({ error: "Missing wallpaper" }, { status: 400 });

  const [repo, viewer] = await Promise.all([getRepo(), getViewer()]);
  if (!viewer.profile)
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const order = await repo.getOrder(orderId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owns = order.userId === viewer.profile.id || viewer.isAdmin;
  if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (order.status !== "paid")
    return NextResponse.json({ error: "Order not paid" }, { status: 402 });
  if (!order.items.some((it) => it.wallpaperId === wallpaperId))
    return NextResponse.json({ error: "Not in order" }, { status: 404 });

  const w = await repo.getWallpaperById(wallpaperId);
  if (!w) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const url = await signedDownloadUrl(w);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "This file is temporarily unavailable. Please contact support." },
      { status: 502 },
    );
  }
}
