import type { Metadata } from "next";
import { env } from "./env";
import { SITE_NAME, SITE_TAGLINE } from "./constants";
import { ogImageUrl } from "./cloudinary";
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
    "Aurava is a premium wallpaper marketplace. Browse and download stunning 4K & HD wallpapers for desktop, phone and tablet.",
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

/** Per-wallpaper metadata (canonical, OG image, Twitter card). */
export function wallpaperMetadata(w: Wallpaper): Metadata {
  const url = abs(`/wallpapers/${w.slug}`);
  const image = ogImageUrl(w);
  return {
    title: w.seoTitle || `${w.title} Wallpaper`,
    description: w.seoDescription || w.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: w.seoTitle || w.title,
      description: w.seoDescription || w.description,
      images: [{ url: image, width: 1200, height: 630, alt: w.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: w.seoTitle || w.title,
      description: w.seoDescription || w.description,
      images: [image],
    },
  };
}

/** JSON-LD for a single wallpaper (ImageObject + Product offer). */
export function wallpaperJsonLd(w: Wallpaper) {
  const url = abs(`/wallpapers/${w.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: w.title,
    description: w.seoDescription || w.description,
    contentUrl: ogImageUrl(w),
    width: w.width,
    height: w.height,
    representativeOfPage: true,
    url,
    ...(w.isPremium
      ? {
          offers: {
            "@type": "Offer",
            price: (w.priceCents / 100).toFixed(2),
            priceCurrency: env.pesapalCurrency,
            availability: "https://schema.org/InStock",
            url,
          },
        }
      : {}),
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
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs("/icon.svg"),
    description:
      "Aurava is a premium wallpaper marketplace offering curated 4K & HD wallpapers for desktop, phone and tablet.",
    // TODO: add brand profile URLs once live, e.g.
    // sameAs: ["https://x.com/...", "https://instagram.com/...", "https://pinterest.com/..."],
    sameAs: [] as string[],
  };
}

/** Organization/website JSON-LD with SearchAction. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/wallpapers?search={query}`,
      "query-input": "required name=query",
    },
  };
}
