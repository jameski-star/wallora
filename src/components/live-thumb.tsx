"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  /** Controlled active/hover state from parent card if provided */
  active: activeProp,
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
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.05 });
  const [hovered, setHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // If always or priority, load video source immediately without waiting for scroll.
  const [srcLoaded, setSrcLoaded] = useState(() => Boolean(always || priority));

  const isCardActive = activeProp !== undefined ? activeProp : hovered;

  useEffect(() => {
    if ((inView || isCardActive || always || priority) && !srcLoaded) {
      setSrcLoaded(true);
    }
  }, [inView, isCardActive, always, priority, srcLoaded]);

  // Whether the device has a real hover-capable pointer. Read via
  // useSyncExternalStore with a `false` server snapshot, so the server and the
  // first client render agree (a render-time `matchMedia` branch hydrates into
  // a mismatched `autoPlay`).
  const canHover = useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(hover: hover)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(hover: hover)").matches,
    () => false,
  );

  const shouldPlay = !reduce && (always || (canHover ? isCardActive : inView));

  // Drive playback robustly across all browsers & devices
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Mobile & strict autoplay policies require muted property on DOM node
    v.defaultMuted = true;
    v.muted = true;

    if (!srcLoaded) return;

    if (shouldPlay) {
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // If browser blocked or media was still buffering, retry on canplay
            const handleCanPlay = () => {
              v.play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
            };
            v.addEventListener("canplay", handleCanPlay, { once: true });
          });
      }
    } else {
      v.pause();
      setIsPlaying(false);
      if (!always) {
        try {
          v.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    }
  }, [shouldPlay, srcLoaded, always, videoSrc]);

  return (
    <div
      ref={ref}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "protected-img relative overflow-hidden",
        contain && "flex items-center justify-center",
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Poster Image — resting frame and fallback until video frames actually render.
          Omitted entirely when there's no poster (a live wallpaper with no still
          and no derivable poster frame): an empty `src` makes the browser
          re-download the current page. */}
      {poster ? (
        <Image
          src={poster}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes ?? "(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"}
          unoptimized
          draggable={false}
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "transition-opacity duration-300 pointer-events-none",
            contain
              ? "h-auto max-h-[80svh] w-auto max-w-full object-contain"
              : "h-full w-full object-cover",
            // Keep poster visible until video is actually playing, avoiding any black flash
            isPlaying ? "opacity-0" : "opacity-100",
          )}
        />
      ) : null}

      {/* Video Loop Element */}
      <video
        ref={videoRef}
        src={srcLoaded && videoSrc ? videoSrc : undefined}
        poster={poster || undefined}
        muted
        loop
        playsInline
        autoPlay={shouldPlay}
        preload={always || priority ? "auto" : "metadata"}
        onPlaying={() => setIsPlaying(true)}
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-300",
          contain ? "object-contain" : "object-cover",
          isPlaying ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
