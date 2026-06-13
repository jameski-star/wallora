-- Fix "Database error saving new user" on signup.
--
-- The signup trigger inserts a row into public.profiles. If it raises, Supabase
-- rolls back the whole auth.users insert and returns that generic error. This
-- hardens it so it cannot abort signup:
--   • security definer + search_path  → bypasses RLS (the auth admin role isn't
--     covered by a profiles INSERT policy, which is the most common cause);
--   • nullif(...,'')::date            → tolerates blank/missing date_of_birth;
--   • exception guard                 → never blocks signup if the insert hiccups.
-- Idempotent and safe to re-run.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, date_of_birth)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    nullif(new.raw_user_meta_data->>'date_of_birth', '')::date
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
