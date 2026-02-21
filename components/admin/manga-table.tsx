"use client";

import { useState } from "react";
import {
  Trash2,
  Search,
  Plus,
  RefreshCw,
  Filter,
  RotateCcw,
} from "lucide-react";
import MangaAddDialog from "./manga-add-dialog";

interface Manga {
  id: number;
  title: string;
  image: string;
  source: string;
  chapter: string;
  last_updated: string;
}

interface MangaTableProps {
  manga: Manga[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onSourceFilter: (source: string) => void;
  onRefresh: () => void;
  sourceFilter: string;
}

const SOURCES = [
  { value: "", label: "All Sources", dot: "bg-gray-400" },
  { value: "Kiryuu", label: "Kiryuu", dot: "bg-blue-500" },
  { value: "ManhwaIndo", label: "ManhwaIndo", dot: "bg-green-500" },
  { value: "Softkomik", label: "Softkomik", dot: "bg-purple-500" },
  { value: "Keikomik", label: "Keikomik", dot: "bg-orange-500" },
];

const SOURCE_BADGE: Record<string, string> = {
  Kiryuu: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  ManhwaIndo: "bg-green-500/15 text-green-300 border border-green-500/30",
  Softkomik: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  Keikomik: "bg-orange-500/15 text-orange-300 border border-orange-500/30",
};

function sourceBadge(source: string) {
  return (
    SOURCE_BADGE[source] ??
    "bg-gray-500/15 text-gray-300 border border-gray-500/30"
  );
}

export function MangaTable({
  manga,
  loading,
  page,
  totalPages,
  onPageChange,
  onSearch,
  onSourceFilter,
  onRefresh,
  sourceFilter,
}: MangaTableProps) {
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAdd] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updatingSource, setUpdatingSource] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* ── search ── */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  /* ── delete ── */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this manga? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/manga/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) onRefresh();
      else alert("Failed to delete manga");
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── update-all ── */
  const handleUpdateAll = async () => {
    if (
      !confirm(
        "Update ALL manga from all sources? This runs in the background.",
      )
    )
      return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/manga/update-all", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) alert("Update started in background!");
      else alert("Failed to start update");
    } catch (err) {
      console.error(err);
      alert("Error starting update");
    } finally {
      setUpdating(false);
    }
  };

  /* ── update-source ── */
  const handleUpdateSource = async () => {
    if (!sourceFilter) return;
    if (
      !confirm(
        `Update all manga from "${sourceFilter}"? This runs in the background.`,
      )
    )
      return;
    setUpdatingSource(true);
    try {
      const res = await fetch("/api/admin/manga/update-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ source: sourceFilter }),
      });
      if (res.ok) alert(`Update started for "${sourceFilter}" in background!`);
      else alert("Failed to start update");
    } catch (err) {
      console.error(err);
      alert("Error starting source update");
    } finally {
      setUpdatingSource(false);
    }
  };

  /* ── image proxy ── */
  const proxyImage = (url: string, source: string) =>
    url
      ? `/api/image/proxy?url=${encodeURIComponent(url)}&source=${source.toLowerCase()}`
      : "";

  /* ─────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-white/10">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="relative min-w-[180px] flex-1 max-w-sm"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search manga…"
            className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Source filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {SOURCES.map((s) => (
            <button
              key={s.value}
              onClick={() => onSourceFilter(s.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                sourceFilter === s.value
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0 flex-wrap">
          {sourceFilter && (
            <button
              onClick={handleUpdateSource}
              disabled={updatingSource}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              title={`Refresh all manga from ${sourceFilter}`}
            >
              <RotateCcw
                className={`w-4 h-4 ${updatingSource ? "animate-spin" : ""}`}
              />
              {updatingSource ? "Refreshing…" : `Refresh ${sourceFilter}`}
            </button>
          )}
          <button
            onClick={handleUpdateAll}
            disabled={updating}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <RefreshCw
              className={`w-4 h-4 ${updating ? "animate-spin" : ""}`}
            />
            {updating ? "Updating…" : "Update All"}
          </button>
          <button
            onClick={() => setIsAdd(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Komik
          </button>
        </div>
      </div>

      {/* ── Active source indicator ── */}
      {sourceFilter && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Showing source:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sourceBadge(sourceFilter)}`}
          >
            {sourceFilter}
          </span>
          <button
            onClick={() => onSourceFilter("")}
            className="text-xs text-gray-500 hover:text-white underline transition-colors ml-1"
          >
            clear
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 uppercase text-[11px] font-semibold text-gray-300 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Cover</th>
                <th className="px-4 py-3.5">Title</th>
                <th className="px-4 py-3.5">Source</th>
                <th className="px-4 py-3.5">Last Chapter</th>
                <th className="px-4 py-3.5">Updated</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading…
                    </div>
                  </td>
                </tr>
              ) : manga.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    {sourceFilter
                      ? `No manga found for source "${sourceFilter}"`
                      : "No manga found"}
                  </td>
                </tr>
              ) : (
                manga.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    {/* Cover */}
                    <td className="px-4 py-3">
                      <div className="relative w-9 h-13 rounded-md overflow-hidden bg-gray-800 shrink-0">
                        {item.image && (
                          <img
                            src={proxyImage(item.image, item.source)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            style={{ aspectRatio: "2/3" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 max-w-xs">
                      <span
                        className="text-white font-medium text-sm line-clamp-2 leading-snug"
                        title={item.title}
                      >
                        {item.title}
                      </span>
                    </td>

                    {/* Source badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${sourceBadge(item.source)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            SOURCES.find((s) => s.value === item.source)?.dot ??
                            "bg-gray-400"
                          }`}
                        />
                        {item.source}
                      </span>
                    </td>

                    {/* Chapter */}
                    <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                      {item.chapter}
                    </td>

                    {/* Updated */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(item.last_updated).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                        title="Delete from database"
                      >
                        {deletingId === item.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-1">
        <span>
          Page <span className="text-white font-medium">{page}</span> of{" "}
          <span className="text-white font-medium">{totalPages}</span>
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-4 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
          >
            ← Prev
          </button>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => onPageChange(page + 1)}
            className="px-4 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
          >
            Next →
          </button>
        </div>
      </div>

      {/* ── Add dialog ── */}
      <MangaAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAdd(false)}
        onSuccess={() => {
          setIsAdd(false);
          onRefresh();
        }}
      />
    </div>
  );
}
