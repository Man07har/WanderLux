import { usePosts } from "@/hooks/usePosts";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const initials = (n: string) => n.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

interface Props { onCreate: () => void; }

export const Stories = ({ onCreate }: Props) => {
  const { data: posts } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Unique users from recent posts
  const seen = new Set<string>();
  const wanderers = (posts ?? []).filter(p => {
    if (!p.profiles || seen.has(p.user_id)) return false;
    seen.add(p.user_id);
    return true;
  }).slice(0, 12);

  return (
    <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
      <button
        onClick={() => user ? onCreate() : navigate("/auth")}
        className="flex flex-col items-center gap-2 shrink-0"
      >
        <div className="relative w-[72px] h-[72px] rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors">
          <Plus className="w-6 h-6 text-muted-foreground" />
        </div>
        <span className="text-xs text-muted-foreground">Your trip</span>
      </button>

      {wanderers.map(w => (
        <button key={w.user_id} className="flex flex-col items-center gap-2 shrink-0 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-gold blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-[2px] rounded-full bg-gradient-gold">
              {w.profiles?.avatar_url ? (
                <img src={w.profiles.avatar_url} alt="" width={72} height={72}
                  className="w-[72px] h-[72px] rounded-full object-cover border-2 border-background" loading="lazy" />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full bg-secondary border-2 border-background flex items-center justify-center font-semibold">
                  {initials(w.profiles?.display_name ?? "??")}
                </div>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground max-w-[80px] truncate">
            {w.profiles?.country ?? w.profiles?.handle}
          </span>
        </button>
      ))}
    </div>
  );
};
