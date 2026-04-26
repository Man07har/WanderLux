import { AppShell } from "@/components/AppShell";
import { useExplore } from "@/hooks/useDiscovery";
import { Loader2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Explore = () => {
    const { data, isLoading } = useExplore();

    return (
        <AppShell>
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <p className="text-xs uppercase tracking-widest text-primary mb-2">Discover</p>
                    <h1 className="font-display text-4xl font-semibold">Explore the world</h1>
                    <p className="text-sm text-muted-foreground mt-2">Fresh moments from wanderers everywhere.</p>
                </header>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : !data || data.length === 0 ? (
                    <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
                        Nothing to explore yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {data.map((p: any, i) => (
                            <Link key={p.id} to={`/post/${p.id}`}
                                className={`group relative overflow-hidden rounded-xl bg-muted ${i % 7 === 0 ? "row-span-2 col-span-2 aspect-square" : "aspect-square"}`}>
                                <img src={p.image_url} alt={p.caption ?? ""} loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <div className="text-xs text-white">
                                        <p className="font-semibold">@{p.profiles?.handle}</p>
                                        {p.location && <p className="flex items-center gap-1 text-white/80 mt-0.5"><MapPin className="w-3 h-3 text-primary" />{p.location}</p>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default Explore;
