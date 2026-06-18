# Aurava — SEO Guide

This documents the SEO state of the site (https://www.auravaw.tech), what was changed in this
optimization pass, and — most importantly — the **off-page steps you must do yourself** to
actually rank. Code makes the site *eligible* and *attractive* in search results; authority and
content win the top spot.

> **Set expectations honestly:** search **engines** rank pages, not browsers. "Rank #1 in every
> browser" means ranking in **Google** (default in Chrome, Safari, Firefox) and **Bing** (default
> in Edge). No code change guarantees #1 — that comes from relevant content, backlinks, and time.
> What we did is remove every technical blocker and maximize click-through and rich-result
> eligibility so you can compete.

---

## What was already in place (good baseline)

- Per-page metadata via `generateMetadata` (titles, descriptions, canonicals)
- JSON-LD: WebSite (+ SearchAction), BlogPosting, ImageObject + Offer, BreadcrumbList
- `robots.txt` (`src/app/robots.ts`) with admin/checkout/api disallowed + sitemap reference
- Image-enabled `sitemap.xml` (`src/app/sitemap.ts`) covering wallpapers, categories, posts, legal
- Age-gated metadata so 18+ content doesn't leak titles/images to guests
- Optimized images (Next/Image + Cloudinary), preloaded LCP hero image

## What this pass changed

| # | Fix | Files |
|---|-----|-------|
| 1 | **Keyword-bearing `<h1>`** on the homepage (sr-only) + demoted the two hero titles from `<h1>` to `<h2>` so there's exactly one, topical H1 | `src/app/page.tsx`, `src/components/featured-hero.tsx` |
| 2 | **Default social share image** (branded 1200×630) for the homepage and all pages without their own art | `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx` |
| 3 | **Organization JSON-LD** (name, url, logo, `sameAs` placeholder) for brand/knowledge-panel eligibility | `src/lib/seo.ts`, `src/app/layout.tsx` |
| 4 | **Web manifest + apple-icon + theme-color** for mobile/PWA & themed browser chrome | `src/app/manifest.ts`, `src/app/apple-icon.tsx` |
| 5 | **`max-image-preview:large`** (+ `max-snippet`/`max-video-preview` = -1) so Google can show large image thumbnails & full snippets — critical for an image-first catalog | `src/lib/seo.ts` |
| 6 | **Explicit homepage canonical** (`/`) | `src/lib/seo.ts` |
| 7 | **Google Search Console verification hook** via env var | `src/lib/seo.ts`, `src/lib/env.ts` |
| 8 | **Breadcrumb display names** ("Nature" not "nature") in visible nav + JSON-LD | `src/app/wallpapers/[slug]/page.tsx` |

---

## Action items you must complete (this is what actually moves rankings)

### 1. Verify the site in Google Search Console — **do this first**
1. Go to https://search.google.com/search-console and add property `https://www.auravaw.tech`.
2. Choose the **HTML tag** method; copy the `content="..."` token.
3. Add it to your environment (Vercel → Project → Settings → Environment Variables):
   ```
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-token-here
   ```
4. Redeploy, then click **Verify** in Search Console.
5. **Submit your sitemap**: Search Console → Sitemaps → enter `sitemap.xml` → Submit.
6. Use **URL Inspection → Request indexing** for the homepage and top wallpaper/category pages.

### 2. Verify in Bing Webmaster Tools (covers Edge + ~10% of search)
- https://www.bing.com/webmasters — add the site, import from Search Console, submit the sitemap.

### 3. Keyword strategy — target long-tail, not just "wallpapers"
"wallpapers" / "4k wallpapers" are dominated by giants (Unsplash, Wallhaven). Win specific
intent instead, then expand. Good targets to build pages/content around:
- `4k nature wallpaper download`, `live phone wallpaper`, `dark oled wallpaper 4k`
- `<category> wallpaper for [iphone|desktop|4k]` — one strong page per category × device
- Seasonal: `christmas wallpaper 4k`, `halloween phone wallpaper` (you already have holiday tags)

### 4. Content depth (the biggest lever after indexing)
- Add **unique intro copy (80–150 words)** to each category page — currently they're thin. Put it
  above the grid in `src/app/wallpapers/[slug]/page.tsx` (category branch), driven from
  `CATEGORIES[].description` expanded into real prose.
- Publish blog posts targeting the long-tail queries above (you already have `/blog` + BlogPosting
  schema). Internally link posts → relevant category/wallpaper pages.
- Make sure each wallpaper has a filled-in `seoTitle` / `seoDescription` and a real `description`.

### 5. Backlinks & authority (off-page — required for competitive terms)
- Submit collections to design/wallpaper directories and roundups.
- Share on Pinterest (huge for wallpaper discovery), Reddit (r/wallpapers, r/iWallpaper), X.
- Once you have social profiles, add their URLs to `sameAs` in `organizationJsonLd()`
  (`src/lib/seo.ts`) — it ties the brand together for Google.

### 6. Monitor & maintain
- Watch **Core Web Vitals** in Search Console (LCP/CLS/INP). The hero image is already
  preloaded; keep an eye on it as the catalog grows.
- Re-check coverage monthly; fix any "Crawled – not indexed" pages with better content.
- Validate structured data after deploys: https://search.google.com/test/rich-results

---

## How to verify the technical changes locally

```bash
pnpm build           # must compile clean
pnpm dev             # then, in another shell:

# Exactly one H1, and it's keyword-bearing:
curl -s localhost:3000/ | grep -o '<h1[^>]*>[^<]*</h1>'

# Branded social images render:
#   open http://localhost:3000/opengraph-image
#   open http://localhost:3000/twitter-image
#   open http://localhost:3000/apple-icon

# Manifest + key tags present:
curl -s localhost:3000/manifest.webmanifest
curl -s localhost:3000/ | grep -io 'max-image-preview:large\|og:image\|rel="canonical"\|application/ld+json'
```

After deploying, paste a wallpaper and a blog URL into the
[Rich Results Test](https://search.google.com/test/rich-results) and a page URL into the
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to confirm the cards.
