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
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: string;
  /** Fill the parent box (object-cover) instead of using the intrinsic ratio. */
  fill?: boolean;
  /**
   * Fit the WHOLE image within the viewport (object-contain, height-capped) so
   * a tall portrait wallpaper is fully visible without scrolling. Used on the
   * detail view.
   */
  contain?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

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
      <Image
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        sizes={sizes ?? "(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"}
        priority={priority}
        draggable={false}
        quality={60}
        onLoad={() => setLoaded(true)}
        placeholder={placeholder ? "blur" : "empty"}
        blurDataURL={placeholder}
        className={cn(
          "transition-opacity duration-500",
          fill && "h-full w-full object-cover",
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
