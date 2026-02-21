"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { PopArtAvatar, MangaSpeedAvatar, CyberpunkAvatar, WebtoonPanelsAvatar, HalftoneNoirAvatar } from "./comic-avatar-decorations";

interface Badge {
    name: string;
    icon_url: string;
}

// Resolve badge icon_url to a proper frontend-accessible URL
function resolveBadgeUrl(url: string): string {
    if (url.startsWith('/uploads/')) {
        return `/api${url}`;
    }
    return url;
}

interface AvatarWithDecorationProps {
    src?: string;
    fallback?: string;
    decorationUrl?: string | null;
    badges?: Badge[];
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeConfig = {
    sm: { avatar: "h-8 w-8", decoration: "scale-125 translate-y-[2px]" },
    md: { avatar: "h-10 w-10", decoration: "scale-125 translate-y-[2px]" },
    lg: { avatar: "h-16 w-16", decoration: "scale-125 translate-y-[4px]" },
    xl: { avatar: "h-24 w-24", decoration: "scale-125 translate-y-[6px]" },
};

export const AvatarWithDecoration: React.FC<AvatarWithDecorationProps> = ({
    src,
    fallback,
    decorationUrl,
    badges,
    size = "md",
    className
}) => {
    const config = sizeConfig[size];

    // Inner avatar element to be potentially wrapped
    const avatarElement = (
        <Avatar className={cn(config.avatar, "relative z-0 overflow-visible")}>
            <AvatarImage src={src} className="rounded-full" />
            <AvatarFallback className="rounded-full">{fallback || "?"}</AvatarFallback>
        </Avatar>
    );

    // Render CSS wrappers if matched
    let content = avatarElement;

    if (decorationUrl?.startsWith("css:")) {
        const type = decorationUrl.split(":")[1];
        switch (type) {
            case "pop-art": content = <PopArtAvatar className={config.avatar}>{avatarElement}</PopArtAvatar>; break;
            case "manga-speed": content = <MangaSpeedAvatar className={config.avatar}>{avatarElement}</MangaSpeedAvatar>; break;
            case "cyberpunk": content = <CyberpunkAvatar className={config.avatar}>{avatarElement}</CyberpunkAvatar>; break;
            case "webtoon": content = <WebtoonPanelsAvatar className={config.avatar}>{avatarElement}</WebtoonPanelsAvatar>; break;
            case "halftone": content = <HalftoneNoirAvatar className={config.avatar}>{avatarElement}</HalftoneNoirAvatar>; break;
            default: break;
        }
    }

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Decoration Overlay (only for image-based decorations) */}
            {decorationUrl && !decorationUrl.startsWith("css:") && (
                <div className={cn(
                    "absolute z-10 pointer-events-none transition-all duration-300",
                    config.decoration
                )}>
                    <img
                        src={decorationUrl}
                        alt="Avatar Decoration"
                        className="w-full h-full object-contain pointer-events-none"
                    />
                </div>
            )}

            {/* Main Avatar (potentially wrapped in CSS component) */}
            {content}

            {/* Badges Display */}
            {badges && badges.length > 0 && (
                <div className="absolute -bottom-1 -right-1 z-20 flex -space-x-1">
                    {badges.slice(0, 3).map((badge, idx) => (
                        <div
                            key={idx}
                            title={badge.name}
                            className="w-4 h-4 rounded-full bg-background border border-border overflow-hidden flex items-center justify-center shadow-sm"
                        >
                            <img src={resolveBadgeUrl(badge.icon_url)} alt={badge.name} className="w-full h-full object-contain" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
