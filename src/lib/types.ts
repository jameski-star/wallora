/** Wallora domain types — shared across the data layer, UI, and APIs. */

export type DeviceType = "desktop" | "phone" | "tablet";

/** Static image vs. looping "live" video wallpaper. */
export type WallpaperKind = "image" | "live";

export type AgeRating = "everyone" | "13+" | "16+" | "18+";

export type HolidayType =
  | "christmas"
  | "easter"
  | "valentines"
  | "new-year"
  | "halloween"
  | "independence"
  | "none";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface Wallpaper {
  id: string;
  slug: string;
  title: string;
  description: string;

  /** Cloudinary public id (or absolute URL) of the ORIGINAL high-res asset.
   * For FREE wallpapers this is also the download source. */
  originalPublicId: string;
  /** PREMIUM only: storage path of the private original in the Supabase premium
   * bucket. Delivered via signed URL after purchase; never public. Unused for
   * free wallpapers (those download straight from Cloudinary). */
  originalStoragePath: string;
  /** Cloudinary public id used to derive the public preview (premium previews
   * are resolution-capped; free previews are served at full size). */
  previewPublicId: string;

  /**
   * "image" (default) or "live". Optional so legacy/Supabase rows that don't
   * carry the field are treated as static images.
   */
  kind?: WallpaperKind;
  /**
   * Live wallpapers only: Cloudinary public id (or absolute URL) of the
   * short looping preview video. The poster falls back to the still preview
   * derived from `previewPublicId`.
   */
  videoPublicId?: string;
  /** Live wallpapers only: loop length in seconds (display metadata). */
  durationSec?: number;

  categorySlug: string;
  tags: string[];
  device: DeviceType;
  resolution: string; // e.g. "3840x2160"
  width: number;
  height: number;

  ageRating: AgeRating;
  isMature: boolean;

  priceCents: number; // 0 => free
  isPremium: boolean;

  // SEO
  seoTitle: string;
  seoDescription: string;

  // Featured / holiday
  isFeatured: boolean;
  holidayTags: HolidayType[];

  downloads: number;
  createdAt: string; // ISO
}

export type FeatureSlot = "day" | "week";

export interface FeaturedItem {
  slot: FeatureSlot;
  wallpaperId: string;
  title: string;
  caption: string;
  description: string;
  displayDate: string; // ISO date
  holidayType: HolidayType;
  /** Set when an admin pins this slot, suppressing cron automation. */
  adminOverride: boolean;
}

/** Blog post (CMS). Unpublished drafts are hidden from the public site. */
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Plain-text / lightly-formatted body, rendered as paragraphs. */
  body: string;
  /** Cover image: Cloudinary public id or absolute URL. Optional. */
  coverImage: string;
  author: string;
  tags: string[];
  published: boolean;
  // SEO
  seoTitle: string;
  seoDescription: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type UserRole = "user" | "admin";

export interface Profile {
  id: string; // matches auth user id
  email: string;
  displayName: string;
  dateOfBirth: string | null; // ISO date
  role: UserRole;
  createdAt: string;
}

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export interface OrderItem {
  wallpaperId: string;
  title: string;
  priceCents: number;
}

export interface Order {
  id: string;
  userId: string | null;
  email: string;
  items: OrderItem[];
  totalCents: number;
  currency: string;
  status: OrderStatus;
  // PesaPal linkage
  pesapalTrackingId: string | null;
  pesapalMerchantRef: string;
  createdAt: string;
  paidAt: string | null;
}

/** A logged-in viewer's gating context (or guest). */
export interface Viewer {
  profile: Profile | null;
  isAdult: boolean;
  isAdmin: boolean;
}

export interface WallpaperQuery {
  category?: string;
  tag?: string;
  device?: DeviceType;
  /** Filter by media kind (e.g. only live wallpapers). */
  kind?: WallpaperKind;
  search?: string;
  premium?: boolean;
  sort?: "newest" | "popular" | "price-asc" | "price-desc";
  limit?: number;
  offset?: number;
}
