-- Supabase SQL para crear la tabla de productos

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price numeric not null default 0,
  category text not null default 'General',
  image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on products(category);
create index if not exists products_featured_idx on products(featured);
