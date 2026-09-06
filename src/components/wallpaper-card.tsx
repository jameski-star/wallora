"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check, Download, Lock, Plus } from "lucide-react";
import { ProtectedImage } from "./protected-image";
import { LiveThumb } from "./live-thumb";
import { useCart } from "./cart";
import { useFormatPrice } from "./currency";
import { useState, useRef, useEffect } from "react";

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
}

export function WallpaperCard({ w }: { w: CardWallpaper }) {
  const cart = useCart();
  const inCart = cart.hydrated && cart.has(w.id);
  const isLive = w.kind === "live" && !!w.videoSrc;
  const formatPrice = useFormatPrice();

  const [isHovered, setIsHovered] = useState(false);
  const isTouchRef = useRef(false);
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseEnter = () => {
    if (!isTouchRef.current) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchRef.current) {
      setIsHovered(false);
    }
  };

  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isTouchRef.current) {
      if (!isHovered) {
        e.preventDefault();
        setIsHovered(true);
      }
    }
  };

  useEffect(() => {
    if (!isHovered) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsHovered(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isHovered]);

  const aspectRatio = w.width && w.height 
    ? `${w.width} / ${w.height}` 
    : (w.device === "phone" ? "9 / 16" : "16 / 9");

  return (
    <motion.article
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      className="group relative w-full overflow-hidden rounded-none border border-white/10 bg-black transition-all duration-300 hover:border-accent/80 hover:shadow-2xl cursor-pointer"
      style={{ aspectRatio }}
    >
      <Link 
        href={`/wallpapers/${w.slug}`} 
        onClick={handleClick} 
        className="relative block h-full w-full overflow-hidden"
        aria-label={w.title}
      >
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
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
      </Link>

      {/* Top badges: PRO on premium, LIVE on motion, 18+ on mature */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex gap-1.5">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-accent/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent shadow-lg">
            <span className="size-1.5 rounded-full bg-accent animate-pulse" />
            LIVE
          </span>
        )}
        {w.isMature && (
          <span className="inline-flex items-center bg-black/75 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-mono font-bold text-white/70 uppercase shadow-lg">
            18+
          </span>
        )}
      </div>

      {w.isPremium && (
        <span className="pointer-events-none absolute right-3 top-3 z-20 inline-flex items-center gap-1 bg-black/80 backdrop-blur-md border border-accent/40 px-2.5 py-0.5 text-[10px] font-bold text-accent shadow-lg tracking-wider">
          <Lock size={10} />
          PRO
        </span>
      )}

      {/* Floating details only on hover with subtle bottom scrim */}
      <div className="absolute inset-x-0 bottom-0 z-20 pt-8 pb-3.5 px-3.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
        <div className="w-8 h-1 bg-accent mb-2" />

        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-white tracking-wider uppercase drop-shadow-md">
              {w.title}
            </h3>
            <p className="truncate text-[11px] font-mono uppercase text-white/70">
              {w.categorySlug} · {w.device}
            </p>
          </div>

          <div className="shrink-0">
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
                className="flex cursor-pointer items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90 transition-colors shadow-lg"
              >
                {inCart ? <Check size={13} /> : <Plus size={13} />}
                {formatPrice(w.priceCents)}
              </button>
            ) : (
              <Link
                href={`/wallpapers/${w.slug}`}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
              >
                <Download size={13} /> 4K
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
