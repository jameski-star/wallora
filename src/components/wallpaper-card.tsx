"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check, Download, Lock, Plus } from "lucide-react";
import { ProtectedImage } from "./protected-image";
import { LiveThumb } from "./live-thumb";
import { useCart } from "./cart";
import { formatPrice } from "@/lib/utils";

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

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group relative overflow-hidden rounded-card border border-border bg-surface transition-colors duration-200 hover:border-accent/40"
    >
      <Link href={`/wallpapers/${w.slug}`} className="block" aria-label={w.title}>
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
          />
        )}
      </Link>

      {/* Top-left badges */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex gap-2">
        {isLive && <LiveBadge />}
        {w.isMature && <Pill className="bg-black/55 text-white">18+</Pill>}
        {!w.isPremium && <Pill className="bg-black/55 text-white">Free</Pill>}
      </div>

      {/* Bottom overlay — title + action, deepens on hover */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-3 pt-12 opacity-90 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{w.title}</p>
            <p className="truncate text-xs capitalize text-white/65">
              {w.categorySlug} · {w.device}
            </p>
          </div>
          {w.isPremium ? (
            <button
              type="button"
              aria-label={inCart ? `Remove ${w.title} from cart` : `Add ${w.title} to cart`}
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
      </div>

      {w.isPremium && (
        <span className="pointer-events-none absolute right-3 top-3 z-20 grid size-7 place-items-center rounded-full bg-black/50 text-white backdrop-blur">
          <Lock size={13} />
        </span>
      )}
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
