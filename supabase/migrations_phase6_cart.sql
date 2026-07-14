-- Run this in Supabase → SQL Editor → New query → paste all → Run

create table cart_items (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity integer not null default 1,
  selected_variants jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table cart_items enable row level security;

create policy "Buyers can view their own cart"
  on cart_items for select
  using (auth.uid() = buyer_id);

create policy "Buyers can add to their own cart"
  on cart_items for insert
  with check (auth.uid() = buyer_id);

create policy "Buyers can update their own cart items"
  on cart_items for update
  using (auth.uid() = buyer_id);

create policy "Buyers can remove their own cart items"
  on cart_items for delete
  using (auth.uid() = buyer_id);
