import { NextResponse, type NextRequest } from "next/server";
import { getRepo } from "@/lib/repo";
import { signedDownloadUrl } from "@/lib/delivery";

/**
 * Guest download for a paid order — no sign-in required.
 *
 * Authorization is by capability: the buyer must present the order id (a random
 * UUID) AND the order's PesaPal merchant reference as a token (`t`). Both are
 * handed to the buyer on the post-payment success page and are never exposed
 * publicly, so together they act as an unguessable bearer credential.
 *
 * The order must be PAID (verified server-side during fulfillment) and actually
 * contain the requested wallpaper. A fresh 60s signed URL is minted per request,
 * so the link works on repeat clicks but each URL expires quickly.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: orderId } = await ctx.params;
  const wallpaperId = request.nextUrl.searchParams.get("wp");
  const token = request.nextUrl.searchParams.get("t");
  if (!wallpaperId || !token)
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  const repo = await getRepo();
  const order = await repo.getOrder(orderId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.pesapalMerchantRef !== token)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (order.status !== "paid")
    return NextResponse.json({ error: "Payment not confirmed" }, { status: 402 });
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
