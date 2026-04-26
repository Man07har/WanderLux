import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Compass, Loader2 } from "lucide-react";
import heroCliff from "@/assets/hero-cliff.jpg";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split("@")[0], country },
          },
        });
        if (error) throw error;
        toast.success("Welcome aboard. Your atlas awaits.");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, traveler.");
        navigate("/");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img src={heroCliff} alt="" className="absolute inset-0 w-full h-full object-cover animate-ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Wanderlux</p>
          <h2 className="font-display text-5xl font-semibold leading-tight max-w-md">
            The world is wide. <em className="text-gold not-italic">Pin your part of it.</em>
          </h2>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-full bg-gradient-gold shadow-glow flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-semibold">Wanderlux</span>
          </div>

          <h1 className="font-display text-3xl font-semibold mb-2">
            {mode === "signin" ? "Welcome back" : "Begin your atlas"}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "signin" ? "Sign in to continue your journey." : "Create an account in seconds."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <input
                  type="text" placeholder="Display name"
                  value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="text" placeholder="Country (e.g. Norway)"
                  value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </>
            )}
            <input
              type="email" required placeholder="Email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="password" required minLength={6} placeholder="Password (min 6 characters)"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" disabled={busy}
              className="w-full bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-xl shadow-glow hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-sm text-muted-foreground hover:text-foreground mt-6"
          >
            {mode === "signin" ? "No account yet? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
