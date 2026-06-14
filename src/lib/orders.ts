import "server-only";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { env } from "./env";
import { getRepo } from "./repo";
import { submitOrder, getTransactionStatus } from "./pesapal";
import { signedDownloadUrl } from "./delivery";
import { sendReceiptAndDownloads } from "./email";
import type { Order, OrderItem } from "./types";

export interface CheckoutLine {
  wallpaperId: string;
}

/**
 * Create a pending order from cart lines (re-priced server-side — client prices
 * are never trusted), then hand off to PesaPal and return the redirect URL.
 */
export async function startCheckout(
  lines: CheckoutLine[],
  email: string,
  userId: string | null,
): Promise<{ order: Order; redirectUrl: string }> {
  const repo = await getRepo();
  const wallpapers = await repo.getWallpapersByIds(lines.map((l) => l.wallpaperId));
  const premium = wallpapers.filter((w) => w.isPremium && w.priceCents > 0);
  if (premium.length === 0) throw new Error("No purchasable items in cart");

  const items: OrderItem[] = premium.map((w) => ({
    wallpaperId: w.id,
    title: w.title,
    priceCents: w.priceCents, // authoritative price from the catalog
  }));
  const totalCents = items.reduce((s, it) => s + it.priceCents, 0);
  const merchantRef = `WLR-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6)}`;

  const order: Order = {
    id: randomUUID(),
    userId,
    email,
    items,
    totalCents,
    currency: env.pesapalCurrency,
    status: "pending",
    pesapalTrackingId: null,
    pesapalMerchantRef: merchantRef,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
  await repo.createOrder(order);

  const result = await submitOrder({
    merchantRef,
    amount: totalCents / 100,
    currency: order.currency,
    description: `Aurava — ${items.length} wallpaper${items.length === 1 ? "" : "s"}`,
    email,
  });

  await repo.updateOrder(order.id, {
    pesapalTrackingId: result.orderTrackingId,
  });

  return { order, redirectUrl: result.redirectUrl };
}

/**
 * Verify + fulfill an order (idempotent). Called from the IPN webhook and the
 * checkout callback. On success it marks the order paid and returns immediately
 * so the confirmation page renders fast; the slower delivery work (download
 * bumps, signed links, receipt email) is scheduled with `after()` to run once
 * the response has been sent. The pending→paid flip happens before either
 * caller returns, so the status guard above keeps delivery exactly-once.
 */
export async function fulfillByMerchantRef(ref: string): Promise<Order | null> {
  const repo = await getRepo();
  const order = await repo.getOrderByMerchantRef(ref);
  if (!order) return null;
  if (order.status === "paid") return order; // already fulfilled

  const tracking = order.pesapalTrackingId ?? `mock_${ref}`;
  const status = await getTransactionStatus(tracking);

  if (status !== "completed") {
    if (status === "failed" || status === "invalid") {
      await repo.updateOrder(order.id, { status: "failed" });
    }
    return repo.getOrder(order.id);
  }

  const paid = await repo.updateOrder(order.id, {
    status: "paid",
    paidAt: new Date().toISOString(),
  });
  const fulfilled = paid ?? order;

  // Don't make the buyer wait on Cloudinary signing + the Resend email — the
  // on-page download buttons work without them. Deliver after the response.
  after(() => deliverOrder(fulfilled));

  return fulfilled;
}

/**
 * Post-payment side effects: bump download counts, generate signed links and
 * email the receipt. Runs off the response path; failures are logged, never
 * surfaced (the order is already paid and downloads remain available on-page).
 */
async function deliverOrder(order: Order): Promise<void> {
  try {
    const repo = await getRepo();
    const wallpapers = await repo.getWallpapersByIds(
      order.items.map((i) => i.wallpaperId),
    );

    // Bump downloads + build signed links in parallel.
    const links = (
      await Promise.all(
        wallpapers.map(async (w) => {
          await repo.incrementDownloads(w.id);
          try {
            return { title: w.title, url: await signedDownloadUrl(w) };
          } catch (err) {
            // One missing original must NOT block the receipt or the other
            // downloads. The buyer can recover via the order page (admin can
            // re-upload; the link regenerates on next click).
            console.error(`Delivery link skipped for ${w.id}:`, err);
            return null;
          }
        }),
      )
    ).filter((l): l is { title: string; url: string } => l !== null);

    await sendReceiptAndDownloads(order, links);
  } catch (err) {
    console.error(`Order delivery failed for ${order.id}:`, err);
  }
}
