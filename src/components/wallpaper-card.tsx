"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Check, Download, Lock, Plus } from "lucide-react";
import { ProtectedImage } from "./protected-image";
import { LiveThumb } from "./live-thumb";
import { useCart } from "./cart";
import { useFormatPrice } from "./currency";
import { DeviceMockup } from "./device-mockup";
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
  /** "live" renders the looping preview; defaults to a static image. */
  kind?: "image" | "live";
  /** Loop URL for live wallpapers. */
  videoSrc?: string;
}

export function WallpaperCard({ w }: { w: CardWallpaper }) {
  const cart = useCart();
  const inCart = cart.has(w.id);
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

  const showMockup = isHovered && (w.device === "phone" || w.device === "tablet");
  const isDesktopDevice = w.device !== "phone" && w.device !== "tablet";

  return (
    <motion.article
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative w-full overflow-hidden rounded-card border border-border bg-surface transition-colors duration-200 hover:border-accent/40 [perspective:800px]"
      style={{ aspectRatio }}
    >
      <Link 
        href={`/wallpapers/${w.slug}`} 
        onClick={handleClick} 
        className="relative block h-full w-full"
        aria-label={w.title}
      >
        {/* Base wallpaper view with 3D perspective animation for desktop */}
        <motion.div
          className="h-full w-full"
          animate={
            isHovered && isDesktopDevice
              ? {
                  rotateY: 8,
                  rotateX: -6,
                  scale: 1.03,
                  z: 10,
                }
              : { rotateY: 0, rotateX: 0, scale: 1, z: 0 }
          }
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {isLive ? (
            <LiveThumb
              videoSrc={w.videoSrc!}
              poster={w.previewSrc}
              alt={`${w.title} — live ${w.device} wallpaper`}
              width={w.width}
              height={w.height}
            />
          ) : (
            <ProtectedImage
              src={w.previewSrc}
              alt={`${w.title} — ${w.device} wallpaper`}
              width={w.width}
              height={w.height}
              placeholder={w.placeholder}
              className="h-full w-full object-cover"
            />
          )}
        </motion.div>

        {/* Mockup transition overlay for phone and tablet */}
        <AnimatePresence>
          {showMockup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex h-full w-full items-center justify-center"
              >
                <DeviceMockup
                  device={w.device}
                  src={w.previewSrc}
                  alt={w.title}
                  className={w.device === "phone" ? "max-h-[85%] max-w-[85%]" : "max-h-[90%] max-w-[90%]"}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Top-left badges - show only on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute left-3 top-3 z-30 flex gap-2"
          >
            {isLive && <LiveBadge />}
            {w.isMature && <Pill className="bg-black/55 text-white">18+</Pill>}
            {!w.isPremium && <Pill className="bg-black/55 text-white">Free</Pill>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock icon for premium - show only on hover */}
      <AnimatePresence>
        {isHovered && w.isPremium && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute right-3 top-3 z-30 grid size-7 place-items-center rounded-full bg-black/50 text-white backdrop-blur border border-white/10"
          >
            <Lock size={13} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Glassmorphic Details Overlay Panel - show only on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex flex-col gap-2 rounded-xl border border-white/10 bg-black/60 p-3 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{w.title}</p>
                <p className="truncate text-xs capitalize text-white/70">
                  {w.categorySlug} · {w.device}
                </p>
              </div>
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
                  className="pointer-events-auto flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold tabular-nums text-black transition hover:bg-white/90"
                >
                  {inCart ? <Check size={14} /> : <Plus size={14} />}
                  {formatPrice(w.priceCents)}
                </button>
              ) : (
                <Link
                  href={`/wallpapers/${w.slug}`}
                  className="pointer-events-auto flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-black transition hover:bg-white/90"
                >
                  <Download size={14} /> Free
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur ${className}`}
    >
      {children}
    </span>
  );
}

function LiveBadge() {
  return (
    <Pill className="bg-black/55 text-white">
      <span className="relative grid size-2 place-items-center">
        <span className="absolute size-2 animate-ping rounded-full bg-accent opacity-75" />
        <span className="size-1.5 rounded-full bg-accent" />
      </span>
      Live
    </Pill>
  );
}
