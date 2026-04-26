import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Settings = () => {
    const { user, profile, refreshProfile, signOut } = useAuth();
    const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
    const [bio, setBio] = useState(profile?.bio ?? "");
    const [country, setCountry] = useState(profile?.country ?? "");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    if (!user || !profile) return null;

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase.from("profiles").update({
            display_name: displayName, bio: bio || null, country: country || null,
        }).eq("id", user.id);
        setSaving(false);
        if (error) { toast.error(error.message); return; }
        await refreshProfile();
        toast.success("Profile updated");
    };

    const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
        if (upErr) { toast.error(upErr.message); setUploading(false); return; }
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        const { error } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);
        setUploading(false);
        if (error) { toast.error(error.message); return; }
        await refreshProfile();
        toast.success("Avatar updated");
    };

    return (
        <AppShell narrow>
            <header className="mb-8">
                <p className="text-xs uppercase tracking-widest text-primary mb-2">Settings</p>
                <h1 className="font-display text-4xl font-semibold">Edit your profile</h1>
            </header>

            <form onSubmit={save} className="space-y-6 max-w-xl">
                <div className="flex items-center gap-5">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-secondary border-2 border-border" />
                    )}
                    <label className="text-sm font-semibold cursor-pointer text-primary hover:opacity-80">
                        {uploading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</span> : "Change avatar"}
                        <input type="file" accept="image/*" onChange={onAvatar} className="hidden" disabled={uploading} />
                    </label>
                </div>

                <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Handle</label>
                    <p className="mt-1 text-sm text-muted-foreground">@{profile.handle} <span className="text-xs">(handle cannot be changed)</span></p>
                </div>

                <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground" htmlFor="dn">Display name</label>
                    <input id="dn" value={displayName} onChange={e => setDisplayName(e.target.value)}
                        className="mt-1 w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>

                <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground" htmlFor="bio">Bio</label>
                    <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={3}
                        className="mt-1 w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>

                <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground" htmlFor="cn">Country</label>
                    <input id="cn" value={country} onChange={e => setCountry(e.target.value)}
                        className="mt-1 w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <button type="submit" disabled={saving}
                        className="bg-gradient-gold text-primary-foreground font-semibold px-6 py-2.5 rounded-full shadow-glow disabled:opacity-50">
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                    <button type="button" onClick={signOut}
                        className="text-sm text-muted-foreground hover:text-destructive">Sign out</button>
                </div>
            </form>
        </AppShell>
    );
};

export default Settings;
