import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, Monitor, Maximize2, Clapperboard } from "lucide-react";
import { Container, SectionHeading, Badge } from "@/components/ui";
import { ProtectedImage } from "@/components/protected-image";
import { LiveThumb } from "@/components/live-thumb";
import { BuyPanel } from "@/components/buy-panel";
import { MockupViewer, MockupTrigger } from "@/components/mockup-viewer";
import { MasonryGrid, MasonrySkeleton } from "@/components/masonry-grid";
import { Filters } from "@/components/filters";
import { JsonLd } from "@/components/json-ld";
import { getRepo } from "@/lib/repo";
import { listWallpapers, countWallpapers, getViewableWallpaper } from "@/lib/catalog";
import { previewUrl, videoPreviewUrl } from "@/lib/cloudinary";
import {
  wallpaperMetadata,
  wallpaperJsonLd,
  wallpaperWebPageJsonLd,
  breadcrumbJsonLd,
  categoryItemListJsonLd,
} from "@/lib/seo";
import { CATEGORIES } from "@/lib/constants";

import type { DeviceType, WallpaperQuery } from "@/lib/types";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}

export const unstable_instant = { prefetch: "static", unstable_disableValidation: true };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepo();

  const category = await repo.getCategory(slug);
  if (category) {
    const title = `${category.name} 4K Wallpapers · Ultra-HD Desktop & Mobile | Aurava`;
    const description = `Download pristine ${category.name.toLowerCase()} wallpapers in native 4K UHD. Curated for multi-monitor workstations, laptops & OLED screens. Free & instant download ✓`;
    const kw = [
      `${category.name.toLowerCase()} wallpapers`,
      `4k ${category.name.toLowerCase()} wallpapers`,
      `best ${category.name.toLowerCase()} backgrounds`,
      "4k wallpapers",
      "desktop backgrounds",
      "oled wallpapers",
      "wallpaper engine alternatives",
      category.slug,
    ];
    return {
      title,
      description,
      keywords: kw,
      alternates: { canonical: `/wallpapers/${slug}` },
      openGraph: {
        type: "website",
        title,
        description,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }

  // Use the GATED lookup so age-restricted wallpapers don't leak their title /
  // description / OG image to guests via metadata.
  const w = await getViewableWallpaper(slug);
  if (w) return wallpaperMetadata(w);
  // No category and nothing viewable → commit a real 404 before streaming.
  notFound();
}

export default function SlugPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <Container className="py-8 sm:py-12">
          <div className="mb-6 space-y-2">
            <div className="skeleton h-8 w-48 rounded-lg" />
            <div className="skeleton h-4 w-64 rounded" />
          </div>
          <div className="mb-6">
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
          <MasonrySkeleton count={12} />
        </Container>
      }
    >
      <SlugContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SlugContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const repo = await getRepo();

  // 1) Category listing?
  const category = await repo.getCategory(slug);
  if (category) {
    const query: WallpaperQuery = {
      category: slug,
      device: str(sp.device) as DeviceType | undefined,
      tag: str(sp.tag),
      kind: str(sp.kind) as WallpaperQuery["kind"],
      search: str(sp.search),
      premium:
        sp.premium === "true" ? true : sp.premium === "false" ? false : undefined,
      sort: (str(sp.sort) as WallpaperQuery["sort"]) ?? "newest",
      limit: 60,
    };

    const [wallpapers, total] = await Promise.all([
      listWallpapers(query),
      countWallpapers(query),
    ]);
    const meta = CATEGORIES.find((c) => c.slug === slug);
    return (
      <Container className="py-8 sm:py-12">
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Wallpapers", path: "/wallpapers" },
            { name: category.name, path: `/wallpapers/${slug}` },
          ])}
        />
        <JsonLd data={categoryItemListJsonLd(category, wallpapers, categoryIntro(category.slug, category.name, meta?.description))} />
        <SectionHeading title={`${category.name} wallpapers`} subtitle={meta?.description} />
        <div className="mt-4 mb-6 max-w-3xl text-sm leading-relaxed text-muted/95 bg-surface-2/40 p-4 rounded-card border border-border/55">
          <p>{categoryIntro(category.slug, category.name, meta?.description)}</p>
        </div>
        <p className="mb-4 text-sm text-muted font-medium">
          {total} wallpaper{total === 1 ? "" : "s"} found
        </p>

        {/* Horizontal Related Categories Strip for Authority Distribution */}
        <nav aria-label="Related categories" className="mb-6 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted mr-1">Other collections:</span>
          {CATEGORIES.filter((c) => c.slug !== slug).slice(0, 7).map((c) => (
            <Link
              key={c.slug}
              href={`/wallpapers/${c.slug}`}
              className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs text-muted hover:border-accent/40 hover:text-foreground transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="mb-6">
          <Filters lockedCategory={slug} />
        </div>
        <MasonryGrid wallpapers={wallpapers} />
      </Container>
    );
  }

  // 2) Single wallpaper.
  const w = await getViewableWallpaper(slug);
  if (!w) notFound();

  const related = (
    await listWallpapers({ category: w.categorySlug, limit: 9 })
  ).filter((r) => r.id !== w.id).slice(0, 8);

  return (
    <Container className="py-8 sm:py-12">
      <JsonLd data={wallpaperJsonLd(w)} />
      <JsonLd data={wallpaperWebPageJsonLd(w)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Wallpapers", path: "/wallpapers" },
          { name: categoryDisplayName(w.categorySlug), path: `/wallpapers/${w.categorySlug}` },
          { name: w.title, path: `/wallpapers/${w.slug}` },
        ])}
      />

      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/wallpapers" className="hover:text-foreground">Wallpapers</Link>
        <span>/</span>
        <Link href={`/wallpapers/${w.categorySlug}`} className="capitalize hover:text-foreground">
          {w.categorySlug}
        </Link>
        <span>/</span>
        <span className="text-foreground">{w.title}</span>
      </nav>

      <MockupViewer
        target={{
          id: w.id,
          slug: w.slug,
          title: w.title,
          device: w.device,
          priceCents: w.priceCents,
          isPremium: w.isPremium,
          previewSrc: previewUrl(w, { width: 1200, quality: 70 }),
          videoSrc: w.kind === "live" ? videoPreviewUrl(w, { width: 1000 }) : null,
          poster: previewUrl(w, { width: 1200, quality: 60 }),
          width: w.width,
          height: w.height,
        }}
      >
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <MockupTrigger className="group cursor-pointer overflow-hidden rounded-card border border-border bg-surface transition hover:border-accent/50">
          {w.kind === "live" && videoPreviewUrl(w, { width: 1400 }) ? (
            <LiveThumb
              videoSrc={videoPreviewUrl(w, { width: 1400 })!}
              poster={previewUrl(w, { width: 1400, quality: 60 })}
              alt={`${w.title} — live ${w.device} wallpaper preview`}
              width={w.width}
              height={w.height}
              priority
              sizes="(max-width:1024px) 100vw, 60vw"
              always
              contain
              />
          ) : (
            <ProtectedImage
              src={previewUrl(w, { width: 1400, quality: 60 })}
              alt={`${w.title} — ${w.device} wallpaper preview`}
              width={w.width}
              height={w.height}
              priority
              sizes="(max-width:1024px) 100vw, 60vw"
              contain
            />
          )}
          <p className="border-t border-border bg-surface/80 py-2 text-center text-xs text-muted transition group-hover:text-foreground">
            Tap to see it on a real {w.device}
          </p>
        </MockupTrigger>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {w.kind === "live" && (
                <Badge tone="accent">
                  <Clapperboard size={12} /> Live
                </Badge>
              )}
              {w.isMature && <Badge tone="mature">18+</Badge>}
              <Badge tone="accent">{w.ageRating}</Badge>
              {w.holidayTags.filter((h) => h !== "none").map((h) => (
                <Badge key={h}>{h}</Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{w.title}</h1>
            <p className="mt-2 text-muted">{w.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Spec icon={<Maximize2 size={15} />} label="Resolution" value={w.resolution} />
            <Spec icon={<Monitor size={15} />} label="Device" value={w.device} />
            {w.kind === "live" && (
              <Spec
                icon={<Clapperboard size={15} />}
                label="Format"
                value={`Live · ${w.durationSec ?? 6}s loop`}
              />
            )}
            <Spec icon={<Download size={15} />} label="Downloads" value={String(w.downloads)} />
            <Spec label="Category" value={w.categorySlug} />
          </dl>

          <div className="rounded-card border border-border bg-surface p-5">
            <BuyPanel
              w={{
                id: w.id,
                slug: w.slug,
                title: w.title,
                device: w.device,
                priceCents: w.priceCents,
                isPremium: w.isPremium,
                previewSrc: previewUrl(w, { width: 600 }),
              }}
            />
          </div>

          {/* Contextual Guide Link: Asset -> Cluster Link */}
          {w.kind === "live" && (
            <div className="rounded-card border border-accent/30 bg-accent/5 p-4 text-xs text-muted leading-relaxed">
              <span className="font-semibold text-foreground block mb-1">Looking to install this live loop?</span>
              Follow our step-by-step tutorial on{" "}
              <Link
                href="/blog/how-to-set-live-wallpapers-windows-mac"
                className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              >
                setting live wallpapers on Windows 11 &amp; Mac without lag
              </Link>
              .
            </div>
          )}

          {w.categorySlug === "dark" && (
            <div className="rounded-card border border-border/80 bg-surface/70 p-4 text-xs text-muted leading-relaxed">
              <span className="font-semibold text-foreground block mb-1">Optimized for OLED &amp; AMOLED displays</span>
              Discover how true pitch-black pixels save battery power in our{" "}
              <Link
                href="/blog/choosing-the-right-resolution"
                className="font-medium text-accent underline underline-offset-2 hover:opacity-80"
              >
                OLED resolution and display guide
              </Link>
              .
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {w.tags.map((t) => (
              <Link
                key={t}
                href={`/wallpapers?tag=${encodeURIComponent(t)}`}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted transition hover:border-accent/50 hover:text-foreground"
              >
                #{t}
              </Link>
            ))}
          </div>
        </div>
      </div>
      </MockupViewer>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="More like this" />
          <MasonryGrid wallpapers={related} />
        </section>
      )}
    </Container>
  );
}
/**
 * Human-readable category name for breadcrumbs / structured data. Prefers the
 * canonical name from CATEGORIES; falls back to title-casing the slug so
 * admin-created categories still read cleanly (e.g. "anime-art" → "Anime Art").
 */
function categoryDisplayName(slug: string): string {
  const known = CATEGORIES.find((c) => c.slug === slug);
  if (known) return known.name;
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function Spec({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <dt className="flex items-center gap-1.5 text-xs text-muted">{icon}{label}</dt>
      <dd className="mt-0.5 font-medium capitalize">{value}</dd>
    </div>
  );
}

/**
 * Generate an SEO-rich intro paragraph for a category page. Uses the canonical
 * CATEGORIES description as a seed, then adds keyword-bearing context that helps
 * search engines understand what each category offers.
 */
function categoryIntro(slug: string, name: string, seedDescription?: string): string {
  const base = seedDescription ?? `Browse our curated ${name.toLowerCase()} wallpaper collection.`;
  const extras: Record<string, string> = {
    nature: " From misty mountain ranges and serene ocean vistas to lush forest canopies and golden-hour skies, every image is optimized for 4K monitors and high-DPI phone screens. Perfect for anyone looking to bring the beauty of the natural world to their desktop or lock screen.",
    cars: " Featuring hypercars, vintage classics, concept vehicles and motorsport photography in ultra-high resolution. Whether you want a sleek Lamborghini on your phone or a vintage Porsche on your ultrawide monitor, these automotive wallpapers deliver stunning detail.",
    sports: " Action-packed shots from football, basketball, motorsport, athletics and more. Freeze-frame the most iconic athletic moments in crisp 4K resolution for your desktop background or phone wallpaper.",
    space: " Explore the cosmos through stunning deep-space photography — galaxies, nebulae, planetary surfaces and star fields rendered in vivid detail. Ideal for dark-themed desktops and OLED screens.",
    gaming: " Key art, character illustrations and iconic game scenes from the biggest titles and indie gems. Level up your setup with high-resolution gaming wallpapers designed for widescreen monitors and mobile devices.",
    anime: " Hand-picked anime art, manga illustrations and stylized character wallpapers in stunning HD. From beloved classics to the latest seasonal hits, find the perfect anime wallpaper for your screen.",
    technology: " Abstract circuit patterns, futuristic interfaces, neon code aesthetics and digital art inspired by innovation. Perfect for developers, designers and tech enthusiasts looking for a modern desktop background.",
    abstract: " Bold gradients, geometric forms, generative art and experimental compositions in vibrant color palettes. These abstract wallpapers add a contemporary art feel to any screen.",
    minimal: " Clean lines, subtle textures and restrained color palettes designed for distraction-free desktops and calm phone backgrounds. Minimal wallpapers that let your icons and widgets breathe.",
    dark: " Deep blacks, moody tones and OLED-optimized wallpapers that save battery on AMOLED screens while looking incredible. Perfect for night-owl setups and dark-themed UIs.",
    cities: " Dramatic skylines, atmospheric street photography and iconic urban architecture from cities around the world. Bring the energy of Tokyo, New York, Paris or Dubai to your screen.",
    animals: " Intimate wildlife portraits, playful pet photography and majestic creature close-ups. From African savanna predators to domestic companions, find animal wallpapers that inspire.",
    illustration: " Digital paintings, concept art, fantasy illustrations and creative designs from talented artists. These wallpapers blur the line between digital art and desktop background.",
    music: " Album-inspired art, instrument photography, concert visuals and music-themed designs. Set the tone with wallpapers that celebrate your favorite genres and artists.",
    movies: " Cinematic key art, iconic movie posters and dramatic scene stills from blockbuster films and beloved TV series. Turn your screen into a personal home theater.",
    travel: " Breathtaking destinations, famous landmarks and hidden gems captured in stunning resolution. Wanderlust-inducing wallpapers from every corner of the globe.",
    food: " Mouth-watering flat-lays, culinary close-ups and artistic food photography. Delicious wallpapers for foodies and home cooks.",
    flowers: " Delicate botanical close-ups, lush floral arrangements and seasonal bloom photography. Elegant flower wallpapers that bring natural beauty to any device.",
    seasons: " Spring blossoms, summer beaches, autumn foliage and winter wonderlands. Seasonal wallpapers that keep your screen in sync with the time of year.",
    patterns: " Geometric tessellations, textile textures, repeating motifs and hypnotic designs. Pattern wallpapers add depth and visual interest without overwhelming your screen.",
  };
  return base + (extras[slug] ?? ` Discover high-quality ${name.toLowerCase()} wallpapers optimized for desktop, phone and tablet screens in 4K and HD resolution.`);
}
