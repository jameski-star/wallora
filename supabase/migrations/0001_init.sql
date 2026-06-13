-- Wallora schema — run in the Supabase SQL editor (or via the CLI).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────
do $$ begin
  create type device_type as enum ('desktop','phone','tablet');
exception when duplicate_object then null; end $$;

do $$ begin
  create type age_rating as enum ('everyone','13+','16+','18+');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','paid','failed','cancelled');
exception when duplicate_object then null; end $$;

-- ── Categories ─────────────────────────────────────────────────────────────
create table if not exists categories (
  id          text primary key,
  slug        text unique not null,
  name        text not null,
  description text not null default ''
);

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text not null default '',
  date_of_birth date,
  role          text not null default 'user' check (role in ('user','admin')),
  created_at    timestamptz not null default now()
);

-- ── Wallpapers ──────────────────────────────────────────────────────────────
create table if not exists wallpapers (
  id                    text primary key,
  slug                  text unique not null,
  title                 text not null,
  description           text not null default '',
  original_public_id    text not null,
  original_storage_path text not null,
  preview_public_id     text not null,
  category_slug         text not null references categories(slug),
  tags                  text[] not null default '{}',
  device                device_type not null,
  resolution            text not null,
  width                 int not null,
  height                int not null,
  age_rating            age_rating not null default 'everyone',
  is_mature             boolean not null default false,
  price_cents           int not null default 0,
  is_premium            boolean not null default false,
  seo_title             text not null default '',
  seo_description       text not null default '',
  is_featured           boolean not null default false,
  holiday_tags          text[] not null default '{none}',
  downloads             int not null default 0,
  created_at            timestamptz not null default now()
);

create index if not exists wallpapers_category_idx on wallpapers (category_slug);
create index if not exists wallpapers_device_idx   on wallpapers (device);
create index if not exists wallpapers_tags_idx      on wallpapers using gin (tags);
create index if not exists wallpapers_mature_idx    on wallpapers (is_mature);

-- ── Featured (wallpaper of day/week) ────────────────────────────────────────
create table if not exists featured (
  slot           text primary key check (slot in ('day','week')),
  wallpaper_id   text not null references wallpapers(id),
  title          text not null,
  caption        text not null,
  description    text not null default '',
  display_date   timestamptz not null default now(),
  holiday_type   text not null default 'none',
  admin_override boolean not null default false
);

-- ── Orders ──────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                   text primary key,
  user_id              uuid references auth.users(id) on delete set null,
  email                text not null,
  items                jsonb not null default '[]',
  total_cents          int not null,
  currency             text not null default 'USD',
  status               order_status not null default 'pending',
  pesapal_tracking_id  text,
  pesapal_merchant_ref text not null,
  created_at           timestamptz not null default now(),
  paid_at              timestamptz
);
create index if not exists orders_user_idx on orders (user_id);
create unique index if not exists orders_merchant_ref_idx on orders (pesapal_merchant_ref);

-- ── Download counter RPC ─────────────────────────────────────────────────────
create or replace function increment_downloads(wp_id text)
returns void language sql as $$
  update wallpapers set downloads = downloads + 1 where id = wp_id;
$$;

-- ── Auto-create a profile on signup ──────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, date_of_birth)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    (new.raw_user_meta_data->>'date_of_birth')::date
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table categories enable row level security;
alter table wallpapers enable row level security;
alter table featured   enable row level security;
alter table profiles   enable row level security;
alter table orders     enable row level security;

-- helper: is the current user an admin?
create or replace function is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Catalog is publicly readable. Mature content is filtered in the app layer
-- (server queries pass is_mature=false for guests/underage). For defense in
-- depth you may additionally restrict mature rows here.
drop policy if exists "categories read" on categories;
create policy "categories read" on categories for select using (true);

drop policy if exists "wallpapers read" on wallpapers;
create policy "wallpapers read" on wallpapers for select using (true);

drop policy if exists "featured read" on featured;
create policy "featured read" on featured for select using (true);

drop policy if exists "wallpapers admin write" on wallpapers;
create policy "wallpapers admin write" on wallpapers for all
  using (is_admin()) with check (is_admin());

drop policy if exists "featured admin write" on featured;
create policy "featured admin write" on featured for all
  using (is_admin()) with check (is_admin());

drop policy if exists "categories admin write" on categories;
create policy "categories admin write" on categories for all
  using (is_admin()) with check (is_admin());

-- Profiles: a user sees/edits only their own row; admins see all.
drop policy if exists "profiles self read" on profiles;
create policy "profiles self read" on profiles for select
  using (auth.uid() = id or is_admin());

drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles for update
  using (auth.uid() = id);

-- Orders: a user sees only their own; writes happen via service role.
drop policy if exists "orders self read" on orders;
create policy "orders self read" on orders for select
  using (auth.uid() = user_id or is_admin());
