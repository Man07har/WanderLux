import { Compass, Home, Map, PlusSquare, Bookmark, User, Search } from "lucide-react";
import { useState } from "react";

const items = [
  { icon: Home, label: "Feed", id: "feed" },
  { icon: Compass, label: "Explore", id: "explore" },
  { icon: Map, label: "Atlas", id: "atlas" },
  { icon: Search, label: "Search", id: "search" },
  { icon: Bookmark, label: "Saved", id: "saved" },
  { icon: User, label: "Profile", id: "profile" },
];

interface Props { active: string; onChange: (id: string) => void; onCreate?: () => void; }

export const Sidebar = ({ active, onChange, onCreate }: Props) => {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border/60 bg-background/40 backdrop-blur-xl px-5 py-8">
      <div className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-full bg-gradient-gold shadow-glow flex items-center justify-center">
          <Compass className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="font-display text-2xl font-semibold tracking-tight">Wanderlux</span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ icon: Icon, label, id }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : ""}`} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-sm ${isActive ? "font-semibold" : ""}`}>{label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />}
            </button>
          );
        })}
      </nav>

      <button onClick={onCreate} className="mt-8 flex items-center justify-center gap-2 bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-xl shadow-glow hover:scale-[1.02] transition-transform">
        <PlusSquare className="w-4 h-4" strokeWidth={2.5} />
        New trip
      </button>

      <div className="mt-auto text-xs text-muted-foreground/60 font-display italic">
        "Not all who wander are lost."
      </div>
    </aside>
  );
};
