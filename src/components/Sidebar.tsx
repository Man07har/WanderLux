import { Compass, Home, Map, PlusSquare, Bookmark, User, Search, Bell, MessageSquare, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const items = [
  { icon: Home, label: "Feed", to: "/" },
  { icon: Compass, label: "Explore", to: "/explore" },
  { icon: Map, label: "Atlas", to: "/atlas" },
  { icon: Search, label: "Search", to: "/search" },
  { icon: Bell, label: "Notifications", to: "/notifications" },
  { icon: MessageSquare, label: "Messages", to: "/messages" },
  { icon: Bookmark, label: "Saved", to: "/saved" },
  { icon: User, label: "Profile", to: "/profile" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

interface Props { active?: string; onChange?: (id: string) => void; onCreate?: () => void; }

export const Sidebar = ({ onCreate }: Props) => {
  const location = useLocation();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border/60 bg-background/40 backdrop-blur-xl px-5 py-8">
      <NavLink to="/" className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-full bg-gradient-gold shadow-glow flex items-center justify-center">
          <Compass className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="font-display text-2xl font-semibold tracking-tight">Wanderlux</span>
      </NavLink>

      <nav className="flex flex-col gap-1">
        {items.map(({ icon: Icon, label, to }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : ""}`} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-sm ${isActive ? "font-semibold" : ""}`}>{label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />}
            </NavLink>
          );
        })}
      </nav>

      {onCreate && (
        <button onClick={onCreate} className="mt-8 flex items-center justify-center gap-2 bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-xl shadow-glow hover:scale-[1.02] transition-transform">
          <PlusSquare className="w-4 h-4" strokeWidth={2.5} />
          New trip
        </button>
      )}

      <div className="mt-auto text-xs text-muted-foreground/60 font-display italic">
        "Not all who wander are lost."
      </div>
    </aside>
  );
};
