"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, Link2, Loader2, Share2 } from "lucide-react";
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
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Cache the fetched image File so a hover/focus prefetch keeps the tap's
  // "transient activation" alive — navigator.share with files must fire from a
  // user gesture, and an in-handler fetch can otherwise outlive it on iOS.
  const fileRef = useRef<File | null>(null);

  // Derived on the client so we can read the real origin for an absolute URL.
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/wallpapers/${slug}`
      : `/wallpapers/${slug}`;
  const text = `${title} — free ${device} wallpaper in 4K & HD. Download free on ${SITE_NAME}.`;
  // Caption used when sharing the image file: some targets (e.g. WhatsApp)
  // attach the file and drop the separate `url`, so we fold the link into the
  // text to guarantee the follow-up link travels with the post / status.
  const captionWithLink = `${text}\n${url}`;

  /** Fetch the preview image and wrap it as a File for the Web Share API.
   *  Returns null on CORS / network failure so callers can fall back to a
   *  link-only share. Result is memoised in `fileRef`. */
  async function getImageFile(): Promise<File | null> {
    if (fileRef.current) return fileRef.current;
    if (!image) return null;
    try {
      const res = await fetch(image, { mode: "cors" });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) return null;
      const ext = blob.type.split("/")[1]?.split("+")[0] || "jpg";
      const file = new File([blob], `${slug}.${ext}`, { type: blob.type });
      fileRef.current = file;
      return file;
    } catch {
      return null;
    }
  }

  // Warm the image cache on hover/focus so the share fires instantly on tap.
  function prefetch() {
    if (image && !fileRef.current) void getImageFile();
  }

  async function onShare() {
    // Prefer the native share sheet when present.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        // Try to include the actual wallpaper so it shows in the post / status.
        setBusy(true);
        const file = await getImageFile();
        setBusy(false);
        if (file && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title, text: captionWithLink });
        } else {
          await navigator.share({ title, text, url });
        }
        return;
      } catch {
        // Cancelled or unsupported payload — fall through to the menu.
        setBusy(false);
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
        onPointerEnter={prefetch}
        onFocus={prefetch}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-busy={busy}
        aria-label={`Share ${title}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-1.5 text-sm text-muted transition hover:text-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />} Share
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
          {image && (
            <a
              href={image}
              download={`${slug}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition hover:bg-surface-2"
            >
              <Download size={15} /> Save image
            </a>
          )}
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
