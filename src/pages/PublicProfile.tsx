import { AppShell } from "@/components/AppShell";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePublicProfile } from "@/hooks/useDiscovery";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleFollow, useFollows } from "@/hooks/usePosts";
import { Loader2, MapPin, MessageSquare, Grid3x3 } from "lucide-react";

const initials = (n: string) => n.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

const PublicProfile = () => {
    const { handle } = useParams();
    const { data, isLoading } = usePublicProfile(handle);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: followingSet } = useFollows();
    const toggleFollow = useToggleFollow();

    if (isLoading) {
        return <AppShell narrow><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></AppShell>;
    }
    if (!data) {
        return <AppShell narrow><p className="text-center text-muted-foreground py-20">Profile not found.</p></AppShell>;
    }

    const { profile, posts, followers, following } = data as any;
    const isMe = user?.id === profile.id;
    const isFollowing = followingSet?.has(profile.id) ?? false;

    const handleFollow = () => {
        if (!user) { navigate("/auth"); return; }
        toggleFollow.mutate({ targetId: profile.id, following: isFollowing });
    };

    return (
        <AppShell narrow>
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-10">
                <div className="p-1 rounded-full bg-gradient-gold">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-32 h-32 rounded-full object-cover border-4 border-background" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-secondary border-4 border-background flex items-center justify-center text-3xl font-display font-semibold">
                            {initials(profile.display_name)}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="font-display text-3xl font-semibold">{profile.display_name}</h1>
                        {!isMe && (
                            <>
                                <button onClick={handleFollow} disabled={toggleFollow.isPending}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${isFollowing
                                            ? "bg-secondary border border-border hover:border-accent"
                                            : "bg-gradient-gold text-primary-foreground shadow-glow"
                                        }`}>
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                <Link to={`/messages/${profile.id}`} className="px-4 py-1.5 text-sm font-semibold bg-secondary border border-border rounded-full hover:border-primary transition-colors flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" /> Message
                                </Link>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">@{profile.handle}</p>
                    <div className="flex gap-6 mt-4 text-sm">
                        <span><strong>{posts.length}</strong> <span className="text-muted-foreground">posts</span></span>
                        <span><strong>{followers}</strong> <span className="text-muted-foreground">followers</span></span>
                        <span><strong>{following}</strong> <span className="text-muted-foreground">following</span></span>
                    </div>
                    {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
                    {profile.country && (
                        <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> Based in {profile.country}
                        </p>
                    )}
                </div>
            </div>

            <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-5">
                    <Grid3x3 className="w-3.5 h-3.5" /> The Atlas
                </div>
                {posts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No posts yet.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {posts.map((p: any) => (
                            <Link to={`/post/${p.id}`} key={p.id} className="aspect-square overflow-hidden rounded-md bg-muted group relative">
                                <img src={p.image_url} alt={p.caption ?? ""} loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                {p.location && (
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                                        <p className="text-xs text-white flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{p.location}</p>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default PublicProfile;
