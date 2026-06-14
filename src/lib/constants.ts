import type { AgeRating, DeviceType, HolidayType } from "./types";

export const SITE_NAME = "Aurava";
export const SITE_TAGLINE = "Premium wallpapers in stunning 4K & HD";

// ── Legal / contact ────────────────────────────────────────────────────────
// TODO: replace these placeholders with your registered business details
// before launch, and have the legal pages reviewed by a professional.
export const LEGAL_ENTITY = "Aurava"; // registered business / trading name
export const SITE_CONTACT_EMAIL = "James@auravaw.tech";
export const LEGAL_JURISDICTION = "Kenya";
export const LEGAL_LAST_UPDATED = "10 June 2026";

/** Footer/legal navigation. */
export const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund Policy" },
  { href: "/license", label: "Content License" },
] as const;

export const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "phone", label: "Phone" },
  { value: "tablet", label: "Tablet" },
];

export const AGE_RATINGS: AgeRating[] = ["everyone", "13+", "16+", "18+"];

/** Minimum age (years) at which a rating becomes viewable. */
export const AGE_RATING_MIN_YEARS: Record<AgeRating, number> = {
  everyone: 0,
  "13+": 13,
  "16+": 16,
  "18+": 18,
};

export const ADULT_AGE = 18;

/**
 * Default category taxonomy. These seed the catalog's category list (the site's
 * navigation structure) but carry NO wallpapers by themselves — admins add
 * wallpapers, and can create/rename/delete categories from the dashboard.
 */
export const CATEGORIES = [
  { slug: "nature", name: "Nature", description: "Landscapes, forests, oceans and skies in breathtaking detail." },
  { slug: "cars", name: "Cars", description: "Supercars, classics and concept machines." },
  { slug: "sports", name: "Sports", description: "Action, athletes and iconic moments." },
  { slug: "space", name: "Space", description: "Galaxies, nebulae and the cosmos." },
  { slug: "gaming", name: "Gaming", description: "Worlds, characters and key art from games." },
  { slug: "anime", name: "Anime", description: "Hand-picked anime and illustration art." },
  { slug: "technology", name: "Technology", description: "Abstract tech, circuits and futurism." },
  { slug: "abstract", name: "Abstract", description: "Shapes, gradients and generative art." },
  { slug: "minimal", name: "Minimal", description: "Clean, simple and distraction-free designs." },
  { slug: "dark", name: "Dark", description: "Deep blacks and moody, OLED-friendly tones." },
  { slug: "cities", name: "Cities", description: "Skylines, streets and urban architecture." },
  { slug: "animals", name: "Animals", description: "Wildlife, pets and creatures great and small." },
  { slug: "illustration", name: "Illustration", description: "Digital painting, concept art and illustration." },
  { slug: "music", name: "Music", description: "Artists, instruments and album-inspired art." },
  { slug: "movies", name: "Movies & TV", description: "Cinematic key art and iconic scenes." },
  { slug: "travel", name: "Travel", description: "Destinations, landmarks and wanderlust." },
  { slug: "food", name: "Food & Drink", description: "Delicious flat-lays and culinary close-ups." },
  { slug: "flowers", name: "Flowers", description: "Botanical blooms and floral close-ups." },
  { slug: "seasons", name: "Seasons", description: "Spring, summer, autumn and winter moods." },
  { slug: "patterns", name: "Patterns", description: "Geometric, textile and repeating textures." },
] as const;

export const POPULAR_TAGS = [
  "nature", "cars", "sports", "space", "gaming", "anime", "technology",
  "abstract", "minimal", "dark", "neon", "sunset", "mountains", "ocean",
  "christmas", "easter", "valentines", "halloween", "new-year",
];

/** Map Nager.Date holiday names → our holiday tags. */
export const HOLIDAY_KEYWORDS: { match: RegExp; type: HolidayType }[] = [
  { match: /christmas/i, type: "christmas" },
  { match: /easter/i, type: "easter" },
  { match: /valentine/i, type: "valentines" },
  { match: /new year/i, type: "new-year" },
  { match: /halloween/i, type: "halloween" },
  { match: /independence/i, type: "independence" },
];

/** Weekly seasonal windows (month is 1-based) → holiday tag. */
export const SEASONAL_WEEKS: { type: HolidayType; from: [number, number]; to: [number, number] }[] = [
  { type: "new-year", from: [12, 27], to: [1, 5] },
  { type: "valentines", from: [2, 8], to: [2, 14] },
  { type: "easter", from: [3, 25], to: [4, 25] },
  { type: "halloween", from: [10, 25], to: [10, 31] },
  { type: "christmas", from: [12, 18], to: [12, 26] },
];

export const HOLIDAY_LABELS: Record<HolidayType, string> = {
  christmas: "Christmas",
  easter: "Easter",
  valentines: "Valentine's",
  "new-year": "New Year",
  halloween: "Halloween",
  independence: "Independence Day",
  none: "Featured",
};

export const ADMIN_ROUTE = "/admin-dash";
