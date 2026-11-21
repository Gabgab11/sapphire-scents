-- Sapphire Scents: products, staff and change history for the admin dashboard.
-- Run once on the Sapphire Scents Supabase project.

create schema if not exists private;

-- ---------- tables ----------
create table if not exists public.products (
  id          text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  type        text not null check (type in ('perfume','refill','diffuser')),
  name        text not null check (char_length(name) between 1 and 80),
  price       integer not null check (price >= 0 and price <= 100000000),
  in_stock    boolean not null default true,
  visible     boolean not null default true,
  sort        integer not null default 0,
  data        jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at  timestamptz not null default now(),
  updated_by  text
);
create index if not exists products_type_sort_idx on public.products (type, sort);

create table if not exists public.staff (
  email     text primary key check (email = lower(email) and email like '%@%'),
  name      text,
  role      text not null default 'editor' check (role in ('owner','editor')),
  added_at  timestamptz not null default now()
);

create table if not exists public.product_changes (
  id          bigint generated always as identity primary key,
  product_id  text not null,
  action      text not null check (action in ('added','edited','deleted')),
  changed_by  text,
  changed_at  timestamptz not null default now(),
  before      jsonb,
  after       jsonb
);
create index if not exists product_changes_at_idx on public.product_changes (changed_at desc);
create index if not exists product_changes_product_idx on public.product_changes (product_id, changed_at desc);

-- ---------- who is staff (signed in, email confirmed, on the staff list) ----------
create or replace function private.staff_role() returns text
language sql stable security definer set search_path = ''
as $$
  select s.role
  from public.staff s
  join auth.users u on lower(u.email) = s.email
  where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  limit 1
$$;
create or replace function private.is_staff() returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.staff_role() is not null $$;
create or replace function private.is_owner() returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.staff_role() = 'owner' $$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke all on all functions in schema private from public, anon;
grant execute on function private.staff_role(), private.is_staff(), private.is_owner() to authenticated;

-- ---------- stamps and history ----------
create or replace function private.stamp_product() returns trigger
language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(lower(auth.jwt() ->> 'email'), new.updated_by, 'system');
  return new;
end $$;

create or replace function private.log_product_change() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare who text := coalesce(lower(auth.jwt() ->> 'email'), 'system');
begin
  if tg_op = 'INSERT' then
    insert into public.product_changes (product_id, action, changed_by, after) values (new.id, 'added', who, to_jsonb(new));
  elsif tg_op = 'UPDATE' then
    if to_jsonb(old) - 'updated_at' - 'updated_by' is distinct from to_jsonb(new) - 'updated_at' - 'updated_by' then
      insert into public.product_changes (product_id, action, changed_by, before, after) values (new.id, 'edited', who, to_jsonb(old), to_jsonb(new));
    end if;
  else
    insert into public.product_changes (product_id, action, changed_by, before) values (old.id, 'deleted', who, to_jsonb(old));
  end if;
  return null;
end $$;
revoke all on function private.stamp_product(), private.log_product_change() from public, anon, authenticated;

drop trigger if exists products_stamp on public.products;
create trigger products_stamp before insert or update on public.products
  for each row execute function private.stamp_product();
drop trigger if exists products_log on public.products;
create trigger products_log after insert or update or delete on public.products
  for each row execute function private.log_product_change();

-- ---------- access ----------
alter table public.products enable row level security;
alter table public.staff enable row level security;
alter table public.product_changes enable row level security;

revoke all on public.products, public.staff, public.product_changes from anon, authenticated;
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.staff to authenticated;
grant select on public.product_changes to authenticated;

drop policy if exists "shoppers see live products" on public.products;
create policy "shoppers see live products" on public.products for select to anon
  using (visible);
drop policy if exists "staff see all products" on public.products;
create policy "staff see all products" on public.products for select to authenticated
  using (visible or (select private.is_staff()));
drop policy if exists "staff add products" on public.products;
create policy "staff add products" on public.products for insert to authenticated
  with check ((select private.is_staff()));
drop policy if exists "staff edit products" on public.products;
create policy "staff edit products" on public.products for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
drop policy if exists "staff delete products" on public.products;
create policy "staff delete products" on public.products for delete to authenticated
  using ((select private.is_staff()));

drop policy if exists "staff see the team" on public.staff;
create policy "staff see the team" on public.staff for select to authenticated
  using ((select private.is_staff()));
drop policy if exists "owners add staff" on public.staff;
create policy "owners add staff" on public.staff for insert to authenticated
  with check ((select private.is_owner()));
drop policy if exists "owners edit staff" on public.staff;
create policy "owners edit staff" on public.staff for update to authenticated
  using ((select private.is_owner())) with check ((select private.is_owner()));
drop policy if exists "owners remove staff" on public.staff;
create policy "owners remove staff" on public.staff for delete to authenticated
  using ((select private.is_owner()));

drop policy if exists "staff see history" on public.product_changes;
create policy "staff see history" on public.product_changes for select to authenticated
  using ((select private.is_staff()));

-- ---------- product photos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "staff list product photos" on storage.objects;
create policy "staff list product photos" on storage.objects for select to authenticated
  using (bucket_id = 'products' and (select private.is_staff()));
drop policy if exists "staff upload product photos" on storage.objects;
create policy "staff upload product photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and (select private.is_staff()));
drop policy if exists "staff replace product photos" on storage.objects;
create policy "staff replace product photos" on storage.objects for update to authenticated
  using (bucket_id = 'products' and (select private.is_staff()))
  with check (bucket_id = 'products' and (select private.is_staff()));
drop policy if exists "staff delete product photos" on storage.objects;
create policy "staff delete product photos" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and (select private.is_staff()));

-- ---------- there must always be at least one owner ----------
create or replace function private.keep_an_owner() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.role = 'owner' and (tg_op = 'DELETE' or new.role <> 'owner' or new.email <> old.email) then
    if not exists (select 1 from public.staff where role = 'owner' and email <> old.email) then
      raise exception 'There must always be at least one owner. Make someone else an owner first.';
    end if;
  end if;
  return coalesce(new, old);
end $$;
revoke all on function private.keep_an_owner() from public, anon, authenticated;
drop trigger if exists staff_keep_owner on public.staff;
create trigger staff_keep_owner before update or delete on public.staff
  for each row execute function private.keep_an_owner();
