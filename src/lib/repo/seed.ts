import type { FeaturedItem, Post, Wallpaper } from "../types";
import { CATEGORIES } from "../constants";

/**
 * Deterministic seed catalog used by the mock repository (and as a starting
 * point for `supabase/seed.sql`). Originals point at free image hosts so the
 * app is fully browsable with no Cloudinary/Supabase credentials.
 */

type Spec = {
  title: string;
  category: string;
  tags: string[];
  device: "desktop" | "phone" | "tablet";
  mature?: boolean;
  premium?: boolean;
  priceCents?: number;
  holiday?: Wallpaper["holidayTags"];
  unsplashId: string; // photo id on images.unsplash.com (still poster)
  w: number;
  h: number;
  /** Mark as a live (looping video) wallpaper. */
  live?: boolean;
  /** Absolute sample mp4 URL used as the loop in keyless demo mode. */
  video?: string;
  /** Loop length, seconds. */
  duration?: number;
};

// Public, CORS-open sample loops for the keyless demo. In production these are
// replaced by downscaled Cloudinary video derivations (see lib/cloudinary.ts).
const SAMPLE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

const SPECS: Spec[] = [
  { title: "Alpine Dawn", category: "nature", tags: ["mountains", "sunset", "minimal"], device: "desktop", premium: true, priceCents: 499, unsplashId: "photo-1506744038136-46273834b3fb", w: 3840, h: 2160 },
  { title: "Misty Forest", category: "nature", tags: ["forest", "dark", "fog"], device: "desktop", unsplashId: "photo-1441974231531-c6227db76b6e", w: 3840, h: 2160 },
  { title: "Ocean Drift", category: "nature", tags: ["ocean", "blue", "minimal"], device: "phone", premium: true, priceCents: 399, unsplashId: "photo-1505228395891-9a51e7e86bf6", w: 1170, h: 2532 },
  { title: "Desert Lines", category: "nature", tags: ["desert", "minimal", "warm"], device: "phone", unsplashId: "photo-1509316785289-025f5b846b35", w: 1170, h: 2532 },

  { title: "Midnight GT", category: "cars", tags: ["dark", "neon", "supercar"], device: "desktop", premium: true, priceCents: 599, unsplashId: "photo-1503376780353-7e6692767b70", w: 3840, h: 2160 },
  { title: "Classic Roadster", category: "cars", tags: ["classic", "warm"], device: "desktop", unsplashId: "photo-1492144534655-ae79c964c9d7", w: 3840, h: 2160 },
  { title: "Track Day", category: "cars", tags: ["sports", "speed"], device: "tablet", premium: true, priceCents: 449, unsplashId: "photo-1552519507-da3b142c6e3d", w: 2048, h: 2732 },

  { title: "Stadium Lights", category: "sports", tags: ["sports", "night"], device: "desktop", unsplashId: "photo-1431324155629-1a6deb1dec8d", w: 3840, h: 2160 },
  { title: "Court Vision", category: "sports", tags: ["sports", "minimal"], device: "phone", unsplashId: "photo-1546519638-68e109498ffc", w: 1170, h: 2532 },

  { title: "Nebula Bloom", category: "space", tags: ["space", "neon", "dark"], device: "desktop", premium: true, priceCents: 699, unsplashId: "photo-1462331940025-496dfbfc7564", w: 3840, h: 2160 },
  { title: "Lunar Quiet", category: "space", tags: ["space", "minimal", "dark"], device: "phone", premium: true, priceCents: 399, unsplashId: "photo-1532693322450-2cb5c511067d", w: 1170, h: 2532 },
  { title: "Deep Field", category: "space", tags: ["space", "stars"], device: "tablet", unsplashId: "photo-1419242902214-272b3f66ee7a", w: 2048, h: 2732 },

  { title: "Neon District", category: "gaming", tags: ["neon", "city", "dark"], device: "desktop", premium: true, priceCents: 549, unsplashId: "photo-1542751371-adc38448a05e", w: 3840, h: 2160 },
  { title: "Arcade Glow", category: "gaming", tags: ["neon", "retro"], device: "phone", unsplashId: "photo-1511512578047-dfb367046420", w: 1170, h: 2532 },

  { title: "Sakura Drift", category: "anime", tags: ["anime", "warm", "minimal"], device: "desktop", premium: true, priceCents: 499, unsplashId: "photo-1490750967868-88aa4486c946", w: 3840, h: 2160 },
  { title: "City Pop Night", category: "anime", tags: ["anime", "neon", "city"], device: "phone", unsplashId: "photo-1480796927426-f609979314bd", w: 1170, h: 2532 },

  { title: "Circuit Flow", category: "technology", tags: ["technology", "abstract", "dark"], device: "desktop", unsplashId: "photo-1518770660439-4636190af475", w: 3840, h: 2160 },
  { title: "Data Streams", category: "technology", tags: ["technology", "neon"], device: "tablet", premium: true, priceCents: 449, unsplashId: "photo-1526374965328-7f61d4dc18c5", w: 2048, h: 2732 },

  { title: "Gradient Dunes", category: "abstract", tags: ["abstract", "gradient", "minimal"], device: "desktop", unsplashId: "photo-1557672172-298e090bd0f1", w: 3840, h: 2160 },
  { title: "Liquid Color", category: "abstract", tags: ["abstract", "gradient"], device: "phone", premium: true, priceCents: 299, unsplashId: "photo-1550859492-d5da9d8e45f3", w: 1170, h: 2532 },

  // Holiday-tagged (for cron features)
  { title: "Winter Lights", category: "nature", tags: ["christmas", "winter", "warm"], device: "desktop", premium: true, priceCents: 499, holiday: ["christmas"], unsplashId: "photo-1543589077-47d81606c1bf", w: 3840, h: 2160 },
  { title: "Hearts Aglow", category: "abstract", tags: ["valentines", "warm"], device: "phone", holiday: ["valentines"], unsplashId: "photo-1518621736915-f3b1c41bfd00", w: 1170, h: 2532 },
  { title: "Hallow Moon", category: "space", tags: ["halloween", "dark"], device: "desktop", holiday: ["halloween"], unsplashId: "photo-1509557965875-b88c97052f0e", w: 3840, h: 2160 },

  // One mature-rated example to exercise age gating.
  { title: "Noir Study", category: "abstract", tags: ["dark", "minimal"], device: "desktop", mature: true, premium: true, priceCents: 399, unsplashId: "photo-1499540633125-484965b60031", w: 3840, h: 2160 },

  // ── Live wallpapers (looping video) ──────────────────────────────────
  { title: "Aurora Live", category: "nature", tags: ["aurora", "night", "live"], device: "desktop", live: true, premium: true, priceCents: 799, video: `${SAMPLE}/ForBiggerJoyrides.mp4`, unsplashId: "photo-1483347756197-71ef80e95f73", w: 3840, h: 2160, duration: 6 },
  { title: "Orbit Drift", category: "space", tags: ["space", "stars", "live"], device: "desktop", live: true, premium: true, priceCents: 899, video: `${SAMPLE}/ElephantsDream.mp4`, unsplashId: "photo-1446776811953-b23d57bd21aa", w: 3840, h: 2160, duration: 6 },
  { title: "Ember Flow", category: "abstract", tags: ["abstract", "warm", "live"], device: "phone", live: true, premium: true, priceCents: 599, video: `${SAMPLE}/ForBiggerBlazes.mp4`, unsplashId: "photo-1502691876148-a84978e59af8", w: 1170, h: 2532, duration: 6 },
  { title: "Neon Rain", category: "gaming", tags: ["neon", "city", "live"], device: "desktop", live: true, video: `${SAMPLE}/ForBiggerEscapes.mp4`, unsplashId: "photo-1545972154-9bb223aac798", w: 3840, h: 2160, duration: 6 },
];

function slug(title: string, device: string, w: number, h: number): string {
  const k = Math.max(w, h);
  const res = k >= 3840 ? "4k" : k >= 2560 ? "2k" : "hd";
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${res}-${device}`;
}

export const SEED_WALLPAPERS: Wallpaper[] = SPECS.map((s, i) => {
  const id = `wp_${String(i + 1).padStart(3, "0")}`;
  const isPremium = Boolean(s.premium);
  const priceCents = isPremium ? (s.priceCents ?? 499) : 0;
  const ageRating = s.mature ? "18+" : "everyone";
  const url = `https://images.unsplash.com/${s.unsplashId}?auto=format&fit=crop`;
  // Stable, increasing timestamps (newest = highest index).
  const createdAt = new Date(Date.UTC(2026, 0, 1 + i)).toISOString();
  return {
    id,
    slug: slug(s.title, s.device, s.w, s.h),
    title: s.title,
    description: s.live
      ? `${s.title} — a live ${s.device} wallpaper. A seamless ${s.duration ?? 6}s loop in crisp motion, delivered as MP4.`
      : `${s.title} — a ${s.device} wallpaper in ${Math.max(s.w, s.h) >= 3840 ? "4K" : "HD"}. Optimized for crisp, vibrant display.`,
    originalPublicId: url,
    originalStoragePath: `originals/${id}.${s.live ? "mp4" : "jpg"}`,
    previewPublicId: url,
    kind: s.live ? "live" : "image",
    videoPublicId: s.video,
    durationSec: s.live ? (s.duration ?? 6) : undefined,
    categorySlug: s.category,
    tags: s.tags,
    device: s.device,
    resolution: `${s.w}x${s.h}`,
    width: s.w,
    height: s.h,
    ageRating,
    isMature: Boolean(s.mature),
    priceCents,
    isPremium,
    seoTitle: `${s.title} ${Math.max(s.w, s.h) >= 3840 ? "4K" : "HD"} ${s.device} Wallpaper | Wallora`,
    seoDescription: `Download ${s.title}, a premium ${s.category} wallpaper for ${s.device}. ${isPremium ? "Available in original high resolution." : "Free download."}`,
    isFeatured: i < 6,
    holidayTags: s.holiday ?? ["none"],
    downloads: ((i * 137) % 900) + 12,
    createdAt,
  } satisfies Wallpaper;
});

export const SEED_CATEGORIES = CATEGORIES.map((c) => ({
  id: `cat_${c.slug}`,
  slug: c.slug,
  name: c.name,
  description: c.description,
}));

export const SEED_FEATURED: FeaturedItem[] = [
  {
    slot: "day",
    wallpaperId: "wp_001",
    title: "Alpine Dawn",
    caption: "Wallpaper of the Day",
    description: "Start your day above the clouds.",
    displayDate: new Date(Date.UTC(2026, 5, 7)).toISOString(),
    holidayType: "none",
    adminOverride: false,
  },
  {
    slot: "week",
    wallpaperId: "wp_010",
    title: "Nebula Bloom",
    caption: "Wallpaper of the Week",
    description: "Lose yourself in the cosmos this week.",
    displayDate: new Date(Date.UTC(2026, 5, 1)).toISOString(),
    holidayType: "none",
    adminOverride: false,
  },
];

/**
 * Sample blog posts loaded by the optional demo content action. The live site
 * ships with no posts — admins author their own from the dashboard.
 */
export const SEED_POSTS: Post[] = [
  {
    id: "post_welcome",
    slug: "welcome-to-wallora",
    title: "Welcome to Wallora",
    excerpt:
      "How to find, preview and download wallpapers that look great on every screen.",
    body: "Wallora is a curated marketplace for high-resolution wallpapers.\n\nBrowse by category, filter by your device, and preview every wallpaper in detail before you download. Free wallpapers download instantly — premium pieces are delivered in full original resolution after checkout.\n\nThanks for stopping by. New collections drop every week.",
    coverImage: "",
    author: "The Wallora Team",
    tags: ["announcements", "guide"],
    published: true,
    seoTitle: "Welcome to Wallora",
    seoDescription:
      "How to find, preview and download wallpapers that look great on every screen.",
    createdAt: new Date(Date.UTC(2026, 5, 1)).toISOString(),
    updatedAt: new Date(Date.UTC(2026, 5, 1)).toISOString(),
  },
  {
    id: "post_choosing-resolution",
    slug: "choosing-the-right-resolution",
    title: "Choosing the right wallpaper resolution",
    excerpt:
      "4K, 2K or HD? A quick guide to picking the sharpest wallpaper for your device.",
    body: "A wallpaper looks its best when its resolution matches — or exceeds — your screen.\n\nFor most laptops and desktops, a 4K (3840×2160) wallpaper is a safe choice. Phones are taller than they are wide, so look for portrait resolutions like 1170×2532.\n\nEvery Wallora listing shows the exact resolution and the device it's optimised for, so you can pick with confidence.",
    coverImage: "",
    author: "The Wallora Team",
    tags: ["guide", "tips"],
    published: true,
    seoTitle: "Choosing the right wallpaper resolution",
    seoDescription:
      "4K, 2K or HD? A quick guide to picking the sharpest wallpaper for your device.",
    createdAt: new Date(Date.UTC(2026, 5, 4)).toISOString(),
    updatedAt: new Date(Date.UTC(2026, 5, 4)).toISOString(),
  },
];
