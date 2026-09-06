import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  subtext?: string;
}

/**
 * The Apex Aperture — Sovereign Brand Logo for Aurava.
 * 
 * Geometry:
 * - A-Monogram apex matching the brand initial
 * - Cinematic 16:9 viewport negative space
 * - Central 4K radiant photon pixel in CME Neon Chartreuse (#e3e935)
 * - Sharp precision chamfers conforming to --radius: 0px
 */
export function BrandEmblem({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 48,
  };
  const px = pixelSizes[size];

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105",
        className
      )}
      style={{ width: px, height: px }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-hidden="true"
      >
        {/* Precision Bezel Tile */}
        <rect
          width="40"
          height="40"
          fill="#0c223c"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1.5"
        />

        {/* CME Neon Top-Left Micro Notch */}
        <rect x="0" y="0" width="3" height="3" fill="#e3e935" />

        {/* Left Leg / Apex Ascent (Electric Blue Gradient) */}
        <path
          d="M20 6L7 32H13.8L20 18.5L26.2 32H33L20 6Z"
          fill="url(#apex-blue)"
        />

        {/* Right Optical Chamfer Flank (Polar White / Silver Sheen) */}
        <path
          d="M20 6L33 32H26.2L20 18.5V6Z"
          fill="url(#apex-silver)"
          opacity="0.95"
        />

        {/* Viewfinder Negative Space (Deep Navy Void) */}
        <polygon points="20,13.5 13.8,26.5 26.2,26.5" fill="#081d37" />

        {/* Glowing Ambient Halo behind Photon */}
        <circle cx="20" cy="21.5" r="3.5" fill="#e3e935" opacity="0.4" />

        {/* Central Core Photon (Active 4K Pixel in Neon Yellow) */}
        <polygon
          points="20,16.5 23.5,21.5 20,26.5 16.5,21.5"
          fill="#e3e935"
        />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient
            id="apex-blue"
            x1="7"
            y1="6"
            x2="27"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#008ce3" />
            <stop offset="1" stopColor="#006eb6" />
          </linearGradient>
          <linearGradient
            id="apex-silver"
            x1="20"
            y1="6"
            x2="33"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#cbd5e1" />
            <stop offset="1" stopColor="#64748b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  className,
  subtext = "STUDIO",
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <BrandEmblem size={size} />
      
      {showWordmark && (
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white uppercase group-hover:text-white/90 transition-colors">
            {SITE_NAME}
          </span>
          {subtext && (
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-accent border border-accent/40 bg-accent/10 px-1.5 py-0.5 uppercase">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
