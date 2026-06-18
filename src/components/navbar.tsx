"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X, Shield } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "./cart";
import { Container } from "./ui";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";

export function Navbar({
  displayName,
  isAdmin,
}: {
  displayName: string | null;
  isAdmin: boolean;
}) {
  const cart = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/wallpapers?search=${encodeURIComponent(q.trim())}` : "/wallpapers");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border glass">
      <Container className="flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg" />
          <span className="text-lg tracking-tight font-bold">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/wallpapers" className="rounded-lg px-3 py-2 text-sm text-muted transition hover:text-foreground">
            Browse
          </Link>
          <Link
            href="/wallpapers?kind=live"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:text-foreground"
          >
            <span className="relative grid size-2 place-items-center" aria-hidden>
              <span className="absolute size-2 animate-ping rounded-full bg-accent opacity-75" />
              <span className="size-1.5 rounded-full bg-accent" />
            </span>
            Live
          </Link>
          {CATEGORIES.slice(0, 3).map((c) => (
            <Link
              key={c.slug}
              href={`/wallpapers/${c.slug}`}
              className="rounded-lg px-3 py-2 text-sm text-muted transition hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-muted transition hover:text-foreground">
            Blog
          </Link>
        </nav>

        <form onSubmit={search} className="ml-auto hidden flex-1 max-w-xs items-center md:flex">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search wallpapers…"
              className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-accent/60"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative grid size-9 place-items-center rounded-lg border border-border bg-surface text-muted transition hover:text-foreground"
          >
            <ShoppingBag size={18} />
            {cart.count > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold tabular-nums text-accent-foreground">
                {cart.count}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link
              href="/admin-dash"
              aria-label="Admin"
              className="hidden size-9 place-items-center rounded-lg border border-border bg-surface text-muted transition hover:text-foreground sm:grid"
            >
              <Shield size={18} />
            </Link>
          )}

          <Link
            href={displayName ? "/account" : "/login"}
            className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition hover:border-accent/50 sm:flex"
          >
            <User size={16} />
            {displayName ? displayName.split(" ")[0] : "Sign in"}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg border border-border bg-surface text-muted lg:hidden"
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </Container>

      {open && (
        <Container className="border-t border-border py-4 lg:hidden">
          <form onSubmit={search} className="mb-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search wallpapers…"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent/60"
            />
          </form>
          <div className="grid grid-cols-2 gap-1">
            <Link href="/wallpapers" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">
              All
            </Link>
            <Link href="/wallpapers?kind=live" onClick={() => setOpen(false)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden /> Live
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">
              Blog
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/wallpapers/${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
            <Link href={displayName ? "/account" : "/login"} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">
              {displayName ? "Account" : "Sign in"}
            </Link>
            {isAdmin && (
              <Link href="/admin-dash" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">
                Admin
              </Link>
            )}
          </div>
        </Container>
      )}
    </header>
  );
}
