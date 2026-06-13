import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";
import { getViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
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
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Join Aurava to buy and download wallpapers.</p>
        <div className="mt-6">
          <AuthForm mode="signup" next={next} />
        </div>
      </div>
    </Container>
  );
}
