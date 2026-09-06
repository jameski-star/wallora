"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Laptop, Smartphone } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface BentMockupProps {
  device?: string; // "desktop" | "phone" | "tablet" | "pc" | "mobile"
  src: string;
  alt: string;
  videoSrc?: string | null;
  width?: number;
  height?: number;
  className?: string;
  allowToggle?: boolean;
  priority?: boolean;
}

export function BentMockup({
  device = "desktop",
  src,
  alt,
  videoSrc,
  width = 1920,
  height = 1080,
  className,
  allowToggle = true,
  priority = false,
}: BentMockupProps) {
  const initialMode =
    device === "phone" || device === "mobile" ? "phone" : "pc";
  const [mode, setMode] = useState<"pc" | "phone">(initialMode);

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)}>
      {/* Device Toggle Pills */}
      {allowToggle && (
        <div className="mb-3 z-30 flex items-center gap-1 bg-[#081d37]/90 backdrop-blur-md border border-white/15 p-1 shadow-lg">
          <button
            type="button"
            onClick={() => setMode("pc")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer",
              mode === "pc"
                ? "bg-accent text-[#081d37]"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <Laptop size={12} />
            <span>PC View</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer",
              mode === "phone"
                ? "bg-accent text-[#081d37]"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <Smartphone size={12} />
            <span>Phone View</span>
          </button>
        </div>
      )}

      {/* 3D Perspective Stage */}
      <div
        className="w-full flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {mode === "pc" ? (
          <Laptop3DMockup
            src={src}
            alt={alt}
            videoSrc={videoSrc}
            priority={priority}
          />
        ) : (
          <Phone3DMockup
            src={src}
            alt={alt}
            videoSrc={videoSrc}
            priority={priority}
          />
        )}
      </div>
    </div>
  );
}

/** 3D Angled / Bent Laptop PC Mockup */
function Laptop3DMockup({
  src,
  alt,
  videoSrc,
  priority,
}: {
  src: string;
  alt: string;
  videoSrc?: string | null;
  priority?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -16, rotateX: 10, scale: 0.95 }}
      animate={{ opacity: 1, rotateY: -12, rotateX: 7, scale: 1 }}
      whileHover={{ rotateY: -7, rotateX: 4, scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px] select-none"
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateY(-12deg) rotateX(7deg) rotateZ(1deg)",
      }}
    >
      {/* Laptop Screen Lid */}
      <div className="relative rounded-t-xl bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#081d37] border-2 border-white/20 p-2 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(0,110,182,0.35)]">
        {/* Subtle camera dot */}
        <span
          aria-hidden
          className="absolute top-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-white/40 z-30"
        />

        {/* Screen Bezel & Display */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-black border border-black">
          {videoSrc ? (
            <VideoScreen videoSrc={videoSrc} alt={alt} />
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              unoptimized
              sizes="(max-width: 768px) 90vw, 540px"
              priority={priority}
              className="object-cover"
            />
          )}

          {/* Diagonal Glass Sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(130deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_18%,transparent_38%,transparent_75%,rgba(255,255,255,0.08)_100%)]"
          />

          {/* Inner bezel shadow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]"
          />
        </div>
      </div>

      {/* 3D Bent Keyboard Base / Deck */}
      <div
        className="relative -mt-0.5 h-3 sm:h-4 w-[106%] -left-[3%] rounded-b-xl bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0a1526] border-x border-b border-white/20 shadow-2xl"
        style={{
          transform: "rotateX(58deg) translateZ(1px)",
          transformOrigin: "top center",
        }}
      >
        {/* Hinge & Trackpad notch */}
        <span
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-1 rounded-b-sm bg-white/30"
        />
        <span
          aria-hidden
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 sm:w-28 h-0.5 rounded-sm bg-white/10"
        />
      </div>

      {/* Realistic Ground Cast Shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-[92%] h-8 bg-black/75 blur-2xl rounded-[50%]"
      />
    </motion.div>
  );
}

/** 3D Angled / Bent Phone Mockup */
function Phone3DMockup({
  src,
  alt,
  videoSrc,
  priority,
}: {
  src: string;
  alt: string;
  videoSrc?: string | null;
  priority?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -18, rotateX: 12, scale: 0.95 }}
      animate={{ opacity: 1, rotateY: -14, rotateX: 8, scale: 1 }}
      whileHover={{ rotateY: -8, rotateX: 4, scale: 1.03 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-[190px] sm:w-[230px] lg:w-[260px] select-none py-2"
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateY(-14deg) rotateX(8deg) rotateZ(-2.5deg)",
      }}
    >
      {/* Outer Titanium Chassis */}
      <div className="relative rounded-[2.8rem] bg-gradient-to-br from-[#475569] via-[#1e293b] to-[#0f172a] p-[3.5px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(0,110,182,0.3)] ring-1 ring-white/20">
        {/* Hardware Side Buttons */}
        <span
          aria-hidden
          className="absolute -left-[3px] top-20 h-9 w-[3px] rounded-l bg-white/40"
        />
        <span
          aria-hidden
          className="absolute -left-[3px] top-32 h-9 w-[3px] rounded-l bg-white/40"
        />
        <span
          aria-hidden
          className="absolute -right-[3px] top-24 h-14 w-[3px] rounded-r bg-white/40"
        />

        {/* Inner Black Bezel */}
        <div className="relative rounded-[2.6rem] bg-black p-[7px] overflow-hidden">
          {/* Phone Screen Display */}
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.2rem] bg-black border border-black">
            {/* Dynamic Island Notch */}
            <div
              aria-hidden
              className="absolute top-2 left-1/2 -translate-x-1/2 z-30 h-4 w-[30%] rounded-full bg-black border border-white/10 flex items-center justify-end px-1.5"
            >
              <span className="size-1.5 rounded-full bg-[#112b4a]" />
            </div>

            {videoSrc ? (
              <VideoScreen videoSrc={videoSrc} alt={alt} />
            ) : (
              <Image
                src={src}
                alt={alt}
                fill
                unoptimized
                sizes="(max-width: 768px) 60vw, 260px"
                priority={priority}
                className="object-cover"
              />
            )}

            {/* Diagonal Glass Sheen */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_20%,transparent_40%,transparent_75%,rgba(255,255,255,0.06)_100%)]"
            />

            {/* Screen Edge Ambient Vignette */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      </div>

      {/* Realistic Cast Shadow Below Phone */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 w-[85%] h-7 bg-black/80 blur-xl rounded-[50%]"
      />
    </motion.div>
  );
}

function VideoScreen({
  videoSrc,
  alt,
}: {
  videoSrc: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.defaultMuted = true;
    v.muted = true;
    if (reduce) {
      v.pause();
    } else {
      const p = v.play();
      if (p !== undefined) {
        p.catch(() => {
          v.addEventListener(
            "canplay",
            () => {
              v.play().catch(() => {});
            },
            { once: true },
          );
        });
      }
    }
  }, [reduce, videoSrc]);

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      muted
      loop
      playsInline
      autoPlay={!reduce}
      aria-label={alt}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
