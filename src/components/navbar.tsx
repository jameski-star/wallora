"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, Menu, X as CloseIcon, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "./cart";
import { BrandLogo } from "./brand-logo";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";

export function Navbar({
  displayName,
  isAdmin,
}: {
  displayName: string | null;
  isAdmin: boolean;
}) {
  const cart = useCart();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/wallpapers?search=${encodeURIComponent(q.trim())}` : "/wallpapers");
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      {/* Tier 1: Top Utility Bar (40px) */}
      <div className={`w-full bg-secondary h-10 flex items-center justify-between px-6 md:px-12 border-b border-white/5 transition-all duration-300 ${
        isScrolled ? "-mt-10 opacity-0 pointer-events-none" : "mt-0 opacity-100"
      }`}>
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold tracking-widest text-accent uppercase">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          CURATED 4K & DYNAMIC DISPLAY PLATFORM
        </div>
        <div className="flex items-center gap-6 text-[11px] font-bold tracking-widest text-white/80 uppercase ml-auto">
          <Link href="/blog" className="hover:text-accent transition-colors">
            Blog & Guides
          </Link>
          <Link href="/wallpapers" className="hover:text-accent transition-colors">
            Collections
          </Link>
          <div className="h-3 w-px bg-white/20" />
          <Link href="/wallpapers?device=desktop" className="hover:text-accent transition-colors">
            Desktop & Mobile
          </Link>
        </div>
      </div>

      {/* Tier 2: Main Navigation Bar (72px) */}
      <div className="w-full bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-[72px] flex items-center justify-between gap-6">
          {/* Sovereign Brand Logo */}
          <Link href="/" className="flex items-center cursor-pointer group shrink-0">
            <BrandLogo size="md" subtext="4K STUDIO" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/wallpapers"
              className="text-[13px] font-bold tracking-widest text-white hover:text-accent transition-colors"
            >
              WALLPAPERS
            </Link>
            <Link
              href="/wallpapers?kind=live"
              className="text-[13px] font-bold tracking-widest text-white hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-accent" />
              LIVE 4K
            </Link>
            <Link
              href="/wallpapers"
              className="text-[13px] font-bold tracking-widest text-white hover:text-accent transition-colors"
            >
              COLLECTIONS
            </Link>
            <Link
              href="/blog"
              className="text-[13px] font-bold tracking-widest text-white hover:text-accent transition-colors"
            >
              BLOG
            </Link>
          </nav>

          {/* Search Bar Form / Expanded */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="w-4.5 h-4.5 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="SEARCH 4K WALLPAPERS…"
                className="w-full bg-[#0c213d]/80 border border-white/10 text-white placeholder:text-white/40 text-xs font-semibold tracking-wider pl-10 pr-3.5 py-2.5 rounded-xl outline-none focus:border-accent transition-all"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Search toggle on mobile */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden text-white hover:text-accent transition-colors p-1"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Icon */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative text-white hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {mounted && cart.hydrated && cart.count > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-[18px] h-[18px] place-items-center bg-accent px-1 text-[10px] font-black text-[#081d37] rounded-full shadow-md">
                  {cart.count}
                </span>
              )}
            </Link>

            {/* Admin link if applicable */}
            {isAdmin && (
              <Link
                href="/admin-dash"
                aria-label="Admin Dashboard"
                className="hidden sm:flex text-white/80 hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-white/5"
              >
                <Shield className="w-5.5 h-5.5" />
              </Link>
            )}

            {/* User Account / LOG IN Button */}
            <Link
              href={displayName ? "/account" : "/login"}
              className="hidden sm:flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-primary text-primary text-[12px] font-bold tracking-widest hover:bg-primary hover:text-white transition-all duration-300"
            >
              <User className="w-4.5 h-4.5" />
              {displayName ? displayName.toUpperCase().split(" ")[0] : "LOG IN"}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="lg:hidden text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="md:hidden px-6 py-3 bg-secondary border-t border-white/10">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="SEARCH 4K WALLPAPERS…"
                autoFocus
                className="w-full bg-background border border-white/10 text-white placeholder:text-white/40 text-xs font-semibold tracking-wider pl-9 pr-3 py-2 outline-none focus:border-primary"
              />
            </form>
          </div>
        )}

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-secondary border-t border-white/10 overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-5">
                <Link
                  href="/wallpapers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold tracking-widest text-white hover:text-accent transition-colors"
                >
                  WALLPAPERS
                </Link>
                <Link
                  href="/wallpapers?kind=live"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold tracking-widest text-white hover:text-accent transition-colors flex items-center gap-2"
                >
                  <span className="size-1.5 rounded-full bg-accent" />
                  LIVE 4K
                </Link>
                <Link
                  href="/wallpapers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold tracking-widest text-white hover:text-accent transition-colors"
                >
                  COLLECTIONS
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold tracking-widest text-white hover:text-accent transition-colors"
                >
                  BLOG
                </Link>

                <div className="h-px bg-white/10 w-full my-2" />

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-white/70">
                  {CATEGORIES.slice(0, 6).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/wallpapers/${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1 hover:text-accent"
                    >
                      {c.name.toUpperCase()}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-white/10 w-full my-2" />

                <Link
                  href={displayName ? "/account" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 bg-primary text-white text-center text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors uppercase"
                >
                  {displayName ? `MY ACCOUNT (${displayName.split(" ")[0]})` : "LOG IN"}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
