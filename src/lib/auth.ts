import { redirect } from "next/navigation";
import { features } from "./env";
import type { Profile, Viewer } from "./types";
import { toViewer } from "./age";
import { getDemoProfile } from "./demo-auth";

/**
 * Resolve the current viewer (profile + gating flags). Works in both modes:
 *  - Supabase configured → real session + profiles row.
 *  - Otherwise          → cookie-based demo profile.
 */
export async function getViewer(): Promise<Viewer> {
  const profile = await getProfile();
  return toViewer(profile);
}

export async function getProfile(): Promise<Profile | null> {
  if (!features.supabase) {
    return getDemoProfile();
  }

  const { createServerSupabase } = await import("./supabase/server");
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      email: user.email ?? "",
      displayName: user.email?.split("@")[0] ?? "User",
      dateOfBirth: null,
      role: "user",
      createdAt: user.created_at ?? new Date().toISOString(),
    };
  }

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    dateOfBirth: data.date_of_birth,
    role: data.role,
    createdAt: data.created_at,
  };
}

/** Redirect to login unless an admin is signed in. */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer.profile) redirect("/login?next=/admin-dash");
  if (!viewer.isAdmin) redirect("/");
  return viewer;
}

/** Redirect to login unless signed in. */
export async function requireUser(next = "/account"): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer.profile) redirect(`/login?next=${encodeURIComponent(next)}`);
  return viewer;
}
