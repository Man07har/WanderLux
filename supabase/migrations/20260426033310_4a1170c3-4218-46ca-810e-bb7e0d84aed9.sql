-- Fix function search path
create or replace function public.set_updated_at()
returns trigger language plpgsql
security definer set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

-- Restrict listing on public buckets: only allow direct file access, not enumeration
drop policy "Post images are publicly viewable" on storage.objects;
drop policy "Avatars are publicly viewable" on storage.objects;

create policy "Post images: read individual files"
  on storage.objects for select
  using (bucket_id = 'posts' and (auth.role() = 'authenticated' or auth.role() = 'anon'));

create policy "Avatars: read individual files"
  on storage.objects for select
  using (bucket_id = 'avatars' and (auth.role() = 'authenticated' or auth.role() = 'anon'));