import "server-only";
import { randomUUID } from "node:crypto";
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
 * checkout callback. On success: mark paid, bump download counts, generate
 * signed links, email the receipt + downloads.
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

  // Bump downloads + build signed links.
  const wallpapers = await repo.getWallpapersByIds(
    order.items.map((i) => i.wallpaperId),
  );
  const links: { title: string; url: string }[] = [];
  for (const w of wallpapers) {
    await repo.incrementDownloads(w.id);
    try {
      links.push({ title: w.title, url: await signedDownloadUrl(w) });
    } catch (err) {
      // The order is already paid; one missing original must NOT block the
      // receipt or the other downloads. Log it and let the buyer recover via
      // the order page (admin can re-upload, link regenerates on next click).
      console.error(`Delivery link skipped for ${w.id}:`, err);
    }
  }

  await sendReceiptAndDownloads(paid ?? order, links);
  return paid ?? order;
}
