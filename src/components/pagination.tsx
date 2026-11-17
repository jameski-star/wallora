import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Server-rendered pagination for the wallpaper catalog. Renders plain <Link>s
 * (crawlable) and preserves the current filters via `makeHref`. Hidden entirely
 * when there is only one page.
 */

function pageWindow(page: number, total: number): (number | "…")[] {
  // Always show first, last, and a window around the current page.
  const out = new Set<number>([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => out.add(p));
  if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => out.add(p));
  const pages = [...out].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const withGaps: (number | "…")[] = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) withGaps.push("…");
    withGaps.push(p);
    prev = p;
  }
  return withGaps;
}

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  /** Builds the URL for a given page, preserving filters/search/sort. */
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const itemCls =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={makeHref(page - 1)}
          rel="prev"
          aria-label="Previous page"
          className={cn(itemCls, "border-border bg-surface text-muted hover:border-accent/50 hover:text-foreground")}
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(itemCls, "border-border/50 bg-surface/50 text-muted/50 cursor-not-allowed")}
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-sm text-muted">
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className={cn(itemCls, "border-accent bg-accent text-accent-foreground")}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p)}
            className={cn(itemCls, "border-border bg-surface text-muted hover:border-accent/50 hover:text-foreground")}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={makeHref(page + 1)}
          rel="next"
          aria-label="Next page"
          className={cn(itemCls, "border-border bg-surface text-muted hover:border-accent/50 hover:text-foreground")}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={15} />
        </Link>
      ) : (
        <span
          aria-hidden
          className={cn(itemCls, "border-border/50 bg-surface/50 text-muted/50 cursor-not-allowed")}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={15} />
        </span>
      )}
    </nav>
  );
}
