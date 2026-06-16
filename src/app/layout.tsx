import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { baseMetadata, websiteJsonLd, organizationJsonLd } from "@/lib/seo";
import { getViewer } from "@/lib/auth";
import { CartProvider } from "@/components/cart";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { themeInitScript } from "@/components/theme-toggle";
import { JsonLd } from "@/components/json-ld";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = baseMetadata;

// Tints the mobile browser chrome (address bar) per active color scheme — the
// site ships dark by default with an optional light theme.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getViewer();

  return (
    <html
      lang="en"
      // The theme init script below adds `.light` to <html> before hydration,
      // so the client class can differ from the server. suppressHydrationWarning
      // scopes the warning away from this element (and also tolerates browser
      // extensions that mutate <html>/<head> before React loads).
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={organizationJsonLd()} />
        <CartProvider>
          <Navbar
            displayName={viewer.profile?.displayName ?? null}
            isAdmin={viewer.isAdmin}
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
