import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { baseMetadata, websiteJsonLd } from "@/lib/seo";
import { getViewer } from "@/lib/auth";
import { CartProvider } from "@/components/cart";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { themeInitScript } from "@/components/theme-toggle";
import { JsonLd } from "@/components/json-ld";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = baseMetadata;

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
        <CartProvider>
          <Navbar
            displayName={viewer.profile?.displayName ?? null}
            isAdmin={viewer.isAdmin}
          />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
