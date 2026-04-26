import { AppShell } from "@/components/AppShell";
import { AtlasMap } from "@/components/AtlasMap";

const Atlas = () => (
    <AppShell narrow>
        <header className="mb-8">
            <p className="text-xs uppercase tracking-widest text-primary mb-2">The Atlas</p>
            <h1 className="font-display text-4xl font-semibold">Every pin tells a story</h1>
            <p className="text-sm text-muted-foreground mt-2">Browse moments by location.</p>
        </header>
        <AtlasMap />
    </AppShell>
);

export default Atlas;
