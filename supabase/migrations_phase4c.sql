-- Run this in Supabase → SQL Editor → New query → paste all → Run

alter table messages add column read boolean not null default false;

-- Let either party in a conversation mark messages as read
-- (needed so opening a thread can clear the unread dot).
create policy "Buyer or vendor can mark messages read in their conversation"
  on messages for update
  using (auth.uid() = buyer_id or auth.uid() = vendor_id);
