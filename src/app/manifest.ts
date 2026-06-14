import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

// Web App Manifest — enables "Add to Home Screen", themed mobile chrome, and
// contributes to mobile-friendliness signals. Auto-served at /manifest.webmanifest
// and linked from <head> by Next's file convention.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description:
      "Aurava is a premium wallpaper marketplace. Browse and download stunning 4K & HD wallpapers for desktop, phone and tablet.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#E3A53A",
    categories: ["entertainment", "lifestyle", "photo"],
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
