import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSearch = (q: string) => {
    return useQuery({
        queryKey: ["search", q],
        enabled: q.trim().length > 0,
        queryFn: async () => {
            const term = `%${q.trim()}%`;
            const [{ data: people }, { data: places }, { data: tagPosts }] = await Promise.all([
                supabase.from("profiles").select("id, handle, display_name, avatar_url, country")
                    .or(`handle.ilike.${term},display_name.ilike.${term}`).limit(10),
                supabase.from("posts").select("*, profiles:user_id(handle, display_name, avatar_url)")
                    .or(`location.ilike.${term},caption.ilike.${term}`).order("created_at", { ascending: false }).limit(20),
                supabase.from("posts").select("*, profiles:user_id(handle, display_name, avatar_url)")
                    .contains("tags", [q.trim().replace(/^#/, "")]).limit(20),
            ]);
            return {
                people: people ?? [],
                posts: places ?? [],
                tagPosts: tagPosts ?? [],
            };
        },
    });
};

export const useExplore = () => {
    return useQuery({
        queryKey: ["explore"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("posts")
                .select("id, image_url, caption, location, user_id, profiles:user_id(handle, display_name, avatar_url)")
                .order("created_at", { ascending: false })
                .limit(60);
            if (error) throw error;
            return data ?? [];
        },
    });
};

export const usePublicProfile = (handle: string | undefined) => {
    return useQuery({
        queryKey: ["public-profile", handle],
        enabled: !!handle,
        queryFn: async () => {
            const { data: profile, error } = await supabase
                .from("profiles").select("*").eq("handle", handle!).maybeSingle();
            if (error) throw error;
            if (!profile) return null;
            const [{ data: posts }, { count: followers }, { count: following }] = await Promise.all([
                supabase.from("posts").select("*, likes(user_id), comments(id)").eq("user_id", (profile as any).id).order("created_at", { ascending: false }),
                supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", (profile as any).id),
                supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", (profile as any).id),
            ]);
            return { profile, posts: posts ?? [], followers: followers ?? 0, following: following ?? 0 };
        },
    });
};

export const usePost = (postId: string | undefined) => {
    return useQuery({
        queryKey: ["post", postId],
        enabled: !!postId,
        queryFn: async () => {
            const { data, error } = await supabase.from("posts")
                .select(`*,
          profiles:user_id(handle, display_name, avatar_url, country),
          likes(user_id), comments(id), saves(user_id)`)
                .eq("id", postId!).maybeSingle();
            if (error) throw error;
            return data;
        },
    });
};

export const useSavedPosts = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["saved-posts", userId],
        enabled: !!userId,
        queryFn: async () => {
            const { data, error } = await supabase.from("saves")
                .select("post_id, created_at, posts:post_id(*, profiles:user_id(handle, display_name, avatar_url), likes(user_id), comments(id), saves(user_id))")
                .eq("user_id", userId!)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data ?? []).map((r: any) => r.posts).filter(Boolean);
        },
    });
};

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: async (updates: { display_name?: string; bio?: string; country?: string; handle?: string; avatar_url?: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not signed in");
            const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
            if (error) throw error;
        }
    });
};
