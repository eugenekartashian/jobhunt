-- Feature 04 storage hardening: authenticated users can access only their own resume keys.

alter table storage.objects enable row level security;

drop policy if exists resumes_select_own on storage.objects;
create policy resumes_select_own
on storage.objects
for select
using (
  bucket = 'resumes'
  and auth.uid() is not null
  and split_part(key, '/', 1) = auth.uid()::text
);

drop policy if exists resumes_insert_own on storage.objects;
create policy resumes_insert_own
on storage.objects
for insert
with check (
  bucket = 'resumes'
  and auth.uid() is not null
  and split_part(key, '/', 1) = auth.uid()::text
);

drop policy if exists resumes_update_own on storage.objects;
create policy resumes_update_own
on storage.objects
for update
using (
  bucket = 'resumes'
  and auth.uid() is not null
  and split_part(key, '/', 1) = auth.uid()::text
)
with check (
  bucket = 'resumes'
  and auth.uid() is not null
  and split_part(key, '/', 1) = auth.uid()::text
);

drop policy if exists resumes_delete_own on storage.objects;
create policy resumes_delete_own
on storage.objects
for delete
using (
  bucket = 'resumes'
  and auth.uid() is not null
  and split_part(key, '/', 1) = auth.uid()::text
);
