import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd, faqPageJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Aurava · Sovereign 4K & Live Wallpaper Platform",
  description:
    "Discover Aurava: the sovereign digital canvas engineered for 4K desktop workstations and OLED screens. Safe downloads, true blacks & zero adware ✓",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About Aurava · Sovereign 4K & Live Wallpaper Platform",
    description:
      "Discover Aurava: the sovereign digital canvas engineered for 4K desktop workstations and OLED screens. Safe downloads, true blacks & zero adware ✓",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Aurava · Sovereign 4K & Live Wallpaper Platform",
    description:
      "Discover Aurava: the sovereign digital canvas engineered for 4K desktop workstations and OLED screens. Safe downloads, true blacks & zero adware ✓",
  },
};

const ABOUT_FAQS = [
  {
    question: "Is downloading wallpapers from Aurava safe?",
    answer:
      "Yes. Aurava provides direct, clean media files (PNG, JPG, MP4) with zero third-party installers, adware, or executable bloatware. Every asset is verified and malware-screened before publication.",
  },
  {
    question: "Are Aurava wallpapers native uncompressed 4K or AI upscaled?",
    answer:
      "All wallpapers are authored or photographed in true native 4K (3840×2160) or high-DPI master resolutions. We do not use low-resolution stretched upscales, ensuring razor-sharp clarity on Retina and 4K displays.",
  },
  {
    question: "Do dark wallpapers actually save battery on OLED screens?",
    answer:
      "Yes. OLED and AMOLED screens illuminate pixels independently. True pitch-black pixels (#000000) physically deactivate, reducing display power draw by 15% to 30% on mobile phones and laptops.",
  },
  {
    question: "How do live video wallpapers work on Windows 11 and Mac?",
    answer:
      "Aurava live wallpapers are delivered as seamless H.264 MP4 loops. On Windows 11, they run via free open-source Lively Wallpaper or Steam Wallpaper Engine; on macOS, they work with native screensavers or loop utilities under 1% CPU utilization.",
  },
  {
    question: "What payment methods are supported, and is there a subscription?",
    answer:
      "Aurava is strictly pay-per-wallpaper with zero forced subscriptions. We process payments via Pesapal, supporting M-Pesa, Airtel Money, Visa, and Mastercard with instant delivery and frictionless guest checkout.",
  },
  {
    question: "Can I use Aurava wallpapers for YouTube, Twitch, or commercial work?",
    answer:
      "Standard purchases and free downloads include a personal-use license for personal devices and desk setup streaming. Commercial redistribution or broadcast licensing is available upon request at James@auravaw.tech.",
  },
];

export default function AboutPage() {
  return (
    <Container className="py-8 sm:py-12">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={faqPageJsonLd(ABOUT_FAQS)} />
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
          <h2 className="text-xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm text-muted">Everything you need to know about downloading, display compatibility, and licensing on {SITE_NAME}.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {ABOUT_FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-card border border-border/60 bg-surface p-4 transition-colors hover:border-accent/40">
                <h3 className="font-semibold text-foreground text-sm">{faq.question}</h3>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">{faq.answer}</p>
              </div>
            ))}
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
