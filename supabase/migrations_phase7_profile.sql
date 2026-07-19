-- Run this in Supabase → SQL Editor → New query → paste all → Run

alter table profiles add column avatar_url text;
alter table profiles add column bio text;
alter table profiles add column social_links jsonb not null default '[]';
alter table profiles add column phone text;
alter table profiles add column contact_email text;

-- Once a vendor is verified, their name is locked forever — it's the
-- name that was checked against their NIN, so it can't quietly change.
create or replace function prevent_name_change_after_verification()
returns trigger as $$
begin
  if old.verified = true and new.full_name is distinct from old.full_name then
    raise exception 'Name cannot be changed after verification.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger lock_name_after_verification
before update on profiles
for each row execute function prevent_name_change_after_verification();
