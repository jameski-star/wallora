import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, Monitor, Maximize2, Clapperboard } from "lucide-react";
import { Container, SectionHeading, Badge } from "@/components/ui";
import { ProtectedImage } from "@/components/protected-image";
import { LiveThumb } from "@/components/live-thumb";
import { BuyPanel } from "@/components/buy-panel";
import { MasonryGrid } from "@/components/masonry-grid";
import { Filters } from "@/components/filters";
import { JsonLd } from "@/components/json-ld";
import { getRepo } from "@/lib/repo";
import { listWallpapers, countWallpapers, getViewableWallpaper } from "@/lib/catalog";
import { previewUrl, videoPreviewUrl } from "@/lib/cloudinary";
import {
  wallpaperMetadata,
  wallpaperJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import { CATEGORIES } from "@/lib/constants";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepo();

  const category = await repo.getCategory(slug);
  if (category) {
    return {
      title: `${category.name} Wallpapers in 4K & HD`,
      description: `Browse premium ${category.name.toLowerCase()} wallpapers optimized for desktop and mobile devices. ${category.description}`,
      alternates: { canonical: `/wallpapers/${slug}` },
    };
  }

  // Use the GATED lookup so age-restricted wallpapers don't leak their title /
  // description / OG image to guests via metadata.
  const w = await getViewableWallpaper(slug);
  if (w) return wallpaperMetadata(w);
  // No category and nothing viewable → commit a real 404 before streaming.
  notFound();
}

export default async function SlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const repo = await getRepo();

  // 1) Category listing?
  const category = await repo.getCategory(slug);
  if (category) {
    const [wallpapers, total] = await Promise.all([
      listWallpapers({ category: slug, sort: "newest", limit: 60 }),
      countWallpapers({ category: slug }),
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
        <SectionHeading title={`${category.name} wallpapers`} subtitle={meta?.description} />
        <p className="mb-6 text-sm text-muted">{total} wallpapers</p>
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

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-card border border-border bg-surface">
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
        </div>

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
