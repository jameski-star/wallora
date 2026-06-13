-- Wallora blog — adds the `posts` table. Safe to re-run.
-- Run after 0001_init.sql (depends on the is_admin() helper and pgcrypto).

create table if not exists posts (
  id              text primary key,
  slug            text unique not null,
  title           text not null,
  excerpt         text not null default '',
  body            text not null default '',
  cover_image     text not null default '',
  author          text not null default 'Wallora',
  tags            text[] not null default '{}',
  published       boolean not null default false,
  seo_title       text not null default '',
  seo_description text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists posts_published_idx on posts (published, created_at desc);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table posts enable row level security;

-- Published posts are publicly readable; admins can read drafts too.
drop policy if exists "posts public read" on posts;
create policy "posts public read" on posts for select
  using (published = true or is_admin());

-- Only admins write (the app also writes via the service role, which bypasses RLS).
drop policy if exists "posts admin write" on posts;
create policy "posts admin write" on posts for all
  using (is_admin()) with check (is_admin());
