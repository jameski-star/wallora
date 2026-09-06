import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#e3e935";
const BG = "#081d37";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: `radial-gradient(1200px 600px at 100% 0%, rgba(0,110,182,0.35), ${BG})`,
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* The Apex Aperture Emblem */}
          <svg width="84" height="84" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" fill="#0c223c" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <rect x="0" y="0" width="3" height="3" fill="#e3e935" />
            <path d="M20 6L7 32H13.8L20 18.5L26.2 32H33L20 6Z" fill="#006eb6" />
            <path d="M20 6L33 32H26.2L20 18.5V6Z" fill="#ffffff" opacity="0.95" />
            <polygon points="20,13.5 13.8,26.5 26.2,26.5" fill="#081d37" />
            <polygon points="20,16.5 23.5,21.5 20,26.5 16.5,21.5" fill="#e3e935" />
          </svg>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2, color: "#ffffff", textTransform: "uppercase" }}>
              {SITE_NAME}
            </span>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: 4, color: ACCENT, border: "2px solid rgba(227,233,53,0.4)", backgroundColor: "rgba(227,233,53,0.1)", padding: "4px 12px", textTransform: "uppercase" }}>
              STUDIO
            </span>
          </div>
        </div>

        {/* Tagline / Value Proposition */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 64, height: 6, backgroundColor: ACCENT }} />
          <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.2, maxWidth: 960, color: "#ffffff", textTransform: "uppercase" }}>
            Curated 4K &amp; Live Wallpapers for High-DPI Displays
          </div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,0.7)" }}>
            Engineered for wide-gamut multi-monitor workstations and OLED screens
          </div>
        </div>

        {/* Footer Meta */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 28 }}>
          <div style={{ fontSize: 22, color: ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            4K UHD · 60FPS LIVE MOTION · DESKTOP &amp; MOBILE
          </div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
            auravaw.tech
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
