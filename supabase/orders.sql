-- Orders: written only by the website's server (Cloudflare) with the secret key.
-- Staff can read them and change the status and an internal note. Shoppers can't see or touch them.
create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  channel text not null check (channel in ('paystack','whatsapp')),
  status text not null default 'new' check (status in ('new','awaiting_payment','paid','confirmed','dispatched','delivered','cancelled')),
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  total integer not null default 0 check (total >= 0),
  paid_amount integer,
  paid_at timestamptz,
  paystack_ref text,
  note text,
  updated_by text
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create or replace function private.stamp_order() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.jwt() ->> 'email', new.updated_by, 'website');
  if new.status = 'paid' and new.paid_at is null then new.paid_at := now(); end if;
  return new;
end $$;
revoke all on function private.stamp_order() from public, anon, authenticated;
drop trigger if exists stamp_order on public.orders;
create trigger stamp_order before update on public.orders for each row execute function private.stamp_order();

alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
grant update (status, note) on public.orders to authenticated;
grant all on public.orders to service_role;

drop policy if exists "staff see orders" on public.orders;
create policy "staff see orders" on public.orders for select to authenticated using ((select private.is_staff()));
drop policy if exists "staff update orders" on public.orders;
create policy "staff update orders" on public.orders for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
