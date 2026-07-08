-- Add Pinterest autoposting columns to wallpapers table
alter table wallpapers add column if not exists pinterest_posted_at timestamptz;
alter table wallpapers add column if not exists pinterest_pin_id text;
