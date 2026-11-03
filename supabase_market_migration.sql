-- Kelnix Market: product catalogue, orders and secure digital delivery
-- Run once in the Supabase SQL Editor for the Market project.
create extension if not exists pgcrypto;

create table if not exists public.market_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  category text not null default 'Digital',
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'MWK' check (currency in ('MWK','USD')),
  cover_image_url text,
  storage_path text,
  file_name text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_orders (
  id uuid primary key default gen_random_uuid(),
  tx_ref text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  currency text not null check (currency in ('MWK','USD')),
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
  paychangu_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.market_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.market_orders(id) on delete cascade,
  product_id uuid not null references public.market_products(id),
  product_title text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null default 1 check (quantity > 0)
);

create index if not exists market_products_published_idx on public.market_products(is_published);
create index if not exists market_orders_tx_ref_idx on public.market_orders(tx_ref);
create index if not exists market_orders_email_idx on public.market_orders(customer_email);

alter table public.market_products enable row level security;
alter table public.market_orders enable row level security;
alter table public.market_order_items enable row level security;

drop policy if exists "Public can view published market products" on public.market_products;
create policy "Public can view published market products"
on public.market_products for select using (is_published = true);

-- Orders and order items are intentionally inaccessible to anonymous clients.
-- All writes, payment verification and download authorization must use a server-side
-- Supabase service-role client. Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('market-digital-products', 'market-digital-products', false, 52428800,
  array['application/pdf','application/zip','application/epub+zip'])
on conflict (id) do update set public = false, file_size_limit = 52428800;
