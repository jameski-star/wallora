"use client";

import { useState } from "react";
import { Loader2, Check as CheckIcon, AlertCircle } from "lucide-react";
import { saveWallpaper } from "@/app/admin-dash/actions";
import { Button } from "@/components/ui";
import { DEVICE_TYPES, AGE_RATINGS } from "@/lib/constants";
import { probeImageUrl } from "@/lib/cloudinary-url";
import type { Category, Wallpaper } from "@/lib/types";

type ProbeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; width: number; height: number }
  | { status: "error"; message: string };

/** Create/edit form. Posts directly to the `saveWallpaper` server action. */
export function WallpaperForm({
  wallpaper,
  categories,
}: {
  wallpaper?: Wallpaper;
  categories: Category[];
}) {
  const w = wallpaper;
  const [resolution, setResolution] = useState(w?.resolution ?? "3840x2160");
  const [probe, setProbe] = useState<ProbeState>({ status: "idle" });

  /**
   * Load the original off-screen to read its natural pixel dimensions, then set
   * the resolution field automatically. Runs when the image link loses focus.
   */
  function detectDimensions(publicId: string) {
    const url = probeImageUrl(publicId.trim());
    if (!url) {
      // Bare public id with no Cloudinary configured — nothing to load.
      setProbe({ status: "idle" });
      return;
    }
    setProbe({ status: "loading" });
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      if (!width || !height) {
        setProbe({ status: "error", message: "Could not read image size" });
        return;
      }
      setResolution(`${width}x${height}`);
      setProbe({ status: "done", width, height });
    };
    img.onerror = () =>
      setProbe({ status: "error", message: "Could not load image from link" });
    img.src = url;
  }

  return (
    <form action={saveWallpaper} className="space-y-5">
      {w && <input type="hidden" name="id" value={w.id} />}
      {w && <input type="hidden" name="createdAt" value={w.createdAt} />}
      {w && <input type="hidden" name="downloads" value={w.downloads} />}

      <Row>
        <Field label="Title" required>
          <input name="title" required defaultValue={w?.title} className={inp} />
        </Field>
        <Field label="Slug" hint="Auto-generated if blank">
          <input name="slug" defaultValue={w?.slug} placeholder="auto" className={inp} />
        </Field>
      </Row>

      <Field label="Description">
        <textarea name="description" rows={3} defaultValue={w?.description} className={inp} />
      </Field>

      <Row>
        <Field label="Original image (Cloudinary public id or URL)" required hint="Display source for all; download source for FREE items. Resolution is auto-detected from this.">
          <input
            name="originalPublicId"
            required
            defaultValue={w?.originalPublicId}
            onBlur={(e) => detectDimensions(e.target.value)}
            className={inp}
          />
        </Field>
        <Field label="Preview public id" hint="Defaults to original; premium previews are resolution-capped">
          <input name="previewPublicId" defaultValue={w?.previewPublicId} className={inp} />
        </Field>
      </Row>

      <Field label="Premium original storage path (private Supabase bucket)" hint="Premium only — the paid download. Defaults to originals/<id>.jpg">
        <input name="originalStoragePath" defaultValue={w?.originalStoragePath} className={inp} />
      </Field>

      <Row>
        <Field label="Preview video (Cloudinary public id or URL)" hint="Live wallpapers only — the looping clip">
          <input name="videoPublicId" defaultValue={w?.videoPublicId} placeholder="e.g. aurava/aurora-loop or https://…/loop.mp4" className={inp} />
        </Field>
        <Field label="Loop length (seconds)" hint="Live wallpapers only">
          <input name="durationSec" type="number" min={1} max={60} defaultValue={w?.durationSec ?? 6} className={inp} />
        </Field>
      </Row>

      <Row>
        <Field label="Category" required>
          <select name="categorySlug" defaultValue={w?.categorySlug ?? categories[0]?.slug} className={inp}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Device" required>
          <select name="device" defaultValue={w?.device ?? "desktop"} className={inp}>
            {DEVICE_TYPES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Resolution"
          required
          hint={
            probe.status === "loading"
              ? "Detecting from image…"
              : probe.status === "done"
                ? "Auto-detected — edit if needed"
                : probe.status === "error"
                  ? probe.message
                  : "Auto-detected from the image link; WIDTHxHEIGHT"
          }
        >
          <div className="relative">
            <input
              name="resolution"
              required
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              pattern="\d+x\d+"
              className={inp}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              {probe.status === "loading" && (
                <Loader2 size={16} className="animate-spin text-muted" />
              )}
              {probe.status === "done" && (
                <CheckIcon size={16} className="text-emerald-400" />
              )}
              {probe.status === "error" && (
                <AlertCircle size={16} className="text-amber-400" />
              )}
            </span>
          </div>
        </Field>
      </Row>

      <Field label="Tags" hint="Comma-separated">
        <input name="tags" defaultValue={w?.tags.join(", ")} placeholder="nature, minimal, dark" className={inp} />
      </Field>

      <Row>
        <Field label="Age rating">
          <select name="ageRating" defaultValue={w?.ageRating ?? "everyone"} className={inp}>
            {AGE_RATINGS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Price (cents)" hint="0 = free">
          <input name="priceCents" type="number" min={0} defaultValue={w?.priceCents ?? 0} className={inp} />
        </Field>
        <Field label="Holiday tags" hint="Comma-separated; e.g. christmas">
          <input name="holidayTags" defaultValue={w?.holidayTags.filter((h) => h !== "none").join(", ")} className={inp} />
        </Field>
      </Row>

      <Row>
        <Field label="SEO title">
          <input name="seoTitle" defaultValue={w?.seoTitle} className={inp} />
        </Field>
        <Field label="SEO description">
          <input name="seoDescription" defaultValue={w?.seoDescription} className={inp} />
        </Field>
      </Row>

      <div className="flex flex-wrap gap-5">
        <Check name="isLive" label="Live wallpaper (video)" defaultChecked={w?.kind === "live"} />
        <Check name="isPremium" label="Premium" defaultChecked={w?.isPremium} />
        <Check name="isMature" label="Mature (18+)" defaultChecked={w?.isMature} />
        <Check name="isFeatured" label="Featured" defaultChecked={w?.isFeatured} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit">{w ? "Save changes" : "Create wallpaper"}</Button>
      </div>
    </form>
  );
}

const inp =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent/60";

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}
