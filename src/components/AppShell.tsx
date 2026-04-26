import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { NewPostDialog } from "./NewPostDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const AppShell = ({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) => {
    const [composing, setComposing] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const onCreate = () => user ? setComposing(true) : navigate("/auth");

    return (
        <div className="min-h-screen flex w-full">
            <Sidebar onCreate={onCreate} />
            <main className={`flex-1 min-w-0 px-4 sm:px-8 py-6 pb-24 lg:pb-8 ${narrow ? "max-w-4xl mx-auto w-full" : ""}`}>
                {children}
            </main>
            <MobileNav onCreate={onCreate} />
            <NewPostDialog open={composing} onOpenChange={setComposing} />
        </div>
    );
};
