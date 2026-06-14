"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export interface ShareTarget {
  slug: string;
  title: string;
  device: string;
  /** Optional preview image — used by image-first networks (Pinterest). */
  image?: string;
}

/**
 * Minimal share control for free wallpapers. Where the Web Share API exists
 * (mobile + some desktops) one tap opens the native share sheet — the user can
 * post straight to any social app. Elsewhere it falls back to a compact menu of
 * social links plus copy-link. The shared blurb is SEO-friendly — title, device
 * and brand — and always points at the canonical detail page so reshared posts
 * read well and link back here.
 */
export function ShareButton({ slug, title, device, image }: ShareTarget) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Derived on the client so we can read the real origin for an absolute URL.
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/wallpapers/${slug}`
      : `/wallpapers/${slug}`;
  const text = `${title} — free ${device} wallpaper in 4K & HD. Download free on ${SITE_NAME}.`;

  async function onShare() {
    // Prefer the native share sheet when present.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // Cancelled or unsupported payload — fall through to the menu.
      }
    }
    setOpen((v) => !v);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  // Dismiss the fallback menu on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const enc = encodeURIComponent;
  const targets = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    {
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${enc(url)}&media=${enc(image ?? "")}&description=${enc(text)}`,
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onShare}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Share ${title}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <Share2 size={15} /> Share
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg"
        >
          {targets.map((t) => (
            <a
              key={t.label}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-foreground transition hover:bg-surface-2"
            >
              {t.label}
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition hover:bg-surface-2"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Link2 size={15} />}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
