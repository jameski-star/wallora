"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "./ui";
import { useCart } from "./cart";
import { beginCheckout } from "@/app/checkout/actions";
import { formatPrice } from "@/lib/utils";

export function CheckoutClient({ defaultEmail }: { defaultEmail: string }) {
  const cart = useCart();
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setBusy(true);
    const res = await beginCheckout(
      email,
      cart.lines.map((l) => l.wallpaperId),
    );
    if (res.ok) {
      // Hand off to the PesaPal hosted page (or the demo simulator).
      window.location.assign(res.redirectUrl);
    } else {
      setError(res.error);
      setBusy(false);
    }
  }

  if (cart.count === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface/50 py-16 text-center">
        <p className="text-lg font-medium">Nothing to check out</p>
        <Link href="/wallpapers" className="mt-2 inline-block text-accent hover:underline">
          Browse wallpapers
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email for your receipt</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent/60"
          />
        </label>
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <Button onClick={pay} size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
          Pay {formatPrice(cart.totalCents)} with PesaPal
        </Button>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck size={14} /> Payments processed securely by PesaPal (Mobile Money & Card).
        </p>
      </div>

      <aside className="h-fit rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 divide-y divide-border">
          {cart.lines.map((l) => (
            <li key={l.wallpaperId} className="flex justify-between gap-3 py-2 text-sm">
              <span className="truncate">{l.title}</span>
              <span className="shrink-0 font-medium">{formatPrice(l.priceCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPrice(cart.totalCents)}</span>
        </div>
      </aside>
    </div>
  );
}

/** Clears the cart once a purchase is confirmed. */
export function ClearCartOnMount() {
  const cart = useCart();
  useEffect(() => {
    cart.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
