"use client";

import { useState, useMemo, useLayoutEffect, useRef } from "react";
import { ImageOff } from "lucide-react";
import { WallpaperCard, type CardWallpaper } from "./wallpaper-card";
import { GalleryPreviewProvider } from "./gallery-preview-modal";
import { ScrollReveal } from "./motion";
import { cn } from "@/lib/utils";

/**
 * Editorial Masonry Column-count breakpoints.
 * Adapts organically according to available container width:
 * - >= 1150px: 5 columns (large desktop)
 * - >= 860px:  4 columns (standard desktop)
 * - >= 620px:  3 columns (tablet)
 * - < 620px:   2 columns (mobile)
 */
const COLUMN_BREAKPOINTS: [number, number][] = [
  [1150, 5],
  [860, 4],
  [620, 3],
  [0, 2],
];

function columnsForWidth(width: number): number {
  for (const [min, cols] of COLUMN_BREAKPOINTS) {
    if (width >= min) return cols;
  }
  return 2;
}

export function MasonryGrid({ cards }: { cards: CardWallpaper[] }) {
  // Server render assumes 5 columns; first client layout effect measures
  // container and applies exact count before paint to avoid reflow.
  const [columnsCount, setColumnsCount] = useState<number>(5);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateColumns = (width: number) => {
    const next = columnsForWidth(width);
    setColumnsCount((prev) => (prev === next ? prev : next));
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    updateColumns(container.clientWidth);

    if (typeof ResizeObserver === "undefined") {
      const onResize = () => updateColumns(container.clientWidth);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) updateColumns(entry.contentRect.width);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const columns = useMemo(() => {
    const cols: { wallpaper: CardWallpaper; index: number }[][] = Array.from(
      { length: columnsCount },
      () => []
    );
    const colHeights = new Array(columnsCount).fill(0);

    cards.forEach((w, i) => {
      const aspect =
        w.width && w.height && w.width > 0
          ? w.height / w.width
          : w.device === "phone"
            ? 16 / 9
            : w.device === "tablet"
              ? 4 / 3
              : 9 / 16;

      // Factoring in the card padding and minimal caption height for precise balance
      const estimatedWeight = aspect + 0.16;

      // Shortest-column placement for organic, staggered editorial balance
      let minCol = 0;
      for (let c = 1; c < columnsCount; c++) {
        if (colHeights[c] < colHeights[minCol]) {
          minCol = c;
        }
      }

      cols[minCol].push({ wallpaper: w, index: i });
      colHeights[minCol] += estimatedWeight;
    });

    return cols;
  }, [cards, columnsCount]);

  if (cards.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-[#0c213d]/50 py-24 text-center">
        <ImageOff className="mb-3 text-white/40" size={40} />
        <p className="text-lg font-medium text-white/90">No wallpapers found</p>
        <p className="mt-1 max-w-sm text-sm text-white/50">
          Try clearing filters or exploring another collection.
        </p>
      </div>
    );
  }

  return (
    <GalleryPreviewProvider>
      <div
        ref={containerRef}
        className="flex gap-3.5 sm:gap-4 lg:gap-5 items-start w-full"
      >
        {columns.map((colItems, colIdx) => (
          <div
            key={colIdx}
            className="flex-1 min-w-0 flex flex-col gap-3.5 sm:gap-4 lg:gap-5"
          >
            {colItems.map(({ wallpaper: card, index }) => (
              <ScrollReveal key={card.id} index={index} className="w-full">
                <WallpaperCard w={card} />
              </ScrollReveal>
            ))}
          </div>
        ))}
      </div>
    </GalleryPreviewProvider>
  );
}

/**
 * Skeleton placeholder grid for loading states, mirroring the editorial masonry layout:
 * matching breakpoints, shortest-column distribution, and floating canvas card shapes.
 */
export function MasonrySkeleton({ count = 12 }: { count?: number }) {
  const heights = [320, 240, 380, 260, 300, 220, 340, 280, 420, 250, 360, 290];
  const columnsCount = 5;
  const cols: number[][] = Array.from({ length: columnsCount }, () => []);
  const colHeights = new Array(columnsCount).fill(0);

  for (let i = 0; i < count; i++) {
    const h = heights[i % heights.length];
    let minCol = 0;
    for (let c = 1; c < columnsCount; c++) {
      if (colHeights[c] < colHeights[minCol]) {
        minCol = c;
      }
    }
    cols[minCol].push(h);
    colHeights[minCol] += h;
  }

  return (
    <div className="flex gap-3.5 sm:gap-4 lg:gap-5 items-start w-full">
      {cols.map((colHeights, colIdx) => (
        <div
          key={colIdx}
          className={cn(
            "flex-1 min-w-0 flex flex-col gap-3.5 sm:gap-4 lg:gap-5",
            // Mirror COLUMN_BREAKPOINTS: 2 cols <620, 3 cols <860, 4 cols <1150, 5 cols >=1150
            colIdx >= 2 && "max-[619px]:hidden",
            colIdx >= 3 && "max-[859px]:hidden",
            colIdx >= 4 && "max-[1149px]:hidden"
          )}
        >
          {colHeights.map((h, i) => (
            <div
              key={i}
              className="flex flex-col rounded-[14px] border border-white/[0.08] bg-[#0c213d]/60 p-2 sm:p-2.5 shadow-md w-full"
            >
              <div
                className="skeleton rounded-[10px] w-full"
                style={{ height: h }}
              />
              <div className="mt-2 flex items-center justify-between gap-2 px-1 pb-0.5">
                <div className="skeleton h-3.5 w-24 rounded-md" />
                <div className="skeleton size-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
