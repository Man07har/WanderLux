import { Compass, Home, Map, PlusSquare, User } from "lucide-react";

const items = [
  { icon: Home, id: "feed" },
  { icon: Compass, id: "explore" },
  { icon: PlusSquare, id: "new" },
  { icon: Map, id: "atlas" },
  { icon: User, id: "profile" },
];

interface Props { active: string; onChange: (id: string) => void; }

export const MobileNav = ({ active, onChange }: Props) => (
  <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/60">
    <div className="flex items-center justify-around py-2.5">
      {items.map(({ icon: Icon, id }) => {
        const isActive = active === id;
        const isNew = id === "new";
        return (
          <button key={id} onClick={() => onChange(id)} className="p-2.5">
            {isNew ? (
              <div className="w-11 h-11 -mt-6 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow">
                <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
            ) : (
              <Icon className={`w-6 h-6 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} strokeWidth={isActive ? 2.5 : 1.8} />
            )}
          </button>
        );
      })}
    </div>
  </nav>
);
