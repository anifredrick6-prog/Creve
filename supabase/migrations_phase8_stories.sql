-- Run this in Supabase → SQL Editor → New query → paste all → Run

create table stories (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references profiles(id) on delete cascade not null,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

alter table stories enable row level security;

create policy "Stories are publicly readable while active"
  on stories for select
  using (expires_at > now());

create policy "Vendors can post their own stories"
  on stories for insert
  with check (auth.uid() = vendor_id);

create policy "Vendors can delete their own stories"
  on stories for delete
  using (auth.uid() = vendor_id);
