-- Before running this: go to Supabase → Storage → New bucket
-- Name it exactly: product-images
-- Toggle "Public bucket" ON
-- Then come back here and run this SQL to set the upload permissions.

create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Vendors can delete their own product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid() = owner);
