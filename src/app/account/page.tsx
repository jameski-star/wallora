import type { Metadata } from "next";
import Link from "next/link";
import { Download, LogOut, ShieldCheck } from "lucide-react";
import { Container, SectionHeading, Badge, Button } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { logout } from "@/app/(auth)/actions";
import { ageFromDob } from "@/lib/age";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const viewer = await requireUser("/account");
  const profile = viewer.profile!;
  const repo = await getRepo();
  const orders = (await repo.listOrders({ userId: profile.id })).filter(
    (o) => o.status === "paid",
  );
  const age = ageFromDob(profile.dateOfBirth);

  return (
    <Container className="py-8 sm:py-12">
      <SectionHeading
        title="My account"
        action={
          <form action={logout}>
            <Button variant="secondary" size="sm" type="submit">
              <LogOut size={15} /> Sign out
            </Button>
          </form>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-3 rounded-card border border-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-accent text-lg font-bold text-white">
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold">{profile.displayName}</p>
              <p className="text-sm text-muted">{profile.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {viewer.isAdmin && <Badge tone="accent"><ShieldCheck size={12} /> Admin</Badge>}
            <Badge tone={viewer.isAdult ? "free" : "neutral"}>
              {age !== null ? `Age ${age}` : "Age not set"}
            </Badge>
          </div>
          {viewer.isAdmin && (
            <Link href="/admin-dash" className="mt-2 inline-block text-sm text-accent hover:underline">
              Go to admin dashboard →
            </Link>
          )}
        </div>

        <div className="rounded-card border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">My downloads</h2>
          {orders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted">
              No purchases yet.{" "}
              <Link href="/wallpapers" className="text-accent hover:underline">Browse wallpapers</Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {orders.flatMap((o) =>
                o.items.map((it) => (
                  <li key={`${o.id}-${it.wallpaperId}`} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{it.title}</p>
                      <p className="text-xs text-muted">
                        Order {o.id.slice(0, 12)} · {formatPrice(it.priceCents, o.currency)}
                      </p>
                    </div>
                    <a
                      href={`/api/download/order/${o.id}?wp=${it.wallpaperId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      <Download size={15} /> Download
                    </a>
                  </li>
                )),
              )}
            </ul>
          )}
        </div>
      </div>
    </Container>
  );
}
