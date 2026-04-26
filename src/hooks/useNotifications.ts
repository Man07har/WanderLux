import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Notification = {
    id: string;
    user_id: string;
    actor_id: string;
    type: "like" | "comment" | "follow";
    post_id: string | null;
    read: boolean;
    created_at: string;
    actor?: { handle: string; display_name: string; avatar_url: string | null } | null;
    post?: { image_url: string } | null;
};

export const useNotifications = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["notifications", user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user!.id)
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            const rows = (data ?? []) as any[];
            const actorIds = Array.from(new Set(rows.map(r => r.actor_id)));
            const postIds = Array.from(new Set(rows.map(r => r.post_id).filter(Boolean))) as string[];
            const [{ data: actors }, { data: posts }] = await Promise.all([
                actorIds.length ? supabase.from("profiles").select("id, handle, display_name, avatar_url").in("id", actorIds) : Promise.resolve({ data: [] as any[] }),
                postIds.length ? supabase.from("posts").select("id, image_url").in("id", postIds) : Promise.resolve({ data: [] as any[] }),
            ]);
            const actorMap = new Map((actors ?? []).map((a: any) => [a.id, a]));
            const postMap = new Map((posts ?? []).map((p: any) => [p.id, p]));
            return rows.map(r => ({
                ...r,
                actor: actorMap.get(r.actor_id) ?? null,
                post: r.post_id ? postMap.get(r.post_id) ?? null : null,
            })) as Notification[];
        },
    });
};

export const useUnreadNotificationCount = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["notifications", "unread", user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { count, error } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user!.id)
                .eq("read", false);
            if (error) throw error;
            return count ?? 0;
        },
    });
};

export const useMarkNotificationsRead = () => {
    const qc = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: async () => {
            if (!user) return;
            const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};
