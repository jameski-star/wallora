"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { Button } from "./ui";
import { useCart } from "./cart";
import { DeviceMockup } from "./device-mockup";
import { beginCheckout } from "@/app/checkout/actions";
import { useFormatPrice } from "./currency";

export function CheckoutClient({ defaultEmail }: { defaultEmail: string }) {
  const cart = useCart();
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // This single hook now handles localizing the display string everywhere
  const formatPrice = useFormatPrice();
  
  const [payUrl, setPayUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!payUrl) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [payUrl]);

  async function pay() {
    setError(null);
    setBusy(true);
    const res = await beginCheckout(
      email,
      cart.lines.map((l) => l.wallpaperId),
    );
    if (res.ok) {
      setPayUrl(res.redirectUrl);
      setBusy(false);
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
          {/* Button now correctly uses dynamic formatPrice */}
          Pay {formatPrice(cart.totalCents)} with PesaPal
        </Button>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck size={14} /> Payments processed securely by PesaPal (Mobile Money & Card).
        </p>
      </div>

      <aside className="h-fit rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-4">
          {cart.lines.map((l) => (
            <li key={l.wallpaperId} className="flex items-center gap-4">
              <div className="w-24 shrink-0">
                <DeviceMockup device={l.device} src={l.previewUrl} alt={l.title} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.title}</p>
                <p className="text-xs capitalize text-muted">{l.device}</p>
              </div>
              <span className="shrink-0 text-sm font-medium">{formatPrice(l.priceCents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-3 font-semibold">
          <span>Total</span>
          <span>{formatPrice(cart.totalCents)}</span>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck size={14} className="shrink-0 text-emerald-400" />
          Downloads are full-resolution and 100% watermark-free.
        </p>
      </aside>

      {payUrl && (
        <PaymentModal url={payUrl} onClose={() => setPayUrl(null)} />
      )}
    </div>
  );
}

function PaymentModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Complete your payment"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[640px] max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-card border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Lock size={14} /> Complete your payment
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment window"
            className="rounded-lg p-1 text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <iframe
          src={url}
          title="PesaPal secure payment"
          className="h-full w-full flex-1 bg-white"
          allow="payment"
        />
      </div>
    </div>
  );
}

export function EscapeIframe() {
  useEffect(() => {
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = window.location.href;
      }
    } catch {
      // Ignore
    }
  }, []);
  return null;
}

export function ClearCartOnMount() {
  const cart = useCart();
  useEffect(() => {
    cart.clear();
  }, []);
  return null;
}