-- Supabase Auth + RLS policy setup for the showroom catalog.
-- /display stays public read-only. /admin writes require a signed-in Supabase Auth user.
-- Run this after creating at least one Supabase Auth email/password user.

grant usage on schema public to anon, authenticated;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

grant select on public.display_nodes to anon, authenticated;
grant insert, update, delete on public.display_nodes to authenticated;

grant select on public.showroom_settings to anon, authenticated;
grant insert, update, delete on public.showroom_settings to authenticated;

alter table public.products enable row level security;
alter table public.display_nodes enable row level security;
alter table public.showroom_settings enable row level security;

drop policy if exists "products_public_read" on public.products;
drop policy if exists "products_authenticated_insert" on public.products;
drop policy if exists "products_authenticated_update" on public.products;
drop policy if exists "products_authenticated_delete" on public.products;

create policy "products_public_read"
on public.products
for select
to anon, authenticated
using (true);

create policy "products_authenticated_insert"
on public.products
for insert
to authenticated
with check (true);

create policy "products_authenticated_update"
on public.products
for update
to authenticated
using (true)
with check (true);

create policy "products_authenticated_delete"
on public.products
for delete
to authenticated
using (true);

drop policy if exists "display_nodes_public_read" on public.display_nodes;
drop policy if exists "display_nodes_authenticated_insert" on public.display_nodes;
drop policy if exists "display_nodes_authenticated_update" on public.display_nodes;
drop policy if exists "display_nodes_authenticated_delete" on public.display_nodes;

create policy "display_nodes_public_read"
on public.display_nodes
for select
to anon, authenticated
using (true);

create policy "display_nodes_authenticated_insert"
on public.display_nodes
for insert
to authenticated
with check (true);

create policy "display_nodes_authenticated_update"
on public.display_nodes
for update
to authenticated
using (true)
with check (true);

create policy "display_nodes_authenticated_delete"
on public.display_nodes
for delete
to authenticated
using (true);

drop policy if exists "showroom_settings_public_read" on public.showroom_settings;
drop policy if exists "showroom_settings_authenticated_insert" on public.showroom_settings;
drop policy if exists "showroom_settings_authenticated_update" on public.showroom_settings;
drop policy if exists "showroom_settings_authenticated_delete" on public.showroom_settings;

create policy "showroom_settings_public_read"
on public.showroom_settings
for select
to anon, authenticated
using (true);

create policy "showroom_settings_authenticated_insert"
on public.showroom_settings
for insert
to authenticated
with check (true);

create policy "showroom_settings_authenticated_update"
on public.showroom_settings
for update
to authenticated
using (true)
with check (true);

create policy "showroom_settings_authenticated_delete"
on public.showroom_settings
for delete
to authenticated
using (true);

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
