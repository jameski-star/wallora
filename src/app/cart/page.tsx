"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Container, Button, ButtonLink } from "@/components/ui";
import { useCart } from "@/components/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const cart = useCart();

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Your cart</h1>

      {cart.count === 0 ? (
        <div className="grid place-items-center rounded-card border border-dashed border-border bg-surface/50 py-20 text-center">
          <ShoppingBag className="mb-3 text-muted" size={40} />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">Add some wallpapers to get started.</p>
          <ButtonLink href="/wallpapers" className="mt-5">Browse wallpapers</ButtonLink>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <ul className="space-y-3">
            {cart.lines.map((l) => (
              <li
                key={l.wallpaperId}
                className="flex items-center gap-4 rounded-card border border-border bg-surface p-3"
              >
                <Link href={`/wallpapers/${l.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={l.previewUrl} alt={l.title} fill sizes="80px" className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/wallpapers/${l.slug}`} className="truncate font-medium hover:text-accent">
                    {l.title}
                  </Link>
                  <p className="text-xs capitalize text-muted">{l.device}</p>
                </div>
                <span className="font-semibold">{formatPrice(l.priceCents)}</span>
                <button
                  onClick={() => cart.remove(l.wallpaperId)}
                  aria-label="Remove"
                  className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-card border border-border bg-surface p-6">
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
