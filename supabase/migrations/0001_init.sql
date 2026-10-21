-- Part 1 Migration: Storefront Foundation
-- Extensions
create extension if not exists "pgcrypto";

-- Collections
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  image_url text not null,
  sort_order int not null default 0
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  collection_id uuid not null references public.collections(id) on delete cascade,
  price_pkr numeric not null check (price_pkr >= 0),
  compare_at_price_pkr numeric check (compare_at_price_pkr is null or compare_at_price_pkr >= 0),
  description text not null,
  details jsonb not null default '{}'::jsonb,
  sizes text[] not null default '{}',
  images text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

-- Currency Rates
create table if not exists public.currency_rates (
  code text primary key,
  rate_from_pkr numeric not null check (rate_from_pkr > 0),
  symbol text not null,
  updated_at timestamptz not null default now()
);

-- Testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  text text not null,
  rating int not null check (rating between 1 and 5),
  is_active boolean not null default true
);

-- Site Settings
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Hero Slides
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  desktop_image_url text not null,
  mobile_image_url text,
  heading text not null,
  subheading text,
  cta_text text not null,
  cta_link text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- Navigation Items
create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  location text not null check (location in ('header', 'footer')),
  label text not null,
  href text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- Pages
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  content text not null,
  meta_title text,
  meta_description text,
  updated_at timestamptz not null default now()
);

-- Enable RLS on all Part 1 tables
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.currency_rates enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;
alter table public.hero_slides enable row level security;
alter table public.navigation_items enable row level security;
alter table public.pages enable row level security;

-- RLS Policies: Public SELECT only for active/published rows, no public writes
create policy "Allow public read for collections"
  on public.collections for select
  using (true);

create policy "Allow public read for active products"
  on public.products for select
  using (is_active = true);

create policy "Allow public read for currency rates"
  on public.currency_rates for select
  using (true);

create policy "Allow public read for active testimonials"
  on public.testimonials for select
  using (is_active = true);

create policy "Allow public read for site settings"
  on public.site_settings for select
  using (true);

create policy "Allow public read for active hero slides"
  on public.hero_slides for select
  using (is_active = true);

create policy "Allow public read for active navigation items"
  on public.navigation_items for select
  using (is_active = true);

create policy "Allow public read for pages"
  on public.pages for select
  using (true);

-- Storage bucket for product images (public read)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Allow public read for product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');
