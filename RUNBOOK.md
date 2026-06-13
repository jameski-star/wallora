# Wallora — Operations Runbook

How to set up the admin account on Supabase, take the app live, and run it day‑to‑day.

> Wallora runs in two modes. **Demo mode** (no env keys) uses an in‑memory catalog,
> cookie auth, a mock payment page and console email — great for local browsing.
> **Live mode** flips each subsystem to the real service as soon as you add its env
> keys (`src/lib/env.ts` does the detection per‑block). This runbook covers live mode.

---

## Part 1 — Set up the admin on Supabase

There is **no signup screen for admins**. An admin is just a normal user whose
`profiles.role` is `'admin'`. You promote yourself once via SQL.

### 1.1 Create the project
1. Go to <https://supabase.com> → **New project**. Pick a region close to your users
   (e.g. EU/“West” for Kenya/East Africa latency is fine).
2. Save the **database password** somewhere safe.

### 1.2 Run the schema migrations
1. In the Supabase dashboard open **SQL Editor → New query**.
2. Run the files in `supabase/migrations/` **in order**:
   - `0001_init.sql` — creates `profiles`, `wallpapers`, `categories`, `featured`,
     `orders`, the enums, the `is_admin()` helper, the `increment_downloads()` RPC,
     the auto‑profile trigger, and all RLS policies.
   - `0002_live_wallpapers.sql` — adds live‑video wallpaper columns (`kind`,
     `video_public_id`, `duration_sec`).
   - All files are idempotent (safe to re‑run).
3. The trigger `on_auth_user_created` means **every new auth user automatically gets
   a `profiles` row** (role defaults to `'user'`).

### 1.3 Create the private Storage bucket
This is where the **original** high‑res files live. Previews are public (Cloudinary);
originals must stay private and are only handed out via 60‑second signed URLs.

1. **Storage → New bucket**.
2. Name it exactly **`premium-wallpapers`** (must match `SUPABASE_PREMIUM_BUCKET`).
3. Set it to **Private** (uncheck “Public bucket”). Leave RLS on.

### 1.4 Grab your API keys
**Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ← **server‑only, never expose**

### 1.5 Create your user, then promote to admin
1. With the three Supabase env vars set (see Part 2) start the app and go to
   **`/signup`**. Register with your real email and a date of birth (the DOB drives
   age‑gating; use an 18+ date so mature content is visible to you).
   - The trigger creates your `profiles` row automatically.
2. Back in **SQL Editor**, promote yourself:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Sign out and back in. Visit **`/admin-dash`** — `requireAdmin()` in
   `src/app/admin-dash/layout.tsx` checks `role = 'admin'` and lets you in.

> **Demo‑mode shortcut (no Supabase):** any email logs in, and the single magic email
> **`admin@wallora.app`** is treated as admin (`src/lib/demo-auth.ts`). Useful locally,
> not for production.

To revoke an admin later: `update profiles set role = 'user' where email = '…';`

### 1.6 Seed the catalog (optional)
A fresh Supabase project has empty `categories`/`wallpapers`/`featured` tables. To
start with the built-in demo catalog instead of an empty store, open
**`/admin-dash/setup`** and click **“Seed catalog into Supabase”**. It upserts by id
(safe to re-run) and seeds categories → wallpapers → featured slots.

> This seeds catalog **metadata** only. Previews load from public image hosts, but
> **paid downloads need the original files** uploaded to the `premium-wallpapers`
> bucket at `originals/<id>.jpg` (see §5.1).

---

## Part 2 — One‑time environment setup

Copy the template and fill the blocks you want. Any block left blank falls back to its
mock.

```bash
cp .env.example .env.local
```

| Variable | Needed for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | SEO, PesaPal callbacks, email links | Your real domain in prod; `http://localhost:3000` locally |
| `NEXT_PUBLIC_SUPABASE_URL` | DB/Auth/Storage | from §1.4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client auth | from §1.4 |
| `SUPABASE_SERVICE_ROLE_KEY` | signed downloads, order writes | **server‑only** |
| `SUPABASE_PREMIUM_BUCKET` | originals bucket | default `premium-wallpapers` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | watermarked previews | without it, seed/Unsplash URLs are used as‑is |
| `PESAPAL_CONSUMER_KEY` / `PESAPAL_CONSUMER_SECRET` | real checkout | server‑only; blank → mock checkout |
| `PESAPAL_IPN_ID` | payment webhook | from the one‑time `registerIpn()` call (§2.1) |
| `PESAPAL_BASE_URL` | PesaPal API | `https://pay.pesapal.com/v3` (live) or the sandbox URL |
| `PESAPAL_CURRENCY` | order currency | default `KES` |
| `RESEND_API_KEY` | real receipt emails | blank → emails print to server console |
| `EMAIL_FROM` | sender | must be a **verified** Resend sender/domain |
| `CRON_SECRET` | protect `/api/cron/*` | blank → cron routes are open (fine in demo only) |

### 2.1 PesaPal — register the IPN once
After setting the consumer key/secret and `NEXT_PUBLIC_SITE_URL`, register your webhook
at `<SITE_URL>/api/pesapal/ipn` **once**. Easiest way: open **`/admin-dash/setup`** and
click **“Register IPN now”**. It returns an `ipn_id` — copy it into `PESAPAL_IPN_ID` and
redeploy. (Under the hood this calls `registerIpn()` in `src/lib/pesapal.ts`.)

### 2.2 Cloudinary
Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`. Upload your **preview** source images to
Cloudinary; the app derives watermarked/blurred/downscaled previews on the fly
(`src/lib/cloudinary.ts`). `next.config.ts` already allow‑lists `res.cloudinary.com`,
`images.unsplash.com`, `picsum.photos`, and `*.supabase.co`.

---

## Part 3 — Run it locally

```bash
pnpm install
pnpm dev          # http://localhost:3000  (Turbopack dev server)
```

Other scripts:
```bash
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # eslint
```

Smoke test after starting:
- `/` loads, featured day/week show.
- `/wallpapers` gallery + filters work.
- `/login` → sign in → `/admin-dash` is reachable for your admin account.

---

## Part 4 — Deploy (Vercel)

1. Import the repo into Vercel.
2. Add **every** env var from Part 2 in **Project → Settings → Environment Variables**
   (set `NEXT_PUBLIC_SITE_URL` to the production domain).
3. Deploy. `vercel.json` is picked up automatically and registers the two crons:
   - `wallpaper-of-day` → `3 0 * * *` (00:03 UTC daily)
   - `wallpaper-of-week` → `7 0 * * 1` (00:07 UTC Mondays)
   Vercel calls them with `Authorization: Bearer <CRON_SECRET>`, which
   `src/lib/cron-auth.ts` verifies.
4. After the first deploy on the real domain, do the PesaPal `registerIpn()` step
   (§2.1) against the production URL if you haven’t already.

---

## Part 5 — Daily operations

### 5.1 Add / publish a wallpaper
Originals live in the private bucket; previews come from Cloudinary. Two steps:

1. **Upload the original** to Storage bucket `premium-wallpapers` at the path
   `originals/<id>.jpg` (or `.mp4` for live wallpapers). The form defaults
   `originalStoragePath` to `originals/<generated-id>.<ext>` — keep that convention so
   the signed‑URL delivery (`src/lib/delivery.ts`) can find the file.
2. Go to **`/admin-dash/wallpapers/new`** and fill the form (`saveWallpaper` in
   `src/app/admin-dash/actions.ts`):
   - **Original image id** (`originalPublicId`) — required.
   - **Resolution** must be `WIDTHxHEIGHT` (e.g. `3840x2160`).
   - **Price (cents)** > 0 marks it premium automatically.
   - Age rating `18+` automatically flags it mature (server‑side age‑gated).
   - Optional: preview id, slug, tags (CSV), holiday tags, live/video + duration.

Edit or delete existing items at **`/admin-dash/wallpapers`** (and `…/wallpapers/[id]`).

### 5.2 Featured “of the day / week”
Page: **`/admin-dash/featured`**.
- **Let it run automatically** — the crons pick a wallpaper (holiday‑aware via
  Nager.Date, deterministic per‑day/week) unless an admin override is set.
- **Pin manually** — set a wallpaper for a slot and tick **admin override** to stop the
  cron from changing it. Untick to hand control back to automation.
- **Run now** — the “run automation” button triggers `refreshWallpaperOfDay/Week`
  immediately without waiting for the schedule.

Manual cron trigger (e.g. to test): 
```bash
curl "https://<domain>/api/cron/wallpaper-of-day?secret=<CRON_SECRET>"
```

### 5.3 Orders & fulfillment (mostly automatic)
- Customers cart → checkout → PesaPal. On payment, PesaPal hits
  `/api/pesapal/ipn`, which calls `fulfillByMerchantRef()` → marks the order paid,
  mints **60‑second signed download URLs**, and emails the receipt + links via Resend.
- Monitor at **`/admin-dash/orders`** (status `pending` / `paid` / `failed`).
- If a customer didn’t get links: confirm the order is `paid`, confirm Resend is
  configured and `EMAIL_FROM` is verified, and re‑trigger delivery as needed. In demo
  mode the email body (with links) is printed to the **server console**.

### 5.4 Routine health checks
- **Crons** — Vercel → Project → **Crons** tab shows last run + status. Expect a daily
  and a Monday run with HTTP 200.
- **Payments** — PesaPal dashboard transactions vs. `/admin-dash/orders`.
- **Email** — Resend dashboard delivery logs.
- **Storage** — every premium wallpaper must have its original at
  `originals/<id>.<ext>` in `premium-wallpapers`, or downloads will 404.

---

## Part 6 — Quick troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `/admin-dash` redirects to `/` | your `profiles.role` isn’t `'admin'` | run the promote SQL (§1.5), re‑login |
| Can’t reach `/admin-dash` at all (redirect to `/login`) | not signed in / session expired | log in again |
| Premium download 404 / signed‑URL error | original missing in bucket, or `SUPABASE_SERVICE_ROLE_KEY` unset | upload to `originals/<id>.<ext>`; set service‑role key |
| Checkout shows mock page in prod | PesaPal key/secret missing | set `PESAPAL_CONSUMER_KEY` + `_SECRET`, redeploy |
| Payment succeeds but no email/links | Resend unset or `EMAIL_FROM` unverified | set `RESEND_API_KEY`, verify sender domain |
| IPN not firing | IPN not registered / wrong `PESAPAL_IPN_ID` | re‑run `registerIpn()` (§2.1), update env |
| Cron 401/Unauthorized | `CRON_SECRET` mismatch | match Vercel env to the secret; Vercel sends it as a Bearer token |
| Previews unwatermarked / look raw | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` unset | set it; falls back to source URLs otherwise |
| Mature wallpapers hidden from you | your DOB makes you <18, or no DOB | set an 18+ DOB on your profile |

---

## Part 7 — Delivery & legal

### 7.1 How buyers get their files (no email required)
After a **confirmed** payment, downloads are shown **on the success page**
(`/checkout/callback`) — one button per item. Guests can buy and download with no
account; the link is authorized by the order id + PesaPal merchant reference (a
bearer capability), and each click mints a fresh 60-second signed URL via
`/api/download/receipt/[id]`. Signing up is **optional** and only lets buyers
**save** purchases to `/account` for unlimited re-downloads. Email receipts (Resend)
are now a nice-to-have, not required for delivery.

Buyers also get a **bookmarkable receipt page** at
`/orders/<id>?token=<merchantRef>` (linked from the success page). It re-verifies
payment on each visit and re-mints download links, so a guest can save the URL and
return later without an account.

### 7.2 Legal pages — fill in before launch
Pages live under `src/app/(legal)/`: `/terms`, `/privacy`, `/refund`, `/license`
(linked in the footer + sitemap). The copy is a **starting template** — edit the
placeholders in `src/lib/constants.ts` and **have it reviewed by a professional**:

- `LEGAL_ENTITY` — your registered business / trading name
- `SITE_CONTACT_EMAIL` — your real support address
- `LEGAL_JURISDICTION` — governing-law country (default `Kenya`)
- `LEGAL_LAST_UPDATED` — bump when you change any policy

---

## Reference — key files
- Env detection: `src/lib/env.ts`
- Auth / admin gate: `src/lib/auth.ts`, `src/app/admin-dash/layout.tsx`, `src/proxy.ts`
- Schema: `supabase/migrations/*.sql` (run in order)
- Admin actions (save/delete/featured/cron): `src/app/admin-dash/actions.ts`
- Featured automation: `src/lib/featured.ts`
- Crons: `src/app/api/cron/*`, `src/lib/cron-auth.ts`, `vercel.json`
- Payments: `src/lib/pesapal.ts`, `src/app/api/pesapal/ipn/route.ts`, `src/lib/orders.ts`
- Delivery (signed URLs): `src/lib/delivery.ts`
- Email: `src/lib/email.ts`
- Previews: `src/lib/cloudinary.ts`
