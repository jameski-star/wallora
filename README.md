# Aurava

A premium wallpaper marketplace — **Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase · Cloudinary · PesaPal v3 · Resend · Motion**.

Aurava is built to **run with zero external credentials**: every integration has a
local fallback (in-memory catalog, cookie auth, mock payment, console email), so you
can browse the full experience immediately and switch each subsystem to the real
service by adding env keys.

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Feature map

| Area | Where | Notes |
| --- | --- | --- |
| Masonry gallery, filters, search | `src/app/wallpapers`, `src/components/masonry-grid.tsx` | CSS columns, dark-mode-first |
| Wallpaper detail + buy/download | `src/app/wallpapers/[slug]`, `src/components/buy-panel.tsx` | one dynamic segment resolves category **or** wallpaper |
| Image protection | `src/components/protected-image.tsx`, `src/lib/cloudinary.ts` | watermark + blur + downscale previews; no-drag/right-click; originals stay private |
| Auth + age gating | `src/lib/auth.ts`, `src/lib/age.ts`, `src/proxy.ts` | DOB at signup; mature content filtered server-side |
| Admin dashboard | `src/app/admin-dash` | hidden, role-gated; upload form, orders, featured |
| PesaPal v3 checkout | `src/lib/pesapal.ts`, `src/lib/orders.ts`, `src/app/checkout` | server-only keys; IPN webhook; 60s signed-URL delivery + email |
| Wallpaper of Day/Week | `src/lib/featured.ts`, `src/app/api/cron`, `vercel.json` | Nager.Date holidays; admin override |
| SEO | `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts` | dynamic metadata, JSON-LD, OG/Twitter, canonical, sitemap |

## Demo mode (no keys)

- **Auth** is cookie-based. Any email logs in; use **`admin@aurava.app`** for the admin dashboard at `/admin-dash`.
- **Payments** route to `/checkout/mock` and auto-confirm.
- **Email** download links print to the server console.
- **Catalog** is the in-memory seed (`src/lib/repo/seed.ts`); writes reset on restart.

## Going live

Copy `.env.example` → `.env.local` and fill the blocks you want. Each block
independently flips its subsystem from mock → real (see `src/lib/env.ts`).

1. **Supabase** — create a project, run `supabase/migrations/0001_init.sql` in the
   SQL editor, create a **private** Storage bucket `premium-wallpapers`, and set the
   three Supabase env vars. Grant yourself admin: `update profiles set role='admin' where email='you@…';`
2. **Cloudinary** — set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`; upload originals and
   reference their public ids in the admin upload form.
3. **PesaPal v3** — set consumer key/secret, then call `registerIpn()` once (see
   `src/lib/pesapal.ts`) and store the returned id in `PESAPAL_IPN_ID`.
4. **Resend** — set `RESEND_API_KEY` and a verified `EMAIL_FROM`.
5. **Cron** — set `CRON_SECRET`; `vercel.json` schedules the daily/weekly refresh.

## Notable Next.js 16 specifics used here

- `proxy.ts` (renamed from `middleware`, Node runtime) for session refresh + gating
- async `params` / `searchParams` / `cookies()` everywhere
- `images.remotePatterns` (not `domains`); `qualities` allow-list
- file-based `sitemap.ts` / `robots.ts`, `generateMetadata`

## Scripts

```bash
pnpm dev      # dev server (Turbopack)
pnpm build    # production build
pnpm start    # serve the build
pnpm lint     # eslint
```
