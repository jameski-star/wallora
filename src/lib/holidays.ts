import "server-only";
import { HOLIDAY_KEYWORDS, SEASONAL_WEEKS } from "./constants";
import type { HolidayType } from "./types";

const NAGER_COUNTRY = process.env.HOLIDAY_COUNTRY ?? "US";

interface NagerHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  localName: string;
}

/**
 * Detect today's holiday tag using the free Nager.Date API. Falls back to
 * "none" on any network/error. Maps the holiday name to one of our tags.
 */
export async function detectHolidayToday(now = new Date()): Promise<HolidayType> {
  const year = now.getUTCFullYear();
  const todayIso = now.toISOString().slice(0, 10);
  try {
    const res = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${NAGER_COUNTRY}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return "none";
    const holidays = (await res.json()) as NagerHoliday[];
    const today = holidays.filter((h) => h.date === todayIso);
    for (const h of today) {
      const tag = matchHoliday(`${h.name} ${h.localName}`);
      if (tag !== "none") return tag;
    }
  } catch {
    /* offline / API down → no holiday */
  }
  return "none";
}

function matchHoliday(name: string): HolidayType {
  for (const { match, type } of HOLIDAY_KEYWORDS) {
    if (match.test(name)) return type;
  }
  return "none";
}

/** Determine the active seasonal-week tag from the date (handles year-wrap). */
export function detectSeasonalWeek(now = new Date()): HolidayType {
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();
  const cur = m * 100 + d;
  for (const w of SEASONAL_WEEKS) {
    const from = w.from[0] * 100 + w.from[1];
    const to = w.to[0] * 100 + w.to[1];
    const inRange =
      from <= to ? cur >= from && cur <= to : cur >= from || cur <= to;
    if (inRange) return w.type;
  }
  return "none";
}
