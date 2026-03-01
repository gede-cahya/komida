"use client";

import React from "react";
import { ShopItemCard } from "./shop-item-card";
import type { ShopItem } from "@/types/payments";
import { ShoppingBag, TrendingUp, Zap, Coins } from "lucide-react";

interface ShopGridProps {
  items: ShopItem[];
  userCredits?: number;
  ownedItemIds?: number[];
  onPurchase: (item: ShopItem) => void;
  onTopUp: () => void;
  filter?: "all" | "decorations" | "badges" | "credit_packs";
  userAvatar?: string | null;
}

export function ShopGrid({
  items,
  userCredits = 0,
  ownedItemIds = [],
  onPurchase,
  onTopUp,
  filter = "all",
  userAvatar = null,
}: ShopGridProps) {
  // Filter items based on category
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "decorations") return item.item_type === "decoration";
    if (filter === "badges") return item.item_type === "badge";
    if (filter === "credit_packs") return item.item_type === "credit_pack";
    return true;
  });

  // Separate credit packs from other items
  const creditPacks = filteredItems.filter((item) => item.item_type === "credit_pack");
  const otherItems = filteredItems.filter((item) => item.item_type !== "credit_pack");

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-400">No items found</h3>
        <p className="text-gray-500 mt-2">Check back later for new items!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Credit Packs Section */}
      {filter === "all" && creditPacks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Credit Packs</h2>
              <p className="text-sm text-gray-400">Top up your credits to purchase items</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPacks.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                userCredits={userCredits}
                owned={ownedItemIds.includes(item.id)}
                onPurchase={onPurchase}
                onTopUp={onTopUp}
                userAvatar={userAvatar}
              />
            ))}
          </div>
        </section>
      )}

      {/* Decorations & Badges Section */}
      {otherItems.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {filter === "decorations" ? "Decorations" : 
                 filter === "badges" ? "Badges" : "Decorations & Badges"}
              </h2>
              <p className="text-sm text-gray-400">
                {otherItems.length} items available
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                userCredits={userCredits}
                owned={ownedItemIds.includes(item.id)}
                onPurchase={onPurchase}
                onTopUp={onTopUp}
                userAvatar={userAvatar}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
