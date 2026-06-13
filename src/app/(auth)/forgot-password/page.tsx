import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { ForgotPasswordForm } from "@/components/auth-form";
import { features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8">
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your email and we&apos;ll send you a link to set a new one.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm demo={!features.supabase} />
        </div>
      </div>
    </Container>
  );
}
