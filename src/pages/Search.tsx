import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Search as SearchIcon, MapPin } from "lucide-react";
import { useSearch } from "@/hooks/useDiscovery";
import { Link } from "react-router-dom";

const initials = (n: string) => n.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

const Search = () => {
    const [q, setQ] = useState("");
    const { data, isFetching } = useSearch(q);

    return (
        <AppShell narrow>
            <header className="mb-6">
                <p className="text-xs uppercase tracking-widest text-primary mb-2">Search</p>
                <h1 className="font-display text-4xl font-semibold">Find people, places, tags</h1>
            </header>

            <div className="relative mb-8">
                <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    autoFocus value={q} onChange={e => setQ(e.target.value)}
                    placeholder="Try 'Kyoto', '@maya', or #sunset"
                    className="w-full bg-secondary/60 border border-border rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
            </div>

            {q.trim().length === 0 ? (
                <p className="text-sm text-muted-foreground">Start typing to search.</p>
            ) : isFetching ? (
                <p className="text-sm text-muted-foreground">Searching…</p>
            ) : !data ? null : (
                <div className="space-y-10">
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">People</h2>
                        {data.people.length === 0 ? <p className="text-sm text-muted-foreground">No people found.</p> : (
                            <div className="space-y-2">
                                {data.people.map((p: any) => (
                                    <Link key={p.id} to={`/u/${p.handle}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                                        {p.avatar_url ? (
                                            <img src={p.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">{initials(p.display_name)}</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{p.display_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">@{p.handle}{p.country ? ` · ${p.country}` : ""}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Posts</h2>
                        {data.posts.length === 0 && data.tagPosts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No posts found.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-1.5">
                                {[...data.posts, ...data.tagPosts].map((p: any) => (
                                    <Link key={p.id} to={`/post/${p.id}`} className="aspect-square overflow-hidden rounded-md group relative bg-muted">
                                        <img src={p.image_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {p.location && (
                                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-xs text-white flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{p.location}</p>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </AppShell>
    );
};

export default Search;
