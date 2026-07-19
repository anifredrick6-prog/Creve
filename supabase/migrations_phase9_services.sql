-- Run this in Supabase → SQL Editor → New query → paste all → Run

alter table products add column listing_type text not null default 'product'
  check (listing_type in ('product', 'service'));
