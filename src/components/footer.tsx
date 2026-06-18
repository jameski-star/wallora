import Link from "next/link";
import Image from "next/image";
import { Container } from "./ui";
import { CATEGORIES, DEVICE_TYPES, LEGAL_LINKS, SITE_NAME, SITE_TAGLINE, SITE_CONTACT_EMAIL } from "@/lib/constants";

/** A small set of featured categories to highlight — the rest are behind "Browse all". */
const FOOTER_CATEGORIES = CATEGORIES.filter((c) =>
  ["nature", "gaming", "anime", "dark", "space", "abstract", "minimal", "cars"].includes(c.slug),
);

export function Footer() {
  return (
    <footer className="relative mt-auto">
      {/* Accent glow line — separates footer from page with a warm light strip */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="bg-[linear-gradient(180deg,color-mix(in_oklch,var(--surface)_85%,var(--background))_0%,color-mix(in_oklch,var(--background)_92%,var(--accent)_2%)_100%)]">
        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        {/* Brand column */}
        <div className="lg:col-span-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-foreground">
            <Image src="/logo.png" alt="" width={36} height={36} className="rounded-xl" />
            <span className="text-lg tracking-tight font-bold">{SITE_NAME}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {SITE_TAGLINE}. Hand-picked designs for every screen.
          </p>

          {/* Subtle accent divider */}
          <div className="mt-6 h-px w-12 rounded-full bg-accent/40" />

          <p className="mt-4 text-xs text-muted">
            Questions?{" "}
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              className="text-accent transition hover:opacity-80"
            >
              {SITE_CONTACT_EMAIL}
            </a>
          </p>

          {/* Subtle wallpaper count badge — social proof */}
          <p className="mt-3 text-[11px] text-muted/50">
            Trusted by creators worldwide
          </p>
        </div>

        {/* Categories — featured + "browse all" */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted/70">
            Categories
          </h3>
          <ul className="space-y-2.5 text-sm">
            {FOOTER_CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/wallpapers/${c.slug}`}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/wallpapers"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent transition hover:opacity-80"
              >
                Browse all {CATEGORIES.length} categories
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Devices */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted/70">
            Devices
          </h3>
          <ul className="space-y-2.5 text-sm">
            {DEVICE_TYPES.map((d) => (
              <li key={d.value}>
                <Link
                  href={`/wallpapers?device=${d.value}`}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {d.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/wallpapers?kind=live"
                className="text-muted transition-colors hover:text-foreground"
              >
                Live wallpapers
              </Link>
            </li>
          </ul>
        </div>

        {/* Company / account */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted/70">
            Aurava
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/about" className="text-muted transition-colors hover:text-foreground">About</Link></li>
            <li><Link href="/blog" className="text-muted transition-colors hover:text-foreground">Blog</Link></li>
            <li><Link href="/account" className="text-muted transition-colors hover:text-foreground">My downloads</Link></li>
            <li><Link href="/cart" className="text-muted transition-colors hover:text-foreground">Cart</Link></li>
            <li className="pt-1">
              <Link
                href="/login"
                className="inline-block rounded-lg border border-accent/30 bg-accent/8 px-4 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/50 hover:bg-accent/15"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div className="border-t border-border/30">
        <Container className="flex flex-col items-center gap-3 py-5 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted/70">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="min-h-11 inline-flex items-center px-2 py-2 text-xs text-muted/70 transition-colors hover:text-foreground sm:min-h-0 sm:py-0"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
      </div>
    </footer>
  );
}
