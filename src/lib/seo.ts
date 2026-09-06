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
    default: `${SITE_NAME} — Best 4K, OLED & Live Wallpapers for PC & Mobile`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Download uncompressed 4K, true OLED & live motion wallpapers. Hand-curated for PC, Mac, ultrawide & mobile screens. Zero watermarks, instant download ✓",
  keywords: [
    "4k wallpapers",
    "live wallpapers",
    "oled wallpapers",
    "best wallpaper sites",
    "wallpaper engine alternatives",
    "desktop backgrounds",
    "ultrawide wallpapers",
    "phone wallpapers",
    "hd backgrounds",
    "pc setup wallpapers",
    "dark aesthetic wallpapers",
  ],
  // Default canonical for the home route. Sub-pages override this in their own
  // generateMetadata (e.g. wallpaperMetadata, the /wallpapers and /blog pages).
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Best 4K, OLED & Live Wallpapers for PC & Mobile`,
    description:
      "Download uncompressed 4K, true OLED & live motion wallpapers. Hand-curated for PC, Mac, ultrawide & mobile screens. Zero watermarks, instant download ✓",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Best 4K, OLED & Live Wallpapers for PC & Mobile`,
    description:
      "Download uncompressed 4K, true OLED & live motion wallpapers. Hand-curated for PC, Mac, ultrawide & mobile screens. Zero watermarks, instant download ✓",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(env.googleSiteVerification
    ? { verification: { google: env.googleSiteVerification } }
    : {}),
};

/** Per-wallpaper metadata (canonical, OG image, Twitter card, keywords). */
export function wallpaperMetadata(w: Wallpaper): Metadata {
  const url = abs(`/wallpapers/${w.slug}`);
  const image = ogImageUrl(w);
  const kw = [
    w.title,
    w.categorySlug,
    w.device,
    w.resolution,
    w.isPremium ? "premium wallpaper" : "free 4k wallpaper",
    w.kind === "live" ? "live wallpaper loop" : "4k wallpaper",
    "uncompressed wallpaper",
    ...w.tags,
  ].filter(Boolean);

  const is4K = Math.max(w.width, w.height) >= 3840;
  const resolutionLabel = is4K ? "4K UHD" : w.resolution;

  // Optimized Title Formula (50–60 characters) with emotional hooks & brand anchor
  const computedTitle =
    w.seoTitle ||
    (w.kind === "live"
      ? `${w.title} · 4K Live Wallpaper Loop | ${SITE_NAME}`
      : w.device === "phone"
        ? `${w.title} · 4K OLED Phone Wallpaper | ${SITE_NAME}`
        : `${w.title} · ${resolutionLabel} Wallpaper for ${w.device === "desktop" ? "Desktop" : "Tablet"} | ${SITE_NAME}`);

  // Optimized Meta Description (150–160 characters) with active benefits & CTA
  const computedDescription =
    w.seoDescription ||
    `Download ${w.title} in native ${w.resolution}. Hand-curated for ${w.device} displays with pristine color accuracy. ${
      w.isPremium ? "Uncompressed original master file." : "100% free instant download."
    } No watermarks ✓`;

  return {
    title: computedTitle,
    description: computedDescription,
    keywords: kw,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: computedTitle,
      description: computedDescription,
      images: [{ url: image, width: 1200, height: 630, alt: `${w.title} — ${w.resolution} Wallpaper Preview` }],
      ...(w.createdAt ? { publishedTime: w.createdAt } : {}),
      tags: kw,
    },
    twitter: {
      card: "summary_large_image",
      title: computedTitle,
      description: computedDescription,
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
    copyrightNotice: `\u00A9 ${new Date().getFullYear()} ${SITE_NAME}`,
    license: url,
    acquireLicensePage: url,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: abs("/icon.png") },
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
    logo: abs("/icon.png"),
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

/** FAQPage JSON-LD — emits rich schema for Google SERP collapsible FAQ accordions and AI search engines. */
export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  };
}

/** Extracts Q&A pairs from a markdown string under a 'Frequently Asked Questions' heading. */
export function extractFaqsFromMarkdown(markdown: string): { question: string; answer: string }[] {
  const match = markdown.match(/##\s+Frequently Asked Questions[\s\S]*$/i);
  if (!match) return [];
  const section = match[0];
  const items: { question: string; answer: string }[] = [];

  const h3Parts = section.split(/\n###\s+/);
  if (h3Parts.length > 1) {
    for (const part of h3Parts.slice(1)) {
      const lines = part.split("\n").filter((l) => l.trim() !== "");
      if (lines.length >= 2) {
        const question = lines[0].replace(/\?*$/, "").trim() + "?";
        const answerLines: string[] = [];
        for (let j = 1; j < lines.length; j++) {
          if (/^#{1,3}\s+/.test(lines[j])) break;
          answerLines.push(lines[j]);
        }
        const answer = answerLines
          .join(" ")
          .replace(/[*_#`]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (question && answer) {
          items.push({ question, answer });
        }
      }
    }
  }
  return items.slice(0, 10);
}
