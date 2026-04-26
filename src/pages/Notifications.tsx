import { AppShell } from "@/components/AppShell";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/useNotifications";
import { useEffect } from "react";
import { Heart, MessageCircle, UserPlus, Loader2 } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { Link } from "react-router-dom";

const initials = (n: string) => n.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

const ICONS = {
    like: { icon: Heart, color: "text-accent" },
    comment: { icon: MessageCircle, color: "text-primary" },
    follow: { icon: UserPlus, color: "text-primary" },
};

const VERB = { like: "liked your post", comment: "commented on your post", follow: "started following you" };

const Notifications = () => {
    const { data, isLoading } = useNotifications();
    const markRead = useMarkNotificationsRead();

    useEffect(() => { markRead.mutate(); /* eslint-disable-next-line */ }, []);

    return (
        <AppShell narrow>
            <header className="mb-8">
                <p className="text-xs uppercase tracking-widest text-primary mb-2">Activity</p>
                <h1 className="font-display text-4xl font-semibold">Notifications</h1>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : !data || data.length === 0 ? (
                <div className="border border-dashed border-border rounded-2xl p-12 text-center">
                    <p className="font-display text-xl mb-1">All caught up.</p>
                    <p className="text-sm text-muted-foreground">When something happens, you'll see it here.</p>
                </div>
            ) : (
                <ul className="space-y-1">
                    {data.map(n => {
                        const I = ICONS[n.type].icon;
                        const target = n.type === "follow"
                            ? (n.actor ? `/u/${n.actor.handle}` : "#")
                            : n.post_id ? `/post/${n.post_id}` : "#";
                        return (
                            <li key={n.id}>
                                <Link to={target} className={`flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors ${!n.read ? "bg-secondary/30" : ""}`}>
                                    <div className="relative">
                                        {n.actor?.avatar_url ? (
                                            <img src={n.actor.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
                                                {initials(n.actor?.display_name ?? "??")}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center ${ICONS[n.type].color}`}>
                                            <I className="w-3 h-3" fill={n.type === "like" ? "currentColor" : "none"} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-sm">
                                        <p><span className="font-semibold">{n.actor?.display_name ?? "Someone"}</span> <span className="text-muted-foreground">{VERB[n.type]}</span></p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNowStrict(new Date(n.created_at), { addSuffix: true })}</p>
                                    </div>
                                    {n.post?.image_url && (
                                        <img src={n.post.image_url} alt="" className="w-12 h-12 rounded-md object-cover" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </AppShell>
    );
};

export default Notifications;
