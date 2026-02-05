'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MangaCardProps {
    title: string;
    image: string;
    rating: number;
    chapter: number;
    type?: string;
    className?: string;
}

export function MangaCard({ title, image, rating, chapter, type, className }: MangaCardProps) {
    return (
        <Link href="#" className={cn("group block relative overflow-hidden rounded-xl bg-card", className)}>
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Badges */}
                {type && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-white rounded-md shadow-lg">
                        {type}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2 md:line-clamp-1 group-hover:line-clamp-none transition-all">
                    {title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-300 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Ch. {chapter}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
