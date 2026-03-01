"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AvatarWithDecoration } from "@/components/avatar-with-decoration";
import { Zap, Award, Backpack, Check, Star, ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserInventoryItem } from "@/types/payments";

type FilterType = "all" | "decoration" | "badge";

export default function InventoryPage() {
  const { user, updateUser } = useAuth();
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [equippingId, setEquippingId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/inventory", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (item: UserInventoryItem) => {
    if (item.is_equipped) return;

    setEquippingId(item.id);
    try {
      const res = await fetch(`/api/user/inventory/${item.id}/equip`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update user context with new decoration
        if (user) {
          updateUser({
            ...user,
            decoration_url: item.item_type === "decoration" ? item.image_url : user.decoration_url,
          });
        }

        // Refresh inventory
        loadInventory();
      }
    } catch (error) {
      console.error("Failed to equip item:", error);
    } finally {
      setEquippingId(null);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (filter === "all") return true;
    return item.item_type === filter;
  });

  const decorations = filteredInventory.filter((item) => item.item_type === "decoration");
  const badges = filteredInventory.filter((item) => item.item_type === "badge");

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111] py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-12">
            <Backpack className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
            <p className="text-gray-400 mb-6">
              Please log in to view your inventory
            </p>
            <Button
              onClick={() => window.location.href = "/login"}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111] py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <Backpack className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            My Inventory
          </h1>
          <p className="text-lg text-gray-400">
            Manage your avatar decorations and badges
          </p>
        </div>

        {/* User Preview */}
        <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <AvatarWithDecoration
                src={user.avatar_url}
                fallback={user.username?.slice(0, 2).toUpperCase()}
                decorationUrl={user.decoration_url}
                size="xl"
                className="w-32 h-32"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">{user.display_name || user.username}</h2>
              <p className="text-gray-400">@{user.username}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                {user.badges?.slice(0, 5).map((badge, idx) => (
                  <img
                    key={idx}
                    src={badge.icon_url.startsWith("/uploads/") ? `/api${badge.icon_url}` : badge.icon_url}
                    alt={badge.name}
                    className="w-8 h-8 rounded-full bg-white/10 p-1"
                    title={badge.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = "/settings"}
                variant="outline"
              >
                Edit Profile
              </Button>
              <Button
                onClick={() => window.location.href = "/shop"}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Shop
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{inventory.length}</p>
            <p className="text-sm text-gray-400">Total Items</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-pink-400">{decorations.length}</p>
            <p className="text-sm text-gray-400">Decorations</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{badges.length}</p>
            <p className="text-sm text-gray-400">Badges</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">
              {inventory.filter((i) => i.is_equipped).length}
            </p>
            <p className="text-sm text-gray-400">Equipped</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            All Items ({inventory.length})
          </button>
          <button
            onClick={() => setFilter("decoration")}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              filter === "decoration"
                ? "bg-pink-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Zap className="w-4 h-4" />
            Decorations ({decorations.length})
          </button>
          <button
            onClick={() => setFilter("badge")}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              filter === "badge"
                ? "bg-amber-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Award className="w-4 h-4" />
            Badges ({badges.length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading inventory...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInventory.length === 0 && (
          <div className="text-center py-20">
            <Backpack className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              {filter === "all" ? "Your inventory is empty" : `No ${filter}s found`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "Purchase items from the shop to build your collection"
                : "Try a different filter or check out the shop"}
            </p>
            <Button
              onClick={() => window.location.href = "/shop"}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Shop
            </Button>
          </div>
        )}

        {/* Decorations Grid */}
        {!loading && decorations.length > 0 && (filter === "all" || filter === "decoration") && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-pink-400" />
              Decorations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {decorations.map((item) => (
                <div
                  key={item.id}
                  className={`relative bg-[#1a1a1a] border rounded-2xl overflow-hidden transition-all ${
                    item.is_equipped
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                      : "border-white/10 hover:border-pink-500/30"
                  }`}
                >
                  {/* Equipped Badge */}
                  {item.is_equipped && (
                    <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Equipped
                    </div>
                  )}

                  {/* Preview */}
                  <div className="aspect-square bg-gradient-to-br from-pink-900/20 to-purple-900/20 flex items-center justify-center p-8">
                    <AvatarWithDecoration
                      src={user.avatar_url || undefined}
                      fallback="?"
                      decorationUrl={
                        item.image_url.startsWith("css:")
                          ? item.image_url
                          : item.image_url.startsWith("/uploads/")
                          ? `/api${item.image_url}`
                          : item.image_url
                      }
                      size="xl"
                      className="w-full h-full"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-xs text-gray-500">
                        Acquired: {new Date(item.acquired_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400 capitalize">
                        {item.acquired_via}
                      </span>
                    </div>
                    {!item.is_equipped && (
                      <Button
                        onClick={() => handleEquip(item)}
                        disabled={equippingId === item.id}
                        className="w-full bg-pink-600 hover:bg-pink-500"
                      >
                        {equippingId === item.id ? "Equipping..." : "Equip"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Badges Grid */}
        {!loading && badges.length > 0 && (filter === "all" || filter === "badge") && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map((item) => (
                <div
                  key={item.id}
                  className={`relative bg-[#1a1a1a] border rounded-2xl p-6 text-center transition-all ${
                    item.is_equipped
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                      : "border-white/10 hover:border-amber-500/30"
                  }`}
                >
                  {/* Equipped Badge */}
                  {item.is_equipped && (
                    <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Equipped
                    </div>
                  )}

                  {/* Badge Icon */}
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center p-2">
                    <img
                      src={
                        item.image_url.startsWith("/uploads/")
                          ? `/api${item.image_url}`
                          : item.image_url
                      }
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(item.acquired_at).toLocaleDateString()}
                    </p>
                    {!item.is_equipped && (
                      <Button
                        onClick={() => handleEquip(item)}
                        disabled={equippingId === item.id}
                        className="w-full bg-amber-600 hover:bg-amber-500 mt-2"
                      >
                        {equippingId === item.id ? "Equipping..." : "Equip"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
