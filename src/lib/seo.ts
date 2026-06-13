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
    "Wallora is a premium wallpaper marketplace. Browse and download stunning 4K & HD wallpapers for desktop, phone and tablet.",
  keywords: ["wallpapers", "4k wallpapers", "hd wallpapers", "desktop", "phone", "premium"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: "Premium 4K & HD wallpapers for every device.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: "Premium 4K & HD wallpapers for every device.",
  },
  robots: { index: true, follow: true },
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
