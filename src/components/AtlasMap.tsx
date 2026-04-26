import { useState } from "react";
import { usePosts } from "@/hooks/usePosts";

export const AtlasMap = () => {
  const { data: posts } = usePosts();
  const pinned = (posts ?? []).filter(p => p.lat != null && p.lng != null).slice(0, 30);
  const [activeId, setActiveId] = useState<string | null>(pinned[0]?.id ?? null);
  const active = pinned.find(p => p.id === activeId) ?? pinned[0];

  // Fallback coords from index for unpinned posts (artistic placement)
  const display = (posts ?? []).slice(0, 12).map((p, i) => {
    const x = p.lng != null ? ((Number(p.lng) + 180) / 360) * 100 : 15 + ((i * 37) % 70);
    const y = p.lat != null ? ((90 - Number(p.lat)) / 180) * 100 : 25 + ((i * 23) % 50);
    return { ...p, x, y };
  });
  const activeDisplay = display.find(d => d.id === activeId) ?? display[0];

  if (!posts || posts.length === 0) return null;

  return (
    <section className="bg-card/60 border border-border/60 rounded-2xl overflow-hidden shadow-cinema">
      <div className="p-5 flex items-center justify-between border-b border-border/60">
        <div>
          <h3 className="font-display text-xl font-semibold">The Atlas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Pinned moments from the network</p>
        </div>
        <span className="text-xs text-primary font-medium">{display.length} pins</span>
      </div>

      <div className="relative aspect-[16/9] bg-[hsl(30,18%,10%)] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
          {[...Array(12)].map((_, i) => (
            <line key={`v${i}`} x1={`${(i + 1) * 8.33}%`} y1="0" x2={`${(i + 1) * 8.33}%`} y2="100%" stroke="hsl(var(--border))" strokeWidth="0.5" />
          ))}
          {[...Array(7)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="hsl(var(--border))" strokeWidth="0.5" />
          ))}
        </svg>
        <svg viewBox="0 0 100 56" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <g fill="hsl(30 14% 13%)" stroke="hsl(38 88% 58% / 0.25)" strokeWidth="0.15">
            <path d="M10,18 Q14,10 22,12 T35,15 Q40,22 32,28 Q24,34 18,30 Q10,26 10,18 Z" />
            <path d="M44,12 Q52,8 60,14 Q66,20 60,26 Q52,28 46,24 Q42,18 44,12 Z" />
            <path d="M68,16 Q78,14 86,20 Q92,28 86,34 Q76,38 70,32 Q64,24 68,16 Z" />
            <path d="M28,38 Q34,34 40,40 Q44,48 36,52 Q28,52 26,46 Q24,40 28,38 Z" />
            <path d="M50,38 Q58,36 62,42 Q60,50 52,50 Q46,46 50,38 Z" />
          </g>
        </svg>

        {display.map(p => (
          <button key={p.id}
            onMouseEnter={() => setActiveId(p.id)}
            onClick={() => setActiveId(p.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <span className={`block w-3 h-3 rounded-full bg-primary ${activeId === p.id ? "animate-pulse-glow" : ""}`} />
            <span className="absolute inset-0 w-3 h-3 rounded-full bg-primary/40 blur-md" />
          </button>
        ))}

        {activeDisplay && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-background/85 backdrop-blur-xl border border-border rounded-xl p-3 flex gap-3 shadow-cinema">
            <img src={activeDisplay.image_url} alt={activeDisplay.location ?? ""} width={64} height={64}
              className="w-16 h-16 rounded-lg object-cover" loading="lazy" />
            <div className="min-w-0">
              <p className="text-xs text-primary font-medium truncate">{activeDisplay.profiles?.display_name}</p>
              <p className="text-sm font-semibold truncate">{activeDisplay.location ?? "Somewhere"}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{activeDisplay.caption}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
