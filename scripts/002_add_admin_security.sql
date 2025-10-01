-- Add admin security to the application

-- Create a profiles table to store user roles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'customer',
  created_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Allow users to read their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Allow admins to read all profiles
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Drop existing policies on orders table
drop policy if exists "orders_select_all" on public.orders;
drop policy if exists "orders_update_all" on public.orders;

-- Keep the insert policy for public (customers can create orders)
-- create policy "orders_insert_public" already exists

-- Create new policy to allow only admins to select orders
create policy "orders_select_admin"
  on public.orders for select
  using (public.is_admin());

-- Create new policy to allow only admins to update orders
create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin());

-- Create new policy to allow only admins to delete orders
create policy "orders_delete_admin"
  on public.orders for delete
  using (public.is_admin());

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert your admin user (replace with your email)
-- You'll need to sign up first with this email, then run this:
-- insert into public.profiles (id, email, role)
-- values (
--   (select id from auth.users where email = 'your-admin-email@example.com'),
--   'your-admin-email@example.com',
--   'admin'
-- )
-- on conflict (id) do update set role = 'admin';
