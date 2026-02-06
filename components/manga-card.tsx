'use client';

import Image from "next/image";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MangaCardProps {
    title: string;
    image: string;
    rating: number;
    chapter: number | string;
    type?: string;
    source?: string;
    link?: string;
    className?: string;
}

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export function MangaCard({ title, image, rating, chapter, type, source, link, className }: MangaCardProps) {
    const slug = slugify(title);
    const mangaType = type ? slugify(type) : 'manhwa';
    // If source and link are present, link to detail page. Otherwise #
    // Simplified URL structure as requested
    const href = `/${mangaType}/${slug}`;

    return (
        <Link href={href} className={cn("group block relative overflow-hidden rounded-xl bg-card", className)}>
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-800 flex items-center justify-center">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                        <span className="text-4xl">📚</span>
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
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
