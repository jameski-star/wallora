"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { env, features } from "@/lib/env";
import {
  clearDemoProfile,
  makeDemoProfile,
  setDemoProfile,
} from "@/lib/demo-auth";
import { ageFromDob } from "@/lib/age";

const signupSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type AuthState =
  | { error?: string; verifyEmail?: string }
  | null;

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "/";
  return n.startsWith("/") ? n : "/";
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    dateOfBirth: formData.get("dateOfBirth"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { displayName, email, password, dateOfBirth } = parsed.data;

  const age = ageFromDob(dateOfBirth);
  if (age === null || age < 13) {
    return { error: "You must be at least 13 years old to register." };
  }

  const next = safeNext(formData.get("next"));

  if (features.supabase) {
    const { createServerSupabase } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, date_of_birth: dateOfBirth },
      },
    });
    if (error) return { error: error.message };

    const user = data.user;
    // With "Confirm email" enabled, Supabase hides an already-registered email
    // by returning a user with no identities (and no error). Surface it as a
    // real "already exists" instead of a silent fake success.
    if (user && Array.isArray(user.identities) && user.identities.length === 0) {
      return {
        error: "An account with this email already exists. Please sign in instead.",
      };
    }

    // Create the profile row from the app using the service role. This bypasses
    // RLS and does NOT depend on the auth.users trigger, so signup populates
    // `profiles` reliably. Upsert makes it a no-op if the trigger also ran.
    if (user && features.supabaseAdmin) {
      const { createAdminSupabase } = await import("@/lib/supabase/admin");
      const admin = createAdminSupabase();
      const { error: profileError } = await admin.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? email,
          display_name: displayName,
          date_of_birth: dateOfBirth,
        },
        { onConflict: "id" },
      );
      if (profileError) {
        return {
          error: `Account created but profile setup failed: ${profileError.message}`,
        };
      }
    }

    // When "Confirm email" is enabled, Supabase issues no session until the
    // user clicks the link in their inbox. Don't redirect into a protected
    // page they can't yet access — surface a "verify your email" prompt.
    if (!data.session) {
      return { verifyEmail: user?.email ?? email };
    }
  } else {
    await setDemoProfile(makeDemoProfile(email, displayName, dateOfBirth));
  }

  redirect(next);
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email, password } = parsed.data;
  const next = safeNext(formData.get("next"));

  if (features.supabase) {
    const { createServerSupabase } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  } else {
    // Demo mode: no password verification (local-only). DOB unknown on login,
    // so mature content stays gated until the user re-enters it via signup.
    const name = email.split("@")[0];
    await setDemoProfile(makeDemoProfile(email, name, null));
  }

  redirect(next);
}

export async function logout(): Promise<void> {
  if (features.supabase) {
    const { createServerSupabase } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } else {
    await clearDemoProfile();
  }
  redirect("/");
}

/* ── Password reset ──────────────────────────────────────────────────────── */

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export type ResetState = { error?: string; sent?: boolean; done?: boolean } | null;

/** Step 1: email a password-reset link. */
export async function requestPasswordReset(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  if (!features.supabase) {
    // Demo mode has no passwords — any email signs in directly.
    return { sent: true };
  }

  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  // The link lands on a route handler that exchanges the code for a session,
  // then forwards to /reset-password where the user sets a new password.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.siteUrl}/api/auth/confirm?next=/reset-password`,
  });
  // Always report success so we don't leak which emails are registered.
  return { sent: true };
}

/** Step 2: set the new password (requires the recovery session from the link). */
export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!features.supabase) {
    return {
      error:
        "Password reset isn't available in demo mode — just sign in with any email.",
    };
  }

  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "Your reset link has expired or is invalid. Request a new one and try again.",
    };
  }
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  return { done: true };
}
