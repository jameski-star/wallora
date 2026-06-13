import Link from "next/link";
import { ArrowRight, Shield, Zap, Sparkles } from "lucide-react";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { MasonryGrid } from "@/components/masonry-grid";
import { FeaturedHero } from "@/components/featured-hero";
import { FadeInView } from "@/components/motion";
import {
  listWallpapers,
  listCategories,
  getFeaturedWallpaper,
} from "@/lib/catalog";
import { previewUrl } from "@/lib/cloudinary";
import { CATEGORIES, SITE_TAGLINE } from "@/lib/constants";

export default async function HomePage() {
  const [featured, week, popular, fresh, live, categories] = await Promise.all([
    getFeaturedWallpaper("day"),
    getFeaturedWallpaper("week"),
    listWallpapers({ sort: "popular", limit: 12 }),
    listWallpapers({ sort: "newest", limit: 8 }),
    listWallpapers({ kind: "live", limit: 8 }),
    listCategories(),
  ]);

  return (
    <Container className="py-8 sm:py-12">
      {/* Hero */}
      {featured ? (
        <FeaturedHero
          slug={featured.wallpaper.slug}
          title={featured.title}
          caption={featured.caption}
          description={featured.description}
          previewSrc={previewUrl(featured.wallpaper, { width: 1100 })}
          width={featured.wallpaper.width}
          height={featured.wallpaper.height}
        />
      ) : (
        <div className="rounded-card border border-border bg-surface p-12 text-center">
          <h1 className="text-4xl font-bold">Aurava</h1>
          <p className="mt-2 text-muted">{SITE_TAGLINE}</p>
          <ButtonLink href="/wallpapers" className="mt-6">Browse wallpapers</ButtonLink>
        </div>
      )}

      {/* Value props */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Sparkles, title: "Curated 4K & HD", body: "Hand-picked, high-resolution art for every screen." },
          { icon: Shield, title: "Protected previews", body: "Reduced-resolution previews; full-res originals delivered securely after purchase." },
          { icon: Zap, title: "Instant delivery", body: "Pay and download via a secure, expiring link." },
        ].map((f) => (
          <div key={f.title} className="rounded-card border border-border bg-surface p-5">
            <f.icon className="mb-3 text-accent" size={22} />
            <p className="font-semibold">{f.title}</p>
            <p className="mt-1 text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section className="mt-16">
        <SectionHeading
          title="Browse by category"
          subtitle="Find your vibe across our collections."
          action={
            <Link href="/wallpapers" className="hidden items-center gap-1 text-sm text-accent hover:underline sm:flex">
              View all <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => {
            const meta = CATEGORIES.find((x) => x.slug === c.slug);
            return (
              <Link
                key={c.slug}
                href={`/wallpapers/${c.slug}`}
                className="group rounded-xl border border-border bg-surface p-4 text-center transition hover:border-accent/50 hover:bg-surface-2"
              >
                <p className="font-medium group-hover:text-accent">{c.name}</p>
                <p className="mt-1 line-clamp-1 text-xs text-muted">{meta?.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section className="mt-16">
        <FadeInView>
          <SectionHeading
            title="Trending now"
            subtitle="The most downloaded wallpapers this week."
            action={
              <Link href="/wallpapers?sort=popular" className="hidden items-center gap-1 text-sm text-accent hover:underline sm:flex">
                See more <ArrowRight size={14} />
              </Link>
            }
          />
        </FadeInView>
        <MasonryGrid wallpapers={popular} />
      </section>

      {/* Live wallpapers */}
      {live.length > 0 && (
        <section className="mt-16">
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
              subtitle="Wallpapers that move. Hover to preview the loop."
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
        <section className="mt-16">
          <FeaturedHero
            slug={week.wallpaper.slug}
            title={week.title}
            caption={week.caption}
            description={week.description}
            previewSrc={previewUrl(week.wallpaper, { width: 1100 })}
            width={week.wallpaper.width}
            height={week.wallpaper.height}
          />
        </section>
      )}

      {/* Fresh */}
      <section className="mt-16">
        <FadeInView>
          <SectionHeading title="Fresh drops" subtitle="Newest additions to the collection." />
        </FadeInView>
        <MasonryGrid wallpapers={fresh} />
      </section>
    </Container>
  );
}
