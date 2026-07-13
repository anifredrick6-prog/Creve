-- Run this in Supabase → SQL Editor → New query → paste all → Run

alter table messages add column sender_id uuid references profiles(id);

-- Every existing message so far was sent by the buyer — backfill that.
update messages set sender_id = buyer_id where sender_id is null;

alter table messages alter column sender_id set not null;

-- Replace the old buyer-only insert policy with one that lets either
-- side of a conversation post, as long as they're actually part of it
-- and are only ever posting as themselves.
drop policy "Buyers can send messages" on messages;

create policy "Buyer or vendor can send messages in their own conversation"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and (auth.uid() = buyer_id or auth.uid() = vendor_id)
  );
