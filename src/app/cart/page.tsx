"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Container, Button, ButtonLink } from "@/components/ui";
import { useCart } from "@/components/cart";
import { useFormatPrice } from "@/components/currency";

// How many lines to show before the "View more" button, and how many more
// each click reveals. Keeps long carts from scrolling past the viewport.
const PAGE_SIZE = 6;

export default function CartPage() {
  const cart = useCart();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const formatPrice = useFormatPrice();

  // slice() tolerates a `visible` larger than the list, so removing items just
  // shows fewer rows without needing to reset the window.
  const shown = cart.lines.slice(0, visible);
  const remaining = cart.count - shown.length;

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Your cart</h1>

      {cart.count === 0 ? (
        <div className="grid place-items-center rounded-card border border-dashed border-border bg-surface/50 px-4 py-20 text-center">
          <ShoppingBag className="mb-3 text-muted" size={40} />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">Add some wallpapers to get started.</p>
          <ButtonLink href="/wallpapers" className="mt-5">Browse wallpapers</ButtonLink>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-8">
          <div className="min-w-0">
            <ul className="space-y-3">
              {shown.map((l) => (
                <li
                  key={l.wallpaperId}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 sm:gap-4"
                >
                  <Link
                    href={`/wallpapers/${l.slug}`}
                    className="relative size-16 shrink-0 overflow-hidden rounded-lg sm:size-20"
                  >
                    <Image src={l.previewUrl} alt={l.title} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/wallpapers/${l.slug}`}
                      className="block truncate font-medium hover:text-accent"
                    >
                      {l.title}
                    </Link>
                    <p className="text-xs capitalize text-muted">{l.device}</p>
                    <span className="mt-0.5 block font-semibold sm:hidden">
                      {formatPrice(l.priceCents)}
                    </span>
                  </div>
                  <span className="hidden font-semibold sm:inline">{formatPrice(l.priceCents)}</span>
                  <button
                    onClick={() => cart.remove(l.wallpaperId)}
                    aria-label="Remove"
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            {remaining > 0 && (
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                View more ({remaining})
              </Button>
            )}
          </div>

          <aside className="h-fit rounded-card border border-border bg-surface p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Items</dt>
                <dd>{cart.count}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(cart.totalCents)}</dd>
              </div>
            </dl>
            <ButtonLink href="/checkout" size="lg" className="mt-5 w-full">
              Checkout <ArrowRight size={18} />
            </ButtonLink>
            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => cart.clear()}>
              Clear cart
            </Button>
          </aside>
        </div>
      )}
    </Container>
  );
}
