import { AppShell } from "@/components/AppShell";
import { useSavedPosts } from "@/hooks/useDiscovery";
import { useAuth } from "@/contexts/AuthContext";
import { PostCard } from "@/components/PostCard";
import { Loader2 } from "lucide-react";

const Saved = () => {
    const { user } = useAuth();
    const { data, isLoading } = useSavedPosts(user?.id);

    return (
        <AppShell narrow>
            <header className="mb-8">
                <p className="text-xs uppercase tracking-widest text-primary mb-2">Your Library</p>
                <h1 className="font-display text-4xl font-semibold">Saved</h1>
                <p className="text-sm text-muted-foreground mt-2">Moments you've bookmarked for later.</p>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : !data || data.length === 0 ? (
                <div className="border border-dashed border-border rounded-2xl p-12 text-center">
                    <p className="font-display text-xl mb-1">Nothing saved yet.</p>
                    <p className="text-sm text-muted-foreground">Tap the bookmark on any post to keep it here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((p: any, i: number) => <PostCard key={p.id} post={p} index={i} />)}
                </div>
            )}
        </AppShell>
    );
};

export default Saved;
