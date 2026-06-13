import Link from "next/link";
import { Container } from "./ui";
import { CATEGORIES, DEVICE_TYPES, LEGAL_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-white">W</span>
            {SITE_NAME}
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">{SITE_TAGLINE}. Crafted for every screen.</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Categories</h3>
          <ul className="space-y-2 text-sm text-muted">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/wallpapers/${c.slug}`} className="transition hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Devices</h3>
          <ul className="space-y-2 text-sm text-muted">
            {DEVICE_TYPES.map((d) => (
              <li key={d.value}>
                <Link href={`/wallpapers?device=${d.value}`} className="transition hover:text-foreground">
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Account</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/blog" className="transition hover:text-foreground">Blog</Link></li>
            <li><Link href="/login" className="transition hover:text-foreground">Sign in</Link></li>
            <li><Link href="/signup" className="transition hover:text-foreground">Create account</Link></li>
            <li><Link href="/account" className="transition hover:text-foreground">My downloads</Link></li>
            <li><Link href="/cart" className="transition hover:text-foreground">Cart</Link></li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-border">
        <Container className="flex flex-col items-center gap-4 py-6 text-xs text-muted">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
            <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
            <p>Premium previews are reduced in resolution. Full-resolution originals delivered after purchase.</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
