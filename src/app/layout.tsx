import type { Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { baseMetadata, websiteJsonLd, organizationJsonLd } from "@/lib/seo";
import { getViewer } from "@/lib/auth";
import { CartProvider } from "@/components/cart";
import { CurrencyProvider } from "@/components/currency";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { themeInitScript } from "@/components/theme-toggle";
import { JsonLd } from "@/components/json-ld";

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
  const [viewer, hdrs] = await Promise.all([getViewer(), headers()]);

  // Vercel sets this header at the CDN edge from the visitor's IP geolocation.
  // Falls back to "XX" (unknown) in local dev or when the header is absent.
  const country = hdrs.get("x-vercel-ip-country") ?? "XX";

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
          <CurrencyProvider country={country}>
            <Navbar
              displayName={viewer.profile?.displayName ?? null}
              isAdmin={viewer.isAdmin}
            />
            <main className="flex-1">{children}</main>
            <Footer />
          </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
