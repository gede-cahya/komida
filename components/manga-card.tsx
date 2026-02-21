"use client";

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
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function MangaCard({
  title,
  image,
  rating,
  chapter,
  type,
  source,
  className,
}: MangaCardProps) {
  const slug = slugify(title);
  const mangaType = type ? slugify(type) : "manhwa";
  const href = `/${mangaType}/${slug}`;

  return (
    <Link href={href} className={cn("group block", className)}>
      {/* Inner card — owns aspect ratio & rounded clipping */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-900">
        {/* Cover image */}
        {image ? (
          <Image
            src={`/api/image/proxy?url=${encodeURIComponent(image)}&source=${source || "kiryuu"}`}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
            <span className="text-4xl">📚</span>
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}

        {/* Gradient overlay — strong at bottom for title legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* Type badge — top left */}
        {type && (
          <span className="absolute top-2 left-2 z-10 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-primary/90 text-white rounded-md shadow-md">
            {type}
          </span>
        )}

        {/* Rating badge — top right */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] text-white font-semibold leading-none">
            {rating}
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
          <h3
            className="text-white font-bold text-[11px] md:text-xs leading-snug line-clamp-2"
            style={{
              textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)",
            }}
          >
            {title}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-2.5 h-2.5 text-gray-300 shrink-0" />
            <span className="text-[9px] md:text-[10px] text-gray-300 truncate">
              Ch. {chapter}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
