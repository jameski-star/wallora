import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { ResetPasswordForm } from "@/components/auth-form";
import { getViewer } from "@/lib/auth";
import { features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

/**
 * Reached from the emailed reset link (via /api/auth/confirm, which exchanges
 * the code for a recovery session). If there's no session, the link was bad or
 * expired — point the user back to request a fresh one.
 */
export default async function ResetPasswordPage() {
  const viewer = features.supabase ? await getViewer() : null;
  const noSession = features.supabase && !viewer?.profile;

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        {noSession ? (
          <div className="mt-4 space-y-4">
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              This reset link is invalid or has expired. Request a new one to
              continue.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              Choose a strong password you don&apos;t use anywhere else.
            </p>
            <div className="mt-6">
              <ResetPasswordForm />
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
