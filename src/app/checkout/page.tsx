import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { CheckoutClient } from "@/components/checkout-client";
import { getViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const viewer = await getViewer();
  return (
    <Container className="py-8 sm:py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Checkout</h1>
      <CheckoutClient defaultEmail={viewer.profile?.email ?? ""} />
    </Container>
  );
}
