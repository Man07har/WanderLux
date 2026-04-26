import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Hero } from "@/components/Hero";
import { Stories } from "@/components/Stories";
import { PostCard } from "@/components/PostCard";
import { AtlasMap } from "@/components/AtlasMap";
import { RightRail } from "@/components/RightRail";
import { NewPostDialog } from "@/components/NewPostDialog";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [active, setActive] = useState("feed");
  const [composing, setComposing] = useState(false);
  const { data: posts, isLoading } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNav = (id: string) => {
    if (id === "new") {
      user ? setComposing(true) : navigate("/auth");
      return;
    }
    if (id === "profile") {
      user ? navigate("/profile") : navigate("/auth");
      return;
    }
    setActive(id);
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar active={active} onChange={handleNav} onCreate={() => user ? setComposing(true) : navigate("/auth")} />

      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 pb-24 lg:pb-8">
        <header className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold" />
            <span className="font-display text-xl font-semibold">Wanderlux</span>
          </div>
          <button className="p-2 rounded-full bg-secondary/60"><Search className="w-4 h-4" /></button>
        </header>

        <div className="flex gap-8 max-w-6xl mx-auto">
          <div className="flex-1 min-w-0 space-y-8">
            <Hero onCta={() => user ? setComposing(true) : navigate("/auth")} />
            <Stories onCreate={() => setComposing(true)} />
            <AtlasMap />

            <div className="flex items-baseline justify-between pt-2">
              <h2 className="font-display text-2xl font-semibold">Latest from the trail</h2>
              <button className="text-xs text-muted-foreground hover:text-primary">Filter</button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : !posts || posts.length === 0 ? (
              <div className="bg-card/50 border border-dashed border-border rounded-2xl p-10 text-center">
                <p className="font-display text-xl mb-2">The trail is quiet.</p>
                <p className="text-sm text-muted-foreground mb-5">Be the first to pin a moment.</p>
                <button
                  onClick={() => user ? setComposing(true) : navigate("/auth")}
                  className="bg-gradient-gold text-primary-foreground font-semibold px-5 py-2.5 rounded-full shadow-glow"
                >
                  Share your first photo
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
              </div>
            )}
          </div>

          <RightRail />
        </div>
      </main>

      <MobileNav active={active} onChange={handleNav} />

      <NewPostDialog open={composing} onOpenChange={setComposing} />
    </div>
  );
};

export default Index;
