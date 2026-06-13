import { ADULT_AGE, AGE_RATING_MIN_YEARS } from "./constants";
import type { AgeRating, Profile, Viewer } from "./types";

/** Whole years between a date-of-birth (ISO) and now. */
export function ageFromDob(dob: string | null, now = new Date()): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/** Build a Viewer gating context from a profile (or null guest). */
export function toViewer(profile: Profile | null): Viewer {
  const age = ageFromDob(profile?.dateOfBirth ?? null);
  return {
    profile,
    isAdult: age !== null && age >= ADULT_AGE,
    isAdmin: profile?.role === "admin",
  };
}

/**
 * Can this viewer see content with the given age rating?
 * Guests and underage users are blocked from anything above their age.
 */
export function canView(viewer: Viewer, rating: AgeRating): boolean {
  const required = AGE_RATING_MIN_YEARS[rating];
  if (required === 0) return true; // everyone
  const age = ageFromDob(viewer.profile?.dateOfBirth ?? null);
  if (age === null) return false; // guest or no DOB on file
  return age >= required;
}

/** True when mature content must be excluded for this viewer. */
export function mustHideMature(viewer: Viewer): boolean {
  return !viewer.isAdult;
}
