-- Shop settings the owner changes from the dashboard (first: the site's look).
-- Anyone can read the public ones (the website needs them); only owners can change them.
create table if not exists public.settings (
  key text primary key check (key ~ '^[a-z_]{2,40}$'),
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by text
);
create or replace function private.stamp_setting() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.jwt() ->> 'email', new.updated_by);
  return new;
end $$;
revoke all on function private.stamp_setting() from public, anon, authenticated;
drop trigger if exists stamp_setting on public.settings;
create trigger stamp_setting before insert or update on public.settings for each row execute function private.stamp_setting();

alter table public.settings enable row level security;
revoke all on public.settings from anon, authenticated;
grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;
grant all on public.settings to service_role;

drop policy if exists "read public settings" on public.settings;
create policy "read public settings" on public.settings for select to anon, authenticated using (is_public or (select private.is_staff()));
drop policy if exists "owners add settings" on public.settings;
create policy "owners add settings" on public.settings for insert to authenticated with check ((select private.is_owner()));
drop policy if exists "owners change settings" on public.settings;
create policy "owners change settings" on public.settings for update to authenticated using ((select private.is_owner())) with check ((select private.is_owner()));

insert into public.settings (key, value) values ('look', '{"id":"midnight","prev":"midnight"}') on conflict (key) do nothing;
