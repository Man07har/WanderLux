import { Bookmark, Heart, MapPin, MessageCircle, MoreHorizontal, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleLike, useToggleSave, type FeedPost, useComments, useAddComment } from "@/hooks/usePosts";
import { toast } from "sonner";
import { formatDistanceToNowStrict } from "date-fns";

const initials = (name: string) => name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

interface Props { post: FeedPost; index: number; }

export const PostCard = ({ post, index }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [body, setBody] = useState("");

  const liked = !!user && post.likes.some(l => l.user_id === user.id);
  const saved = !!user && post.saves.some(s => s.user_id === user.id);
  const likeCount = post.likes.length;

  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const { data: comments } = useComments(showComments ? post.id : "");
  const addComment = useAddComment(post.id);

  const handleLike = () => {
    if (!user) { navigate("/auth"); return; }
    toggleLike.mutate({ postId: post.id, liked });
  };
  const handleSave = () => {
    if (!user) { navigate("/auth"); return; }
    toggleSave.mutate({ postId: post.id, saved });
  };
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (!body.trim()) return;
    try { await addComment.mutateAsync(body.trim()); setBody(""); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const profile = post.profiles;
  const when = formatDistanceToNowStrict(new Date(post.created_at), { addSuffix: false });

  return (
    <article
      className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden shadow-cinema animate-float-up grain"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <header className="flex items-center gap-3 p-4">
        <div className="p-[1.5px] rounded-full bg-gradient-gold shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" width={40} height={40}
              className="w-10 h-10 rounded-full object-cover border-2 border-card" loading="lazy" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-semibold">
              {initials(profile?.display_name ?? "??")}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{profile?.display_name ?? "Unknown"}</p>
          {post.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 leading-tight mt-0.5">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{post.location}</span>
            </p>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{when}</span>
        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-5 h-5" /></button>
      </header>

      <div className="relative overflow-hidden bg-muted">
        <img src={post.image_url} alt={post.caption ?? "Travel moment"}
          className="w-full aspect-square object-cover transition-transform duration-700 hover:scale-105"
          loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        {post.location && (
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-medium text-foreground/90">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            {post.location}
          </div>
        )}
      </div>

      <div className="p-4 pb-2 flex items-center gap-4">
        <button onClick={handleLike} disabled={toggleLike.isPending} className="group">
          <Heart className={`w-6 h-6 transition-all ${liked ? "fill-accent text-accent scale-110" : "text-foreground group-hover:text-accent"}`} strokeWidth={1.8} />
        </button>
        <button onClick={() => setShowComments(s => !s)}>
          <MessageCircle className="w-6 h-6 hover:text-primary transition-colors" strokeWidth={1.8} />
        </button>
        <button><Send className="w-6 h-6 hover:text-primary transition-colors" strokeWidth={1.8} /></button>
        <button onClick={handleSave} disabled={toggleSave.isPending} className="ml-auto">
          <Bookmark className={`w-6 h-6 transition-all ${saved ? "fill-primary text-primary" : "text-foreground hover:text-primary"}`} strokeWidth={1.8} />
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="text-sm font-semibold">{likeCount.toLocaleString()} likes</p>
        {post.caption && (
          <p className="text-sm mt-2 leading-relaxed">
            <span className="font-semibold mr-2">{profile?.handle}</span>
            {post.caption}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {post.tags.map(t => <span key={t} className="text-xs text-primary/90 hover:text-primary cursor-pointer">{t}</span>)}
          </div>
        )}

        {!showComments && post.comments.length > 0 && (
          <button onClick={() => setShowComments(true)} className="text-xs text-muted-foreground mt-3 hover:text-foreground">
            View all {post.comments.length} comments
          </button>
        )}

        {showComments && (
          <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
            {comments?.map(c => (
              <div key={c.id} className="text-sm">
                <span className="font-semibold mr-2">{(c as any).profiles?.handle ?? "user"}</span>
                <span>{c.body}</span>
              </div>
            ))}
            <form onSubmit={handleComment} className="flex gap-2 pt-2">
              <input value={body} onChange={e => setBody(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 bg-secondary/60 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary" />
              <button type="submit" disabled={addComment.isPending || !body.trim()}
                className="text-primary text-sm font-semibold disabled:opacity-40 px-2">
                {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};
