import type { Metadata } from "next";
import { env } from "./env";
import { SITE_NAME, SITE_TAGLINE } from "./constants";
import { ogImageUrl, previewUrl } from "./cloudinary";
import type { Wallpaper } from "./types";

export const SITE_URL = env.siteUrl.replace(/\/$/, "");

/** Absolute URL for a path. */
export function abs(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Aurava is a curated premium wallpaper marketplace offering hand-picked 4K and HD wallpapers for desktop, phone, and tablet. Browse free and premium designs across 20+ categories.",
  keywords: ["wallpapers", "4k wallpapers", "hd wallpapers", "desktop", "phone", "premium"],
  // Default canonical for the home route. Sub-pages override this in their own
  // generateMetadata (e.g. wallpaperMetadata, the /wallpapers and /blog pages).
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: "Premium 4K & HD wallpapers for every device.",
    // og:image is supplied automatically by the app/opengraph-image.tsx file
    // convention (and per-wallpaper/per-post pages set their own image).
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: "Premium 4K & HD wallpapers for every device.",
    // twitter:image likewise comes from app/twitter-image.tsx.
  },
  robots: {
    index: true,
    follow: true,
    // Let Google show full-size image thumbnails and untruncated snippets —
    // essential for an image-first catalog to win Google Images + rich results.
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Emits <meta name="google-site-verification"> only when the token is set.
  ...(env.googleSiteVerification
    ? { verification: { google: env.googleSiteVerification } }
    : {}),
};

/** Per-wallpaper metadata (canonical, OG image, Twitter card, keywords). */
export function wallpaperMetadata(w: Wallpaper): Metadata {
  const url = abs(`/wallpapers/${w.slug}`);
  const image = ogImageUrl(w);
  // Build a keyword list that includes the wallpaper's own tags plus its
  // category and device type — these become the <meta name="keywords"> and
  // also feed article:tag for OG consumers.
  const kw = [
    w.title,
    w.categorySlug,
    w.device,
    w.resolution,
    w.isPremium ? "premium wallpaper" : "free wallpaper",
    w.kind === "live" ? "live wallpaper" : "",
    ...w.tags,
  ].filter(Boolean);
  return {
    title: w.seoTitle || `${w.title} Wallpaper`,
    description: w.seoDescription || w.description,
    keywords: kw,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: w.seoTitle || w.title,
      description: w.seoDescription || w.description,
      images: [{ url: image, width: 1200, height: 630, alt: w.title }],
      // article:tag surfaces each wallpaper's tags to social crawlers,
      // helping them categorise and surface the content.
      ...(w.createdAt ? { publishedTime: w.createdAt } : {}),
      tags: kw,
    },
    twitter: {
      card: "summary_large_image",
      title: w.seoTitle || w.title,
      description: w.seoDescription || w.description,
      images: [image],
    },
  };
}

/** JSON-LD for a single wallpaper — rich ImageObject with indexing signals. */
export function wallpaperJsonLd(w: Wallpaper) {
  const url = abs(`/wallpapers/${w.slug}`);
  const image = ogImageUrl(w);
  const thumb = previewUrl(w, { width: 300, quality: 60 });
  // keywords = tags + category + device + resolution — gives Google many
  // long-tail entry points per wallpaper ("4k nature wallpaper desktop" etc.)
  const keywords = [
    ...w.tags,
    w.categorySlug,
    w.device,
    w.resolution,
    w.kind === "live" ? "live wallpaper" : "wallpaper",
  ];
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: w.seoTitle || w.title,
    description: w.seoDescription || w.description,
    contentUrl: image,
    thumbnailUrl: thumb,
    width: w.width,
    height: w.height,
    representativeOfPage: true,
    url,
    keywords: keywords.join(", "),
    uploadDate: w.createdAt,
    encodingFormat: w.kind === "live" ? "video/mp4" : "image/jpeg",
    isFamilyFriendly: !w.isMature,
    genre: w.categorySlug,
    creditText: SITE_NAME,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: abs("/icon.svg") },
    },
    ...(w.isPremium
      ? {
          offers: {
            "@type": "Offer",
            price: (w.priceCents / 100).toFixed(2),
            priceCurrency: env.pesapalCurrency,
            availability: "https://schema.org/InStock",
            url,
          },
          license: url,
          acquireLicensePage: url,
          copyrightNotice: `© ${new Date().getFullYear()} ${SITE_NAME}`,
        }
      : {}),
  };
}

/** WebPage JSON-LD wrapping a wallpaper — helps Google pick the right thumbnail. */
export function wallpaperWebPageJsonLd(w: Wallpaper) {
  const url = abs(`/wallpapers/${w.slug}`);
  const image = ogImageUrl(w);
  const thumb = previewUrl(w, { width: 300, quality: 60 });
  const keywords = [
    ...w.tags,
    w.categorySlug,
    w.device,
    w.resolution,
    w.kind === "live" ? "live wallpaper" : "wallpaper",
  ];
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: w.seoTitle || `${w.title} Wallpaper — ${SITE_NAME}`,
    description: w.seoDescription || w.description,
    keywords: keywords.join(", "),
    datePublished: w.createdAt,
    dateModified: w.createdAt,
    isFamilyFriendly: !w.isMature,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": `${url}#primaryimage`,
      url: image,
      width: w.width,
      height: w.height,
      thumbnailUrl: thumb,
      caption: `${w.title} — ${w.device} wallpaper preview`,
    },
  };
}

/** JSON-LD breadcrumb. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/**
 * Organization JSON-LD — establishes the brand entity for Google's knowledge
 * graph and makes the logo eligible to appear beside results. Add public
 * profile URLs to `sameAs` (X, Instagram, Pinterest, etc.) as they go live;
 * `sameAs` is the strongest signal tying those profiles to this brand.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs("/icon.svg"),
    description: BRAND_DESCRIPTION,
    // TODO: add brand profile URLs once live, e.g.
    // sameAs: ["https://x.com/...", "https://instagram.com/...", "https://pinterest.com/..."],
    sameAs: [] as string[],
  };
}

/** Human-readable brand description used in JSON-LD and meta tags. */
const BRAND_DESCRIPTION =
  "Aurava is a curated premium wallpaper marketplace offering hand-picked 4K and HD wallpapers for desktop, phone, and tablet. Browse free and premium designs across 20+ categories including nature, gaming, anime, dark/OLED, space, and more.";

/** Organization/website JSON-LD with SearchAction. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: BRAND_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/wallpapers?search={query}`,
      "query-input": "required name=query",
    },
  };
}

/** Homepage WebPage JSON-LD — tells AI browsers what Aurava is. */
export function homePageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: BRAND_DESCRIPTION,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: BRAND_DESCRIPTION,
    },
  };
}

/** ItemList JSON-LD for a category page — tells Google the page is a curated collection. */
export function categoryItemListJsonLd(
  category: { slug: string; name: string; description: string },
  wallpapers: { slug: string; title: string }[],
  richDescription?: string,
) {
  const url = abs(`/wallpapers/${category.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} Wallpapers`,
    description: richDescription || category.description,
    url,
    numberOfItems: wallpapers.length,
    itemListElement: wallpapers.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: w.title,
      url: abs(`/wallpapers/${w.slug}`),
    })),
  };
}
