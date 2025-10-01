-- Add archived field to orders table
alter table public.orders add column if not exists archived boolean not null default false;

-- Create index for archived field
create index if not exists orders_archived_idx on public.orders(archived);

-- Update any existing orders with status 'archived' to use the new field
update public.orders set archived = true where status = 'archived';

-- Optionally reset the status of archived orders to their previous state
-- (This can't be done automatically, so archived orders will keep 'archived' status for now)
