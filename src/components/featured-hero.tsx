"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ProtectedImage } from "./protected-image";
import Image from "next/image";
import { BentMockup } from "./bent-mockup";
import { CosineWaveNet } from "./cosine-net";

interface FeaturedWallpaperItem {
  slug: string;
  title: string;
  caption: string;
  description: string;
  previewSrc: string;
  width: number;
  height: number;
  device?: string;
  targetDevice?: "mobile" | "desktop";
  videoSrc?: string | null;
  isPremium?: boolean;
  category?: string;
}

const FALLBACK_WALLPAPERS: FeaturedWallpaperItem[] = [
  {
    slug: "cyberpunk-neon-street",
    title: "Cyberpunk Neon Street",
    caption: "Wallpaper of the Day",
    description: "A rain-slicked city alley illuminated by futuristic holographic advertisements and neon signs.",
    previewSrc: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=800&auto=format&fit=crop",
    width: 3840,
    height: 2160,
    device: "desktop",
    targetDevice: "desktop",
    videoSrc: null,
    isPremium: true,
    category: "Sci-Fi",
  },
  {
    slug: "minimalist-mountain-fog",
    title: "Minimalist Mountain Fog",
    caption: "Featured Drop",
    description: "Serene layers of misty forest mountains in deep slate blue tones. Perfect for minimalist setups.",
    previewSrc: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    width: 1440,
    height: 3120,
    device: "phone",
    targetDevice: "mobile",
    videoSrc: null,
    isPremium: false,
    category: "Nature",
  },
  {
    slug: "abstract-liquid-glass",
    title: "Abstract Liquid Glass",
    caption: "Trending Live",
    description: "Flowing iridescent glass waves that play with light reflections. Modern glassmorphism art.",
    previewSrc: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    width: 3840,
    height: 2400,
    device: "desktop",
    targetDevice: "desktop",
    videoSrc: null,
    isPremium: true,
    category: "Abstract",
  },
  {
    slug: "lofi-cozy-room",
    title: "Cozy Lo-Fi Study Room",
    caption: "Wallpaper of the Week",
    description: "Relaxing late-night pixel-art scene with a rainy window, a sleeping cat, and coffee.",
    previewSrc: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
    width: 1080,
    height: 2400,
    device: "phone",
    targetDevice: "mobile",
    videoSrc: null,
    isPremium: false,
    category: "Anime",
  }
];

const DATA_BAR_HEIGHTS = [14, 19, 9, 21, 12, 17, 24, 10, 20, 15, 23, 16];

export function FeaturedHero({
  wallpapers,
  slug,
  title,
  caption,
  description,
  previewSrc,
  width,
  height,
  device = "desktop",
  videoSrc,
  isPremium = false,
  category,
  priority = false,
}: {
  wallpapers?: FeaturedWallpaperItem[];
  slug?: string;
  title?: string;
  caption?: string;
  description?: string;
  previewSrc?: string;
  width?: number;
  height?: number;
  device?: string;
  videoSrc?: string | null;
  isPremium?: boolean;
  category?: string;
  priority?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const items: FeaturedWallpaperItem[] = (
    wallpapers && wallpapers.length > 0
      ? wallpapers
      : slug
      ? [
          {
            slug,
            title: title || "",
            caption: caption || "",
            description: description || "",
            previewSrc: previewSrc || "",
            width: width || 1920,
            height: height || 1080,
            device,
            videoSrc,
            isPremium,
            category,
          },
        ]
      : FALLBACK_WALLPAPERS
  ).map((item) => ({
    ...item,
    targetDevice:
      item.targetDevice ||
      (item.device === "phone" || item.device === "tablet" || item.device === "mobile"
        ? "mobile"
        : "desktop"),
  }));

  const currentItem = items[currentIndex];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  if (!currentItem) return null;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#081d37] pt-28 pb-16 md:pt-36 md:pb-24 border-b border-white/10">
      {/* CME Bokeh & Ambient Cyan Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen scale-105 transition-all duration-1000"
          style={{ 
            backgroundImage: `url('${currentItem.previewSrc}')`,
            filter: 'blur(40px) saturate(1.8)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081d37]/80 via-[#081d37]/70 to-[#081d37]" />

        {/* Parametric Cosine-Sine Math Net Background */}
        <CosineWaveNet
          amplitude={26}
          speed={0.0015}
          cols={44}
          rows={26}
          opacity={0.42}
          baseColor="0, 110, 182"
          peakColor="56, 189, 248"
          fadePreset="hero-spotlight"
        />
        
        {/* Right-aligned CME Visual Grid Accent */}
        <div className="absolute right-0 top-0 w-full lg:w-1/3 h-full opacity-25 hidden md:block">
          <div className="grid grid-cols-12 gap-2 h-full px-6">
            {DATA_BAR_HEIGHTS.map((barCount, i) => (
              <div key={i} className="flex flex-col justify-end gap-1 pb-16">
                {Array.from({ length: barCount }).map((_, j) => (
                  <div 
                    key={j} 
                    className="w-full h-1 bg-accent rounded-none"
                    style={{ opacity: (j + 1) / barCount }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Top Minimal Header: 90% Picture focus, minimal text */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-accent text-[11px] font-black tracking-[0.25em] uppercase flex items-center gap-2">
                <span className="size-2 bg-accent animate-pulse" />
                {currentItem.caption || "WALLPAPER OF THE DAY"}
              </span>
              <span className="text-white/30 text-xs">|</span>
              <span className="text-white/70 text-[11px] font-bold tracking-widest uppercase">
                {currentItem.category || "4K UHD"}
              </span>
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-tight"
            >
              Where digital art <span className="font-normal text-white">meets display perfection.</span>
            </motion.h1>
          </div>

          {/* Quick Action & Controls */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href={`/wallpapers/${currentItem.slug}`}
              className="px-6 py-3 bg-primary text-white font-bold tracking-widest text-xs uppercase hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/30"
            >
              GET 4K WALLPAPER
              <ArrowRight className="w-4 h-4" />
            </Link>

            {items.length > 1 && (
              <div className="flex items-center gap-1 bg-[#112b4a] border border-white/10 p-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono tracking-widest text-white/70 px-2">
                  {String(currentIndex + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── MASSIVE 90% PICTURE SHOWCASE STAGE ───────────────────────── */}
        <div className="relative w-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full min-h-[480px] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[620px] aspect-[16/10] md:aspect-[21/9] bg-[#112b4a] border border-white/10 shadow-2xl overflow-hidden group flex items-center justify-center lg:justify-end"
            >
              {currentItem.videoSrc ? (
                <video
                  ref={(el) => {
                    if (el) {
                      el.defaultMuted = true;
                      el.muted = true;
                      el.play().catch(() => {});
                    }
                  }}
                  src={currentItem.videoSrc}
                  poster={currentItem.previewSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                />
              ) : (
                <ProtectedImage
                  src={currentItem.previewSrc}
                  alt={currentItem.title}
                  width={currentItem.width || 1920}
                  height={currentItem.height || 1080}
                  fill
                  fit="cover"
                  sizes="(max-width: 1280px) 100vw, 1400px"
                  priority={priority}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              )}

              {/* Atmospheric subtle vignette for depth while keeping wallpaper 100% visible */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#081d37]/90 via-[#081d37]/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081d37] via-transparent to-black/30 pointer-events-none" />

              {/* Floating 3D Angled / Bent Device Mockup Stage */}
              <div className="relative z-20 w-full sm:w-auto px-4 sm:px-8 lg:pr-16 flex items-center justify-center lg:justify-end pb-16 lg:pb-0">
                <BentMockup
                  device={currentItem.device || currentItem.targetDevice}
                  src={currentItem.previewSrc}
                  alt={currentItem.title}
                  videoSrc={currentItem.videoSrc}
                  width={currentItem.width}
                  height={currentItem.height}
                  allowToggle={true}
                  priority={priority}
                  className="scale-90 sm:scale-95 lg:scale-100 origin-center lg:origin-right"
                />
              </div>

              {/* Minimal floating overlay badges */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <span className="px-3 py-1 bg-[#112b4a]/90 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-white tracking-wider uppercase">
                  {currentItem.width} × {currentItem.height}
                </span>
                {currentItem.isPremium && (
                  <span className="px-3 py-1 backdrop-blur-md border text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5 bg-black/80 border-accent/40 text-accent font-black">
                    <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                    PRO 4K
                  </span>
                )}
              </div>

              {/* Bottom Image Overlay Strip with Title and Quick Details */}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-[#081d37] via-[#081d37]/80 to-transparent flex flex-col md:flex-row md:items-end justify-between gap-4 z-20 pointer-events-none">
                <div className="pointer-events-auto max-w-lg">
                  <div className="w-12 h-1 bg-accent mb-2" />
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide uppercase drop-shadow-md">
                    {currentItem.title}
                  </h2>
                  <p className="text-xs text-white/80 max-w-xl line-clamp-1 mt-1 font-medium">
                    {currentItem.description}
                  </p>
                </div>

                <Link
                  href={`/wallpapers/${currentItem.slug}`}
                  className="inline-flex items-center gap-2 text-accent font-bold tracking-widest text-xs uppercase hover:underline shrink-0 pointer-events-auto"
                >
                  FULL RESOLUTION PREVIEW <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── VISUAL THUMBNAIL STRIP (90% Picture Experience) ────────── */}
          {items.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {items.map((it, idx) => (
                <button
                  key={it.slug + idx}
                  type="button"
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={cn(
                    "relative aspect-[16/9] overflow-hidden border transition-all duration-300 text-left cursor-pointer group",
                    idx === currentIndex
                      ? "border-accent ring-2 ring-accent/30 scale-[1.02]"
                      : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/40"
                  )}
                >
                  <Image
                    src={it.previewSrc}
                    alt={it.title}
                    fill
                    sizes="300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081d37] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase truncate tracking-wider">
                      {it.title}
                    </span>
                    {idx === currentIndex && (
                      <span className="size-1.5 rounded-full bg-accent" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
