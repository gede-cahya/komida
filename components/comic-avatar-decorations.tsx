import React from "react";
import { cn } from "@/lib/utils";

// 1. Pop Art Action
export const PopArtAvatar: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
        {/* Pop Art Outline */}
        <div className="absolute -inset-2 bg-yellow-400 rounded-full border-[3px] border-black border-dashed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-[spin_15s_linear_infinite] pointer-events-none"></div>
        {children}
        {/* Pop Art Text */}
        <div className="absolute -bottom-3 -right-3 bg-red-600 text-white font-black italic text-[0.65rem] px-2 py-0.5 rounded-bl-xl rounded-tr-xl rounded-tl-sm rounded-br-sm border-[2px] border-black rotate-[-10deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 pointer-events-none">
            BAM!
        </div>
    </div>
);

// 2. Manga Speed Lines
export const MangaSpeedAvatar: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
        {/* Speed Lines Background */}
        <div
            className="absolute -inset-[18%] rounded-full border-[2px] border-black z-[-1] pointer-events-none"
            style={{
                background: "repeating-conic-gradient(#000 0% 2%, #fff 2% 4%, #000 4% 5%, #fff 5% 8%)",
                animation: "spin 2s linear infinite"
            }}
        ></div>
        {children}
    </div>
);

// 3. Cyberpunk Mecha
export const CyberpunkAvatar: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
        {/* Hexagon / Mecha Border */}
        <div className="absolute -inset-1.5 rounded-full border-[2px] border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8),inset_0_0_10px_rgba(34,211,238,0.8)] animate-pulse pointer-events-none"></div>

        {/* HUD Elements */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-fuchsia-500 rounded-tl-full pointer-events-none"></div>
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-fuchsia-500 rounded-br-full pointer-events-none"></div>
        <div className="absolute top-1/2 -right-2.5 w-1 h-6 bg-fuchsia-500 rounded-sm shadow-[0_0_8px_rgba(217,70,239,0.8)] -translate-y-1/2 pointer-events-none"></div>

        <div className="relative z-0 filter sepia-[0.2] hue-rotate-180">
            {children}
        </div>
    </div>
);

// 4. Webtoon Panels
export const WebtoonPanelsAvatar: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
        {/* Background Panels */}
        <div className="absolute -top-1.5 -right-1.5 w-[70%] h-[70%] bg-blue-500 border-[1.5px] border-black shadow-[1.5px_1.5px_0_rgba(0,0,0,1)] rotate-12 z-[-1] pointer-events-none"></div>
        <div className="absolute -bottom-1.5 -left-1.5 w-[50%] h-[50%] bg-pink-500 border-[1.5px] border-black shadow-[1.5px_1.5px_0_rgba(0,0,0,1)] -rotate-12 z-[-1] pointer-events-none"></div>

        <div className="relative z-0 border-[2px] border-black object-cover bg-white" style={{ borderRadius: "20% 50% 30% 40%" }}>
            {children}
        </div>
    </div>
);

// 5. Halftone Noir
export const HalftoneNoirAvatar: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={cn("relative flex items-center justify-center grayscale contrast-125 group", className)}>
        {/* Halftone Shadow */}
        <div className="absolute inset-0 rounded-full translate-x-1.5 translate-y-1.5 z-[-1] pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, #000 1.5px, transparent 2px)",
            backgroundSize: "6px 6px"
        }}></div>

        <div className="relative z-0 border-[2px] border-black rounded-full overflow-hidden">
            {children}
        </div>

        {/* Slash detail */}
        <div className="absolute top-1/2 left-1/2 w-[120%] h-[1.5px] bg-white border-y-[0.5px] border-black -translate-x-1/2 -translate-y-1/2 -rotate-45 z-20 mix-blend-difference pointer-events-none"></div>
    </div>
);

export function ComicAvatarDecorations() {
    const avatarUrl = "https://picsum.photos/seed/comic/150/150";

    const previewAvatar = (
        <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
    );

    return (
        <div className="flex flex-col items-center gap-10 p-10 bg-gray-50 dark:bg-zinc-900 min-h-screen font-sans">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-800 dark:text-zinc-100 mb-6 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] dark:drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">
                Koleksi Avatar Dekorasi Komik
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                <div className="flex flex-col items-center gap-4">
                    <PopArtAvatar>{previewAvatar}</PopArtAvatar>
                    <span className="font-bold uppercase tracking-wider text-sm mt-4 text-zinc-700 dark:text-zinc-300">1. Pop Art Action</span>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <MangaSpeedAvatar>{previewAvatar}</MangaSpeedAvatar>
                    <span className="font-bold uppercase tracking-wider text-sm mt-4 text-zinc-700 dark:text-zinc-300">2. Manga Speed Lines</span>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <CyberpunkAvatar>{previewAvatar}</CyberpunkAvatar>
                    <span className="font-bold uppercase tracking-wider text-sm mt-4 text-zinc-700 dark:text-zinc-300">3. Cyberpunk Mecha</span>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <WebtoonPanelsAvatar>{previewAvatar}</WebtoonPanelsAvatar>
                    <span className="font-bold uppercase tracking-wider text-sm mt-4 text-zinc-700 dark:text-zinc-300">4. Webtoon Panels</span>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <HalftoneNoirAvatar>{previewAvatar}</HalftoneNoirAvatar>
                    <span className="font-bold uppercase tracking-wider text-sm mt-4 text-zinc-700 dark:text-zinc-300">5. Halftone Noir</span>
                </div>
            </div>
        </div>
    );
}
