"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES, DEVICE_TYPES } from "@/lib/constants";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
];

export function Filters({
  lockedCategory,
  categories,
}: {
  lockedCategory?: string;
  /** Live category list from the repo. Falls back to the static default. */
  categories?: { slug: string; name: string }[];
}) {
  const cats = categories ?? CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }));
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  const device = params.get("device") ?? "";
  const sort = params.get("sort") ?? "newest";
  const premium = params.get("premium") ?? "";
  const category = lockedCategory ?? params.get("category") ?? "";
  const kind = params.get("kind") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!lockedCategory && (
        <Select
          value={category}
          onChange={(v) => setParam("category", v)}
          placeholder="All categories"
          options={cats.map((c) => ({ value: c.slug, label: c.name }))}
        />
      )}

      <div className="flex rounded-lg border border-border bg-surface p-0.5">
        <Chip active={device === ""} onClick={() => setParam("device", null)}>All</Chip>
        {DEVICE_TYPES.map((d) => (
          <Chip key={d.value} active={device === d.value} onClick={() => setParam("device", d.value)}>
            {d.label}
          </Chip>
        ))}
      </div>

      <div className="flex rounded-lg border border-border bg-surface p-0.5">
        <Chip active={premium === ""} onClick={() => setParam("premium", null)}>All</Chip>
        <Chip active={premium === "false"} onClick={() => setParam("premium", "false")}>Free</Chip>
        <Chip active={premium === "true"} onClick={() => setParam("premium", "true")}>Premium</Chip>
      </div>

      <div className="flex rounded-lg border border-border bg-surface p-0.5">
        <Chip active={kind === ""} onClick={() => setParam("kind", null)}>All</Chip>
        <Chip active={kind === "image"} onClick={() => setParam("kind", "image")}>Static</Chip>
        <Chip active={kind === "live"} onClick={() => setParam("kind", "live")}>
          <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden /> Live
        </Chip>
      </div>

      <Select
        value={sort}
        onChange={(v) => setParam("sort", v)}
        options={SORTS}
        className="ml-auto"
      />
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
        active ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-accent/60",
        className,
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
