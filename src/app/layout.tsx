import { Suspense } from "react";
import type { Viewport } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { baseMetadata, websiteJsonLd, organizationJsonLd } from "@/lib/seo";
import { getViewer } from "@/lib/auth";
import { CartProvider } from "@/components/cart";
import { CurrencyProvider } from "@/components/currency";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  ...baseMetadata,
  title: "Aurava | Premium 4K & Live Wallpapers",
  description: "Where digital craftsmanship meets display perfection. Explore curated 4K wallpapers and dynamic live backgrounds for desktop, OLED, and mobile.",
};

export const viewport: Viewport = {
  themeColor: "#081d37",
};

function LayoutFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-secondary/80 backdrop-blur h-[72px] flex items-center px-6 md:px-12">
        <div className="skeleton h-8 w-36" />
        <div className="ml-auto skeleton h-8 w-8" />
      </div>
      <div className="flex-1 bg-background" />
    </div>
  );
}

async function DynamicLayout({ children }: { children: React.ReactNode }) {
  const [viewer, hdrs] = await Promise.all([getViewer(), headers()]);
  const country = hdrs.get("x-vercel-ip-country") ?? "US";

  return (
    <CurrencyProvider defaultCountry={country}>
      <Navbar
        displayName={viewer.profile?.displayName ?? null}
        isAdmin={viewer.isAdmin}
      />
      <div className="flex-1">{children}</div>
      <Footer />
    </CurrencyProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans scroll-smooth h-full antialiased bg-[#081d37]`}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//supabase.co" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="flex min-h-full flex-col bg-[#081d37] text-white selection:bg-accent selection:text-[#081d37]">
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={organizationJsonLd()} />
        <CartProvider>
          <Suspense fallback={<LayoutFallback />}>
            <DynamicLayout>{children}</DynamicLayout>
          </Suspense>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}