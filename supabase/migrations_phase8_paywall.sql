-- Run this in Supabase → SQL Editor → New query → paste all → Run

alter table profiles add column trial_ends_at timestamptz;
update profiles set trial_ends_at = created_at + interval '1 month';
alter table profiles alter column trial_ends_at set not null;
alter table profiles alter column trial_ends_at set default (now() + interval '1 month');

-- Null = never subscribed. Set by the payment verification step once a
-- vendor pays; extended by another month on each successful renewal.
alter table profiles add column subscribed_until timestamptz;
