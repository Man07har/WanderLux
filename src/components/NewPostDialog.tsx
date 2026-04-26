import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreatePost } from "@/hooks/usePosts";
import { ImagePlus, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

export const NewPostDialog = ({ open, onOpenChange }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const create = useCreatePost();

  const reset = () => {
    setFile(null); setPreview(null); setCaption(""); setLocation(""); setTagsStr("");
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Add a photo first"); return; }
    try {
      const tags = tagsStr.split(/[,\s]+/).filter(Boolean).map(t => t.startsWith("#") ? t : `#${t}`);
      await create.mutateAsync({ file, caption, location, tags });
      toast.success("Posted to your atlas");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't post");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Pin a new moment</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-[4/5] rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors overflow-hidden flex flex-col items-center justify-center text-muted-foreground bg-secondary/40"
          >
            {preview ? (
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImagePlus className="w-10 h-10 mb-2" />
                <span className="text-sm">Click to choose a photo</span>
                <span className="text-xs opacity-60 mt-1">JPG · PNG · WebP · max 10MB</span>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" hidden
              onChange={e => handleFile(e.target.files?.[0] ?? null)} />
          </button>

          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-primary" />
            <input
              type="text" placeholder="Location (e.g. Torres del Paine, Patagonia)"
              value={location} onChange={e => setLocation(e.target.value)}
              className="w-full bg-secondary/60 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <textarea
            placeholder="Tell the story…"
            value={caption} onChange={e => setCaption(e.target.value)}
            rows={3}
            className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
          />

          <input
            type="text" placeholder="Tags: solotravel, hiddengems"
            value={tagsStr} onChange={e => setTagsStr(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />

          <button type="submit" disabled={create.isPending}
            className="w-full bg-gradient-gold text-primary-foreground font-semibold py-3 rounded-xl shadow-glow hover:scale-[1.01] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {create.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Share
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
