-- Run this in Supabase → SQL Editor → New query → paste all → Run

-- Multiple photos per product (the existing image_url stays as the cover photo)
alter table products add column image_urls text[] not null default '{}';

-- Optional stock count — null means "not tracking stock", not "0 left"
alter table products add column stock_count integer;

-- Variant groups, e.g. [{"name":"Size","options":["S","M","L"]}]
-- Informational for now (no per-variant price/stock yet).
alter table products add column variants jsonb not null default '[]';
