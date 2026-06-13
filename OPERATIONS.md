# Aurava — Operations & Setup Guide

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Database Setup & Admin User](#3-database-setup--admin-user)
4. [Seeding Categories (Fix FK Error)](#4-seeding-categories-fix-fk-error)
5. [Daily Operations](#5-daily-operations)
6. [Deployment](#6-deployment)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

- **Node.js** >= 18
- **pnpm** (package manager used by this project)
- **Supabase** project (free tier works) — provides auth, Postgres, and storage
- **Cloudinary** account (optional, for production image hosting)
- **PesaPal** account (optional, for paid wallpaper checkout — Kenya/East Africa payments)

---

## 2. Environment Setup

### 2.1 Clone & Install

```bash
git clone <your-repo-url>
cd aurava
pnpm install
```

### 2.2 Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Key variables to set:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key (server-side only, never expose to client) |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for image delivery |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `PESAPAL_CONSUMER_KEY` | No | PesaPal sandbox/live consumer key |
| `PESAPAL_CONSUMER_SECRET` | No | PesaPal sandbox/live consumer secret |
| `PESAPAL_IPN_ID` | No | Set after registering IPN from admin dashboard |
| `PESAPAL_BASE_URL` | No | `https://cybqa.pesapal.com/pesapalv3/api` (sandbox) or live URL |
| `CRON_SECRET` | No | A secret token to protect cron API routes |
| `DEMO_MODE` | No | Set to `true` to run without Supabase (uses in-memory mock data) |

### 2.3 Run the Migration

Open your Supabase project's **SQL Editor** and run the contents of:

```
supabase/migrations/0001_init.sql
```

This creates all tables: `categories`, `profiles`, `wallpapers`, `featured`, `orders`, plus RLS policies and the `is_admin()` helper function.

### 2.4 Start Dev Server

```bash
pnpm dev
```

The app runs at `http://localhost:3000`.

---

## 3. Database Setup & Admin User

### 3.1 Create Your User Account

1. Navigate to `http://localhost:3000/signup`
2. Register with your email and password
3. This creates a row in `auth.users` and auto-creates a `profiles` row (via the trigger in the migration)

### 3.2 Promote Yourself to Admin

The `profiles` table defaults new users to `role = 'user'`. You must manually promote yourself to admin:

1. Go to your **Supabase Dashboard** -> **Table Editor**
2. Open the `profiles` table
3. Find your row (by email)
4. Change the `role` column from `user` to `admin`
5. Save

Alternatively, run this SQL in the Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3.3 Verify Admin Access

1. Log in at `http://localhost:3000/login`
2. Navigate to `http://localhost:3000/admin-dash`
3. You should see the admin dashboard (wallpapers, orders, featured sections)

If you get redirected away, your profile role is not `admin` — double-check step 3.2.

---

## 4. Seeding Categories (Fix FK Error)

### The Problem

When you try to create a wallpaper, you get this error:

```
insert or update on table "wallpapers" violates foreign key constraint
"wallpapers_category_slug_fkey"
Key (category_slug)=(nature) is not present in table "categories".
```

**Root cause:** The `wallpapers` table has a foreign key to `categories(slug)`. The category dropdown in the form shows categories from `src/lib/constants.ts` (nature, cars, sports, etc.), but **these categories don't exist in your database yet**. The database `categories` table is empty after migration.

### The Fix

You have two options:

#### Option A: Use the Seed Catalog Action (Recommended)

1. Go to `http://localhost:3000/admin-dash`
2. Click the **"Seed Catalog"** button
3. This inserts all 8 categories + 27 sample wallpapers + 2 featured slots into Supabase
4. Categories are inserted **first** (before wallpapers), so the FK constraint is satisfied

#### Option B: Insert Categories Manually via SQL

Run this in the Supabase SQL Editor:

```sql
INSERT INTO categories (id, slug, name, description) VALUES
  ('cat_nature',      'nature',      'Nature',      'Landscapes, forests, oceans and skies in breathtaking detail.'),
  ('cat_cars',        'cars',        'Cars',        'Supercars, classics and concept machines.'),
  ('cat_sports',      'sports',      'Sports',      'Action, athletes and iconic moments.'),
  ('cat_space',       'space',       'Space',       'Galaxies, nebulae and the cosmos.'),
  ('cat_gaming',      'gaming',      'Gaming',      'Worlds, characters and key art from games.'),
  ('cat_anime',       'anime',       'Anime',       'Hand-picked anime and illustration art.'),
  ('cat_technology',  'technology',  'Technology',  'Abstract tech, circuits and futurism.'),
  ('cat_abstract',    'abstract',    'Abstract',    'Shapes, gradients and generative art.')
ON CONFLICT (id) DO NOTHING;
```

After either option, creating wallpapers will work because `category_slug` values like `nature` now exist in the `categories` table.

---

## 5. Daily Operations

### 5.1 Adding a Wallpaper

1. Go to `/admin-dash/wallpapers/new`
2. Fill in the form:
   - **Title** (required)
   - **Original image** — a Cloudinary public ID or direct image URL (required)
   - **Category** — must be one of the seeded categories
   - **Device** — desktop / phone / tablet
   - **Resolution** — format `WIDTHxHEIGHT` (e.g. `3840x2160`)
   - **Tags** — comma-separated
   - **Price** — `0` for free; any positive value auto-marks as premium
3. Click **Create wallpaper**

### 5.2 Managing Featured Wallpapers

- Go to `/admin-dash/featured`
- **Wallpaper of the Day / Week** can be set manually with admin override
- Or trigger the automated selection via the "Run Automation" buttons
- Cron endpoints exist at `/api/cron/wallpaper-of-day` and `/api/cron/wallpaper-of-week` (protect with `CRON_SECRET` header)

### 5.3 Orders

- View all orders at `/admin-dash/orders`
- Paid downloads are delivered via `/api/download/order/[id]`
- Free downloads via `/api/download/free/[id]`

### 5.4 PesaPal Payment Setup (Optional)

1. Set `PESAPAL_CONSUMER_KEY` and `PESAPAL_CONSUMER_SECRET` in `.env.local`
2. Restart the dev server
3. Go to `/admin-dash` and click **"Register IPN"**
4. Copy the returned `ipn_id` and add it to `.env.local` as `PESAPAL_IPN_ID`
5. Restart the server again
6. PesaPal will now send payment notifications to `/api/pesapal/ipn`

---

## 6. Deployment

### 6.1 Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Log in and deploy
vercel
```

On first deploy, link to your Vercel project. Then set all environment variables in the Vercel dashboard:

**Vercel Dashboard -> Settings -> Environment Variables**

Add every variable from `.env.local` (all variables listed in [section 2.2](#22-environment-variables)).

#### vercel.json

The project already includes `vercel.json` for configuration. Review it before deploying.

### 6.2 Cron Jobs on Vercel

The project uses Vercel cron jobs (configured in `vercel.json`). Make sure:

1. `CRON_SECRET` is set in Vercel env vars
2. The cron schedule in `vercel.json` matches your needs
3. Vercel will automatically call `/api/cron/wallpaper-of-day` and `/api/cron/wallpaper-of-week`

### 6.3 Deploy to Other Platforms

For any Node.js host (Railway, Render, Fly.io, etc.):

```bash
pnpm build
pnpm start
```

Set all environment variables in your platform's dashboard.

### 6.4 Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Migration `0001_init.sql` has been run in Supabase
- [ ] Admin user promoted to `role = 'admin'`
- [ ] Categories seeded (Seed Catalog button or manual SQL)
- [ ] PesaPal IPN registered (if using payments)
- [ ] Cron jobs configured (if using featured automation)
- [ ] Supabase Storage bucket created (if serving premium originals from Supabase)

---

## 7. Troubleshooting

### FK constraint error on wallpaper create

**Error:** `violates foreign key constraint "wallpapers_category_slug_fkey"`

**Fix:** Seed categories first. See [Section 4](#4-seeding-categories-fix-fk-error).

### Admin dashboard redirects to home

**Cause:** Your profile role is not `admin`.

**Fix:** Update your role in Supabase:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Seed Catalog fails with Supabase error

**Cause:** `SUPABASE_SERVICE_ROLE_KEY` is not set.

**Fix:** Add it to `.env.local` and restart the server.

### Images not loading

- **Demo mode** (`DEMO_MODE=true`): Uses Unsplash URLs directly — no Cloudinary needed
- **Production**: Set `CLOUDINARY_CLOUD_NAME` and upload images to your Cloudinary account
- **Premium downloads**: Upload original files to the Supabase Storage bucket (`premium-wallpapers` or as configured)

### PesaPal payment not working

1. Verify `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, and `PESAPAL_IPN_ID` are all set
2. Check `PESAPAL_BASE_URL` matches your environment (sandbox vs live)
3. Ensure `/api/pesapal/ipn` is reachable from PesaPal's servers (deploy to a public URL first)
