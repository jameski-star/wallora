"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Button } from "./ui";
import {
  login,
  signup,
  requestPasswordReset,
  resetPassword,
  type AuthState,
  type ResetState,
} from "@/app/(auth)/actions";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next: string;
}) {
  const action = mode === "signup" ? signup : login;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );

  // After a successful signup with email confirmation on, swap the form for a
  // prompt to go check the inbox — the account isn't usable until verified.
  if (state?.verifyEmail) {
    return <VerifyEmailNotice email={state.verifyEmail} next={next} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {mode === "signup" && (
        <Field label="Display name">
          <input name="displayName" required placeholder="Ada Lovelace" className={inputCls} />
        </Field>
      )}

      <Field label="Email">
        <input name="email" type="email" required placeholder="you@example.com" className={inputCls} />
      </Field>

      <Field label="Password">
        <PasswordInput
          name="password"
          required
          minLength={mode === "signup" ? 8 : 1}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </Field>

      {mode === "login" && (
        <div className="-mt-1 text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-muted transition hover:text-accent"
          >
            Forgot password?
          </Link>
        </div>
      )}

      {mode === "signup" && (
        <Field label="Date of birth" hint="Used to gate mature content. You must be 13+.">
          <input name="dateOfBirth" type="date" required className={inputCls} />
        </Field>
      )}

      {state?.error && (
        <p
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" size={18} />}
        {mode === "signup" ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Aurava?{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-accent/60";

function PasswordInput({
  name,
  required,
  minLength,
  autoComplete,
}: {
  name: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={revealed ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder="••••••••"
        className={`${inputCls} pr-11`}
      />
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? "Hide password" : "Show password"}
        aria-pressed={revealed}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:text-accent"
      >
        {revealed ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}

export function ForgotPasswordForm({ demo }: { demo: boolean }) {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    requestPasswordReset,
    null,
  );

  if (state?.sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
          <MailCheck size={24} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Check your inbox</h2>
          <p className="mt-1 text-sm text-muted">
            If an account exists for that email, we&apos;ve sent a link to reset
            your password. The link expires in an hour.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {demo && (
        <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
          Demo mode has no passwords — just sign in with any email.
        </p>
      )}
      <Field label="Email">
        <input name="email" type="email" required placeholder="you@example.com" className={inputCls} />
      </Field>

      {state?.error && <ErrorNote message={state.error} />}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" size={18} />}
        Send reset link
      </Button>

      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    resetPassword,
    null,
  );

  if (state?.done) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={24} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Password updated</h2>
          <p className="mt-1 text-sm text-muted">
            Your password has been changed. You can now sign in with it.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="New password">
        <PasswordInput name="password" required minLength={8} autoComplete="new-password" />
      </Field>
      <Field label="Confirm new password">
        <PasswordInput name="confirm" required minLength={8} autoComplete="new-password" />
      </Field>

      {state?.error && <ErrorNote message={state.error} />}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" size={18} />}
        Update password
      </Button>
    </form>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

function VerifyEmailNotice({ email, next }: { email: string; next: string }) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
        <MailCheck size={24} aria-hidden />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Verify your email</h2>
        <p className="mt-1 text-sm text-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click it to
          activate your account, then sign in.
        </p>
      </div>
      <p className="text-xs text-muted">
        Didn&apos;t get it? Check your spam folder — the link can take a minute to arrive.
      </p>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
      >
        Go to sign in
      </Link>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
