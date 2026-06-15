"use client";

import { ProtectedImage } from "./protected-image";
import { cn } from "@/lib/utils";

/**
 * Renders a wallpaper preview inside a CSS-drawn device frame (laptop / phone /
 * tablet) chosen by the wallpaper's `device`. Pure CSS — no image assets — so it
 * themes with the design tokens and stays crisp at any size. The screen aspect
 * ratio matches the real device so the wallpaper crops the way it actually will.
 *
 * `device` is a loose string (cart lines store it untyped); anything other than
 * "phone"/"tablet" falls back to the laptop frame.
 */
export function DeviceMockup({
  device,
  src,
  alt,
  className,
}: {
  device: string;
  src: string;
  alt: string;
  className?: string;
}) {
  if (device === "phone") {
    return (
      <div className={cn("mx-auto w-full max-w-[120px]", className)}>
        {/* Phone: tall body, rounded corners, notch. */}
        <div className="relative aspect-[9/19] rounded-[1.4rem] border-[3px] border-surface-2 bg-surface-2 p-1 shadow-lg ring-1 ring-border">
          <div className="relative h-full w-full overflow-hidden rounded-[1.05rem]">
            <Screen src={src} alt={alt} />
            {/* Notch */}
            <span className="absolute left-1/2 top-0 z-20 h-3 w-1/3 -translate-x-1/2 rounded-b-lg bg-surface-2" />
          </div>
        </div>
      </div>
    );
  }

  if (device === "tablet") {
    return (
      <div className={cn("mx-auto w-full max-w-[180px]", className)}>
        {/* Tablet: 4:3-ish body, even bezel, front camera dot. */}
        <div className="relative aspect-[3/4] rounded-2xl border-[3px] border-surface-2 bg-surface-2 p-2 shadow-lg ring-1 ring-border">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Screen src={src} alt={alt} />
          </div>
          <span className="absolute left-1/2 top-1 z-20 size-1 -translate-x-1/2 rounded-full bg-border" />
        </div>
      </div>
    );
  }

  // Laptop: 16:10 screen on a hinge/base.
  return (
    <div className={cn("mx-auto w-full max-w-[240px]", className)}>
      <div className="relative aspect-[16/10] rounded-t-lg border-[3px] border-b-0 border-surface-2 bg-surface-2 p-1.5 shadow-lg ring-1 ring-border ring-offset-0">
        <div className="relative h-full w-full overflow-hidden rounded-sm">
          <Screen src={src} alt={alt} />
        </div>
      </div>
      {/* Base / hinge */}
      <div className="relative h-2 w-[112%] -translate-x-[5.3%] rounded-b-xl bg-surface-2 shadow-md ring-1 ring-border">
        <span className="absolute left-1/2 top-0 h-1 w-1/5 -translate-x-1/2 rounded-b-md bg-border" />
      </div>
    </div>
  );
}

function Screen({ src, alt }: { src: string; alt: string }) {
  return (
    <ProtectedImage
      src={src}
      alt={alt}
      width={400}
      height={400}
      fill
      fit="cover"
      sizes="240px"
      className="h-full w-full"
    />
  );
}
