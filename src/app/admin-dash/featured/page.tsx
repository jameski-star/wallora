import { Button } from "@/components/ui";
import { getRepo } from "@/lib/repo";
import {
  setFeaturedOverride,
  runFeaturedAutomation,
} from "@/app/admin-dash/actions";
import { HOLIDAY_LABELS } from "@/lib/constants";
import type { FeatureSlot } from "@/lib/types";

const HOLIDAYS = Object.keys(HOLIDAY_LABELS) as (keyof typeof HOLIDAY_LABELS)[];

export default async function AdminFeatured() {
  const repo = await getRepo();
  const [day, week, wallpapers] = await Promise.all([
    repo.getFeatured("day"),
    repo.getFeatured("week"),
    repo.listWallpapers({ includeMature: true, limit: 500 }),
  ]);

  const slots: { slot: FeatureSlot; label: string; current: typeof day }[] = [
    { slot: "day", label: "Wallpaper of the Day", current: day },
    { slot: "week", label: "Wallpaper of the Week", current: week },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Automation runs on a schedule (daily / Monday). Pin a slot with{" "}
        <strong>Admin override</strong> to stop automation from changing it.
      </p>

      {slots.map(({ slot, label, current }) => (
        <section key={slot} className="rounded-card border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{label}</h2>
            <form action={runFeaturedAutomation}>
              <input type="hidden" name="which" value={slot} />
              <Button variant="secondary" size="sm" type="submit">Run automation now</Button>
            </form>
          </div>

          <p className="mb-4 text-sm text-muted">
            Current:{" "}
            {current ? (
              <>
                <span className="font-medium text-foreground">{current.title}</span> —{" "}
                {current.caption}
                {current.adminOverride && (
                  <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-xs text-accent">
                    pinned
                  </span>
                )}
              </>
            ) : (
              "none"
            )}
          </p>

          <form action={setFeaturedOverride} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="slot" value={slot} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Wallpaper</span>
              <select name="wallpaperId" defaultValue={current?.wallpaperId} className={inp}>
                {wallpapers.map((w) => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Holiday type</span>
              <select name="holidayType" defaultValue={current?.holidayType ?? "none"} className={inp}>
                {HOLIDAYS.map((h) => (
                  <option key={h} value={h}>{HOLIDAY_LABELS[h]}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Caption</span>
              <input name="caption" defaultValue={current?.caption} className={inp} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Title</span>
              <input name="title" defaultValue={current?.title} className={inp} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Description / caption text</span>
              <input name="description" defaultValue={current?.description} className={inp} />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                name="adminOverride"
                defaultChecked={current?.adminOverride}
                className="size-4 accent-[var(--accent)]"
              />
              Pin this selection (disable automation for this slot)
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">Save featured</Button>
            </div>
          </form>
        </section>
      ))}
    </div>
  );
}

const inp =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent/60";
