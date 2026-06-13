-- Run this in Supabase SQL Editor if admin buttons load but product/node edits do not persist.
-- The app uses its own local password gate and writes through the Supabase anon key.
-- For a public deployment, replace this with Supabase Auth-backed policies instead.

alter table public.products disable row level security;
alter table public.showroom_settings disable row level security;
alter table public.display_nodes disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.products to anon, authenticated;
grant select, insert, update, delete on public.showroom_settings to anon, authenticated;
grant select, insert, update, delete on public.display_nodes to anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.products;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.showroom_settings;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.display_nodes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
