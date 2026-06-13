import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";
import { getViewer } from "@/lib/auth";
import { features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/" } = await searchParams;
  const viewer = await getViewer();
  if (viewer.profile) redirect(next.startsWith("/") ? next : "/");

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to access your downloads.</p>
        {!features.supabase && (
          <p className="mt-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
            Demo mode — any email works. Use <strong>admin@aurava.app</strong> for admin access.
          </p>
        )}
        <div className="mt-6">
          <AuthForm mode="login" next={next} />
        </div>
      </div>
    </Container>
  );
}
