"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AvatarWithDecoration } from "@/components/avatar-with-decoration";
import { TierBadge, DEFAULT_TIER } from "@/components/tier-badge";

export default function SettingsPage() {
  const { user, updateUser, checkAuth, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile State
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tierInfo, setTierInfo] = useState<any>(null);
  const [tierLoading, setTierLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setDisplayName(user.display_name || "");
      setEmail(user.email || "");
      setAvatarUrl(user.avatar_url || "");
      fetchTierInfo();
    }
  }, [user, authLoading, router]);

  const fetchTierInfo = async () => {
    try {
      const res = await fetch("/api/user/tier", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTierInfo(data);
      }
    } catch (e) {
      console.error("Failed to fetch tier info:", e);
    } finally {
      setTierLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        // 200KB limit
        setMessage({ type: "error", text: "Image too large. Max 200KB." });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          display_name: displayName,
          email,
          avatar_url: avatarUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      updateUser(data.user);
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setMessage({ type: "success", text: "Password changed successfully" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 relative">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors z-10 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Settings
          </h1>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-2 ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Profile Information
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center sm:flex-row gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 relative">
                      <div className="absolute inset-x-0 -top-1 bottom-1 flex items-center justify-center">
                        <AvatarWithDecoration
                          src={avatarUrl}
                          fallback={user.username.slice(0, 2).toUpperCase()}
                          decorationUrl={user?.decoration_url}
                          size="xl"
                        />
                      </div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div>
                      <h3 className="font-medium text-xl mb-1 flex items-center justify-center sm:justify-start gap-2">
                        {user.username}
                        {!tierLoading && (
                          <TierBadge
                            tierInfo={tierInfo?.tier || DEFAULT_TIER}
                            size="sm"
                          />
                        )}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Changed your look? Upload a new avatar (max 200KB).
                      </p>
                    </div>

                    {!tierLoading && tierInfo && (
                      <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-2 max-w-sm mx-auto sm:mx-0">
                        <div className="flex flex-wrap justify-between items-center text-xs">
                          <span className="text-gray-400">XP Progress</span>
                          <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-purple-400">
                            {tierInfo.progress.current} /{" "}
                            {tierInfo.progress.needed} XP
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${tierInfo.progress.percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${tierInfo.tier.gradient}`}
                          />
                        </div>
                        {tierInfo.next_tier && (
                          <p className="text-[10px] text-gray-500 italic">
                            {tierInfo.progress.needed -
                              tierInfo.progress.current}{" "}
                            XP to {tierInfo.next_tier.name}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors inline-block mt-2"
                    >
                      Upload New Photo
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">
                      Display Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
                        placeholder="Enter display name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-600"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
            {/* Inventory & Web3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Save className="w-5 h-5 text-blue-400 rotate-90" />
                  Inventory
                </h2>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res1 = await fetch("/api/user/decorations/sync", {
                        method: "POST",
                        credentials: "include",
                      });
                      const res2 = await fetch("/api/user/badges/sync", {
                        method: "POST",
                        credentials: "include",
                      });
                      if (res1.ok && res2.ok) {
                        const d1 = await res1.json();
                        const d2 = await res2.json();
                        const totalNew =
                          (d1.newlyAcquired?.length || 0) +
                          (d2.newlyAcquired?.length || 0);
                        setMessage({
                          type: "success",
                          text: `Sync complete! Found ${totalNew} new items.`,
                        });
                        await checkAuth(); // Refresh profile
                      }
                    } catch (e) {
                      setMessage({ type: "error", text: "Sync failed" });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full transition-all flex items-center gap-2"
                >
                  <Loader2
                    className={cn("w-3 h-3", loading && "animate-spin")}
                  />
                  Sync NFTs
                </button>
              </div>

              <div className="space-y-8">
                {/* Decorations */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-4">
                    Avatar Decorations
                  </h3>
                  <DecorationList
                    currentDecoration={user.decoration_url}
                    onEquip={async (id) => {
                      const res = await fetch("/api/user/decorations/equip", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ decorationId: id }),
                      });
                      if (res.ok) {
                        await checkAuth();
                        setMessage({
                          type: "success",
                          text: "Decoration updated!",
                        });
                      }
                    }}
                  />
                </div>

                {/* Badges */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-4">
                    My Badges
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {user.badges && user.badges.length > 0 ? (
                      user.badges.map((badge, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center gap-1 group relative"
                        >
                          <div className="w-12 h-12 rounded-full border border-white/5 p-1 flex items-center justify-center transition-transform group-hover:scale-110">
                            <img
                              src={
                                badge.icon_url.startsWith("/uploads")
                                  ? `/api${badge.icon_url}`
                                  : badge.icon_url
                              }
                              alt={badge.name}
                              className="w-full h-full object-contain rounded-full"
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 max-w-[60px] text-center truncate">
                            {badge.name}
                          </span>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                            {badge.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">
                        No badges earned yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Security */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-pink-400" />
                Security
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-gray-600"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-gray-600"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-gray-600"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 border border-white/5 rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DecorationList({
  currentDecoration,
  onEquip,
}: {
  currentDecoration?: string | null;
  onEquip: (id: number | null) => void;
}) {
  const [decorations, setDecorations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/decorations", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setDecorations(data.decorations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-xs text-gray-500 animate-pulse">
        Loading decorations...
      </div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Unequip option */}
      <div
        onClick={() => onEquip(null)}
        className={cn(
          "relative aspect-square rounded-xl bg-[#2a2a2a] border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group",
          !currentDecoration
            ? "border-purple-500 bg-purple-500/5"
            : "border-white/5 hover:border-white/10",
        )}
      >
        <div className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-gray-500">
          <X className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-medium text-gray-400 group-hover:text-white">
          None
        </span>
      </div>

      {decorations.map((dec) => (
        <div
          key={dec.id}
          onClick={() => onEquip(dec.id)}
          className={cn(
            "relative aspect-square rounded-xl bg-[#2a2a2a] border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group p-2",
            currentDecoration === dec.image_url
              ? "border-purple-500 bg-purple-500/5"
              : "border-white/5 hover:border-white/10",
          )}
        >
          <div className="w-10 h-10 relative flex items-center justify-center scale-[0.8]">
            <AvatarWithDecoration
              decorationUrl={dec.image_url}
              size="sm"
              fallback="U"
              src="https://picsum.photos/seed/comic/150/150"
            />
          </div>
          <span className="text-[10px] font-medium text-gray-400 group-hover:text-white text-center truncate w-full">
            {dec.name}
          </span>
        </div>
      ))}
    </div>
  );
}
