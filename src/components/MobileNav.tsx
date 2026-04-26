import { Compass, Home, Map, PlusSquare, User, Bell } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props { active?: string; onChange?: (id: string) => void; onCreate?: () => void; }

export const MobileNav = ({ onCreate }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const items = [
    { icon: Home, to: "/" },
    { icon: Compass, to: "/explore" },
    { icon: PlusSquare, to: "__new" },
    { icon: Bell, to: "/notifications" },
    { icon: User, to: "/profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/60">
      <div className="flex items-center justify-around py-2.5">
        {items.map(({ icon: Icon, to }) => {
          const isNew = to === "__new";
          const isActive = !isNew && (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to));
          if (isNew) {
            return (
              <button key="new" onClick={() => onCreate ? onCreate() : (user ? navigate("/?new=1") : navigate("/auth"))} className="p-2.5">
                <div className="w-11 h-11 -mt-6 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow">
                  <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                </div>
              </button>
            );
          }
          return (
            <NavLink key={to} to={to} className="p-2.5">
              <Icon className={`w-6 h-6 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} strokeWidth={isActive ? 2.5 : 1.8} />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
