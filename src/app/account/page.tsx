import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Download, LogOut, ShieldCheck, Sparkles, Receipt } from "lucide-react";
import { Container } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { logout } from "@/app/(auth)/actions";
import { ageFromDob } from "@/lib/age";
import { formatPrice } from "@/lib/utils";
import { previewUrl } from "@/lib/cloudinary";

export const metadata: Metadata = {
  title: "My Account | Aurava",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const viewer = await requireUser("/account");
  const profile = viewer.profile!;
  const repo = await getRepo();
  const orders = (await repo.listOrders({ userId: profile.id })).filter(
    (o) => o.status === "paid",
  );
  const age = ageFromDob(profile.dateOfBirth);

  // Fetch actual wallpaper preview assets for purchased items
  const wallpaperIds = Array.from(
    new Set(orders.flatMap((o) => o.items.map((it) => it.wallpaperId))),
  );
  const wallpapers = await repo.getWallpapersByIds(wallpaperIds);
  const wallpaperMap = new Map(wallpapers.map((w) => [w.id, w]));

  const purchasedItems = orders.flatMap((o) =>
    o.items.map((it) => ({
      ...it,
      orderId: o.id,
      currency: o.currency,
      wallpaper: wallpaperMap.get(it.wallpaperId),
      orderDate: o.paidAt || o.createdAt,
    })),
  );

  return (
    <main className="min-h-screen bg-[#081d37] text-white pt-24 pb-20 sm:pt-32 sm:pb-28">
      <Container className="max-w-5xl px-4 sm:px-6">
        {/* ── 1. Mobile-First Profile Identity Card ────────────────────── */}
        <div className="bg-[#112b4a] border border-white/10 p-5 sm:p-8 mb-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative size-14 sm:size-16 shrink-0 rounded-full bg-gradient-to-br from-primary to-[#081d37] border-2 border-accent flex items-center justify-center text-xl sm:text-2xl font-bold text-accent shadow-lg shadow-black/40">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight truncate">
                    {profile.displayName}
                  </h1>
                  {viewer.isAdmin && (
                    <span className="px-2 py-0.5 bg-accent/20 border border-accent/40 text-accent text-[10px] font-black uppercase tracking-wider">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-white/60 truncate font-mono mt-0.5">
                  {profile.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 uppercase">
                    {age !== null ? `Age verified: ${age}+` : "Age Unverified"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#081d37] border border-accent/40 text-[10px] font-bold text-accent uppercase tracking-wider">
                    <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                    Active Member
                  </span>
                </div>
              </div>
            </div>

            {viewer.isAdmin && (
              <Link
                href="/admin-dash"
                className="inline-flex items-center justify-center px-4 py-3 bg-[#081d37] border border-white/15 text-accent text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors shrink-0"
              >
                Admin Portal →
              </Link>
            )}
          </div>

          {/* Quick Metrics Counter Strip */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/10 text-center">
            <div className="p-2">
              <span className="block text-2xl font-light text-accent font-mono">
                {purchasedItems.length}
              </span>
              <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">
                Wallpapers
              </span>
            </div>
            <div className="p-2 border-x border-white/10">
              <span className="block text-2xl font-light text-white font-mono">
                {orders.length}
              </span>
              <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">
                Orders
              </span>
            </div>
            <div className="p-2">
              <span className="block text-2xl font-light text-white font-mono">
                4K UHD
              </span>
              <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">
                Resolution
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. Visual Wallpaper Library (90% Picture Experience) ─────── */}
        <div className="bg-[#112b4a] border border-white/10 p-5 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <div>
              <div className="w-8 h-1 bg-accent mb-1.5" />
              <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
                My Wallpapers & Downloads
              </h2>
            </div>
            <span className="text-xs font-mono text-white/60">
              {purchasedItems.length} Items
            </span>
          </div>

          {purchasedItems.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-white/10 bg-[#081d37]/50 p-6">
              <Sparkles className="mx-auto text-accent mb-3" size={32} />
              <p className="text-sm font-bold uppercase text-white mb-1">
                No wallpapers in your collection yet
              </p>
              <p className="text-xs text-white/60 max-w-sm mx-auto mb-6">
                Explore our curated 4K and live motion backgrounds to customize your desktop and mobile displays.
              </p>
              <Link
                href="/wallpapers"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg"
              >
                BROWSE WALLPAPERS
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {purchasedItems.map((it) => {
                const thumb = it.wallpaper
                  ? previewUrl(it.wallpaper, { width: 600 })
                  : null;

                return (
                  <div
                    key={`${it.orderId}-${it.wallpaperId}`}
                    className="bg-[#081d37] border border-white/10 hover:border-accent transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Visual Preview Box */}
                    <div className="relative aspect-[16/10] bg-[#112b4a] overflow-hidden">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={it.title}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#0d233e]">
                          <Sparkles className="text-white/20" size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#081d37] via-transparent to-transparent opacity-60" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                        <span className="px-2 py-0.5 bg-[#081d37]/90 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-accent uppercase">
                          {it.wallpaper?.resolution || "4K UHD"}
                        </span>
                        {it.wallpaper?.device && (
                          <span className="px-2 py-0.5 bg-[#081d37]/90 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white/80 uppercase">
                            {it.wallpaper.device}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content & Touch-First Action Button */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase line-clamp-1 group-hover:text-accent transition-colors">
                          {it.title}
                        </h3>
                        <p className="text-[11px] text-white/60 font-mono mt-1">
                          Order #{it.orderId.slice(0, 8)} · {formatPrice(it.priceCents, it.currency)}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
                        {it.wallpaper ? (
                          <>
                            <a
                              href={`/api/download/order/${it.orderId}?wp=${it.wallpaperId}`}
                              className="w-full h-12 bg-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-98 transition-all shadow-md"
                            >
                              <Download size={15} /> DOWNLOAD FULL RESOLUTION
                            </a>
                            <Link
                              href={`/wallpapers/${it.wallpaper.slug}`}
                              className="w-full py-2 text-center text-[10px] font-bold tracking-widest text-white/50 hover:text-accent uppercase transition-colors"
                            >
                              VIEW WALLPAPER DETAILS →
                            </Link>
                          </>
                        ) : (
                          <p className="w-full py-2 text-center text-[10px] font-bold tracking-widest text-amber-300/90 uppercase">
                            Temporarily unavailable — contact support
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. Orders & Receipts Summary ────────────────────────────── */}
        {orders.length > 0 && (
          <div className="bg-[#112b4a] border border-white/10 p-5 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Order Receipts ({orders.length})
              </h2>
            </div>
            <div className="divide-y divide-white/10">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-white font-mono uppercase">
                      Order #{o.id}
                    </p>
                    <p className="text-[11px] text-white/60 font-mono mt-0.5">
                      {new Date(o.paidAt || o.createdAt).toLocaleDateString()} ·{" "}
                      {o.items.length} {o.items.length === 1 ? "item" : "items"} ·{" "}
                      {formatPrice(o.totalCents, o.currency)}
                    </p>
                  </div>
                  <a
                    href={`/api/download/receipt/${o.id}`}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 bg-[#081d37] border border-white/15 text-xs font-bold text-accent uppercase tracking-wider hover:bg-white/5 transition-colors"
                  >
                    <Receipt size={13} /> Receipt PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Safe Sign Out Action (Bottom Thumb-Accessible) ───────── */}
        <div className="text-center pt-4">
          <form action={logout}>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 h-12 border border-white/15 text-white/70 hover:text-red-400 hover:border-red-400/40 text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer mx-auto active:scale-98"
            >
              <LogOut size={15} /> SIGN OUT OF AURAVA
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}
