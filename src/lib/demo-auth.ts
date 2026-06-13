import { cookies } from "next/headers";
import type { Profile } from "./types";

/**
 * Cookie-based demo auth, used ONLY when Supabase is not configured, so the
 * full signup / login / age-gating / admin experience works with zero
 * credentials. The cookie stores a non-sensitive demo profile (no password is
 * ever verified here — this is a local demo, not production auth).
 */

const COOKIE = "wallora_demo_user";

export async function getDemoProfile(): Promise<Profile | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export async function setDemoProfile(profile: Profile): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(profile), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearDemoProfile(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Make a demo profile. Email `admin@wallora.app` is granted the admin role. */
export function makeDemoProfile(
  email: string,
  displayName: string,
  dateOfBirth: string | null,
): Profile {
  return {
    id: `demo_${email}`,
    email,
    displayName,
    dateOfBirth,
    role: email.trim().toLowerCase() === "admin@wallora.app" ? "admin" : "user",
    createdAt: new Date().toISOString(),
  };
}
