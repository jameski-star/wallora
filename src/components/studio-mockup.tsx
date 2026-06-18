"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { ProtectedImage } from "./protected-image";
import { cn } from "@/lib/utils";

/**
 * A large, "studio-shot" device render: the wallpaper sits behind realistic
 * glass inside a phone / laptop / tablet frame, lit by a soft gradient backdrop,
 * a glare sweep across the screen, and a blurred cast shadow on the floor. Pure
 * CSS (no photo assets) so it themes with the design tokens and stays crisp at
 * any size. `device` is loose (cart lines store it untyped); anything other than
 * "phone" / "tablet" falls back to the laptop frame.
 *
 * The screen shows a still preview, or — for live wallpapers — a muted looping
 * clip. Either way the media uses `object-cover` so the wallpaper fills the whole
 * screen (no letterbox), matching how it will actually look on the device.
 */
export function StudioMockup({
  device,
  src,
  alt,
  videoSrc,
  poster,
  priority,
  className,
}: {
  device: string;
  src: string;
  alt: string;
  videoSrc?: string | null;
  poster?: string;
  priority?: boolean;
  className?: string;
}) {
  const screen = <Screen src={src} alt={alt} videoSrc={videoSrc} poster={poster} priority={priority} />;

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-card",
        // Studio sweep: a soft pool of light up-top fading into the floor.
        "bg-[radial-gradient(120%_90%_at_50%_15%,_color-mix(in_oklch,var(--surface-2)_92%,white_7%),_var(--background)_75%)]",
        "px-6 py-10 sm:px-10 sm:py-14",
        className,
      )}
    >
      {device === "phone" ? (
        <PhoneFrame>{screen}</PhoneFrame>
      ) : device === "tablet" ? (
        <TabletFrame>{screen}</TabletFrame>
      ) : (
        <LaptopFrame>{screen}</LaptopFrame>
      )}
    </div>
  );
}

/** Diagonal light sweep + top sheen across the glass. */
function Glare() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(125deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_16%,transparent_34%,transparent_72%,rgba(255,255,255,0.06)_100%)]"
    />
  );
}

/** Blurred elliptical contact shadow on the studio floor. */
function CastShadow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 -z-10 -translate-x-1/2 rounded-[50%] bg-black/45 blur-2xl",
        className,
      )}
    />
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[60svh] max-h-[560px] min-h-[360px] aspect-[9/19.5]">
      <CastShadow className="bottom-[-6%] h-[7%] w-[62%]" />
      {/* Side buttons. */}
      <span aria-hidden className="absolute -left-[2px] top-[22%] h-12 w-[3px] rounded-l bg-surface-2" />
      <span aria-hidden className="absolute -right-[2px] top-[28%] h-16 w-[3px] rounded-r bg-surface-2" />
      {/* Titanium edge → inner bezel → screen. */}
      <div className="relative h-full w-full rounded-[3rem] bg-[linear-gradient(145deg,color-mix(in_oklch,var(--surface-2)_60%,white_18%),var(--surface-2)_45%,color-mix(in_oklch,var(--surface-2)_70%,black_25%))] p-[3px] shadow-2xl ring-1 ring-black/30">
        <div className="relative h-full w-full overflow-hidden rounded-[2.85rem] bg-black p-[7px]">
          <div className="protected-img relative h-full w-full overflow-hidden rounded-[2.4rem] bg-black">
            {children}
            {/* Dynamic-island pill. */}
            <span aria-hidden className="absolute left-1/2 top-2.5 z-30 h-6 w-[28%] -translate-x-1/2 rounded-full bg-black" />
            <Glare />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[58svh] max-h-[600px] min-h-[340px] aspect-[3/4]">
      <CastShadow className="bottom-[-5%] h-[6%] w-[70%]" />
      <div className="relative h-full w-full rounded-[1.6rem] bg-[linear-gradient(145deg,color-mix(in_oklch,var(--surface-2)_60%,white_16%),var(--surface-2)_45%,color-mix(in_oklch,var(--surface-2)_70%,black_22%))] p-[3px] shadow-2xl ring-1 ring-black/30">
        <div className="relative h-full w-full overflow-hidden rounded-[1.45rem] bg-black p-3">
          <div className="protected-img relative h-full w-full overflow-hidden rounded-lg bg-black">
            {children}
            <Glare />
          </div>
          {/* Front camera dot, centered on the top bezel. */}
          <span aria-hidden className="absolute left-1/2 top-[6px] z-30 size-1.5 -translate-x-1/2 rounded-full bg-white/25" />
        </div>
      </div>
    </div>
  );
}

function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[min(86vw,60rem)]">
      <CastShadow className="bottom-[-14%] h-[14%] w-[88%]" />
      {/* Lid. */}
      <div className="relative aspect-[16/10] w-full rounded-t-2xl bg-[linear-gradient(160deg,color-mix(in_oklch,var(--surface-2)_55%,white_15%),var(--surface-2)_50%,color-mix(in_oklch,var(--surface-2)_70%,black_22%))] p-[10px] shadow-2xl ring-1 ring-black/30">
        <div className="protected-img relative h-full w-full overflow-hidden rounded-md bg-black">
          {children}
          {/* Webcam dot. */}
          <span aria-hidden className="absolute left-1/2 top-1 z-30 size-1 -translate-x-1/2 rounded-full bg-white/25" />
          <Glare />
        </div>
      </div>
      {/* Hinge / base — slightly wider than the lid, with a lip notch. */}
      <div className="relative left-1/2 h-3 w-[106%] -translate-x-1/2 rounded-b-xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--surface-2)_70%,white_8%),color-mix(in_oklch,var(--surface-2)_75%,black_18%))] shadow-lg ring-1 ring-black/25">
        <span aria-hidden className="absolute left-1/2 top-0 h-1.5 w-[14%] -translate-x-1/2 rounded-b-md bg-black/30" />
      </div>
    </div>
  );
}

function Screen({
  src,
  alt,
  videoSrc,
  poster,
  priority,
}: {
  src: string;
  alt: string;
  videoSrc?: string | null;
  poster?: string;
  priority?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduce) v.pause();
    else v.play().catch(() => {});
  }, [reduce]);

  if (videoSrc) {
    return (
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay={!reduce}
        preload="metadata"
        aria-label={alt}
        className="absolute inset-0 z-10 h-full w-full object-cover"
      />
    );
  }

  return (
    <ProtectedImage
      src={src}
      alt={alt}
      width={1000}
      height={1000}
      fill
      fit="cover"
      priority={priority}
      sizes="(max-width:640px) 90vw, 600px"
      className="absolute inset-0 z-10 h-full w-full"
    />
  );
}
