import { ComicAvatarDecorations } from "@/components/comic-avatar-decorations";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Comic Avatar Demo",
    description: "Demonstration of 5 comic-themed CSS avatar decorations.",
};

export default function AvatarDemoPage() {
    return (
        <main>
            <ComicAvatarDecorations />
        </main>
    );
}
