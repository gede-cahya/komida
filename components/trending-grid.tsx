"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, ArrowRight, Flame } from "lucide-react";
import { type TrendingManga } from "@/lib/api";

export interface TrendingGridProps {
  items: TrendingManga[];
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

interface BentoCardProps {
  item: TrendingManga;
  featured?: boolean;
  index?: number;
}

function BentoCard({ item, featured = false, index = 0 }: BentoCardProps) {
  const slug = slugify(item.title);
  const mangaType = item.type ? slugify(item.type) : "manhwa";
  const href = `/${mangaType}/${slug}`;

  return (
    <motion.div
      className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900 group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
    >
      {/* Cover image fills the full container */}
      {item.image ? (
        <Image
          src={`/api/image/proxy?url=${encodeURIComponent(item.image)}&source=${item.source || "kiryuu"}`}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 50vw, 25vw"
          }
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
          <span className="text-4xl">📚</span>
          <span className="text-xs font-medium">No Image</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          featured
            ? "from-black/95 via-black/20 to-transparent"
            : "from-black/95 via-black/30 to-transparent"
        }`}
      />

      {/* Clickable overlay */}
      <Link
        href={href}
        className="absolute inset-0 z-10"
        aria-label={item.title}
      />

      {/* Type badge — top left */}
      {item.type && (
        <span
          className={`absolute top-2 left-2 z-20 font-bold uppercase tracking-wider bg-primary/90 text-white rounded-md shadow-md ${
            featured ? "text-xs px-2 py-1" : "text-[9px] px-1.5 py-0.5"
          }`}
        >
          {item.type}
        </span>
      )}

      {/* Rating badge — top right */}
      <div
        className={`absolute top-2 right-2 z-20 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-full ${
          featured ? "px-2 py-1 gap-1" : "px-1.5 py-0.5"
        }`}
      >
        <Star
          className={`${
            featured ? "w-3.5 h-3.5" : "w-2.5 h-2.5"
          } text-yellow-400 fill-yellow-400`}
        />
        <span
          className={`${
            featured ? "text-xs" : "text-[10px]"
          } text-white font-semibold leading-none`}
        >
          {item.rating}
        </span>
      </div>

      {/* Bottom info */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 ${
          featured ? "p-4 md:p-5" : "p-2.5"
        }`}
      >
        <h3
          className={`text-white font-bold leading-snug line-clamp-2 ${
            featured ? "text-lg md:text-2xl" : "text-[11px] md:text-xs"
          }`}
          style={{
            textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)",
          }}
        >
          {item.title}
        </h3>
        <div
          className={`flex items-center gap-1 ${featured ? "mt-2" : "mt-1"}`}
        >
          <Clock
            className={`${
              featured ? "w-3.5 h-3.5" : "w-2.5 h-2.5"
            } text-gray-300 shrink-0`}
          />
          <span
            className={`${
              featured ? "text-xs" : "text-[9px] md:text-[10px]"
            } text-gray-300 truncate`}
          >
            Ch. {item.chapter}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function TrendingGrid({ items }: TrendingGridProps) {
  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, 5);

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-foreground">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Trending This Week
          </h2>
        </div>
        <button className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group">
          View All{" "}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ── Desktop bento layout ── */}
      {/* Uses flex so each child can explicitly define its own height (no aspect-ratio conflict) */}
      <div className="hidden md:flex gap-4 h-[520px]">
        {/* Featured large card — left half */}
        {displayItems[0] && (
          <div className="w-[48%] xl:w-[45%] flex-shrink-0">
            <BentoCard item={displayItems[0]} featured index={0} />
          </div>
        )}

        {/* Right side — 2 × 2 grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
          {displayItems.slice(1, 5).map((item, idx) => (
            <BentoCard key={item.id} item={item} index={idx + 1} />
          ))}
        </div>
      </div>

      {/* ── Mobile simple 2-column grid ── */}
      {/* Wrapper div controls height via aspect-ratio so BentoCard (h-full) fills it correctly */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {displayItems.map((item, index) => (
          <div key={item.id} className="aspect-[2/3] relative">
            <BentoCard item={item} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
