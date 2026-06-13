import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Images, ShoppingCart, Sparkles, Plus, Settings, FolderTree, Newspaper } from "lucide-react";
import { Container } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin-dash", label: "Overview", icon: LayoutDashboard },
  { href: "/admin-dash/wallpapers", label: "Wallpapers", icon: Images },
  { href: "/admin-dash/wallpapers/new", label: "Add wallpaper", icon: Plus },
  { href: "/admin-dash/categories", label: "Categories", icon: FolderTree },
  { href: "/admin-dash/blog", label: "Blog", icon: Newspaper },
  { href: "/admin-dash/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin-dash/featured", label: "Featured", icon: Sparkles },
  { href: "/admin-dash/setup", label: "Setup", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(); // server-side authorization (defense in depth vs proxy)

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="rounded-md bg-accent/15 px-2 py-1 text-xs font-semibold text-accent">
          ADMIN
        </span>
        <h1 className="text-xl font-bold">Wallora Dashboard</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface hover:text-foreground"
            >
              <n.icon size={16} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
