-- Create product_catalog table to store bread categories
create table if not exists public.product_catalog (
  id uuid primary key default gen_random_uuid(),
  revision integer not null,
  catalog_data jsonb not null,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create sequence for revision numbers
create sequence if not exists product_catalog_revision_seq start with 1;

-- Enable Row Level Security
alter table public.product_catalog enable row level security;

-- Allow anyone to read the active catalog (for customers)
create policy "catalog_select_active"
  on public.product_catalog for select
  using (is_active = true);

-- Only admins can insert/update/delete catalogs
-- We'll check admin role in the application layer
create policy "catalog_insert_admin"
  on public.product_catalog for insert
  with check (true);

create policy "catalog_update_admin"
  on public.product_catalog for update
  using (true);

create policy "catalog_delete_admin"
  on public.product_catalog for delete
  using (true);

-- Create index for faster queries
create index if not exists product_catalog_active_idx on public.product_catalog(is_active, updated_at desc);
create index if not exists product_catalog_revision_idx on public.product_catalog(revision desc);

-- Insert default catalog data from the current BREAD_CATEGORIES
insert into public.product_catalog (revision, catalog_data, is_active)
values (
  1,
  '[
    {
      "title": "לחם חיטה מלאה",
      "price": 24,
      "breads": [
        { "id": 1, "name": "בציפוי צ''יה" },
        { "id": 2, "name": "בציפוי שומשום" },
        { "id": 3, "name": "עם עגבניות מיובשות" },
        { "id": 4, "name": "עם זיתים" }
      ]
    },
    {
      "title": "לחם זרעים",
      "price": 28,
      "breads": [
        { "id": 5, "name": "עם שומשום" },
        { "id": 6, "name": "עם גרעיני דלעת" },
        { "id": 7, "name": "עם צ''יה" },
        { "id": 8, "name": "עם פשתן" },
        { "id": 9, "name": "עם פרג" }
      ]
    },
    {
      "title": "לחם כוסמין",
      "price": 28,
      "breads": [
        { "id": 10, "name": "בציפוי שומשום" },
        { "id": 11, "name": "בציפוי צ''יה" },
        { "id": 12, "name": "עם פרג ואגוזים" }
      ]
    },
    {
      "title": "לחם ארבעה קמחים",
      "price": 28,
      "breads": [
        { "id": 13, "name": "בציפוי שומשום" },
        { "id": 14, "name": "בציפוי זרעים" }
      ]
    }
  ]'::jsonb,
  true
);
