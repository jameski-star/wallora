-- Live (looping video) wallpaper support. Additive + idempotent — safe to
-- re-run and safe on databases already initialised with 0001_init.sql.

-- ── Media kind enum ──────────────────────────────────────────────────────
do $$ begin
  create type wallpaper_kind as enum ('image','live');
exception when duplicate_object then null; end $$;

-- ── New columns on wallpapers ────────────────────────────────────────────
alter table wallpapers
  add column if not exists kind             wallpaper_kind not null default 'image',
  add column if not exists video_public_id  text,
  add column if not exists duration_sec     int;

-- Filtering "only live wallpapers" hits this often enough to index.
create index if not exists wallpapers_kind_idx on wallpapers (kind);
