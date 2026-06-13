import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import { Container, ButtonLink } from "@/components/ui";
import { getRepo } from "@/lib/repo";
import { getViewer } from "@/lib/auth";
import { fulfillByMerchantRef } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

/**
 * Bookmarkable receipt + downloads for a single order. Authorized by capability:
 * the order id (path) plus its PesaPal merchant reference as `?token=`. Anyone
 * with this link can re-download while the order exists — no account needed.
 * Revisiting re-verifies payment, so a link saved while "processing" starts
 * working once PesaPal confirms.
 */
export default async function OrderReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; t?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const token = sp.token ?? sp.t ?? "";

  const repo = await getRepo();
  let order = await repo.getOrder(id);

  // Valid only if the order exists and the token matches its merchant reference.
  const authorized = Boolean(order && token && order.pesapalMerchantRef === token);

  // If authorized but not yet paid, re-check with PesaPal (idempotent).
  if (authorized && order && order.status !== "paid") {
    await fulfillByMerchantRef(order.pesapalMerchantRef);
    order = await repo.getOrder(id);
  }

  if (!authorized || !order) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center">
          <XCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h1 className="text-2xl font-bold">Order not found</h1>
          <p className="mt-2 text-muted">
            This link is invalid or has expired. Check that you copied the full
            address, including the token.
          </p>
          <ButtonLink href="/wallpapers" variant="secondary" className="mt-6">
            Browse wallpapers
          </ButtonLink>
        </div>
      </Container>
    );
  }

  const viewer = await getViewer();
  const purchasedOn = new Date(order.createdAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (order.status !== "paid") {
    const failed = order.status === "failed" || order.status === "cancelled";
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center">
          {failed ? (
            <XCircle className="mx-auto mb-4 text-red-400" size={48} />
          ) : (
            <Clock className="mx-auto mb-4 text-amber-400" size={48} />
          )}
          <h1 className="text-2xl font-bold">
            {failed ? "Payment not completed" : "Payment processing"}
          </h1>
          <p className="mt-2 text-muted">
            {failed
              ? "This order was not paid. You can try again from your cart."
              : "We're still confirming this payment. Refresh this page in a moment."}
          </p>
          <ButtonLink
            href={failed ? "/cart" : `/orders/${order.id}?token=${encodeURIComponent(token)}`}
            variant="secondary"
            className="mt-6"
          >
            {failed ? "Back to cart" : "Refresh status"}
          </ButtonLink>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-lg rounded-card border border-border bg-surface p-8">
        <CheckCircle2 className="mb-4 text-emerald-400" size={40} />
        <h1 className="text-2xl font-bold">Your downloads</h1>
        <p className="mt-1 text-sm text-muted">
          Order {order.id.slice(0, 12)} · {purchasedOn} ·{" "}
          {formatPrice(order.totalCents, order.currency)}
        </p>

        <ul className="mt-6 divide-y divide-border">
          {order.items.map((it) => (
            <li
              key={it.wallpaperId}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
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
          ))}
        </ul>

        <div className="mt-6 rounded-lg border border-border bg-surface-2/40 p-4 text-sm text-muted">
          {viewer.profile ? (
            <>
              Also saved to your account —{" "}
              <Link href="/account" className="text-accent hover:underline">
                My downloads
              </Link>
              .
            </>
          ) : (
            <>
              <strong className="text-foreground">Bookmark this page</strong> to
              re-download anytime, or{" "}
              <Link
                href="/signup?next=/account"
                className="text-accent hover:underline"
              >
                create a free account
              </Link>{" "}
              with {order.email} to keep your purchases in one place.
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
