import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

// Default social share card for every route that doesn't set its own OG image
// (homepage, /wallpapers, /blog index, legal pages). Next wires this into the
// <head> automatically via the file convention and also exposes it at
// /opengraph-image. Per-wallpaper and per-post pages override with their art.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (mirrors icon.svg / globals.css): warm amber on near-black.
const ACCENT = "#E3A53A";
const ACCENT_FG = "#382C1B";
const BG = "#0a0a0b";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: `radial-gradient(1200px 600px at 100% 0%, rgba(227,165,58,0.18), ${BG})`,
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: ACCENT,
              color: ACCENT_FG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 78,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>
            {SITE_NAME}
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 900,
            color: "#fafafa",
          }}
        >
          {SITE_TAGLINE}
        </div>

        <div style={{ marginTop: 24, fontSize: 32, color: "#a1a1aa" }}>
          Download 4K &amp; HD wallpapers for desktop, phone &amp; tablet
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: ACCENT,
            fontWeight: 600,
          }}
        >
          auravaw.tech
        </div>
      </div>
    ),
    { ...size },
  );
}
