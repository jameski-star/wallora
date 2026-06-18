import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

// Default social share card for every route that doesn't set its own OG image
// (homepage, /wallpapers, /blog index, legal pages). Next wires this into the
// <head> automatically via the file convention and also exposes it at
// /opengraph-image. Per-wallpaper and per-post pages override with their art.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (matches the Aurava logo: warm gold on deep black).
const ACCENT = "#E3A53A";
const BG = "#0a0a0b";

// Embed the logo as a base64 data URL so ImageResponse can render it without
// needing a network request or absolute URL.
const logoDataUrl = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "logo.png"),
).toString("base64")}`;

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
          padding: "70px 80px",
          background: `radial-gradient(1200px 600px at 100% 0%, rgba(227,165,58,0.14), ${BG})`,
          color: "#fafafa",
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <img
            src={logoDataUrl}
            width={140}
            height={140}
            style={{ borderRadius: 28 }}
            alt=""
          />
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              letterSpacing: -2,
              color: "#fafafa",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: 900,
            color: "#e4e4e7",
          }}
        >
          {SITE_TAGLINE}
        </div>

        <div style={{ marginTop: 20, fontSize: 30, color: "#a1a1aa" }}>
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
