"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A live-wallpaper preview: a muted, looping clip that plays on hover (pointer
 * devices) or while in view (touch devices), with a still poster as the resting
 * frame. Honors `prefers-reduced-motion` by never auto-playing.
 *
 * The clip + poster sit inside `.protected-img`, so neither can be dragged or
 * saved while the parent <Link> stays clickable.
 */
export function LiveThumb({
  videoSrc,
  poster,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
  /** Detail view: fill the box and keep playing regardless of hover. */
  always = false,
  /** Fit the whole clip within the viewport (object-contain, height-capped). */
  contain = false,
}: {
  videoSrc: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  always?: boolean;
  contain?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.5 });
  const [active, setActive] = useState(false);

  // Drive playback. On hover-capable devices the clip follows `active`
  // (hover/always); on touch devices it follows viewport visibility so the
  // loop plays without a hover affordance.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const shouldPlay = !reduce && (always || (canHover ? active : inView));
    if (shouldPlay) {
      v.play().catch(() => {});
    } else {
      v.pause();
      if (!always) v.currentTime = 0;
    }
  }, [active, inView, reduce, always]);

  return (
    <div
      ref={ref}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      className={cn(
        "protected-img relative overflow-hidden",
        contain && "flex items-center justify-center",
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Poster — the resting frame; also the SSR/no-JS fallback. */}
      <Image
        src={poster}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes ?? "(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"}
        priority={priority}
        draggable={false}
        quality={60}
        className={cn(
          "transition-opacity duration-500",
          contain
            ? "h-auto max-h-[80svh] w-auto max-w-full object-contain"
            : "h-auto w-full object-cover",
          active || (always && !reduce) ? "opacity-0" : "opacity-100",
        )}
      />
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full",
          contain ? "object-contain" : "object-cover",
        )}
      />
    </div>
  );
}
