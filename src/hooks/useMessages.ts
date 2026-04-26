import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export type ChatMessage = {
    id: string;
    sender_id: string;
    recipient_id: string;
    body: string;
    read: boolean;
    created_at: string;
};

export type ConversationSummary = {
    partner_id: string;
    partner: { handle: string; display_name: string; avatar_url: string | null } | null;
    last_message: ChatMessage;
    unread: number;
};

export const useConversations = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ["conversations", user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
                .order("created_at", { ascending: false });
            if (error) throw error;
            const rows = (data ?? []) as ChatMessage[];
            const map = new Map<string, ConversationSummary>();
            for (const m of rows) {
                const partnerId = m.sender_id === user!.id ? m.recipient_id : m.sender_id;
                if (!map.has(partnerId)) {
                    map.set(partnerId, { partner_id: partnerId, partner: null, last_message: m, unread: 0 });
                }
                const c = map.get(partnerId)!;
                if (!c.last_message || c.last_message.created_at < m.created_at) c.last_message = m;
                if (m.recipient_id === user!.id && !m.read) c.unread += 1;
            }
            const partnerIds = Array.from(map.keys());
            if (partnerIds.length) {
                const { data: profs } = await supabase.from("profiles").select("id, handle, display_name, avatar_url").in("id", partnerIds);
                for (const p of profs ?? []) {
                    const c = map.get((p as any).id);
                    if (c) c.partner = p as any;
                }
            }
            return Array.from(map.values()).sort((a, b) => b.last_message.created_at.localeCompare(a.last_message.created_at));
        },
    });
};

export const useConversation = (partnerId: string | undefined) => {
    const { user } = useAuth();
    const qc = useQueryClient();

    const query = useQuery({
        queryKey: ["conversation", user?.id, partnerId],
        enabled: !!user && !!partnerId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(
                    `and(sender_id.eq.${user!.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user!.id})`
                )
                .order("created_at", { ascending: true });
            if (error) throw error;
            // mark inbound as read
            await supabase.from("messages").update({ read: true })
                .eq("sender_id", partnerId!).eq("recipient_id", user!.id).eq("read", false);
            return (data ?? []) as ChatMessage[];
        },
    });

    // Realtime subscription
    useEffect(() => {
        if (!user || !partnerId) return;
        const channel = supabase
            .channel(`dm:${user.id}:${partnerId}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
                const m = payload.new as ChatMessage;
                const inThread =
                    (m.sender_id === user.id && m.recipient_id === partnerId) ||
                    (m.sender_id === partnerId && m.recipient_id === user.id);
                if (inThread) {
                    qc.invalidateQueries({ queryKey: ["conversation", user.id, partnerId] });
                    qc.invalidateQueries({ queryKey: ["conversations", user.id] });
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user, partnerId, qc]);

    return query;
};

export const useSendMessage = () => {
    const { user } = useAuth();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ recipientId, body }: { recipientId: string; body: string }) => {
            if (!user) throw new Error("Sign in to send messages");
            const { error } = await supabase.from("messages").insert({
                sender_id: user.id, recipient_id: recipientId, body,
            });
            if (error) throw error;
        },
        onSuccess: (_d, vars) => {
            qc.invalidateQueries({ queryKey: ["conversation", user?.id, vars.recipientId] });
            qc.invalidateQueries({ queryKey: ["conversations", user?.id] });
        },
    });
};
