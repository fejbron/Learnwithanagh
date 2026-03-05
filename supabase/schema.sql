-- =============================================
-- ToyBox Finance — Supabase Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- Products table
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category in ('Toys', 'Books', 'Other')),
  price       numeric(10,2) not null default 0,
  cost        numeric(10,2) not null default 0,
  stock       integer not null default 0,
  emoji       text not null default '📦',
  created_at  timestamptz not null default now()
);

-- Sales table
create table if not exists sales (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,
  product_name text not null,
  category     text not null check (category in ('Toys', 'Books', 'Other')),
  qty          integer not null default 1,
  unit_price   numeric(10,2) not null,
  total        numeric(10,2) not null,
  status       text not null default 'Completed' check (status in ('Completed', 'Pending', 'Refunded')),
  created_at   timestamptz not null default now()
);

-- Expenses table
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  description text not null,
  category    text not null,
  amount      numeric(10,2) not null,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security (RLS) — allows public read/write for now
-- You can tighten this with auth later
alter table products enable row level security;
alter table sales     enable row level security;
alter table expenses  enable row level security;

create policy "Allow all on products" on products for all using (true) with check (true);
create policy "Allow all on sales"    on sales    for all using (true) with check (true);
create policy "Allow all on expenses" on expenses for all using (true) with check (true);
