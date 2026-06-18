import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev indicator (compile/runtime errors still surface).
  devIndicators: false,
  images: {
    // Next 16: `domains` is deprecated — use remotePatterns.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      // Supabase Storage public/signed URLs (host derived from project ref).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    // Prefer AVIF (20-30% smaller than WebP) with WebP fallback.
    formats: ["image/avif", "image/webp"],
    // Allow a couple of quality levels for previews vs. hero imagery.
    qualities: [10, 20, 40, 55, 60, 75, 90],
  },
};

export default nextConfig;
