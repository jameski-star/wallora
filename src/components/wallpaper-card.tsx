"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Maximize2,
  Download,
  Lock,
  Plus,
  Check,
  Heart,
  ExternalLink,
  Share2,
} from "lucide-react";
import { ProtectedImage } from "./protected-image";
import { LiveThumb } from "./live-thumb";
import { useCart } from "./cart";
import { useFavorites } from "./favorites";
import { useFormatPrice } from "./currency";
import { useGalleryPreview } from "./gallery-preview-modal";

export interface CardWallpaper {
  id: string;
  slug: string;
  title: string;
  device: string;
  categorySlug: string;
  width: number;
  height: number;
  priceCents: number;
  isPremium: boolean;
  isMature: boolean;
  previewSrc: string;
  placeholder?: string;
  kind?: "image" | "live";
  videoSrc?: string;
  resolution?: string;
}

export function WallpaperCard({ w }: { w: CardWallpaper }) {
  const cart = useCart();
  const favorites = useFavorites();
  const formatPrice = useFormatPrice();
  const { openPreview } = useGalleryPreview();

  const inCart = cart.hydrated && cart.has(w.id);
  const isSaved = favorites.isSaved(w.id);
  const isLive = w.kind === "live" && !!w.videoSrc;

  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef(false);

  // Close 3-dot dropdown on click outside or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/wallpapers/${w.slug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const aspectRatio =
    w.width && w.height
      ? `${w.width} / ${w.height}`
      : w.device === "phone"
        ? "9 / 16"
        : w.device === "tablet"
          ? "3 / 4"
          : "16 / 9";

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => {
        if (!isTouchRef.current) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (!isTouchRef.current) {
          setIsHovered(false);
          setMenuOpen(false);
        }
      }}
      onTouchStart={() => {
        isTouchRef.current = true;
      }}
      className={`group relative flex w-full flex-col rounded-[14px] border border-white/[0.08] bg-[#0c213d]/90 p-2 sm:p-2.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-[#0e2544] hover:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.6),0_0_0_1px_rgba(227,233,53,0.2)] ${
        menuOpen ? "z-30" : "z-0"
      }`}
    >
      {/* ── Floating Canvas Image Area ───────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Preview ${w.title}`}
        onClick={() => openPreview(w)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPreview(w);
          }
        }}
        className="relative w-full cursor-pointer overflow-hidden rounded-[10px] bg-[#061528] select-none"
        style={{ aspectRatio }}
      >
        {/* Media (Image or Looping Live video) */}
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          {isLive ? (
            <LiveThumb
              videoSrc={w.videoSrc!}
              poster={w.previewSrc}
              alt={`${w.title} — live ${w.device} wallpaper`}
              width={w.width}
              height={w.height}
              active={isHovered}
              className="h-full w-full"
            />
          ) : (
            <ProtectedImage
              src={w.previewSrc}
              alt={`${w.title} — ${w.device} wallpaper`}
              width={w.width}
              height={w.height}
              placeholder={w.placeholder}
              fill
              fit="cover"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Top-left Badges (Understated indicators) */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-20 flex items-center gap-1.5">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-accent backdrop-blur-md shadow-md">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              LIVE
            </span>
          )}
          {w.isMature && (
            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/70 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase text-white/75 backdrop-blur-md shadow-md">
              18+
            </span>
          )}
        </div>

        {/* Top-right Quick Actions: Favorite & Pro Indicator */}
        <div className="absolute right-2.5 top-2.5 z-20 flex items-center gap-2">
          {w.isPremium && (
            <span className="pointer-events-none inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-black/80 px-2.5 py-1 text-[10px] font-bold tracking-wider text-accent backdrop-blur-md shadow-md">
              <Lock size={11} strokeWidth={2.5} />
              PRO
            </span>
          )}

          {/* Quick Save Heart (visible on hover, or permanently if saved) */}
          <button
            type="button"
            aria-label={isSaved ? `Remove ${w.title} from saved` : `Save ${w.title}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              favorites.toggleSave({ id: w.id, slug: w.slug, title: w.title });
            }}
            className={`flex size-8.5 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 shadow-md ${
              isSaved
                ? "border-accent bg-black/85 text-accent opacity-100 shadow-[0_0_12px_rgba(227,233,53,0.4)] scale-105"
                : "border-white/20 bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 hover:border-white/50 hover:bg-black/85 hover:text-white hover:scale-105"
            }`}
          >
            <Heart size={16} strokeWidth={2.2} className={isSaved ? "fill-accent text-accent" : ""} />
          </button>
        </div>

        {/* Soft Dark Hover Overlay with Action Pills (Desktop Hover) */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-3 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="pointer-events-auto flex items-center justify-between gap-2">
            {/* Quick Preview Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openPreview(w);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/30 bg-black/70 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-xl transition-all hover:border-white/50 hover:bg-black/90 hover:scale-105 active:scale-95"
            >
              <Maximize2 size={15} className="text-accent" />
              <span>Preview</span>
            </button>

            {/* Direct Download / Cart Button */}
            {w.isPremium ? (
              <button
                type="button"
                aria-label={inCart ? `Remove ${w.title} from cart` : `Add ${w.title} to cart`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  inCart
                    ? cart.remove(w.id)
                    : cart.add({
                        wallpaperId: w.id,
                        slug: w.slug,
                        title: w.title,
                        priceCents: w.priceCents,
                        previewUrl: w.previewSrc,
                        device: w.device,
                      });
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-accent/50 bg-accent px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#081d37] shadow-xl backdrop-blur-md transition-all hover:bg-accent/90 hover:scale-105 active:scale-95"
              >
                {inCart ? <Check size={15} strokeWidth={2.5} /> : <Plus size={15} strokeWidth={2.5} />}
                <span>{formatPrice(w.priceCents)}</span>
              </button>
            ) : (
              <a
                href={`/api/download/free/${w.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/30 bg-white/25 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-xl transition-all hover:bg-white/35 hover:scale-105 active:scale-95"
              >
                <Download size={15} />
                <span>4K</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Minimal Caption System ───────────────────────────────────────── */}
      <div className="relative mt-2 flex items-center justify-between gap-2 px-1 pb-0.5">
        <Link
          href={`/wallpapers/${w.slug}`}
          className="min-w-0 flex-1 truncate text-[12px] sm:text-[13px] font-medium tracking-tight text-white/90 transition-colors hover:text-accent"
          title={w.title}
        >
          {w.title}
        </Link>

        {/* Discreet Three-Dot Options Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label={`Options for ${w.title}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className={`flex size-8.5 cursor-pointer items-center justify-center rounded-full transition-all ${
              menuOpen
                ? "bg-white/20 text-white"
                : "text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <MoreHorizontal size={18} />
          </button>

          {/* Floating Dropdown Popover */}
          {menuOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 bottom-full z-40 mb-2 w-48 rounded-2xl border border-white/15 bg-[#0d233e]/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Quick Preview */}
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  openPreview(w);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Maximize2 size={16} className="text-accent" />
                <span>Quick Preview</span>
              </button>

              {/* View Details Page */}
              <Link
                href={`/wallpapers/${w.slug}`}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ExternalLink size={16} />
                <span>View Details</span>
              </Link>

              {/* Save to Favorites */}
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  favorites.toggleSave({ id: w.id, slug: w.slug, title: w.title });
                  setMenuOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Heart
                  size={16}
                  className={isSaved ? "fill-accent text-accent" : "text-white/60"}
                />
                <span>{isSaved ? "Remove Saved" : "Save Wallpaper"}</span>
              </button>

              {/* Download / Buy */}
              {w.isPremium ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    inCart
                      ? cart.remove(w.id)
                      : cart.add({
                          wallpaperId: w.id,
                          slug: w.slug,
                          title: w.title,
                          priceCents: w.priceCents,
                          previewUrl: w.previewSrc,
                          device: w.device,
                        });
                    setMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {inCart ? <Check size={16} className="text-accent" /> : <Plus size={16} />}
                  <span>{inCart ? "In Cart" : `Add (${formatPrice(w.priceCents)})`}</span>
                </button>
              ) : (
                <a
                  href={`/api/download/free/${w.id}`}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Download size={16} className="text-accent" />
                  <span>Download 4K</span>
                </a>
              )}

              <div className="my-1 border-t border-white/10" />

              {/* Copy Share Link */}
              <button
                type="button"
                role="menuitem"
                onClick={handleCopyLink}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                {copied ? (
                  <Check size={16} className="text-accent" />
                ) : (
                  <Share2 size={16} />
                )}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
