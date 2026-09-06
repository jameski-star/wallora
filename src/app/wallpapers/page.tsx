import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui";
import { Filters } from "@/components/filters";
import { MasonryGrid, MasonrySkeleton } from "@/components/masonry-grid";
import { listWallpapers, countWallpapers, listCategories } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { DeviceType, WallpaperQuery } from "@/lib/types";

type SP = Promise<{ [k: string]: string | string[] | undefined }>;

export const unstable_instant = { prefetch: "static", unstable_disableValidation: true };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SP;
}): Promise<Metadata> {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const kind = typeof sp.kind === "string" ? sp.kind : undefined;

  let title = "Browse 4K, OLED & Live Wallpapers · Desktop & Mobile | Aurava";
  let description =
    "Explore 4K UHD, OLED dark, and live motion wallpapers for PC, Mac, iPhone & Android. Hand-picked collections, pristine quality & zero watermarks ✓";

  if (search) {
    title = `“${search}” 4K Wallpapers & Live Backgrounds | Aurava`;
    description = `Download pristine 4K wallpapers matching “${search}”. Hand-curated for desktop, tablet, and mobile with zero watermarks ✓`;
  } else if (kind === "live") {
    title = "4K Live Motion Wallpapers · 60FPS Video Loops | Aurava";
    description =
      "Explore curated 4K live video wallpapers. Lightweight H.264 MP4 loops for Windows 11 & Mac with <1% CPU load. Free and premium instant downloads ✓";
  }

  return {
    title,
    description,
    keywords: [
      "4k wallpapers",
      "live wallpapers",
      "oled backgrounds",
      "best wallpaper sites",
      "wallpaper engine alternatives",
      "desktop wallpapers 4k",
      "phone wallpapers hd",
    ],
    alternates: { canonical: "/wallpapers" },
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

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}

export default function WallpapersPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  return (
    <Container className="py-8 sm:py-12">
      <Suspense
        fallback={
          <>
            <div className="mb-6 space-y-2">
              <div className="skeleton h-8 w-48 rounded-lg" />
              <div className="skeleton h-4 w-64 rounded" />
            </div>
            <div className="mb-6">
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
            <MasonrySkeleton count={12} />
          </>
        }
      >
        <WallpapersContent searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function WallpapersContent({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const query: WallpaperQuery = {
    category: str(sp.category),
    device: str(sp.device) as DeviceType | undefined,
    tag: str(sp.tag),
    kind: str(sp.kind) as WallpaperQuery["kind"],
    search: str(sp.search),
    premium:
      sp.premium === "true" ? true : sp.premium === "false" ? false : undefined,
    sort: (str(sp.sort) as WallpaperQuery["sort"]) ?? "newest",
    limit: 60,
  };

  const isLive = query.kind === "live";

  const [wallpapers, total, categories] = await Promise.all([
    listWallpapers(query),
    countWallpapers(query),
    listCategories(),
  ]);

  return (
    <>
      <SectionHeading
        title={
          query.search
            ? `Results for “${query.search}”`
            : isLive
              ? "Live wallpapers"
              : "Browse wallpapers"
        }
        subtitle={
          isLive
            ? `${total} looping wallpaper${total === 1 ? "" : "s"} in motion`
            : `${total} wallpaper${total === 1 ? "" : "s"} available`
        }
      />

      {/* Crawlable Category Navigation Pills for Direct SEO Equity Flow */}
      <nav aria-label="Wallpaper categories" className="mb-6 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        <Link
          href="/wallpapers"
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-colors",
            !query.category
              ? "bg-accent text-accent-foreground"
              : "border border-border/80 bg-surface text-muted hover:border-accent/40 hover:text-foreground"
          )}
        >
          All
        </Link>
        {categories.map((cat) => {
          const isActive = query.category === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/wallpapers/${cat.slug}`}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold tracking-wider transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "border border-border/80 bg-surface text-muted hover:border-accent/40 hover:text-foreground"
              )}
            >
              {cat.name}
            </Link>
          );
        })}
      </nav>

      <div className="mb-6">
        <Filters categories={categories} />
      </div>
      <MasonryGrid wallpapers={wallpapers} />
    </>
  );
}
