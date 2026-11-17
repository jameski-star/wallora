"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Download,
  ShoppingBag,
  Check,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Heart,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { StudioMockup } from "./studio-mockup";
import { useCart } from "./cart";
import { useFormatPrice } from "./currency";
import { useFavorites } from "./favorites";
import type { CardWallpaper } from "./wallpaper-card";

interface GalleryPreviewContextValue {
  openPreview: (w: CardWallpaper) => void;
  closePreview: () => void;
  activeWallpaper: CardWallpaper | null;
}

const GalleryPreviewContext = createContext<GalleryPreviewContextValue | null>(null);

export function GalleryPreviewProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<CardWallpaper | null>(null);

  const openPreview = useCallback((w: CardWallpaper) => {
    setActive(w);
  }, []);

  const closePreview = useCallback(() => {
    setActive(null);
  }, []);

  // Lock body scroll + close on Escape
  useEffect(() => {
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [active, closePreview]);

  return (
    <GalleryPreviewContext.Provider
      value={{ openPreview, closePreview, activeWallpaper: active }}
    >
      {children}
      <AnimatePresence>
        {active && <GalleryPreviewModal wallpaper={active} onClose={closePreview} />}
      </AnimatePresence>
    </GalleryPreviewContext.Provider>
  );
}

export function useGalleryPreview(): GalleryPreviewContextValue {
  const ctx = useContext(GalleryPreviewContext);
  if (!ctx) {
    return {
      openPreview: () => {},
      closePreview: () => {},
      activeWallpaper: null,
    };
  }
  return ctx;
}

function GalleryPreviewModal({
  wallpaper,
  onClose,
}: {
  wallpaper: CardWallpaper;
  onClose: () => void;
}) {
  const cart = useCart();
  const router = useRouter();
  const formatPrice = useFormatPrice();
  const favorites = useFavorites();
  const [busy, setBusy] = useState(false);

  const inCart = cart.has(wallpaper.id);
  const isSaved = favorites.isSaved(wallpaper.id);

  const line = {
    wallpaperId: wallpaper.id,
    slug: wallpaper.slug,
    title: wallpaper.title,
    priceCents: wallpaper.priceCents,
    previewUrl: wallpaper.previewSrc,
    device: wallpaper.device,
  };

  const buyNow = () => {
    if (!cart.has(wallpaper.id)) cart.add(line);
    setBusy(true);
    router.push("/checkout");
  };

  const resolutionText =
    wallpaper.resolution ||
    (wallpaper.width && wallpaper.height
      ? `${wallpaper.width} × ${wallpaper.height}`
      : "4K UHD");

  const DeviceIcon =
    wallpaper.device === "phone"
      ? Smartphone
      : wallpaper.device === "tablet"
        ? Tablet
        : Monitor;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${wallpaper.title} interactive preview`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0c223d]/95 p-4 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header Bar */}
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              Studio Preview
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono uppercase text-white/50">
              <DeviceIcon size={12} />
              {wallpaper.device} · {resolutionText}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Favorite Toggle */}
            <button
              type="button"
              aria-label={isSaved ? "Remove from saved" : "Save wallpaper"}
              onClick={() =>
                favorites.toggleSave({
                  id: wallpaper.id,
                  slug: wallpaper.slug,
                  title: wallpaper.title,
                })
              }
              className={`flex size-9 cursor-pointer items-center justify-center rounded-full border transition-all ${
                isSaved
                  ? "border-accent bg-accent/15 text-accent shadow-[0_0_12px_rgba(227,233,53,0.35)]"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white"
              }`}
            >
              <Heart size={16} className={isSaved ? "fill-accent text-accent" : ""} />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 shadow-lg transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Studio Realistic Mockup Render */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#07172b]">
          <StudioMockup
            device={wallpaper.device}
            src={wallpaper.previewSrc}
            alt={`${wallpaper.title} on a ${wallpaper.device}`}
            videoSrc={wallpaper.videoSrc}
            width={wallpaper.width}
            height={wallpaper.height}
            className="border-0"
          />
        </div>

        {/* Bottom Details & Actions Bar */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-lg sm:text-xl font-bold tracking-tight text-white">
              {wallpaper.title}
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span className="font-semibold text-accent">
                {wallpaper.isPremium ? formatPrice(wallpaper.priceCents) : "Free 4K"}
              </span>
              <span>·</span>
              <span className="capitalize">{wallpaper.categorySlug}</span>
              <span>·</span>
              <span className="font-mono text-white/50">{resolutionText}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Full Page Link */}
            <Link
              href={`/wallpapers/${wallpaper.slug}`}
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white/90 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <span>Full Details</span>
              <ExternalLink size={13} />
            </Link>

            {/* Download / Buy Actions */}
            {wallpaper.isPremium ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => (inCart ? cart.remove(wallpaper.id) : cart.add(line))}
                  className="inline-flex h-10 flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/20"
                >
                  {inCart ? <Check size={14} className="text-accent" /> : null}
                  {inCart ? "In Cart" : "Add to Cart"}
                </button>
                <button
                  type="button"
                  onClick={buyNow}
                  disabled={busy}
                  className="inline-flex h-10 flex-1 sm:flex-none cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-primary/90"
                >
                  {busy ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                  Buy Now
                </button>
              </div>
            ) : (
              <a
                href={`/api/download/free/${wallpaper.id}`}
                className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accent px-5 text-xs font-bold uppercase tracking-wider text-[#081d37] shadow-lg transition-all hover:brightness-105 active:scale-98"
              >
                <Download size={15} />
                Download 4K Free
              </a>
            )}
          </div>
        </div>

        {wallpaper.isPremium && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/45">
            <ShieldCheck size={13} className="shrink-0 text-accent" />
            Full original resolution with zero watermarks delivered immediately upon purchase.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
