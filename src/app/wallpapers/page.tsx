import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui";
import { Filters } from "@/components/filters";
import { MasonryGrid, MasonrySkeleton } from "@/components/masonry-grid";
import { Pagination } from "@/components/pagination";
import { listWallpapers, countWallpapers, listCategories } from "@/lib/catalog";
import { toCardWallpaper } from "@/lib/card";
import { WALLPAPERS_PAGE_SIZE } from "@/lib/constants";
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
  const rawPage = Math.max(1, parseInt(sp.page as string, 10) || 1);

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

  // Clamp the canonical to a page that exists so `?page=999` doesn't emit a
  // canonical URL with no content behind it. Count with the same filters the
  // page itself lists under.
  const total = await countWallpapers({
    category: str(sp.category),
    device: str(sp.device) as DeviceType | undefined,
    tag: str(sp.tag),
    kind: kind as WallpaperQuery["kind"],
    search,
    premium:
      sp.premium === "true" ? true : sp.premium === "false" ? false : undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / WALLPAPERS_PAGE_SIZE));
  const page = Math.min(rawPage, totalPages);

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
    alternates: { canonical: page > 1 ? `/wallpapers?page=${page}` : "/wallpapers" },
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
    limit: WALLPAPERS_PAGE_SIZE,
  };

  const isLive = query.kind === "live";

  // Fetch the total first so a stale/out-of-range `page` can be clamped back
  // into a page that actually has content, then fetch that page.
  const [total, categories] = await Promise.all([
    countWallpapers(query),
    listCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / WALLPAPERS_PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(sp.page as string, 10) || 1), totalPages);
  const wallpapers = await listWallpapers({
    ...query,
    offset: (page - 1) * WALLPAPERS_PAGE_SIZE,
  });


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
      <MasonryGrid cards={wallpapers.map(toCardWallpaper)} />
      <Pagination
        page={page}
        totalPages={totalPages}
        makeHref={(p) => {
          const next = new URLSearchParams();
          for (const [k, v] of Object.entries(sp)) {
            if (typeof v === "string" && v && k !== "page") next.set(k, v);
          }
          if (p > 1) next.set("page", String(p));
          const qs = next.toString();
          return qs ? `/wallpapers?${qs}` : "/wallpapers";
        }}
      />
    </>
  );
}
