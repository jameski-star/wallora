"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, DEVICE_TYPES } from "@/lib/constants";

const SORTS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
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
    // Filter/sort changes restart the listing at page 1.
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const device = params.get("device") ?? "";
  const sort = params.get("sort") ?? "newest";
  const premium = params.get("premium") ?? "";
  const category = lockedCategory ?? params.get("category") ?? "";
  const kind = params.get("kind") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {!lockedCategory && (
        <Select
          value={category}
          onChange={(v) => setParam("category", v)}
          placeholder="All Categories"
          options={cats.map((c) => ({ value: c.slug, label: c.name }))}
        />
      )}

      {/* Device Filter Group */}
      <div className="flex rounded-xl border border-white/10 bg-[#0c213d]/90 p-1 backdrop-blur-sm shadow-sm">
        <Chip active={device === ""} onClick={() => setParam("device", null)}>All Devices</Chip>
        {DEVICE_TYPES.map((d) => (
          <Chip key={d.value} active={device === d.value} onClick={() => setParam("device", d.value)}>
            {d.label}
          </Chip>
        ))}
      </div>

      {/* Pricing Filter Group */}
      <div className="flex rounded-xl border border-white/10 bg-[#0c213d]/90 p-1 backdrop-blur-sm shadow-sm">
        <Chip active={premium === ""} onClick={() => setParam("premium", null)}>All</Chip>
        <Chip active={premium === "false"} onClick={() => setParam("premium", "false")}>Free</Chip>
        <Chip active={premium === "true"} onClick={() => setParam("premium", "true")}>Premium</Chip>
      </div>

      {/* Format Filter Group */}
      <div className="flex rounded-xl border border-white/10 bg-[#0c213d]/90 p-1 backdrop-blur-sm shadow-sm">
        <Chip active={kind === ""} onClick={() => setParam("kind", null)}>All</Chip>
        <Chip active={kind === "image"} onClick={() => setParam("kind", "image")}>Static</Chip>
        <Chip active={kind === "live"} onClick={() => setParam("kind", "live")}>
          <span className="size-1.5 rounded-full bg-current animate-pulse" aria-hidden /> Live
        </Chip>
      </div>

      {/* Sort Select */}
      <Select
        value={sort}
        onChange={(v) => setParam("sort", v)}
        options={SORTS}
        icon={<SlidersHorizontal className="size-3.5 text-white/50 pointer-events-none" />}
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
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all select-none",
        active
          ? "bg-accent text-[#081d37] shadow-sm font-bold scale-[1.02]"
          : "text-white/65 hover:text-white hover:bg-white/5",
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
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn("group relative inline-flex items-center", className)}>
      {icon && <span className="absolute left-3.5 z-10">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#0c213d]/95 pr-9 text-xs sm:text-sm font-semibold tracking-wide text-white/90 shadow-sm backdrop-blur-md outline-none transition-all hover:border-white/25 hover:bg-[#0e2544] focus:border-accent focus:ring-1 focus:ring-accent/40",
          icon ? "pl-9" : "pl-3.5"
        )}
      >
        {placeholder && (
          <option value="" className="bg-[#0c213d] text-white/80 py-2">
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0c213d] text-white py-2">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-white/45 transition-colors group-hover:text-accent" />
    </div>
  );
}
