import { AppShell } from "@/components/AppShell";
import { useParams, useNavigate } from "react-router-dom";
import { usePost } from "@/hooks/useDiscovery";
import { PostCard } from "@/components/PostCard";
import { ArrowLeft, Loader2 } from "lucide-react";

const PostDetail = () => {
    const { id } = useParams();
    const { data, isLoading } = usePost(id);
    const navigate = useNavigate();

    return (
        <AppShell narrow>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : !data ? (
                <p className="text-center text-muted-foreground py-20">Post not found.</p>
            ) : (
                <div className="max-w-xl mx-auto">
                    <PostCard post={data as any} index={0} />
                </div>
            )}
        </AppShell>
    );
};

export default PostDetail;
