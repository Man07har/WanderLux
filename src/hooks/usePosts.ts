import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FeedPost = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  tags: string[] | null;
  created_at: string;
  profiles: {
    handle: string;
    display_name: string;
    avatar_url: string | null;
    country: string | null;
  } | null;
  likes: { user_id: string }[];
  comments: { id: string }[];
  saves: { user_id: string }[];
};

export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<FeedPost[]> => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id ( handle, display_name, avatar_url, country ),
          likes ( user_id ),
          comments ( id ),
          saves ( user_id )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown) as FeedPost[];
    },
  });
};

export const useUserPosts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["posts", "user", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, likes(user_id), comments(id)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useToggleLike = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      if (!user) throw new Error("Sign in to like posts");
      if (liked) {
        const { error } = await supabase.from("likes").delete().match({ user_id: user.id, post_id: postId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useToggleSave = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ postId, saved }: { postId: string; saved: boolean }) => {
      if (!user) throw new Error("Sign in to save posts");
      if (saved) {
        const { error } = await supabase.from("saves").delete().match({ user_id: user.id, post_id: postId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("saves").insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
};

export const useToggleFollow = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ targetId, following }: { targetId: string; following: boolean }) => {
      if (!user) throw new Error("Sign in to follow");
      if (following) {
        const { error } = await supabase.from("follows").delete()
          .match({ follower_id: user.id, following_id: targetId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["follows"] }),
  });
};

export const useFollows = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["follows", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("follows").select("following_id").eq("follower_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map(f => f.following_id));
    },
  });
};

export const useSuggestedUsers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["suggested-users", user?.id],
    queryFn: async () => {
      let q = supabase.from("profiles").select("id, handle, display_name, avatar_url, country").limit(8);
      if (user) q = q.neq("id", user.id);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles:user_id ( handle, avatar_url )")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
};

export const useAddComment = (postId: string) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!user) throw new Error("Sign in to comment");
      const { error } = await supabase.from("comments").insert({ post_id: postId, user_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useCreatePost = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      file: File; caption: string; location: string; tags: string[];
      lat?: number; lng?: number;
    }) => {
      if (!user) throw new Error("Sign in to post");
      const ext = input.file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("posts").upload(path, input.file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("posts").getPublicUrl(path);
      const { error: insErr } = await supabase.from("posts").insert({
        user_id: user.id,
        image_url: pub.publicUrl,
        caption: input.caption || null,
        location: input.location || null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        tags: input.tags,
      });
      if (insErr) throw insErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
};
