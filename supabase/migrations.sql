-- Run this in Supabase → SQL Editor → New query → paste all → Run

-- Public-safe profile info (shown on the marketplace)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('vendor', 'buyer')),
  full_name text not null,
  department text,
  level text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Anyone (including logged-out visitors) can read profiles —
-- needed so the marketplace can show vendor names/badges.
create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

-- Users can only create/edit their own profile.
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);


-- Private KYC info (never shown publicly — only the owner can read it)
create table vendor_kyc (
  user_id uuid references auth.users on delete cascade primary key,
  nin text not null,
  school_address text not null,
  created_at timestamptz not null default now()
);

alter table vendor_kyc enable row level security;

create policy "Vendors can read their own KYC info"
  on vendor_kyc for select
  using (auth.uid() = user_id);

create policy "Vendors can insert their own KYC info"
  on vendor_kyc for insert
  with check (auth.uid() = user_id);
