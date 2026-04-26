import { AppShell } from "@/components/AppShell";
import { useConversations, useConversation, useSendMessage } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

const initials = (n: string) => n.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

const Messages = () => {
    const { partnerId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: convos, isLoading } = useConversations();
    const { data: thread } = useConversation(partnerId);
    const send = useSendMessage();
    const [body, setBody] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    const partner = convos?.find(c => c.partner_id === partnerId)?.partner ?? null;

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim() || !partnerId) return;
        await send.mutateAsync({ recipientId: partnerId, body: body.trim() });
        setBody("");
    };

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto grid lg:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-8rem)]">
                {/* Conversations list */}
                <aside className={`border border-border/60 rounded-2xl bg-card/40 overflow-hidden flex flex-col ${partnerId ? "hidden lg:flex" : ""}`}>
                    <header className="p-4 border-b border-border/60">
                        <h2 className="font-display text-lg font-semibold">Messages</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                        ) : !convos || convos.length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground text-center">No conversations yet. Find people on Explore and start chatting.</p>
                        ) : convos.map(c => (
                            <Link key={c.partner_id} to={`/messages/${c.partner_id}`}
                                className={`flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors ${partnerId === c.partner_id ? "bg-secondary/60" : ""}`}>
                                {c.partner?.avatar_url ? (
                                    <img src={c.partner.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">{initials(c.partner?.display_name ?? "??")}</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{c.partner?.display_name ?? "Unknown"}</p>
                                    <p className="text-xs text-muted-foreground truncate">{c.last_message.body}</p>
                                </div>
                                {c.unread > 0 && <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">{c.unread}</span>}
                            </Link>
                        ))}
                    </div>
                </aside>

                {/* Thread */}
                <section className={`border border-border/60 rounded-2xl bg-card/40 overflow-hidden flex flex-col ${!partnerId ? "hidden lg:flex" : ""}`}>
                    {!partnerId ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Select a conversation</div>
                    ) : (
                        <>
                            <header className="flex items-center gap-3 p-4 border-b border-border/60">
                                <button onClick={() => navigate("/messages")} className="lg:hidden text-muted-foreground"><ArrowLeft className="w-4 h-4" /></button>
                                {partner?.avatar_url ? (
                                    <img src={partner.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">{initials(partner?.display_name ?? "??")}</div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{partner?.display_name ?? "Conversation"}</p>
                                    {partner?.handle && <Link to={`/u/${partner.handle}`} className="text-xs text-muted-foreground hover:text-primary">@{partner.handle}</Link>}
                                </div>
                            </header>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {thread?.map(m => {
                                    const mine = m.sender_id === user?.id;
                                    return (
                                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                                                <p>{m.body}</p>
                                                <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                                    {formatDistanceToNowStrict(new Date(m.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={endRef} />
                            </div>
                            <form onSubmit={submit} className="p-3 border-t border-border/60 flex gap-2">
                                <input value={body} onChange={e => setBody(e.target.value)} placeholder="Write a message…"
                                    className="flex-1 bg-secondary/60 border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                                <button type="submit" disabled={!body.trim() || send.isPending}
                                    className="bg-gradient-gold text-primary-foreground font-semibold w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </AppShell>
    );
};

export default Messages;
