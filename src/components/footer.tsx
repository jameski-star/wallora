import Link from "next/link";
import { Globe } from "lucide-react";
import { BrandLogo, BrandEmblem } from "./brand-logo";
import { CATEGORIES, DEVICE_TYPES, LEGAL_LINKS, SITE_NAME, SITE_CONTACT_EMAIL } from "@/lib/constants";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.211-.174.256-.402.155-1.499-.696-2.435-2.883-2.435-4.643 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.004-5.367 12.004-11.987C24.015 5.367 18.638 0 12.017 0z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-secondary pt-16 pb-10 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Top Brand Banner */}
        <div className="pb-10 mb-12 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <BrandLogo size="lg" subtext="PRECISION 4K GALLERY" />
          <p className="text-xs text-white/50 max-w-md font-medium leading-relaxed">
            The sovereign digital canvas platform engineered for wide-gamut multi-monitor workstations and ultra-wide OLED displays.
          </p>
        </div>

        {/* 5-column CME layout */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
          
          {/* Column 1: Categories */}
          <div>
            <h4 className="text-white text-[13px] font-bold tracking-widest mb-6 uppercase">
              CATEGORIES
            </h4>
            <ul className="space-y-3.5">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/wallpapers/${c.slug}`}
                    className="text-white/60 text-xs hover:text-accent transition-colors font-medium"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/wallpapers"
                  className="text-accent text-xs font-bold tracking-wider hover:underline"
                >
                  BROWSE ALL CATEGORIES →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Devices & Formats */}
          <div>
            <h4 className="text-white text-[13px] font-bold tracking-widest mb-6 uppercase">
              DEVICES & FORMATS
            </h4>
            <ul className="space-y-3.5">
              {DEVICE_TYPES.map((d) => (
                <li key={d.value}>
                  <Link
                    href={`/wallpapers?device=${d.value}`}
                    className="text-white/60 text-xs hover:text-accent transition-colors font-medium"
                  >
                    {d.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/wallpapers?kind=live"
                  className="text-white/60 text-xs hover:text-accent transition-colors font-medium flex items-center gap-1.5"
                >
                  <span className="size-1.5 rounded-full bg-accent" />
                  Live Motion 4K
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & License */}
          <div>
            <h4 className="text-white text-[13px] font-bold tracking-widest mb-6 uppercase">
              PLATFORM & LICENSE
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link href="/license" className="text-white/60 text-xs hover:text-accent transition-colors font-medium">
                  Commercial Licensing
                </Link>
              </li>
              <li>
                <Link href="/wallpapers" className="text-white/60 text-xs hover:text-accent transition-colors font-medium">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-white/60 text-xs hover:text-accent transition-colors font-medium">
                  Instant Download
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-white/60 text-xs hover:text-accent transition-colors font-medium">
                  Download History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div>
            <h4 className="text-white text-[13px] font-bold tracking-widest mb-6 uppercase">
              ABOUT AURAVA
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link href="/about" className="text-white/60 text-xs hover:text-accent transition-colors font-medium">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/60 text-xs hover:text-accent transition-colors font-medium">
                  Blog & Guides
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONTACT_EMAIL}`}
                  className="text-white/60 text-xs hover:text-accent transition-colors font-medium"
                >
                  Creator Inquiries
                </a>
              </li>
              <li>
                <span className="text-white/40 text-xs font-mono">
                  v0.1.0-ULTRA
                </span>
              </li>
            </ul>
          </div>

          {/* Column 5: Stay Connected */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white text-[13px] font-bold tracking-widest mb-6 uppercase">
              STAY CONNECTED
            </h4>
            <div className="flex gap-4 mb-6 text-white/60">
              <a href="#" aria-label="Facebook" className="hover:text-white transition-colors cursor-pointer">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/CharieS28452"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.pinterest.com/mickelsgerald/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <PinterestIcon className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-white transition-colors cursor-pointer">
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
              <Globe className="w-4 h-4 text-accent" />
              <span>GLOBAL / 4K UHD</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <BrandEmblem size="sm" />
            <span className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} {SITE_NAME} INC. ALL RIGHTS RESERVED.
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold tracking-widest text-white/40 uppercase">
            {LEGAL_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
