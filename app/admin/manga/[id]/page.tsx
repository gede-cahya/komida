'use client';

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { ArrowLeft, Save, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Chapter {
    title: string;
    slug: string;
    link: string;
    date?: string;
}

interface MangaDetail {
    id: number;
    title: string;
    image: string;
    source: string;
    status: string;
    author: string;
    synopsis: string;
    genres: string; // JSON string or comma separated in DB? Schema says text(JSON)
    chapters: string; // JSON string
    link: string;
}

export default function MangaEditor({ params }: { params: Promise<{ id: string }> }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { id } = use(params);

    const [manga, setManga] = useState<MangaDetail | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [formData, setFormData] = useState<Partial<MangaDetail>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/login');
            } else {
                fetchManga();
            }
        }
    }, [user, isLoading, id]);

    const fetchManga = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/manga/${id}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setManga(data);
                setFormData({
                    title: data.title,
                    image: data.image,
                    status: data.status,
                    author: data.author,
                    synopsis: data.synopsis,
                    genres: data.genres
                });

                try {
                    const parsedChapters = JSON.parse(data.chapters || '[]');
                    setChapters(parsedChapters);
                } catch (e) {
                    console.error("Failed to parse chapters", e);
                    setChapters([]);
                }
            } else {
                alert('Failed to load manga');
                router.push('/admin/dashboard');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/manga/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Manga updated successfully');
                fetchManga(); // Reload to confirm
            } else {
                alert('Failed to update manga');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating manga');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteChapter = async (slug: string) => {
        if (!confirm('Are you sure you want to delete this chapter?')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/manga/${id}/chapter/${encodeURIComponent(slug)}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                // Optimistic update
                setChapters(prev => prev.filter(c => c.slug !== slug));
            } else {
                alert('Failed to delete chapter');
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="text-white p-8">Loading...</div>;
    if (!manga) return <div className="text-white p-8">Manga not found</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-2xl font-bold">Edit Manga</h1>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={manga.link}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Original Source
                        </a>
                        <Button onClick={handleSave} disabled={saving} className="flex gap-2">
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Metadata Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Cover Image Preview */}
                    <div className="md:col-span-1">
                        <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-gray-900 border border-white/10">
                            <img
                                src={formData.image ? `/api/image/proxy?url=${encodeURIComponent(formData.image)}&source=${manga.source}` : '/placeholder.png'}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Title</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Author</label>
                                <input
                                    type="text"
                                    value={formData.author || ''}
                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Status</label>
                                <select
                                    value={formData.status || ''}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                                >
                                    <option value="Ongoing">Ongoing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Hiatus">Hiatus</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Source</label>
                                <input
                                    type="text"
                                    value={manga.source}
                                    disabled
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Image URL</label>
                            <input
                                type="text"
                                value={formData.image || ''}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Synopsis</label>
                            <textarea
                                value={formData.synopsis || ''}
                                onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
                                rows={5}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Chapters List */}
                <div className="bg-gray-900/50 rounded-xl border border-white/10 p-6">
                    <h2 className="text-xl font-bold mb-4">Chapters ({chapters.length})</h2>

                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 uppercase text-xs font-semibold text-white sticky top-0">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Slug</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {chapters.map((chapter) => (
                                    <tr key={chapter.slug} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{chapter.title}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{chapter.slug}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteChapter(chapter.slug)}
                                                className="p-2 hover:bg-red-500/10 rounded-full text-red-400 transition-colors"
                                                title="Delete Chapter"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
