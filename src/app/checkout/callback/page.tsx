import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import { Container, ButtonLink } from "@/components/ui";
import { ClearCartOnMount, EscapeIframe } from "@/components/checkout-client";
import { DeviceMockup } from "@/components/device-mockup";
import { fulfillByMerchantRef } from "@/lib/orders";
import { getWallpapersByIds } from "@/lib/catalog";
import { previewUrl } from "@/lib/cloudinary";
import { getViewer } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

/**
 * PesaPal redirects the buyer here after payment with OrderMerchantReference +
 * OrderTrackingId. We verify + fulfill (idempotent with the IPN webhook), then
 * deliver the downloads on-screen — no email or account required. Payment must
 * be confirmed (status "paid") before any link is shown.
 */
export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ OrderMerchantReference?: string; ref?: string }>;
}) {
  const sp = await searchParams;
  const ref = sp.OrderMerchantReference ?? sp.ref;

  const order = ref ? await fulfillByMerchantRef(ref) : null;
  const status: "paid" | "pending" | "failed" | "missing" = !order
    ? "missing"
    : order.status === "paid"
      ? "paid"
      : order.status === "failed"
        ? "failed"
        : "pending";

  const viewer = await getViewer();

  // For a paid order, resolve the purchased wallpapers so each line can render
  // inside its device mockup (preview + device aren't stored on OrderItem).
  const wallpapers =
    order && status === "paid"
      ? await getWallpapersByIds(order.items.map((i) => i.wallpaperId))
      : [];
  const byId = new Map(wallpapers.map((w) => [w.id, w]));

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-12">
      {/* If this page rendered inside the payment popup iframe, break out to
          the top window so the buyer sees the full confirmation page. */}
      <EscapeIframe />
      <div className="w-full max-w-lg rounded-card border border-border bg-surface p-8 text-center">
        {status === "paid" && order && (
          <>
            <ClearCartOnMount />
            <CheckCircle2 className="mx-auto mb-4 text-emerald-400" size={48} />
            <h1 className="text-2xl font-bold">Payment confirmed</h1>
            <p className="mt-2 text-muted">
              Your wallpapers are ready — download them below.
            </p>

            <ul className="mt-6 divide-y divide-border text-left">
              {order.items.map((it) => {
                const w = byId.get(it.wallpaperId);
                return (
                  <li
                    key={it.wallpaperId}
                    className="flex items-center gap-3 py-3"
                  >
                    {w && (
                      <div className="w-16 shrink-0">
                        <DeviceMockup
                          device={w.device}
                          src={previewUrl(w, { width: 400 })}
                          alt={it.title}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{it.title}</p>
                      <p className="text-xs text-muted">
                        {formatPrice(it.priceCents, order.currency)}
                      </p>
                    </div>
                    <a
                      href={`/api/download/receipt/${order.id}?wp=${it.wallpaperId}&t=${encodeURIComponent(order.pesapalMerchantRef)}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      <Download size={15} /> Download
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 rounded-lg border border-border bg-surface-2/40 p-4 text-sm text-muted">
              {viewer.profile ? (
                <>
                  Saved to your account — re-download anytime from{" "}
                  <Link href="/account" className="text-accent hover:underline">
                    My downloads
                  </Link>
                  .
                </>
              ) : (
                <>
                  <strong className="text-foreground">
                    Bookmark your downloads page
                  </strong>{" "}
                  to come back and re-download anytime:{" "}
                  <Link
                    href={`/orders/${order.id}?token=${encodeURIComponent(order.pesapalMerchantRef)}`}
                    className="text-accent hover:underline"
                  >
                    save this link
                  </Link>
                  . Or{" "}
                  <Link
                    href="/signup?next=/account"
                    className="text-accent hover:underline"
                  >
                    create a free account
                  </Link>{" "}
                  with {order.email} to keep everything in one place.
                </>
              )}
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            {/* An order exists and the buyer already went through PesaPal — clear
                the cart so the same wallpaper isn't left "awaiting another
                payment" (which previously let the buyer pay twice). */}
            <ClearCartOnMount />
            <Clock className="mx-auto mb-4 text-amber-400" size={48} />
            <h1 className="text-2xl font-bold">Payment processing</h1>
            <p className="mt-2 text-muted">
              We&apos;re confirming your payment with PesaPal. This can take a
              moment — refresh this page to check again.
            </p>
            {ref && (
              <ButtonLink
                href={`/checkout/callback?ref=${encodeURIComponent(ref)}`}
                variant="secondary"
                className="mt-6"
              >
                Refresh status
              </ButtonLink>
            )}
          </>
        )}

        {(status === "failed" || status === "missing") && (
          <>
            <XCircle className="mx-auto mb-4 text-red-400" size={48} />
            <h1 className="text-2xl font-bold">Payment not completed</h1>
            <p className="mt-2 text-muted">
              Something went wrong and you have not been charged for a completed
              order. You can try again from your cart.
            </p>
            <ButtonLink href="/cart" variant="secondary" className="mt-6">
              Back to cart
            </ButtonLink>
          </>
        )}

        <p className="mt-6 text-xs text-muted">
          Need help?{" "}
          <Link href="/" className="text-accent hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </Container>
  );
}
