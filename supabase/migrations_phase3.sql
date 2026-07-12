-- Run this in Supabase → SQL Editor → New query → paste all → Run
-- (This is in addition to the earlier migrations.sql — don't re-run that one.)

create table products (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references auth.users on delete cascade not null,
  name text not null,
  price numeric not null,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Anyone can browse the marketplace, logged in or not.
create policy "Products are publicly readable"
  on products for select
  using (true);

-- Only the vendor who owns a product can create it.
create policy "Vendors can insert their own products"
  on products for insert
  with check (auth.uid() = vendor_id);

-- Only the vendor who owns a product can edit it.
create policy "Vendors can update their own products"
  on products for update
  using (auth.uid() = vendor_id);

-- Only the vendor who owns a product can delete it.
create policy "Vendors can delete their own products"
  on products for delete
  using (auth.uid() = vendor_id);
