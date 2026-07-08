import "server-only";
import { getRepo } from "./repo";
import { detectHolidayToday, detectSeasonalWeek } from "./holidays";
import { HOLIDAY_LABELS } from "./constants";
import { pickByKey } from "./utils";
import type { FeaturedItem, FeatureSlot, HolidayType, Wallpaper } from "./types";

/** Display shape consumed by the home-page heroes. */
export type FeaturedDisplay = {
  wallpaper: Wallpaper;
  caption: string;
  title: string;
  description: string;
};

/** ISO-week key (`YYYY-Www`) — stable across a calendar week, the rotation unit
 *  for the Wallpaper of the Week. */
export function isoWeekKey(now: Date): string {
  const onejan = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) / 7,
  );
  return `${now.getUTCFullYear()}-W${week}`;
}

/** The holiday + rotation key currently in effect for a slot. Day rotates every
 *  calendar day; week rotates every ISO week. */
async function slotContext(
  slot: FeatureSlot,
  now: Date,
): Promise<{ holiday: HolidayType; dateKey: string }> {
  if (slot === "day") {
    return {
      holiday: await detectHolidayToday(now),
      dateKey: now.toISOString().slice(0, 10),
    };
  }
  return { holiday: detectSeasonalWeek(now), dateKey: isoWeekKey(now) };
}

/** The rotation key a stored item belongs to, so we can tell whether it's gone
 *  stale (i.e. the day/week has rolled over since it was picked). */
function storedKeyFor(slot: FeatureSlot, displayDate: string): string {
  if (slot === "day") return displayDate.slice(0, 10);
  const d = new Date(displayDate);
  return Number.isNaN(d.getTime()) ? "" : isoWeekKey(d);
}

/**
 * Pick + persist the featured wallpaper for a slot. Honors an admin override
 * (a manually pinned slot is never overwritten by automation). `excludeId`, when
 * given, is kept out of the pool (as long as something else remains) so the two
 * slots never land on the same wallpaper.
 */
async function refresh(
  slot: FeatureSlot,
  holiday: HolidayType,
  dateKey: string,
  excludeId?: string,
): Promise<{ updated: boolean; reason: string; wallpaper?: Wallpaper; item?: FeaturedItem }> {
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
  // Keep the slots distinct: drop the other slot's current pick when we can.
  if (excludeId) {
    const trimmed = pool.filter((w) => w.id !== excludeId);
    if (trimmed.length > 0) pool = trimmed;
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
  return { updated: true, reason: `selected ${chosen.slug}`, wallpaper: chosen, item };
}

async function fetchFeaturedDisplayCached(slot: FeatureSlot, dateKey: string) {
  'use cache';
  const repo = await getRepo();
  const existing = await repo.getFeatured(slot);
  if (!existing) return null;
  const wallpaper = await repo.getWallpaperById(existing.wallpaperId);
  if (!wallpaper) return null;
  return {
    wallpaper,
    caption: existing.caption,
    title: existing.title,
    description: existing.description,
    displayDate: existing.displayDate,
    adminOverride: existing.adminOverride,
  };
}

async function getFeaturedForDisplayCached(slot: FeatureSlot) {
  'use cache';
  const now = new Date();
  return getFeaturedForDisplayUncached(slot, now);
}

export async function getFeaturedForDisplay(
  slot: FeatureSlot,
  now?: Date,
): Promise<FeaturedDisplay | null> {
  if (now) {
    return getFeaturedForDisplayUncached(slot, now);
  }
  return getFeaturedForDisplayCached(slot);
}

async function getFeaturedForDisplayUncached(
  slot: FeatureSlot,
  now: Date,
): Promise<FeaturedDisplay | null> {
  const { holiday, dateKey } = await slotContext(slot, now);
  const cached = await fetchFeaturedDisplayCached(slot, dateKey);

  if (cached) {
    if (cached.adminOverride || storedKeyFor(slot, cached.displayDate) === dateKey) {
      return {
        wallpaper: cached.wallpaper,
        caption: cached.caption,
        title: cached.title,
        description: cached.description,
      };
    }
  }

  const repo = await getRepo();
  const existing = await repo.getFeatured(slot);

  const toDisplay = async (item: FeaturedItem): Promise<FeaturedDisplay | null> => {
    const wallpaper = await repo.getWallpaperById(item.wallpaperId);
    if (!wallpaper) return null;
    return {
      wallpaper,
      caption: item.caption,
      title: item.title,
      description: item.description,
    };
  };

  // 1) Respect a manual pin (as long as its wallpaper still exists).
  if (existing?.adminOverride) {
    const pinned = await toDisplay(existing);
    if (pinned) return pinned;
  }

  // 2) Still fresh for this day/week → serve the stored pick.
  if (existing && !existing.adminOverride && storedKeyFor(slot, existing.displayDate) === dateKey) {
    const fresh = await toDisplay(existing);
    if (fresh) return fresh;
  }

  // 3) Stale (or missing) → re-pick, excluding the other slot's current choice.
  const other: FeatureSlot = slot === "day" ? "week" : "day";
  const otherFeat = await repo.getFeatured(other);
  const result = await refresh(slot, holiday, dateKey, otherFeat?.wallpaperId);
  if (result.item && result.wallpaper) {
    return {
      wallpaper: result.wallpaper,
      caption: result.item.caption,
      title: result.item.title,
      description: result.item.description,
    };
  }

  // 4) Couldn't refresh (e.g. admin override with a since-deleted wallpaper, or
  //    an empty catalog) — fall back to whatever is stored, if anything.
  return existing ? toDisplay(existing) : null;
}

export async function refreshWallpaperOfDay(now = new Date()) {
  const { holiday, dateKey } = await slotContext("day", now);
  const week = await (await getRepo()).getFeatured("week");
  const result = await refresh("day", holiday, dateKey, week?.wallpaperId);
  return { slot: "day" as const, holiday, ...result };
}

export async function refreshWallpaperOfWeek(now = new Date()) {
  const { holiday, dateKey } = await slotContext("week", now);
  const day = await (await getRepo()).getFeatured("day");
  const result = await refresh("week", holiday, dateKey, day?.wallpaperId);
  return { slot: "week" as const, holiday, ...result };
}
