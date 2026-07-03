import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Aurava — a curated premium wallpaper marketplace offering hand-picked 4K and HD wallpapers for every device.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Container className="py-8 sm:py-12">
      <JsonLd data={organizationJsonLd()} />
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          About {SITE_NAME}
        </h1>
        <p className="mt-4 text-lg text-muted">{SITE_TAGLINE}.</p>

        <section className="mt-10 space-y-5 text-sm leading-relaxed text-muted">
          <p>
            <strong className="text-foreground">{SITE_NAME}</strong> is a curated wallpaper
            marketplace built for people who care about visual quality. Every design in our
            collection is hand-picked — not scraped from stock libraries — ensuring that what
            you see on screen is genuinely worth putting on your device.
          </p>
          <p>
            We offer wallpapers in true 4K (3840×2160) and HD resolutions, optimized for
            desktop monitors, phones and tablets. Our collection spans more than 20 categories
            including nature, gaming, anime, abstract, dark/OLED, cities, space, and more —
            each one carefully maintained so you spend less time searching and more time
            enjoying your screen.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Free &amp; Premium</h2>
          <p>
            Many of our wallpapers are completely free to download at full resolution — no
            watermarks, no sign-up walls. Premium originals start at just $0.30 and are
            delivered securely via expiring download links after purchase. This model keeps
            the site sustainable while ensuring free content stays genuinely useful.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Live Wallpapers</h2>
          <p>
            Beyond static images, {SITE_NAME} also features live wallpapers — short looping
            animations that bring your screen to life. Preview them directly on the site
            before downloading.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Protected Previews</h2>
          <p>
            Preview images are served at reduced resolution so the full-quality originals
            remain exclusive to buyers. This protects both creators and customers — what you
            purchase is genuinely premium, not a slightly-larger version of what everyone can
            see for free.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Questions, feedback, or licensing inquiries? Reach us at{" "}
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              className="text-accent underline transition hover:opacity-80"
            >
              {SITE_CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Frequently Asked Questions — Quick Facts</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-card border border-border/50 bg-surface-2/30 p-4">
              <h3 className="font-semibold text-foreground text-sm">What is Aurava?</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">Aurava is a curated premium wallpaper marketplace, desktop personalization platform, visual search engine, and display technology resource.</p>
            </div>
            <div className="rounded-card border border-border/50 bg-surface-2/30 p-4">
              <h3 className="font-semibold text-foreground text-sm">Who is it for?</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">It is built for digital artists, designers, gamers, and tech enthusiasts who want custom, high-resolution visual setups for high-DPI monitors, mobile phones, and tablets.</p>
            </div>
            <div className="rounded-card border border-border/50 bg-surface-2/30 p-4">
              <h3 className="font-semibold text-foreground text-sm">Why is it useful?</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">It eliminates thin, low-resolution clutter by providing hand-picked, human-curated 4K wallpapers and looping live video backgrounds optimized for color science, HDR, and OLED screens.</p>
            </div>
            <div className="rounded-card border border-border/50 bg-surface-2/30 p-4">
              <h3 className="font-semibold text-foreground text-sm">How is it different?</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">Unlike automated scraping galleries, Aurava enforces transparent licensing, premium editor curation, regional payment options (M-Pesa KES), and frictionless guest checkout.</p>
            </div>
            <div className="rounded-card border border-border/50 bg-surface-2/30 p-4">
              <h3 className="font-semibold text-foreground text-sm">When should it be used?</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">Use it whenever personalizing a new device, setting up multi-monitor configurations, selecting OLED-friendly battery-saving backgrounds, or upgrading home screen aesthetics.</p>
            </div>
            <div className="rounded-card border border-border/50 bg-surface-2/30 p-4">
              <h3 className="font-semibold text-foreground text-sm">What related concepts exist?</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">Desktop customization, color calibration, high dynamic range (HDR), OLED pixel performance, digital artwork curation, and mobile UI/UX lockscreen aesthetics.</p>
            </div>
          </div>
        </section>

        <div className="mt-12">
          <Link
            href="/wallpapers"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Browse wallpapers
          </Link>
        </div>
      </article>
    </Container>
  );
}
