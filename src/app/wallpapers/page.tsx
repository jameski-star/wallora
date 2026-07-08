import { Suspense } from "react";
import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { Filters } from "@/components/filters";
import { MasonryGrid, MasonrySkeleton } from "@/components/masonry-grid";
import { listWallpapers, countWallpapers, listCategories } from "@/lib/catalog";
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
  const title = search ? `Search: ${search}` : "Browse Wallpapers";
  return {
    title,
    description:
      "Browse premium 4K & HD wallpapers for desktop, phone and tablet. Filter by category, device and more.",
    alternates: { canonical: "/wallpapers" },
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
      <div className="mb-6">
        <Filters categories={categories} />
      </div>
      <MasonryGrid wallpapers={wallpapers} />
    </>
  );
}
