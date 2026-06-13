import type { Metadata } from "next";
import { Container, ButtonLink } from "@/components/ui";
import { CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Demo payment",
  robots: { index: false, follow: false },
};

/**
 * Stand-in for the PesaPal hosted payment page, used only when PesaPal isn't
 * configured. "Pay" simply forwards to the real callback, which auto-confirms
 * the mock transaction.
 */
export default async function MockPayPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center">
        <CreditCard className="mx-auto mb-4 text-accent" size={44} />
        <h1 className="text-2xl font-bold">Demo payment gateway</h1>
        <p className="mt-2 text-sm text-muted">
          PesaPal isn&apos;t configured, so this simulates a successful payment.
          Reference <code className="rounded bg-surface-2 px-1.5 py-0.5">{ref}</code>.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <ButtonLink href={`/checkout/callback?ref=${encodeURIComponent(ref ?? "")}`}>
            Simulate successful payment
          </ButtonLink>
          <ButtonLink href="/cart" variant="ghost">Cancel</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
