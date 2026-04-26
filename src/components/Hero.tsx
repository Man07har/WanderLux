import heroCliff from "@/assets/hero-cliff.jpg";
import { ArrowRight, Globe2 } from "lucide-react";

interface Props { onCta: () => void; }

export const Hero = ({ onCta }: Props) => (
  <section className="relative overflow-hidden rounded-2xl border border-border/60 shadow-cinema mb-8">
    <div className="absolute inset-0">
      <img src={heroCliff} alt="Traveler at the edge of a cliff at golden hour"
        width={1920} height={1080}
        className="w-full h-full object-cover animate-ken-burns" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
    </div>

    <div className="relative px-6 sm:px-10 py-12 sm:py-20 max-w-2xl">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary mb-5">
        <Globe2 className="w-3.5 h-3.5" />
        <span>Issue 04 · The Wandering</span>
      </div>
      <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[0.95] tracking-tight">
        Stories from <em className="text-gold not-italic">everywhere</em> the road takes you.
      </h1>
      <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-md">
        A cinematic feed for travelers. Pin your moments to the atlas, follow the world's most curious wanderers.
      </p>
      <div className="mt-7 flex items-center gap-3">
        <button onClick={onCta}
          className="inline-flex items-center gap-2 bg-gradient-gold text-primary-foreground font-semibold px-5 py-3 rounded-full shadow-glow hover:scale-[1.03] transition-transform">
          Pin your first moment <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </section>
);
