"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface Badge {
    name: string;
    icon_url: string;
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

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Decoration Overlay */}
            {decorationUrl && (
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

            {/* Main Avatar */}
            <Avatar className={cn(config.avatar, "relative z-0 overflow-visible")}>
                <AvatarImage src={src} className="rounded-full" />
                <AvatarFallback className="rounded-full">{fallback || "?"}</AvatarFallback>
            </Avatar>

            {/* Badges Display (Top right or Bottom right?) */}
            {badges && badges.length > 0 && (
                <div className="absolute -bottom-1 -right-1 z-20 flex -space-x-1">
                    {badges.slice(0, 3).map((badge, idx) => (
                        <div
                            key={idx}
                            title={badge.name}
                            className="w-4 h-4 rounded-full bg-background border border-border overflow-hidden flex items-center justify-center shadow-sm"
                        >
                            <img src={badge.icon_url} alt={badge.name} className="w-full h-full object-contain" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
