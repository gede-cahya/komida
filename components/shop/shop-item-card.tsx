"use client";

import React from "react";
import { ShoppingCart, Zap, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ShopItem } from "@/types/payments";
import { formatIDR, formatCredits } from "@/lib/payments";
import {
  PopArtAvatar,
  MangaSpeedAvatar,
  CyberpunkAvatar,
  WebtoonPanelsAvatar,
  HalftoneNoirAvatar,
} from "@/components/comic-avatar-decorations";

interface ShopItemCardProps {
  item: ShopItem;
  userCredits?: number;
  owned?: boolean;
  onPurchase: (item: ShopItem) => void;
  onTopUp: () => void;
  userAvatar?: string | null;
}

const decorationThemes = {
  "css:pop-art": {
    bg: "bg-[#fff1d0]",
    accent: "text-[#ff6b6b]",
  },
  "css:manga-speed": {
    bg: "bg-[#f8f8f8]",
    accent: "text-[#ff4757]",
  },
  "css:cyberpunk": {
    bg: "bg-[#0a0a1a]",
    accent: "text-[#22d3ee]",
  },
  "css:webtoon": {
    bg: "bg-[#fefefe]",
    accent: "text-[#3b82f6]",
  },
  "css:halftone": {
    bg: "bg-[#1a1a1a]",
    accent: "text-[#888]",
  }
};

function DecorationPreview({ imageUrl, userAvatar }: { imageUrl: string; userAvatar?: string | null }) {
  const type = imageUrl.replace("css:", "");
  const avatarSrc = userAvatar || "/logo.png";
  const fallback = userAvatar ? "U" : "K";
  
  const avatarElement = (
    <Avatar className="w-20 h-20">
      <AvatarImage src={avatarSrc} className="w-full h-full object-cover" />
      <AvatarFallback className="rounded-full bg-purple-500 text-white text-xl">{fallback}</AvatarFallback>
    </Avatar>
  );

  switch (type) {
    case "pop-art":
      return <PopArtAvatar className="w-28 h-28">{avatarElement}</PopArtAvatar>;
    case "manga-speed":
      return <MangaSpeedAvatar className="w-28 h-28">{avatarElement}</MangaSpeedAvatar>;
    case "cyberpunk":
      return <CyberpunkAvatar className="w-28 h-28">{avatarElement}</CyberpunkAvatar>;
    case "webtoon":
      return <WebtoonPanelsAvatar className="w-28 h-28">{avatarElement}</WebtoonPanelsAvatar>;
    case "halftone":
      return <HalftoneNoirAvatar className="w-28 h-28">{avatarElement}</HalftoneNoirAvatar>;
    default:
      return avatarElement;
  }
}

export function ShopItemCard({
  item,
  userCredits = 0,
  owned = false,
  onPurchase,
  onTopUp,
  userAvatar = null,
}: ShopItemCardProps) {
  const canAfford = userCredits >= item.price_credits;
  const isCreditPack = item.item_type === "credit_pack";
  
  const isDecoration = item.item_type === "decoration" && item.image_url?.startsWith("css:");
  const theme = isDecoration ? decorationThemes[item.image_url as keyof typeof decorationThemes] : null;

  const handleBuy = () => {
    if (owned) return;
    if (isCreditPack) {
      onTopUp();
    } else {
      onPurchase(item);
    }
  };

  return (
    <div className="group relative bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl">
      {/* Popular Badge */}
      {item.id === 102 && (
        <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
          <Sparkles className="w-3 h-3" />
          BEST VALUE
        </div>
      )}

      {/* Owned Badge */}
      {owned && (
        <div className="absolute top-3 left-3 z-20 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          OWNED
        </div>
      )}

      {/* Decoration Preview Area */}
      {isDecoration && theme ? (
        <div className={`relative aspect-square ${theme.bg} overflow-hidden flex items-center justify-center p-4`}>
          {/* Decoration Frame with Avatar */}
          <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
            <DecorationPreview imageUrl={item.image_url || ""} userAvatar={userAvatar} />
          </div>
        </div>
      ) : (
        /* Credit Pack Preview */
        <div className="relative aspect-square bg-gradient-to-br from-amber-900/30 to-yellow-900/30 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.2),transparent_70%)]"></div>
          <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <Coins className="w-12 h-12 text-white" />
          </div>
          {item.id === 102 && (
            <div className="absolute bottom-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              +50 BONUS
            </div>
          )}
        </div>
      )}

      {/* Item Info */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-white text-lg truncate group-hover:text-purple-400 transition-colors">
            {item.name}
          </h3>
        </div>

        {/* Price */}
        <div className="space-y-2">
          {isCreditPack ? (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-amber-400 text-lg">
                  {item.name.includes("100") && "100"}
                  {item.name.includes("550") && "550"}
                  {item.name.includes("1000") && "1,000"}
                  {item.name.includes("5000") && "5,000"}
                </span>
                <span className="text-gray-400 text-sm ml-1">Credits</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <span className="font-bold text-purple-400 text-lg">
                {formatCredits(item.price_credits)} Credits
              </span>
            </div>
          )}

          {/* Alternative prices */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">
              {formatIDR(item.price_qris)}
            </span>
            <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">
              {(parseInt(item.price_crypto) / 1e18).toFixed(4)} ETH
            </span>
          </div>
        </div>

        {/* Buy Button */}
        <Button
          onClick={handleBuy}
          disabled={owned || (!canAfford && !isCreditPack)}
          className={`
            w-full py-3 rounded-xl font-bold transition-all
            ${owned
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : isCreditPack
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            }
          `}
        >
          {owned ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Owned
            </span>
          ) : isCreditPack ? (
            <span className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Top Up
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Buy
            </span>
          )}
        </Button>

        {/* Can afford indicator */}
        {!isCreditPack && !owned && userCredits > 0 && (
          <div className={`text-xs text-center ${canAfford ? "text-emerald-400" : "text-red-400"}`}>
            {canAfford ? "✓ You can afford!" : `Need ${(item.price_credits - userCredits).toLocaleString()} more`}
          </div>
        )}
      </div>
    </div>
  );
}
