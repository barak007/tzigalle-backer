-- Create orders table for Tzigla bakery
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_city text not null,
  delivery_date text not null,
  items jsonb not null,
  total_price integer not null,
  status text not null default 'pending',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Create policy to allow anyone to insert orders (for customer orders)
create policy "orders_insert_public"
  on public.orders for insert
  with check (true);

-- Create policy to allow anyone to select orders (for admin dashboard)
-- In production, you might want to restrict this to authenticated admin users
create policy "orders_select_all"
  on public.orders for select
  using (true);

-- Create policy to allow anyone to update orders (for admin status updates)
-- In production, you might want to restrict this to authenticated admin users
create policy "orders_update_all"
  on public.orders for update
  using (true);

-- Create index for faster queries
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
