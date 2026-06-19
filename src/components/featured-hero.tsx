"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, ArrowRight, Info, X, Monitor, Smartphone, Tablet } from "lucide-react";
import { StudioMockup } from "./studio-mockup";
import { cn } from "@/lib/utils";

/**
 * Premium device-mockup hero for Wallpaper of the Day / Week.
 *
 * Desktop: two-column — minimal info (badge + title + CTA) left, floating
 * device mockup right inside a warm ambient room scene (lamp glow, plant,
 * shelf line). The wallpaper lives entirely inside the device screen.
 *
 * Mobile: device mockup fills the section. Badge + title shown above. Tapping
 * "Details" reveals a floating bottom-sheet with description and CTA while the
 * wallpaper remains fully visible inside the device.
 */
export function FeaturedHero({
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
  titleAs: TitleTag = "h2",
  priority = false,
}: {
  slug: string;
  title: string;
  caption: string;
  description: string;
  previewSrc: string;
  width: number;
  height: number;
  device?: string;
  videoSrc?: string | null;
  isPremium?: boolean;
  category?: string;
  titleAs?: "h1" | "h2";
  /** Mark the hero image as LCP — preloads + fetchpriority=high. */
  priority?: boolean;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const deviceType = device === "phone" ? "phone" : device === "tablet" ? "tablet" : "laptop";

  return (
    <section className="relative overflow-hidden rounded-card border border-border bg-surface">
      {/* ── Desktop: side-by-side ──────────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-2">
        {/* Left — premium info panel with ambient glow */}
        <div className="relative flex flex-col justify-center px-10 py-12">
          {/* Ambient accent glow — warm radial echoing the logo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 30% 40%, color-mix(in oklch, var(--accent) 6%, transparent), transparent)",
            }}
          />

          <div className="relative z-10">
            <span className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              <Sparkles size={13} />
              {caption}
            </span>

            <TitleTag className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground xl:text-4xl">
              {title}
            </TitleTag>

            {/* Resolution + device specs */}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted/80">
              <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                {width} × {height}
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="inline-flex items-center gap-1">
                {deviceType === "phone" ? (
                  <Smartphone size={12} />
                ) : deviceType === "tablet" ? (
                  <Tablet size={12} />
                ) : (
                  <Monitor size={12} />
                )}
                {deviceType === "phone" ? "Phone" : deviceType === "tablet" ? "Tablet" : "Desktop"}
              </span>
            </div>

            {/* Category + price badges */}
            <div className="mt-3 flex items-center gap-2">
              {category && (
                <span className="rounded-full bg-surface-2/80 px-2.5 py-0.5 text-[11px] font-medium capitalize text-muted">
                  {category}
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  isPremium
                    ? "bg-accent/15 text-accent"
                    : "bg-emerald-500/10 text-emerald-500",
                )}
              >
                {isPremium ? "Premium" : "Free"}
              </span>
            </div>

            {/* Accent divider */}
            <div className="mt-6 h-px w-14 rounded-full bg-accent/30" />

            <Link
              href={`/wallpapers/${slug}`}
              className="group mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              View wallpaper
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Right — ambient room scene with device mockup */}
        <div className="relative flex items-center justify-center p-6">
          <AmbientScene />
          <StudioMockup
            device={deviceType}
            src={previewSrc}
            alt={title}
            videoSrc={videoSrc}
            poster={previewSrc}
          />
        </div>
      </div>

      {/* ── Mobile / Tablet: device-focused ───────────────────────── */}
      <div className="lg:hidden">
        {/* Always-visible: badge + title */}
        <div className="flex items-center gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
            <Sparkles size={11} />
            {caption}
          </span>
        </div>
        <TitleTag className="px-5 pt-3 pb-2 text-xl font-bold tracking-tight text-foreground sm:px-7 sm:text-2xl">
          {title}
        </TitleTag>

        {/* Device mockup — wallpaper stays inside the screen */}
        <div className="relative flex items-center justify-center px-4 py-6 sm:px-8 sm:py-8">
          <AmbientScene />
          <StudioMockup
            device={deviceType}
            src={previewSrc}
            alt={title}
            videoSrc={videoSrc}
            poster={previewSrc}
            priority={priority}
          />
        </div>

        {/* Tap-to-reveal details button */}
        <div className="flex justify-center pb-5">
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-5 py-2 text-xs font-medium text-muted backdrop-blur-sm transition hover:text-foreground"
          >
            <Info size={14} />
            Details
          </button>
        </div>

        {/* Floating info sheet (mobile only) */}
        {infoOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setInfoOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-50 animate-[slideUp_0.35s_ease-out] rounded-t-2xl border-t border-border bg-surface p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                    <Sparkles size={11} />
                    {caption}
                  </span>
                  <h3 className="mt-2 text-lg font-bold tracking-tight">{title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOpen(false)}
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted transition hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-muted">{description}</p>
              <Link
                href={`/wallpapers/${slug}`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
              >
                View wallpaper
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/**
 * CSS-only ambient room elements that surround the device mockup on desktop:
 *  - Warm lamp glow (soft radial behind the device)
 *  - Minimal plant silhouette (left side)
 *  - Coffee mug (right side)
 *  - Subtle floating bokeh dots
 *  - Desk/shelf line
 * Gives the hero a "natural workspace" feel rather than a sterile product shot.
 */
function AmbientScene() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Warm lamp glow — a soft pool of amber light behind the device */}
      <div className="absolute right-[12%] top-[8%] h-48 w-48 rounded-full bg-accent/12 blur-[80px]" />
      <div className="absolute right-[18%] top-[12%] h-24 w-24 rounded-full bg-accent/8 blur-[40px]" />

      {/* Desk line — a thin horizontal surface the device "sits" on */}
      <div className="absolute bottom-[18%] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      {/* Plant — left side of desk, pure CSS leaves */}
      <div className="absolute bottom-[16%] left-[6%] flex flex-col items-center">
        {/* Leaves */}
        <div className="relative h-14 w-10">
          <span className="absolute left-1/2 top-0 h-8 w-3 -translate-x-1/2 rotate-[-18deg] rounded-full bg-emerald-600/25" />
          <span className="absolute left-1/2 top-1 h-7 w-2.5 -translate-x-1/2 rotate-[15deg] rounded-full bg-emerald-500/20" />
          <span className="absolute left-1/2 top-2 h-6 w-2 -translate-x-[30%] rotate-[-35deg] rounded-full bg-emerald-700/20" />
          <span className="absolute left-1/2 top-1 h-7 w-2.5 -translate-x-[70%] rotate-[30deg] rounded-full bg-emerald-600/18" />
        </div>
        {/* Pot */}
        <div className="h-5 w-6 rounded-b-md bg-surface-2/60" style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)" }} />
      </div>

      {/* Coffee mug — right side of desk */}
      <div className="absolute bottom-[16%] right-[10%]">
        <div className="relative">
          {/* Mug body */}
          <div className="h-7 w-5 rounded-b-md bg-surface-2/50" />
          {/* Handle */}
          <span className="absolute -right-1.5 top-1 h-4 w-2 rounded-r-full border border-surface-2/40 border-l-0" />
          {/* Steam wisps */}
          <span className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 animate-pulse bg-gradient-to-t from-muted/20 to-transparent" />
          <span className="absolute -top-4 left-[40%] h-4 w-px animate-pulse bg-gradient-to-t from-muted/15 to-transparent [animation-delay:0.6s]" />
        </div>
      </div>

      {/* Bokeh dots — soft floating light particles */}
      <div className="absolute left-[20%] top-[20%] h-2 w-2 rounded-full bg-accent/10 blur-[2px]" />
      <div className="absolute right-[25%] top-[30%] h-1.5 w-1.5 rounded-full bg-accent/8 blur-[1px]" />
      <div className="absolute left-[35%] top-[15%] h-1 w-1 rounded-full bg-foreground/6" />
      <div className="absolute right-[15%] top-[55%] h-1.5 w-1.5 rounded-full bg-accent/6 blur-[2px]" />
      <div className="absolute left-[12%] top-[50%] h-1 w-1 rounded-full bg-foreground/5" />
    </div>
  );
}
