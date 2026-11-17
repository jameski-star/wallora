import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { MasonryGrid } from "@/components/masonry-grid";
import { FeaturedHero } from "@/components/featured-hero";
import { BentMockup } from "@/components/bent-mockup";
import { CosineWaveNet } from "@/components/cosine-net";
import { FadeInView } from "@/components/motion";
import { JsonLd } from "@/components/json-ld";
import { homePageJsonLd } from "@/lib/seo";
import {
  listWallpapers,
  listCategories,
} from "@/lib/catalog";
import { listPosts } from "@/lib/blog";
import { getFeaturedForDisplay } from "@/lib/featured";
import { previewUrl, videoPreviewUrl, postImageUrl } from "@/lib/cloudinary";
import { toCardWallpaper } from "@/lib/card";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";

export const unstable_instant = { prefetch: "static", unstable_disableValidation: true };

const MARKET_CATEGORY_IMAGES: Record<string, string> = {
  nature: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
  cars: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop",
  space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
  gaming: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
  anime: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
  abstract: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
  minimal: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
  dark: "https://res.cloudinary.com/djfn486ag/image/upload/q_auto,f_auto,w_1000/v1781452236/wallandiamobile_6_cpwldb.jpg",
  cities: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1000&auto=format&fit=crop",
  animals: "https://res.cloudinary.com/djfn486ag/image/upload/q_auto,f_auto,w_1000/v1/wallandiamobile_553_onmaod.jpg",
  illustration: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop",
  movies: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop",
  travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop",
  food: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop",
  flowers: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1000&auto=format&fit=crop",
  seasons: "https://images.unsplash.com/photo-1507371341162-763b5e419408?q=80&w=1000&auto=format&fit=crop",
  patterns: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1000&auto=format&fit=crop",
  "sci-fi": "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1000&auto=format&fit=crop",
  scifi: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1000&auto=format&fit=crop",
  caligraphy: "https://res.cloudinary.com/djfn486ag/image/upload/q_auto,f_auto,w_1000/v1/wallandiamobile_357_uzfd9f.jpg",
  calligraphy: "https://res.cloudinary.com/djfn486ag/image/upload/q_auto,f_auto,w_1000/v1/wallandiamobile_357_uzfd9f.jpg",
  "world-cup-2026": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
};

export default async function HomePage() {
  const [featured, week, popular, fresh, live, categories, posts] = await Promise.all([
    getFeaturedForDisplay("day"),
    getFeaturedForDisplay("week"),
    listWallpapers({ sort: "popular", limit: 20 }),
    listWallpapers({ sort: "newest", limit: 12 }),
    listWallpapers({ kind: "live", limit: 12 }),
    listCategories(),
    listPosts(3),
  ]);

  const heroSrc = featured
    ? previewUrl(featured.wallpaper, { width: 800 })
    : null;

  return (
    <main className="min-h-screen bg-[#081d37] text-white">
      {/* Hidden SEO h1 */}
      <h1 className="sr-only">
        {`${SITE_NAME} — Curated 4K & Live Wallpaper Gallery for Desktop, Phone & Tablet`}
      </h1>

      {heroSrc && (
        <link
          rel="preload"
          as="image"
          href={heroSrc}
          fetchPriority="high"
          imageSrcSet={heroSrc}
          imageSizes="(max-width:640px) 90vw, 600px"
        />
      )}

      {/* ── SECTION 3: Hero Section (90% Picture Showcase) ─────────────── */}
      {featured ? (
        <FeaturedHero
          slug={featured.wallpaper.slug}
          title={featured.title}
          caption={featured.caption || "WALLPAPER OF THE DAY"}
          description={featured.description}
          previewSrc={previewUrl(featured.wallpaper, { width: 1200 })}
          width={featured.wallpaper.width}
          height={featured.wallpaper.height}
          device={featured.wallpaper.device}
          videoSrc={videoPreviewUrl(featured.wallpaper, { width: 1000 })}
          isPremium={featured.wallpaper.isPremium}
          category={CATEGORIES.find((c) => c.slug === featured.wallpaper.categorySlug)?.name}
          priority
        />
      ) : (
        <section className="relative w-full pt-36 pb-20 bg-[#081d37] border-b border-white/10 overflow-hidden">
          <CosineWaveNet
            amplitude={24}
            speed={0.0016}
            opacity={0.35}
            fadePreset="center-faint"
          />
          <Container className="relative z-10 text-center py-20">
            <h2 className="text-5xl font-light text-white mb-4">
              Where digital art meets <span className="font-normal">display perfection.</span>
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Explore premier high-resolution 4K wallpapers and dynamic live motion backgrounds.
            </p>
            <ButtonLink href="/wallpapers" variant="primary">
              EXPLORE WALLPAPERS
            </ButtonLink>
          </Container>
        </section>
      )}

      {/* ── SECTION 4: Visual Navigation Tabs (Picture Backed) ─────────── */}
      <div className="relative z-20 -mt-12 sm:-mt-16 max-w-7xl mx-auto px-6 md:px-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 bg-[#112b4a] border border-white/10 shadow-2xl">
          <Link
            href="/wallpapers?sort=popular"
            className="relative px-6 py-6 text-left transition-all duration-300 group hover:bg-white/5 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-35 transition-opacity"
              style={{ backgroundImage: `url('${MARKET_CATEGORY_IMAGES.dark}')` }}
            />
            <div className="relative z-10">
              <span className="text-[12px] font-bold tracking-[0.2em] text-white block uppercase mb-1">
                EXPLORE NEW DROPS
              </span>
              <span className="text-[11px] text-white/70 block font-mono">
                TRENDING 4K & OLED RELEASES
              </span>
            </div>
            {/* Active Accent Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-accent" />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="w-2 h-2 border-t-2 border-r-2 border-accent rotate-45" />
            </div>
          </Link>

          <Link
            href="/wallpapers"
            className="relative px-6 py-6 text-left transition-all duration-300 group hover:bg-white/5 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-35 transition-opacity"
              style={{ backgroundImage: `url('${MARKET_CATEGORY_IMAGES.space}')` }}
            />
            <div className="relative z-10">
              <span className="text-[12px] font-bold tracking-[0.2em] text-white/90 group-hover:text-white block uppercase mb-1 transition-colors">
                BROWSE ALL WALLPAPERS
              </span>
              <span className="text-[11px] text-white/60 block font-mono">
                ALL CATEGORIES & DISPLAY SIZES
              </span>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="w-2 h-2 border-t-2 border-r-2 border-accent rotate-45" />
            </div>
          </Link>

          <Link
            href="/wallpapers?kind=live"
            className="relative px-6 py-6 text-left transition-all duration-300 group hover:bg-white/5 overflow-hidden"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-35 transition-opacity"
              style={{ backgroundImage: `url('${MARKET_CATEGORY_IMAGES.gaming}')` }}
            />
            <div className="relative z-10">
              <span className="text-[12px] font-bold tracking-[0.2em] text-white/90 group-hover:text-white block uppercase mb-1 transition-colors flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent animate-ping" />
                LIVE 4K WALLPAPERS
              </span>
              <span className="text-[11px] text-white/60 block font-mono">
                SMOOTH 60FPS MOTION BACKGROUNDS
              </span>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="w-2 h-2 border-t-2 border-r-2 border-accent rotate-45" />
            </div>
          </Link>
        </div>
      </div>

      <JsonLd data={homePageJsonLd()} />

      {/* ── SECTION 5: Feature Highlight (70% Visual / 30% Minimal Text) ── */}
      {week && (
        <section className="w-full bg-[#112b4a] border-y border-white/10 overflow-hidden my-20">
          <div className="flex flex-col lg:flex-row min-h-[560px] lg:min-h-[600px]">
            {/* Left: 70% Massive Wallpaper Visual Showcase with 3D Bent Mockup */}
            <div className="w-full lg:w-[70%] relative min-h-[460px] lg:min-h-[580px] overflow-hidden group flex items-center justify-center lg:justify-end p-6 sm:p-10 lg:pr-16">
              <Image
                src={previewUrl(week.wallpaper, { width: 1400 }) || MARKET_CATEGORY_IMAGES.space}
                alt={week.title}
                fill
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#081d37]/90 via-[#081d37]/35 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081d37] via-transparent to-black/30 pointer-events-none" />

              {/* Floating 3D Angled / Bent Device Mockup */}
              <div className="relative z-10 w-full max-w-[420px] sm:max-w-[480px] flex justify-center lg:justify-end pb-16 lg:pb-0">
                <BentMockup
                  device={week.wallpaper.device}
                  src={previewUrl(week.wallpaper, { width: 1000 })}
                  alt={week.title}
                  videoSrc={week.wallpaper.kind === "live" ? videoPreviewUrl(week.wallpaper, { width: 1000 }) : null}
                  width={week.wallpaper.width}
                  height={week.wallpaper.height}
                  allowToggle={true}
                  className="scale-90 sm:scale-95 lg:scale-100 origin-center lg:origin-right"
                />
              </div>

              <div className="absolute bottom-8 left-8 z-10 max-w-sm sm:max-w-md pointer-events-none">
                <span className="text-[11px] font-black tracking-[0.25em] text-accent uppercase block mb-1">
                  WALLPAPER OF THE WEEK
                </span>
                <h2 className="text-white text-3xl lg:text-5xl font-light opacity-95 drop-shadow-md">
                  {week.title}
                </h2>
              </div>
            </div>

            {/* Right: Minimal 30% Information Panel */}
            <div className="relative overflow-hidden w-full lg:w-[30%] flex flex-col justify-center px-8 sm:px-12 py-12 bg-[#0d233e] border-t lg:border-t-0 lg:border-l border-white/10">
              <CosineWaveNet
                amplitude={18}
                speed={0.0012}
                cols={28}
                rows={18}
                opacity={0.3}
                baseColor="0, 110, 182"
                peakColor="56, 189, 248"
                fadePreset="diagonal-subtle"
              />
              <div className="relative z-10">
                <span className="text-[10px] font-black tracking-[0.2em] text-accent uppercase block mb-3">
                  CURATED SPOTLIGHT
                </span>
              <h3 className="text-2xl font-bold text-white leading-tight mb-4 tracking-tight">
                Crafted for your screen.
              </h3>
              <p className="text-xs text-white/70 mb-6 leading-relaxed">
                {week.description || "Mastered for wide-gamut multi-monitor workstations and ultra-wide OLED displays."}
              </p>
              
              <div className="mb-6 border-y border-white/10 py-3 text-[11px] font-mono text-white/60">
                RESOLUTION: <span className="text-white font-bold">{week.wallpaper.width}×{week.wallpaper.height}</span>
              </div>

                <Link
                  href={`/wallpapers/${week.wallpaper.slug}`}
                  className="px-6 py-3.5 bg-primary text-white font-bold tracking-widest text-xs uppercase hover:bg-primary/90 transition-all text-center block"
                >
                  GET WALLPAPER
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 6: Full-Bleed Wallpaper Categories Grid ───────────── */}
      <section className="w-full py-20 bg-[#081d37] border-b border-white/10">
        <Container>
          <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
            <div>
              <div className="w-8 h-1 bg-accent mb-2" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                Wallpaper Categories
              </h2>
            </div>
            <Link
              href="/wallpapers"
              className="text-accent text-xs font-bold tracking-widest hover:underline uppercase"
            >
              VIEW ALL CATEGORIES →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {categories.slice(0, 12).map((cat, idx) => {
              const bgImg = MARKET_CATEGORY_IMAGES[cat.slug] || MARKET_CATEGORY_IMAGES.default;
              return (
                <Link
                  key={cat.slug}
                  href={`/wallpapers/${cat.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden cursor-pointer bg-[#112b4a] border border-white/10 hover:border-accent transition-all"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${bgImg}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081d37] via-transparent to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-5 z-10">
                    <div className="w-8 h-1 bg-accent mb-2 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase block">
                      COLLECTION #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-wider uppercase drop-shadow-sm">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Trending Wallpapers: Massive 20-Picture Masonry Grid ──────── */}
      <section className="py-20 bg-[#081d37] border-b border-white/10">
        <Container>
          <FadeInView>
            <SectionHeading
              title="Trending 4K Wallpapers"
              subtitle="Most downloaded high-resolution visuals across desktop and mobile"
              action={
                <Link
                  href="/wallpapers?sort=popular"
                  className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent hover:underline uppercase"
                >
                  SEE ALL TRENDING <ArrowRight size={14} />
                </Link>
              }
            />
          </FadeInView>
          <MasonryGrid cards={popular.map(toCardWallpaper)} />
        </Container>
      </section>

      {/* ── Live Wallpapers Showcase Grid ─────────────────────────────── */}
      {live.length > 0 && (
        <section className="py-20 bg-[#081d37] border-b border-white/10">
          <Container>
            <FadeInView>
              <SectionHeading
                title={
                  <span className="inline-flex items-center gap-3">
                    <span className="size-2 bg-accent animate-ping" />
                    LIVE MOTION WALLPAPERS
                  </span>
                }
                subtitle="Looping high-definition video backgrounds for dynamic desks"
                action={
                  <Link
                    href="/wallpapers?kind=live"
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent hover:underline uppercase"
                  >
                    VIEW ALL LIVE <ArrowRight size={14} />
                  </Link>
                }
              />
            </FadeInView>
            <MasonryGrid cards={live.map(toCardWallpaper)} />
          </Container>
        </section>
      )}

      {/* ── SECTION 7: Visual Editorial Cards (Display Insights) ─────── */}
      <section className="w-full py-20 bg-[#112b4a] border-b border-white/10">
        <Container>
          <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-4">
            <div>
              <div className="w-8 h-1 bg-accent mb-2" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                Display Insights & Guides
              </h2>
              <p className="mt-1 text-xs font-semibold tracking-wider text-white/60 uppercase">
                Display science, setup guides, and wallpaper curation
              </p>
            </div>
            <Link
              href="/blog"
              className="text-accent text-xs font-bold tracking-widest hover:underline uppercase flex items-center gap-1.5"
            >
              VIEW ALL GUIDES <ArrowRight size={14} />
            </Link>
          </div>

          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => {
                const cover =
                  postImageUrl(post.coverImage, { width: 800 }) ||
                  MARKET_CATEGORY_IMAGES[post.tags?.[0]?.toLowerCase() || ""] ||
                  MARKET_CATEGORY_IMAGES.technology;
                const categoryTag = post.tags?.[0]?.toUpperCase() || "GUIDE";

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group cursor-pointer flex flex-col bg-[#0d233e] border border-white/10 hover:border-accent transition-all overflow-hidden"
                  >
                    <div className="aspect-[16/10] relative overflow-hidden bg-[#081d37]">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={post.title}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                          style={{ backgroundImage: `url('${MARKET_CATEGORY_IMAGES.technology}')` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d233e] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 block">
                          {categoryTag}
                        </span>
                        <h3 className="text-base font-bold text-white group-hover:text-accent transition-colors uppercase leading-snug line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold tracking-widest uppercase group-hover:translate-x-1 transition-transform">
                        READ ARTICLE <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-white/10 bg-[#081d37]/50">
              <p className="text-white/60 text-sm mb-4">
                Explore our latest display guides, calibration techniques, and wallpaper curation.
              </p>
              <ButtonLink href="/blog" variant="primary">
                EXPLORE BLOG
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      {/* ── Fresh Drops Gallery ─────────────────────────────────────────── */}
      <section className="py-20 bg-[#081d37]">
        <Container>
          <FadeInView>
            <SectionHeading
              title="Fresh Wallpaper Drops"
              subtitle="Newly added high-resolution wallpapers and collections"
              action={
                <Link
                  href="/wallpapers?sort=newest"
                  className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-accent hover:underline uppercase"
                >
                  EXPLORE NEWEST <ArrowRight size={14} />
                </Link>
              }
            />
          </FadeInView>
          <MasonryGrid cards={fresh.map(toCardWallpaper)} />
        </Container>
      </section>
    </main>
  );
}
