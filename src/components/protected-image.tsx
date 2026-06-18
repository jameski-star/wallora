"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders a protected preview image. Deterrents (NOT real protection — the
 * actual safeguard is that premium images are only ever served publicly as
 * reduced-resolution previews; full-res originals live in a private bucket):
 *  - right-click / context menu disabled
 *  - drag-and-drop save disabled
 *  - selection + pointer events suppressed via `.protected-img`
 *  - a transparent overlay sits above the image to intercept long-press/save
 *
 * Images use `unoptimized` because Cloudinary already delivers width-capped,
 * quality-compressed, format-negotiated URLs — the Next.js image proxy would
 * redundantly re-fetch and re-encode them, causing timeouts on large PNGs.
 */
export function ProtectedImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority,
  placeholder,
  fill = false,
  contain = false,
  fit = "cover",
  blurBackdrop = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: string;
  /** Fill the parent box instead of using the intrinsic ratio. */
  fill?: boolean;
  /**
   * Fit the WHOLE image within the viewport (object-contain, height-capped) so
   * a tall portrait wallpaper is fully visible without scrolling. Used on the
   * detail view.
   */
  contain?: boolean;
  /**
   * How a `fill` image sits in its box: "cover" crops to fill (default),
   * "contain" shows the whole image (letterboxed). Ignored unless `fill`.
   */
  fit?: "cover" | "contain";
  /**
   * Paint a blurred, zoomed copy of the same image behind a `fit="contain"`
   * image so the empty letterbox bands are filled instead of left blank — lets
   * a portrait wallpaper sit fully visible in a wider box. Ignored unless
   * `fill` and `fit === "contain"`.
   */
  blurBackdrop?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const showBackdrop = fill && fit === "contain" && blurBackdrop;

  return (
    <div
      className={cn(
        "protected-img relative overflow-hidden",
        contain && "flex items-center justify-center",
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {!loaded && (
        <div className="absolute inset-0 skeleton" aria-hidden />
      )}
      {showBackdrop && (
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          sizes={sizes ?? "100vw"}
          unoptimized
          draggable={false}
          className={cn(
            "scale-110 object-cover blur-2xl transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      <Image
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        sizes={sizes ?? "(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"}
        unoptimized
        draggable={false}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        placeholder={placeholder ? "blur" : "empty"}
        blurDataURL={placeholder}
        className={cn(
          "relative transition-opacity duration-500",
          fill && fit === "cover" && "h-full w-full object-cover",
          fill && fit === "contain" && "h-full w-full object-contain",
          contain && "h-auto max-h-[80svh] w-auto max-w-full object-contain",
          !fill && !contain && "h-auto w-full object-cover",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Transparent capture layer — blocks long-press "save image" affordance. */}
      <span
        aria-hidden
        className="absolute inset-0 z-10 block select-none"
        style={{ WebkitTouchCallout: "none" }}
      />
    </div>
  );
}
