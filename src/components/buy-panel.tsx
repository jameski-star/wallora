"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "./ui";
import { useCart } from "./cart";
import { ShareButton } from "./share-button";
import { formatPrice } from "@/lib/utils";

export interface BuyTarget {
  id: string;
  slug: string;
  title: string;
  device: string;
  priceCents: number;
  isPremium: boolean;
  previewSrc: string;
}

export function BuyPanel({ w }: { w: BuyTarget }) {
  const cart = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const inCart = cart.has(w.id);

  if (!w.isPremium) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-2xl font-bold text-emerald-400">Free</span>
          <ShareButton
            slug={w.slug}
            title={w.title}
            device={w.device}
            image={w.previewSrc}
          />
        </div>
        <a
          href={`/api/download/free/${w.id}`}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-7 text-base font-semibold text-accent-foreground transition hover:opacity-90"
        >
          <Download size={18} /> Download free
        </a>
        <p className="text-xs text-muted">Free for personal use. No account required.</p>
      </div>
    );
  }

  function buyNow() {
    if (!inCart)
      cart.add({
        wallpaperId: w.id,
        slug: w.slug,
        title: w.title,
        priceCents: w.priceCents,
        previewUrl: w.previewSrc,
        device: w.device,
      });
    setBusy(true);
    router.push("/checkout");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{formatPrice(w.priceCents)}</span>
        <span className="text-sm text-muted">one-time · original resolution</span>
      </div>

      <Button onClick={buyNow} size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" size={18} /> : <ShoppingBag size={18} />}
        Buy now
      </Button>

      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() =>
          inCart
            ? cart.remove(w.id)
            : cart.add({
                wallpaperId: w.id,
                slug: w.slug,
                title: w.title,
                priceCents: w.priceCents,
                previewUrl: w.previewSrc,
                device: w.device,
              })
        }
      >
        {inCart ? <Check size={18} /> : null}
        {inCart ? "In cart" : "Add to cart"}
      </Button>

      <p className="text-xs text-muted">
        Secure checkout via PesaPal. Download link delivered by email and in your account.
      </p>
    </div>
  );
}
