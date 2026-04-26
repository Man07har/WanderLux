import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { useUserPosts } from "@/hooks/usePosts";
import { Settings, Grid3x3, MapPin, LogOut } from "lucide-react";

const initials = (n: string) => n.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: posts } = useUserPosts(user?.id);

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar active="profile" onChange={(id) => id === "feed" ? navigate("/") : null} onCreate={() => navigate("/")} />

      <main className="flex-1 min-w-0 px-4 sm:px-10 py-8 pb-24 lg:pb-10 max-w-5xl mx-auto">
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
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="font-display text-3xl font-semibold">{profile.display_name}</h1>
              <button className="px-4 py-1.5 text-sm font-semibold bg-secondary border border-border rounded-full hover:border-primary transition-colors flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> Edit profile
              </button>
              <button onClick={signOut} className="text-muted-foreground hover:text-foreground" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">@{profile.handle}</p>
            <div className="flex gap-6 mt-4 text-sm">
              <span><strong>{posts?.length ?? 0}</strong> <span className="text-muted-foreground">posts</span></span>
              <span><strong>0</strong> <span className="text-muted-foreground">followers</span></span>
              <span><strong>0</strong> <span className="text-muted-foreground">following</span></span>
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

          {!posts || posts.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-10 text-center">
              <p className="font-display text-xl mb-2">No moments yet.</p>
              <p className="text-sm text-muted-foreground mb-5">Your atlas starts with a single pin.</p>
              <button onClick={() => navigate("/")}
                className="bg-gradient-gold text-primary-foreground font-semibold px-5 py-2.5 rounded-full shadow-glow">
                Share a photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {posts.map(p => (
                <div key={p.id} className="aspect-square overflow-hidden rounded-md bg-muted group relative">
                  <img src={p.image_url} alt={p.caption ?? ""} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {p.location && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                      <p className="text-xs text-white flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{p.location}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <MobileNav active="profile" onChange={(id) => id === "feed" ? navigate("/") : null} />
    </div>
  );
};

export default Profile;
