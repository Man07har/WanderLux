import { useFollows, useSuggestedUsers, useToggleFollow } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const trendingTags = [
  { tag: "#solotravel", posts: "284K" },
  { tag: "#hiddengems", posts: "192K" },
  { tag: "#vanlife", posts: "1.2M" },
  { tag: "#offgrid", posts: "76K" },
  { tag: "#nightsky", posts: "143K" },
];

const initials = (n: string) => n.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

export const RightRail = () => {
  const { user, profile, signOut } = useAuth();
  const { data: suggested } = useSuggestedUsers();
  const { data: following } = useFollows();
  const toggleFollow = useToggleFollow();
  const navigate = useNavigate();

  return (
    <aside className="hidden xl:flex flex-col gap-6 w-80 shrink-0 sticky top-8 self-start">
      {user && profile && (
        <div className="flex items-center gap-3 px-2">
          <div className="p-[1.5px] rounded-full bg-gradient-gold">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-background" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary border-2 border-background flex items-center justify-center font-semibold">
                {initials(profile.display_name)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{profile.handle}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.display_name}{profile.country ? ` · ${profile.country}` : ""}</p>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {!user && (
        <div className="bg-card/50 border border-border/60 rounded-2xl p-5">
          <p className="font-display text-lg font-semibold mb-1">Join Wanderlux</p>
          <p className="text-sm text-muted-foreground mb-4">Pin moments, follow travelers, save inspiration.</p>
          <button onClick={() => navigate("/auth")} className="w-full bg-gradient-gold text-primary-foreground font-semibold py-2.5 rounded-full shadow-glow">
            Sign in / Sign up
          </button>
        </div>
      )}

      <div className="bg-card/50 border border-border/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="font-display text-sm font-semibold tracking-wide uppercase">Trending</h4>
        </div>
        <ul className="space-y-3">
          {trendingTags.map(t => (
            <li key={t.tag} className="flex items-center justify-between hover:text-primary cursor-pointer transition-colors">
              <span className="text-sm">{t.tag}</span>
              <span className="text-xs text-muted-foreground">{t.posts} posts</span>
            </li>
          ))}
        </ul>
      </div>

      {suggested && suggested.length > 0 && (
        <div className="bg-card/50 border border-border/60 rounded-2xl p-5">
          <h4 className="font-display text-sm font-semibold tracking-wide uppercase mb-4">Travelers to follow</h4>
          <ul className="space-y-4">
            {suggested.slice(0, 5).map(u => {
              const isFollowing = following?.has(u.id) ?? false;
              return (
                <li key={u.id} className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
                      {initials(u.display_name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.handle}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.country ?? "Earth"}</p>
                  </div>
                  <button
                    onClick={() => user ? toggleFollow.mutate({ targetId: u.id, following: isFollowing }) : navigate("/auth")}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-transform hover:scale-105 ${
                      isFollowing
                        ? "bg-secondary text-foreground border border-border"
                        : "bg-gradient-gold text-primary-foreground"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground/60 px-2">© Wanderlux · Made for those who chase the horizon.</p>
    </aside>
  );
};
