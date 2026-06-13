import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the on-screen dev activity badge (compiling/rendering, bottom-left).
  // Compile/runtime errors are still surfaced; this only removes the indicator.
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
    // Allow a couple of quality levels for previews vs. hero imagery.
    qualities: [40, 60, 75, 90],
  },
};

export default nextConfig;
