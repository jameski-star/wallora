"use client";

import { useState } from "react";
import { Loader2, Check as CheckIcon, AlertCircle, Sparkles, Clapperboard } from "lucide-react";
import { saveWallpaper, analyzeWallpaper } from "@/app/admin-dash/actions";
import { Button } from "@/components/ui";
import { DEVICE_TYPES, AGE_RATINGS } from "@/lib/constants";
import { probeImageUrl, probeVideoUrl } from "@/lib/cloudinary-url";
import type { AgeRating, Category, DeviceType, Wallpaper } from "@/lib/types";

type ProbeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; width: number; height: number }
  | { status: "error"; message: string };

type AutoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done" }
  | { status: "error"; message: string };

/**
 * Pick a device from the image's aspect ratio. This is deterministic arithmetic,
 * so we derive it locally rather than asking the model:
 *   - portrait  → phone
 *   - wide landscape (≥16:10) → desktop
 *   - in between (squarish / 4:3) → tablet
 */
function deviceFromDimensions(width: number, height: number): DeviceType {
  if (!width || !height) return "desktop";
  const ratio = width / height;
  if (ratio < 0.9) return "phone";
  if (ratio >= 1.6) return "desktop";
  return "tablet";
}

/** Create/edit form. Posts directly to the `saveWallpaper` server action. */
export function WallpaperForm({
  wallpaper,
  categories,
}: {
  wallpaper?: Wallpaper;
  categories: Category[];
}) {
  const w = wallpaper;

  // Controlled fields — these are the ones "Auto-fill from image" can populate.
  const [originalPublicId, setOriginalPublicId] = useState(w?.originalPublicId ?? "");
  const [previewPublicId, setPreviewPublicId] = useState(w?.previewPublicId ?? "");
  const [title, setTitle] = useState(w?.title ?? "");
  const [description, setDescription] = useState(w?.description ?? "");
  const [tags, setTags] = useState(w?.tags.join(", ") ?? "");
  const [categorySlug, setCategorySlug] = useState(
    w?.categorySlug ?? categories[0]?.slug ?? "",
  );
  const [device, setDevice] = useState<DeviceType>(w?.device ?? "desktop");
  const [ageRating, setAgeRating] = useState<AgeRating>(w?.ageRating ?? "everyone");
  const [holidayTags, setHolidayTags] = useState(
    w?.holidayTags.filter((h) => h !== "none").join(", ") ?? "",
  );
  const [seoTitle, setSeoTitle] = useState(w?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(w?.seoDescription ?? "");
  const [isMature, setIsMature] = useState(w?.isMature ?? false);
  const [isLive, setIsLive] = useState(w?.kind === "live");
  const [videoPublicId, setVideoPublicId] = useState(w?.videoPublicId ?? "");

  const [resolution, setResolution] = useState(w?.resolution ?? "3840x2160");
  const [probe, setProbe] = useState<ProbeState>({ status: "idle" });
  const [auto, setAuto] = useState<AutoState>({ status: "idle" });

  /**
   * Load the original off-screen to read its natural pixel dimensions, then set
   * the resolution field (and infer the device) automatically. Runs when the
   * image link loses focus.
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
      setDevice(deviceFromDimensions(width, height));
      setProbe({ status: "done", width, height });
    };
    img.onerror = () =>
      setProbe({ status: "error", message: "Could not load image from link" });
    img.src = url;
  }

  /**
   * Read a live wallpaper's resolution straight from the video when it ships
   * without a still. Loads the untransformed video's metadata off-screen to get
   * `videoWidth/Height`, then sets resolution + device — the video counterpart
   * to {@link detectDimensions}.
   */
  function detectVideoDimensions(publicId: string) {
    const url = probeVideoUrl(publicId.trim());
    if (!url) {
      setProbe({ status: "idle" });
      return;
    }
    setProbe({ status: "loading" });
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) {
        setProbe({ status: "error", message: "Could not read video size" });
        return;
      }
      setResolution(`${width}x${height}`);
      setDevice(deviceFromDimensions(width, height));
      setProbe({ status: "done", width, height });
    };
    video.onerror = () =>
      setProbe({ status: "error", message: "Could not load video from link" });
    video.src = url;
  }

  /**
   * Ask Gemini to read the image and fill in the descriptive fields. Explicit,
   * button-triggered, and non-destructive of the admin's manual choices around
   * price/premium/featured — those aren't touched.
   */
  async function autofill() {
    const hasImage = Boolean(originalPublicId.trim() || previewPublicId.trim());
    const hasVideo = isLive && Boolean(videoPublicId.trim());
    if (!hasImage && !hasVideo) {
      setAuto({ status: "error", message: "Add the image or video link first." });
      return;
    }
    setAuto({ status: "loading" });
    const result = await analyzeWallpaper({
      originalPublicId: originalPublicId.trim(),
      previewPublicId: previewPublicId.trim() || undefined,
      videoPublicId: videoPublicId.trim() || undefined,
    });
    if (!result.ok) {
      setAuto({ status: "error", message: result.message });
      return;
    }
    const d = result.data;
    setTitle(d.title);
    setDescription(d.description);
    setTags(d.tags.join(", "));
    setCategorySlug(d.categorySlug);
    setAgeRating(d.ageRating);
    setIsMature(d.isMature);
    setHolidayTags(d.holidayTags.filter((h) => h !== "none").join(", "));
    setSeoTitle(d.seoTitle);
    setSeoDescription(d.seoDescription);
    setAuto({ status: "done" });
  }

  const canAutofill =
    (Boolean(originalPublicId.trim() || previewPublicId.trim()) ||
      (isLive && Boolean(videoPublicId.trim()))) &&
    auto.status !== "loading";

  return (
    <form action={saveWallpaper} className="space-y-5">
      {w && <input type="hidden" name="id" value={w.id} />}
      {w && <input type="hidden" name="createdAt" value={w.createdAt} />}
      {w && <input type="hidden" name="downloads" value={w.downloads} />}

      <Row>
        <Field label="Title" required>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inp}
          />
        </Field>
        <Field label="Slug" hint="Auto-generated if blank">
          <input name="slug" defaultValue={w?.slug} placeholder="auto" className={inp} />
        </Field>
      </Row>

      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inp}
        />
      </Field>

      <Row>
        <Field
          label="Original image (Cloudinary public id or URL)"
          required={!isLive}
          hint={
            isLive
              ? "Optional for live wallpapers — leave blank and we auto-generate the poster from a video frame."
              : "Display source for all; download source for FREE items. Resolution is auto-detected from this."
          }
        >
          <input
            name="originalPublicId"
            required={!isLive}
            value={originalPublicId}
            onChange={(e) => setOriginalPublicId(e.target.value)}
            onBlur={(e) => detectDimensions(e.target.value)}
            className={inp}
          />
        </Field>
        <Field label="Preview public id" hint="Defaults to original; premium previews are resolution-capped">
          <input
            name="previewPublicId"
            value={previewPublicId}
            onChange={(e) => setPreviewPublicId(e.target.value)}
            className={inp}
          />
        </Field>
      </Row>

      {/* Auto-fill from image — enabled once a Cloudinary link is present. */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface/50 p-3">
        <Button
          type="button"
          variant="secondary"
          onClick={autofill}
          disabled={!canAutofill}
        >
          {auto.status === "loading" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {auto.status === "loading" ? "Analysing image…" : "Auto-fill from image"}
        </Button>
        <span className="text-xs text-muted">
          {auto.status === "done"
            ? "Filled title, description, tags, category, age rating, holidays & SEO — review before saving."
            : auto.status === "error"
              ? auto.message
              : "Reads the image — or a live wallpaper's video frame — with Gemini and fills the descriptive fields."}
        </span>
      </div>

      {/* Live wallpaper — a clearly-grouped section so the upload path is
          obvious: toggle it on, then point it at a looping video. */}
      <fieldset className="rounded-lg border border-border bg-surface/50 p-4">
        <label className="flex items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            name="isLive"
            checked={isLive}
            onChange={(e) => setIsLive(e.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          <Clapperboard size={16} className="text-accent" />
          Live wallpaper (looping video)
        </label>

        {isLive ? (
          <>
            <p className="mt-2 text-xs text-muted">
              Upload the loop to Cloudinary (an <code>.mp4</code>/<code>.webm</code>),
              then paste its public id or URL below. The still image above is{" "}
              <strong>optional</strong> — leave it blank and we auto-generate the
              poster from a representative video frame. The public loop is
              auto-capped to ~6s.
            </p>
            <Row>
              <Field
                label="Preview video (Cloudinary public id or URL)"
                required
                hint="The looping clip shown on hover and on the detail page"
              >
                <input
                  name="videoPublicId"
                  required={isLive}
                  value={videoPublicId}
                  onChange={(e) => setVideoPublicId(e.target.value)}
                  onBlur={(e) => {
                    // Detect resolution from the video only when there's no
                    // still to detect it from (the still-image probe wins).
                    if (!originalPublicId.trim()) detectVideoDimensions(e.target.value);
                  }}
                  placeholder="e.g. aurava/aurora-loop or https://…/loop.mp4"
                  className={inp}
                />
              </Field>
              <Field label="Loop length (seconds)" hint="Shown as metadata on the detail page">
                <input
                  name="durationSec"
                  type="number"
                  min={1}
                  max={60}
                  defaultValue={w?.durationSec ?? 6}
                  className={inp}
                />
              </Field>
            </Row>
          </>
        ) : (
          <p className="mt-2 text-xs text-muted">
            Leave this off for a normal still image. Turn it on to attach a looping
            video and render it as a live wallpaper.
          </p>
        )}
      </fieldset>

      <Field label="Premium original storage path (private Supabase bucket)" hint="Premium only — the paid download. Defaults to originals/<id>.jpg">
        <input name="originalStoragePath" defaultValue={w?.originalStoragePath} className={inp} />
      </Field>

      <Row>
        <Field label="Category" required>
          <select
            name="categorySlug"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className={inp}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Device" required>
          <select
            name="device"
            value={device}
            onChange={(e) => setDevice(e.target.value as DeviceType)}
            className={inp}
          >
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
        <input
          name="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="nature, minimal, dark"
          className={inp}
        />
      </Field>

      <Row>
        <Field label="Age rating">
          <select
            name="ageRating"
            value={ageRating}
            onChange={(e) => setAgeRating(e.target.value as AgeRating)}
            className={inp}
          >
            {AGE_RATINGS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Price (cents)" hint="0 = free">
          <input name="priceCents" type="number" min={0} defaultValue={w?.priceCents ?? 0} className={inp} />
        </Field>
        <Field label="Holiday tags" hint="Comma-separated; e.g. christmas">
          <input
            name="holidayTags"
            value={holidayTags}
            onChange={(e) => setHolidayTags(e.target.value)}
            className={inp}
          />
        </Field>
      </Row>

      <Row>
        <Field label="SEO title">
          <input
            name="seoTitle"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className={inp}
          />
        </Field>
        <Field label="SEO description">
          <input
            name="seoDescription"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className={inp}
          />
        </Field>
      </Row>

      <div className="flex flex-wrap gap-5">
        <Check name="isPremium" label="Premium" defaultChecked={w?.isPremium} />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isMature"
            checked={isMature}
            onChange={(e) => setIsMature(e.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          Mature (18+)
        </label>
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
