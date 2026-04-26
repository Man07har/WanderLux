-- Fix saves SELECT policy: allow all authenticated/anon users to read saves
-- so that the feed query (usePosts) can fetch saves for all posts.
-- Previously only the owner could read their own saves, which broke
-- the .select("*, ... saves(user_id)") query on the posts feed.

drop policy if exists "Users can view their own saves" on public.saves;

create policy "Saves are viewable by everyone"
  on public.saves for select using (true);
