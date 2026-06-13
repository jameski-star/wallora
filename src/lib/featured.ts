import "server-only";
import { getRepo } from "./repo";
import { detectHolidayToday, detectSeasonalWeek } from "./holidays";
import { HOLIDAY_LABELS } from "./constants";
import { pickByKey } from "./utils";
import type { FeaturedItem, FeatureSlot, HolidayType, Wallpaper } from "./types";

/**
 * Pick + persist the featured wallpaper for a slot. Honors an admin override
 * (a manually pinned slot is never overwritten by automation).
 */
async function refresh(
  slot: FeatureSlot,
  holiday: HolidayType,
  dateKey: string,
): Promise<{ updated: boolean; reason: string; wallpaper?: Wallpaper }> {
  const repo = await getRepo();

  const existing = await repo.getFeatured(slot);
  if (existing?.adminOverride) {
    return { updated: false, reason: "admin override active" };
  }

  const all = await repo.listWallpapers({ includeMature: false, limit: 500 });

  let pool: Wallpaper[] = [];
  if (holiday !== "none") {
    pool = all.filter((w) => w.holidayTags.includes(holiday));
  }
  let usedHoliday = holiday;
  if (pool.length === 0) {
    // No themed art → fall back to premium (then any) wallpapers.
    pool = all.filter((w) => w.isPremium);
    if (pool.length === 0) pool = all;
    usedHoliday = "none";
  }
  if (pool.length === 0) return { updated: false, reason: "no wallpapers" };

  const chosen = pickByKey(pool, `${slot}:${dateKey}:${holiday}`);
  const label = HOLIDAY_LABELS[usedHoliday];
  const caption = slot === "day" ? "Wallpaper of the Day" : "Wallpaper of the Week";

  const item: FeaturedItem = {
    slot,
    wallpaperId: chosen.id,
    title: chosen.title,
    caption: usedHoliday === "none" ? caption : `${label} ${caption}`,
    description:
      usedHoliday === "none"
        ? chosen.description
        : `Celebrate ${label} with ${chosen.title}.`,
    displayDate: new Date().toISOString(),
    holidayType: usedHoliday,
    adminOverride: false,
  };
  await repo.setFeatured(item);
  return { updated: true, reason: `selected ${chosen.slug}`, wallpaper: chosen };
}

export async function refreshWallpaperOfDay(now = new Date()) {
  const holiday = await detectHolidayToday(now);
  const dateKey = now.toISOString().slice(0, 10);
  const result = await refresh("day", holiday, dateKey);
  return { slot: "day" as const, holiday, ...result };
}

export async function refreshWallpaperOfWeek(now = new Date()) {
  const holiday = detectSeasonalWeek(now);
  // ISO week key (year-week) keeps the pick stable across the week.
  const onejan = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) / 7,
  );
  const dateKey = `${now.getUTCFullYear()}-W${week}`;
  const result = await refresh("week", holiday, dateKey);
  return { slot: "week" as const, holiday, ...result };
}
