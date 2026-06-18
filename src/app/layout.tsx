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
  // Falls back to "US" if undefined. Change this to "KE" to test locally!
  const country = hdrs.get("x-vercel-ip-country") ?? "US";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to Cloudinary CDN — eliminates DNS + TLS round-trip for images */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        {/* DNS prefetch for Supabase (auth + API calls) */}
        <link rel="dns-prefetch" href="//supabase.co" />
        {/* Apple touch icon for iOS home-screen shortcuts */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={organizationJsonLd()} />
        <CartProvider>
          {/* Note the prop change here to `defaultCountry` */}
          <CurrencyProvider defaultCountry={country}>
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