"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Trophy,
  X,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { AvatarWithDecoration } from "@/components/avatar-with-decoration";

interface Quest {
  id: number;
  title: string;
  description: string;
  quest_type: string;
  target_value: number;
  target_genre: string | null;
  reward_type: string;
  reward_badge_id: number | null;
  reward_decoration_id: number | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  badge_name: string | null;
  badge_icon_url: string | null;
  decoration_name: string | null;
  decoration_image_url: string | null;
}

interface Badge {
  id: number;
  name: string;
  icon_url: string;
  type: string;
}

interface Decoration {
  id: number;
  name: string;
  image_url: string;
  type: string;
}

function resolveUrl(url: string): string {
  if (url?.startsWith("/uploads/")) return `/api${url}`;
  return url;
}

interface QuestsManagerProps {
  onRefresh?: () => void;
}

export function QuestsManager({ onRefresh }: QuestsManagerProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questType, setQuestType] = useState("genre_read");
  const [targetValue, setTargetValue] = useState(1);
  const [targetGenre, setTargetGenre] = useState("");
  const [rewardType, setRewardType] = useState("badge");
  const [rewardBadgeId, setRewardBadgeId] = useState<number | undefined>();
  const [rewardDecorationId, setRewardDecorationId] = useState<
    number | undefined
  >();
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quests", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBadges = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/badges", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchDecorations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/decorations", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDecorations(data.decorations || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
    fetchBadges();
    fetchDecorations();
  }, [fetchQuests, fetchBadges, fetchDecorations]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setQuestType("genre_read");
    setTargetValue(1);
    setTargetGenre("");
    setRewardType("badge");
    setRewardBadgeId(undefined);
    setRewardDecorationId(undefined);
    setIsActive(true);
    setStartsAt("");
    setExpiresAt("");
    setEditingQuest(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setTitle(quest.title);
    setDescription(quest.description || "");
    setQuestType(quest.quest_type);
    setTargetValue(quest.target_value);
    setTargetGenre(quest.target_genre || "");
    setRewardType(quest.reward_type);
    setRewardBadgeId(quest.reward_badge_id || undefined);
    setRewardDecorationId(quest.reward_decoration_id || undefined);
    setIsActive(quest.is_active);
    setStartsAt(quest.starts_at ? quest.starts_at.slice(0, 16) : "");
    setExpiresAt(quest.expires_at ? quest.expires_at.slice(0, 16) : "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      description,
      quest_type: questType,
      target_value: targetValue,
      target_genre: questType === "genre_read" ? targetGenre : null,
      reward_type: rewardType,
      reward_badge_id:
        rewardType === "badge" || rewardType === "both"
          ? rewardBadgeId || null
          : null,
      reward_decoration_id:
        rewardType === "decoration" || rewardType === "both"
          ? rewardDecorationId || null
          : null,
      is_active: isActive,
      starts_at: startsAt || null,
      expires_at: expiresAt || null,
    };

    try {
      const url = editingQuest
        ? `/api/admin/quests/${editingQuest.id}`
        : "/api/admin/quests";
      const method = editingQuest ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchQuests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus quest ini?")) return;
    try {
      await fetch(`/api/admin/quests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchQuests();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActive = async (quest: Quest) => {
    try {
      await fetch(`/api/admin/quests/${quest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !quest.is_active }),
        credentials: "include",
      });
      fetchQuests();
    } catch (e) {
      console.error(e);
    }
  };

  // Find selected badge/decoration for preview
  const selectedBadge = badges.find((b) => b.id === rewardBadgeId);
  const selectedDecoration = decorations.find(
    (d) => d.id === rewardDecorationId,
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Quests ({quests.length})
        </h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Quest
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-[#111] border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              {editingQuest ? "Edit Quest" : "Create New Quest"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Quest Type
                </label>
                <select
                  value={questType}
                  onChange={(e) => setQuestType(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                >
                  <option value="genre_read">Genre Read</option>
                  <option value="comics_read">Comics Read (Milestone)</option>
                  <option value="chapters_read">Chapters Read</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  min={1}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                />
              </div>
              {questType === "genre_read" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Target Genre
                  </label>
                  <input
                    type="text"
                    value={targetGenre}
                    onChange={(e) => setTargetGenre(e.target.value)}
                    placeholder="e.g. Isekai, Horror"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Reward Type
                </label>
                <select
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                >
                  <option value="badge">Badge Only</option>
                  <option value="decoration">Decoration Only</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {/* Reward selectors with icon previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(rewardType === "badge" || rewardType === "both") && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Reward Badge
                  </label>
                  <div className="flex gap-2 items-center">
                    {selectedBadge && (
                      <div className="w-8 h-8 rounded-lg bg-[#2a2a2a] border border-white/10 p-1 flex-shrink-0">
                        <img
                          src={resolveUrl(selectedBadge.icon_url)}
                          alt={selectedBadge.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <select
                      value={rewardBadgeId || ""}
                      onChange={(e) =>
                        setRewardBadgeId(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                    >
                      <option value="">Select Badge</option>
                      {badges.map((b) => (
                        <option key={b.id} value={b.id}>
                          🏆 {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Badge icon grid for quick selection */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {badges.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setRewardBadgeId(b.id)}
                          className={`w-10 h-10 rounded-lg border p-1 transition-all ${rewardBadgeId === b.id ? "border-amber-400 bg-amber-500/10 scale-110" : "border-white/10 bg-[#2a2a2a] hover:border-white/30"}`}
                          title={b.name}
                        >
                          <img
                            src={resolveUrl(b.icon_url)}
                            alt={b.name}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(rewardType === "decoration" || rewardType === "both") && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Reward Decoration
                  </label>
                  {/* Selected preview + dropdown */}
                  <div className="flex gap-2 items-center">
                    {selectedDecoration && (
                      <div className="w-10 h-10 relative flex items-center justify-center scale-[0.85] flex-shrink-0">
                        <AvatarWithDecoration
                          src="https://picsum.photos/seed/comic/150/150"
                          fallback="U"
                          decorationUrl={selectedDecoration.image_url}
                          size="sm"
                        />
                      </div>
                    )}
                    <select
                      value={rewardDecorationId || ""}
                      onChange={(e) =>
                        setRewardDecorationId(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                    >
                      <option value="">Select Decoration</option>
                      {decorations.map((d) => (
                        <option key={d.id} value={d.id}>
                          ✨ {d.name} ({d.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Decoration grid — same style as Settings > Inventory */}
                  {decorations.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                      {decorations.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setRewardDecorationId(d.id)}
                          className={`relative aspect-square rounded-xl bg-[#2a2a2a] border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group p-2 ${
                            rewardDecorationId === d.id
                              ? "border-purple-500 bg-purple-500/5"
                              : "border-white/5 hover:border-white/20"
                          }`}
                          title={d.name}
                        >
                          <div className="w-10 h-10 relative flex items-center justify-center scale-[0.8]">
                            <AvatarWithDecoration
                              src="https://picsum.photos/seed/comic/150/150"
                              fallback="U"
                              decorationUrl={d.image_url}
                              size="sm"
                            />
                          </div>
                          <span className="text-[9px] font-medium text-gray-400 group-hover:text-white text-center truncate w-full leading-tight">
                            {d.name}
                          </span>
                          {rewardDecorationId === d.id && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Starts At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-white/20 bg-[#1a1a1a]"
                />
                Active
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingQuest
                    ? "Update Quest"
                    : "Create Quest"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-white/5 text-gray-400 px-6 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quest Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="px-4 py-3 text-left">Quest</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-center">Target</th>
                <th className="px-4 py-3 text-left">Reward</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quests.map((quest) => (
                <tr
                  key={quest.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{quest.title}</p>
                      <p className="text-gray-500 text-xs truncate max-w-xs">
                        {quest.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300">
                      {quest.quest_type}
                      {quest.target_genre && ` (${quest.target_genre})`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-white">
                    {quest.target_value}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {quest.badge_icon_url && (
                        <div className="w-6 h-6 rounded bg-[#2a2a2a] p-0.5 flex-shrink-0">
                          <img
                            src={resolveUrl(quest.badge_icon_url)}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      {quest.decoration_image_url && (
                        <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
                          <div className="w-10 h-10 relative flex items-center justify-center scale-[0.85] rounded-xl bg-[#2a2a2a] border border-white/10 p-1">
                            <AvatarWithDecoration
                              src="https://picsum.photos/seed/comic/150/150"
                              fallback="U"
                              decorationUrl={quest.decoration_image_url}
                              size="sm"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col">
                        {quest.badge_name && (
                          <span className="text-gray-300 text-xs">
                            🏆 {quest.badge_name}
                          </span>
                        )}
                        {quest.decoration_name && (
                          <span className="text-purple-300 text-xs">
                            ✨ {quest.decoration_name}
                          </span>
                        )}
                        {!quest.badge_name && !quest.decoration_name && (
                          <span className="text-gray-500 text-xs">
                            {quest.reward_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(quest)}
                      className="inline-flex items-center gap-1"
                    >
                      {quest.is_active ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-xs">
                          <CheckCircle className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 text-xs">
                          <XCircle className="w-4 h-4" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(quest)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(quest.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {quests.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No quests yet. Create one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
