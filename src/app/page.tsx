import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { MasonryGrid } from "@/components/masonry-grid";
import { FeaturedHero } from "@/components/featured-hero";
import { FadeInView } from "@/components/motion";
import { JsonLd } from "@/components/json-ld";
import { homePageJsonLd } from "@/lib/seo";
import {
  listWallpapers,
  listCategories,
} from "@/lib/catalog";
import { getFeaturedForDisplay } from "@/lib/featured";
import { previewUrl, videoPreviewUrl } from "@/lib/cloudinary";
import { SITE_NAME } from "@/lib/constants";

export default async function HomePage() {
  const [featured, week, popular, fresh, live, categories] = await Promise.all([
    getFeaturedForDisplay("day"),
    getFeaturedForDisplay("week"),
    listWallpapers({ sort: "popular", limit: 12 }),
    listWallpapers({ sort: "newest", limit: 8 }),
    listWallpapers({ kind: "live", limit: 8 }),
    listCategories(),
  ]);

  // LCP hero image URL for manual preload (Cloudinary already optimizes,
  // so we bypass Next.js image proxy and preload directly).
  const heroSrc = featured
    ? previewUrl(featured.wallpaper, { width: 800 })
    : null;

  return (
    <Container className="py-8 sm:py-12">
      {/*
        The page's single, keyword-bearing <h1>. Visually hidden because the
        visual focus is the featured-wallpaper hero (whose title is a wallpaper
        *name*, rendered as <h2>), but search engines fully honour an sr-only
        h1 — it states what this page is actually about.
      */}
      <h1 className="sr-only">
        {`${SITE_NAME} — Premium 4K & HD Wallpapers for Desktop, Phone & Tablet`}
      </h1>

      {/* Preload the hero image for LCP — bypasses Next.js image proxy */}
      {heroSrc && (
        <link
          rel="preload"
          as="image"
          href={heroSrc}
          fetchPriority="high"
          imageSrcSet={heroSrc}
          imageSizes="(max-width:640px) 90vw, 600px"
        />
      )}

      {/* Wallpaper of the day — priority=true for LCP */}
      {featured ? (
        <FeaturedHero
          slug={featured.wallpaper.slug}
          title={featured.title}
          caption={featured.caption}
          description={featured.description}
          previewSrc={previewUrl(featured.wallpaper, { width: 800 })}
          width={featured.wallpaper.width}
          height={featured.wallpaper.height}
          device={featured.wallpaper.device}
          videoSrc={videoPreviewUrl(featured.wallpaper, { width: 700 })}
          priority
        />
      ) : (
        <div className="rounded-card border border-border bg-surface p-12 text-center">
          <p className="text-4xl font-bold">Aurava</p>
          <p className="mt-2 text-muted">Premium 4K & HD wallpapers</p>
          <ButtonLink href="/wallpapers" className="mt-6">Browse wallpapers</ButtonLink>
        </div>
      )}

      {/* Homepage WebPage schema — tells AI browsers what Aurava is (invisible, SEO-only) */}
      <JsonLd data={homePageJsonLd()} />

      {/* Categories — compact pill bar, hidden on mobile to keep the focus on images */}
      <div className="mt-8 hidden sm:flex flex-wrap items-center gap-2">
        <Link
          href="/wallpapers"
          className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/wallpapers/${c.slug}`}
            className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Trending */}
      <section className="mt-12">
        <FadeInView>
          <SectionHeading
            title="Trending"
            action={
              <Link href="/wallpapers?sort=popular" className="hidden items-center gap-1 text-sm text-accent hover:underline sm:flex">
                See all <ArrowRight size={14} />
              </Link>
            }
          />
        </FadeInView>
        <MasonryGrid wallpapers={popular} />
      </section>

      {/* Live wallpapers */}
      {live.length > 0 && (
        <section className="mt-12">
          <FadeInView>
            <SectionHeading
              title={
                <span className="inline-flex items-center gap-2.5">
                  <span className="relative grid size-2.5 place-items-center">
                    <span className="absolute size-2.5 animate-ping rounded-full bg-accent opacity-75" />
                    <span className="size-2 rounded-full bg-accent" />
                  </span>
                  Live wallpapers
                </span>
              }
              action={
                <Link href="/wallpapers?kind=live" className="hidden items-center gap-1 text-sm text-accent hover:underline sm:flex">
                  See all <ArrowRight size={14} />
                </Link>
              }
            />
          </FadeInView>
          <MasonryGrid wallpapers={live} />
        </section>
      )}

      {/* Wallpaper of the week */}
      {week && (
        <section className="mt-12">
          <FadeInView>
            <SectionHeading title="Wallpaper of the week" />
          </FadeInView>
          <FeaturedHero
            slug={week.wallpaper.slug}
            title={week.title}
            caption={week.caption}
            description={week.description}
            previewSrc={previewUrl(week.wallpaper, { width: 800 })}
            width={week.wallpaper.width}
            height={week.wallpaper.height}
            device={week.wallpaper.device}
            videoSrc={videoPreviewUrl(week.wallpaper, { width: 700 })}
          />
        </section>
      )}

      {/* Fresh */}
      <section className="mt-12">
        <FadeInView>
          <SectionHeading title="Fresh drops" />
        </FadeInView>
        <MasonryGrid wallpapers={fresh} />
      </section>
    </Container>
  );
}
