import Link from "next/link";
import { Container } from "@/components/ui";
import { LEGAL_LINKS } from "@/lib/constants";

/**
 * Shared shell for legal pages: a readable single column with prose-like
 * styling applied via arbitrary variants (no typography plugin needed) and a
 * cross-link nav between the policies.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <article
          className={
            "text-sm leading-relaxed text-muted " +
            "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground " +
            "[&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground " +
            "[&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-foreground " +
            "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 " +
            "[&_strong]:text-foreground [&_a]:text-accent [&_a]:underline"
          }
        >
          {children}
        </article>

        <nav className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6 text-sm text-muted">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </Container>
  );
}
