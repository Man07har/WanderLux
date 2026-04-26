-- =========================================================
-- PROFILES
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  bio text,
  country text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete using (auth.uid() = id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_handle text;
  final_handle text;
  n int := 0;
begin
  base_handle := coalesce(
    new.raw_user_meta_data->>'handle',
    split_part(new.email, '@', 1)
  );
  base_handle := regexp_replace(lower(base_handle), '[^a-z0-9_]', '', 'g');
  if length(base_handle) < 3 then base_handle := 'wanderer' || substr(new.id::text, 1, 6); end if;

  final_handle := base_handle;
  while exists (select 1 from public.profiles where handle = final_handle) loop
    n := n + 1;
    final_handle := base_handle || n::text;
  end loop;

  insert into public.profiles (id, handle, display_name, country)
  values (
    new.id,
    final_handle,
    coalesce(new.raw_user_meta_data->>'display_name', initcap(replace(base_handle, '_', ' '))),
    new.raw_user_meta_data->>'country'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- POSTS
-- =========================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  location text,
  lat numeric,
  lng numeric,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- =========================================================
-- LIKES
-- =========================================================
create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index likes_post_id_idx on public.likes(post_id);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Users can like as themselves"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike their own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- =========================================================
-- COMMENTS
-- =========================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index comments_post_id_idx on public.comments(post_id);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Users can insert their own comments"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.comments for update using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- =========================================================
-- FOLLOWS
-- =========================================================
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_following_idx on public.follows(following_id);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users can follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow as themselves"
  on public.follows for delete using (auth.uid() = follower_id);

-- =========================================================
-- SAVES
-- =========================================================
create table public.saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.saves enable row level security;

create policy "Users can view their own saves"
  on public.saves for select using (auth.uid() = user_id);

create policy "Users can save as themselves"
  on public.saves for insert with check (auth.uid() = user_id);

create policy "Users can unsave their own saves"
  on public.saves for delete using (auth.uid() = user_id);

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public) values ('posts', 'posts', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Posts bucket: anyone can view, users upload to their own folder
create policy "Post images are publicly viewable"
  on storage.objects for select using (bucket_id = 'posts');

create policy "Users can upload posts to their folder"
  on storage.objects for insert with check (
    bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own post images"
  on storage.objects for update using (
    bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own post images"
  on storage.objects for delete using (
    bucket_id = 'posts' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars bucket
create policy "Avatars are publicly viewable"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );