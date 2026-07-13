-- Run this in Supabase → SQL Editor → New query → paste all → Run

create table messages (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references profiles(id) on delete cascade not null,
  vendor_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

-- Only the buyer and vendor involved in a message can see it —
-- this is the "regulated" part: nobody else (not even other vendors)
-- can read someone else's conversation.
create policy "Buyers and vendors can read their own messages"
  on messages for select
  using (auth.uid() = buyer_id or auth.uid() = vendor_id);

-- Only logged-in buyers can send a message, and only as themselves.
create policy "Buyers can send messages"
  on messages for insert
  with check (auth.uid() = buyer_id);
