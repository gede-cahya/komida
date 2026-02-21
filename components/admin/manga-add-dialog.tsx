"use client";

import { useState } from "react";

import { Search, Loader2, Plus, Download, X, BookOpen } from "lucide-react";

interface MangaAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SearchResult {
  title: string;
  image: string;
  source: string;
  chapter: string;
  rating: number;
  link: string;
}

const SOURCES = [
  { value: "", label: "All Sources", color: "bg-gray-600" },
  { value: "Kiryuu", label: "Kiryuu", color: "bg-blue-600" },
  { value: "ManhwaIndo", label: "ManhwaIndo", color: "bg-green-600" },
  { value: "Softkomik", label: "Softkomik", color: "bg-purple-600" },
  { value: "Keikomik", label: "Keikomik", color: "bg-orange-600" },
];

const SOURCE_BADGE: Record<string, string> = {
  Kiryuu: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  ManhwaIndo: "bg-green-500/20 text-green-300 border border-green-500/30",
  Softkomik: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  Keikomik: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
};

const API_URL = "/api";

export default function MangaAddDialog({
  isOpen,
  onClose,
  onSuccess,
}: MangaAddDialogProps) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch(`${API_URL}/admin/manga/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query, source: source || undefined }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || `Search failed: ${res.status} ${res.statusText}`,
        );
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (manga: SearchResult): Promise<void> => {
    setImporting(manga.link);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/manga/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ source: manga.source, link: manga.link }),
      });

      if (!res.ok) throw new Error("Failed to import");

      setImported((prev) => new Set(prev).add(manga.link));
      onSuccess();
    } catch (err: any) {
      setError("Import failed: " + err.message);
    } finally {
      setImporting(null);
    }
  };

  const badgeClass = (src: string) =>
    SOURCE_BADGE[src] ??
    "bg-gray-500/20 text-gray-300 border border-gray-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            Add New Comic
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/60 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-3">
            {/* Query input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search comic title…"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-9 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            {/* Source select */}
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[140px]"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </form>

          {/* Source pills (quick filter) */}
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSource(s.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  source === s.value
                    ? `${s.color} text-white border-transparent shadow`
                    : "bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 shrink-0" /> {error}
            </p>
          )}
        </div>

        {/* ── Results ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm">Searching external sources…</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-xs text-gray-500 mb-4">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((manga, idx) => {
                  const isImporting = importing === manga.link;
                  const isImported = imported.has(manga.link);

                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 p-4 rounded-xl border transition-colors ${
                        isImported
                          ? "bg-green-900/10 border-green-700/30"
                          : "bg-gray-800/40 border-gray-700/40 hover:border-gray-600"
                      }`}
                    >
                      {/* Cover */}
                      <div className="w-16 h-22 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                        <img
                          src={`/api/image/proxy?url=${encodeURIComponent(manga.image)}&source=${manga.source.toLowerCase()}`}
                          alt={manga.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.png";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3
                            className="font-semibold text-white text-sm leading-snug line-clamp-2"
                            title={manga.title}
                          >
                            {manga.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass(manga.source)}`}
                            >
                              {manga.source}
                            </span>
                            {manga.rating > 0 && (
                              <span className="text-[11px] text-yellow-400">
                                ★ {manga.rating}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 truncate">
                            {manga.chapter}
                          </p>
                        </div>

                        {/* Import button */}
                        <button
                          onClick={() => handleImport(manga)}
                          disabled={isImporting || isImported}
                          className={`mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                            isImported
                              ? "bg-green-600/20 text-green-400 border-green-600/30 cursor-default"
                              : "bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border-blue-600/30"
                          } disabled:opacity-60`}
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                              Importing…
                            </>
                          ) : isImported ? (
                            <>
                              <BookOpen className="w-3.5 h-3.5" /> Imported
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" /> Import to
                              Library
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-600">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">
                Search for a comic to add to your library
              </p>
              <p className="text-xs mt-1 opacity-60">
                Supports: Kiryuu · ManhwaIndo · Softkomik · Keikomik
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
