'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Trash2, Edit, Plus, Image as ImageIcon, Award, Sparkles, X } from 'lucide-react';
import { AvatarWithDecoration } from '@/components/avatar-with-decoration';
import { DeleteConfirmModal } from './delete-confirm-modal';

interface Badge {
    id: number;
    name: string;
    description: string | null;
    icon_url: string;
    type: string;
    created_at: string;
}

interface Decoration {
    id: number;
    name: string;
    description: string | null;
    image_url: string;
    type: string;
    created_at: string;
}

function resolveUploadUrl(url: string): string {
    if (url?.startsWith('/uploads/')) return `/api${url}`;
    return url;
}

export default function InventoryManager() {
    const [activeTab, setActiveTab] = useState<'badges' | 'decorations'>('badges');

    return (
        <div className="space-y-6">
            {/* Tab switcher */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'badges' ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <Award className="w-4 h-4" /> Badges
                </button>
                <button
                    onClick={() => setActiveTab('decorations')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'decorations' ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <Sparkles className="w-4 h-4" /> Decorations
                </button>
            </div>

            {activeTab === 'badges' ? <BadgesPanel /> : <DecorationsPanel />}
        </div>
    );
}

// ─── Badges Panel ─────────────────────────────────

function BadgesPanel() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name?: string }>({ open: false, id: null, name: '' });
    const [deleting, setDeleting] = useState(false);

    const fetchBadges = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/badges', { credentials: 'include' });
            const data = await res.json();
            setBadges(data.badges || []);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBadges(); }, [fetchBadges]);

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setDeleting(true);
        try {
            await fetch(`/api/admin/badges/${deleteModal.id}`, { method: 'DELETE', credentials: 'include' });
            setDeleteModal({ open: false, id: null, name: '' });
            fetchBadges();
        } catch { } finally { setDeleting(false); }
    };

    if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading badges...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">All Badges ({badges.length})</h3>
                <button
                    onClick={() => { setEditingBadge(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Badge
                </button>
            </div>

            {showForm && (
                <BadgeForm
                    badge={editingBadge}
                    onSave={() => { setShowForm(false); fetchBadges(); }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {badges.map(badge => (
                    <div key={badge.id} className="bg-[#1e1e1e] rounded-xl border border-white/5 p-3 flex flex-col items-center gap-2 group relative hover:border-amber-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-full p-1 flex items-center justify-center">
                            <img src={resolveUploadUrl(badge.icon_url)} alt={badge.name} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs font-medium text-white text-center truncate w-full">{badge.name}</span>
                        <span className="text-[10px] text-gray-500 capitalize">{badge.type}</span>
                        {badge.description && (
                            <span className="text-[10px] text-gray-600 text-center line-clamp-2">{badge.description}</span>
                        )}
                        {/* Actions */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setEditingBadge(badge); setShowForm(true); }}
                                className="p-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                            >
                                <Edit className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setDeleteModal({ open: true, id: badge.id, name: badge.name })}
                                className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                            <DeleteConfirmModal
                                open={deleteModal.open && deleteModal.id === badge.id}
                                onOpenChange={(open) => setDeleteModal({ open, id: open ? badge.id : null, name: open ? badge.name : '' })}
                                onConfirm={handleDelete}
                                title="Delete Badge?"
                                description={`Are you sure you want to delete "${badge.name}"? Users who earned this badge will lose it.`}
                                isLoading={deleting}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {badges.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No badges yet. Create one!</p>
            )}
        </div>
    );
}

function BadgeForm({ badge, onSave, onCancel }: { badge: Badge | null; onSave: () => void; onCancel: () => void }) {
    const [name, setName] = useState(badge?.name || '');
    const [description, setDescription] = useState(badge?.description || '');
    const [type, setType] = useState(badge?.type || 'achievement');
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [preview, setPreview] = useState(badge ? resolveUploadUrl(badge.icon_url) : '');
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIconFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        if (!badge && !iconFile) return alert('Please upload an icon');

        setSaving(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('type', type);
        if (iconFile) formData.append('icon', iconFile);

        const url = badge ? `/api/admin/badges/${badge.id}` : '/api/admin/badges';
        const method = badge ? 'PUT' : 'POST';

        await fetch(url, { method, body: formData, credentials: 'include' });
        setSaving(false);
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#1e1e1e] rounded-xl border border-amber-500/20 p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-amber-400">{badge ? 'Edit Badge' : 'New Badge'}</h4>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex gap-4">
                {/* Icon upload area */}
                <div
                    onClick={() => fileRef.current?.click()}
                    className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-white/10 hover:border-amber-500/30 flex items-center justify-center cursor-pointer transition-colors bg-[#2a2a2a] overflow-hidden"
                >
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-500">
                            <Upload className="w-5 h-5" />
                            <span className="text-[10px]">Upload</span>
                        </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                <div className="flex-1 space-y-3">
                    <input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Badge name" required
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
                    />
                    <input
                        type="text" value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50"
                    />
                    <select
                        value={type} onChange={e => setType(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    >
                        <option value="achievement">Achievement</option>
                        <option value="regular">Regular</option>
                        <option value="nft">NFT</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : badge ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}

// ─── Decorations Panel ────────────────────────────

function DecorationsPanel() {
    const [decorations, setDecorations] = useState<Decoration[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDeco, setEditingDeco] = useState<Decoration | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name?: string }>({ open: false, id: null, name: '' });
    const [deleting, setDeleting] = useState(false);

    const fetchDecorations = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/decorations', { credentials: 'include' });
            const data = await res.json();
            setDecorations(data.decorations || []);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchDecorations(); }, [fetchDecorations]);

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setDeleting(true);
        try {
            await fetch(`/api/admin/decorations/${deleteModal.id}`, { method: 'DELETE', credentials: 'include' });
            setDeleteModal({ open: false, id: null, name: '' });
            fetchDecorations();
        } catch { } finally { setDeleting(false); }
    };

    if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading decorations...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">All Decorations ({decorations.length})</h3>
                <button
                    onClick={() => { setEditingDeco(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Decoration
                </button>
            </div>

            {showForm && (
                <DecorationForm
                    decoration={editingDeco}
                    onSave={() => { setShowForm(false); fetchDecorations(); }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {decorations.map(deco => (
                    <div key={deco.id} className="bg-[#1e1e1e] rounded-xl border border-white/5 p-3 flex flex-col items-center gap-2 group relative hover:border-purple-500/30 transition-colors">
                        <div className="w-16 h-16 flex items-center justify-center">
                            <AvatarWithDecoration
                                fallback="✨"
                                decorationUrl={deco.image_url.startsWith('css:') ? deco.image_url : resolveUploadUrl(deco.image_url)}
                                size="lg"
                            />
                        </div>
                        <span className="text-xs font-medium text-white text-center truncate w-full">{deco.name}</span>
                        <span className="text-[10px] text-gray-500 capitalize">{deco.type}</span>
                        {deco.image_url.startsWith('css:') && (
                            <span className="text-[9px] text-purple-400/60 font-mono">{deco.image_url}</span>
                        )}
                        {/* Actions */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setEditingDeco(deco); setShowForm(true); }}
                                className="p-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                            >
                                <Edit className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setDeleteModal({ open: true, id: deco.id, name: deco.name })}
                                className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                            <DeleteConfirmModal
                                open={deleteModal.open && deleteModal.id === deco.id}
                                onOpenChange={(open) => setDeleteModal({ open, id: open ? deco.id : null, name: open ? deco.name : '' })}
                                onConfirm={handleDelete}
                                title="Delete Decoration?"
                                description={`Are you sure you want to delete "${deco.name}"? Users who own this decoration will lose it.`}
                                isLoading={deleting}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {decorations.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No decorations yet. Create one!</p>
            )}
        </div>
    );
}

function DecorationForm({ decoration, onSave, onCancel }: { decoration: Decoration | null; onSave: () => void; onCancel: () => void }) {
    const [name, setName] = useState(decoration?.name || '');
    const [description, setDescription] = useState(decoration?.description || '');
    const [type, setType] = useState(decoration?.type || 'regular');
    const [imageUrl, setImageUrl] = useState(decoration?.image_url || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState(decoration && !decoration.image_url.startsWith('css:') ? resolveUploadUrl(decoration.image_url) : '');
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<'upload' | 'css'>(decoration?.image_url?.startsWith('css:') ? 'css' : 'upload');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setSaving(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('type', type);

        if (mode === 'css') {
            formData.append('image_url', imageUrl);
        } else if (imageFile) {
            formData.append('image', imageFile);
        } else if (!decoration) {
            alert('Please upload an image or enter a CSS decoration URL');
            setSaving(false);
            return;
        }

        const url = decoration ? `/api/admin/decorations/${decoration.id}` : '/api/admin/decorations';
        const method = decoration ? 'PUT' : 'POST';

        await fetch(url, { method, body: formData, credentials: 'include' });
        setSaving(false);
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#1e1e1e] rounded-xl border border-purple-500/20 p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-purple-400">{decoration ? 'Edit Decoration' : 'New Decoration'}</h4>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {/* Mode switcher */}
            <div className="flex gap-2">
                <button type="button" onClick={() => setMode('upload')}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${mode === 'upload' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Upload className="w-3 h-3 inline mr-1" /> Upload Image
                </button>
                <button type="button" onClick={() => setMode('css')}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${mode === 'css' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Sparkles className="w-3 h-3 inline mr-1" /> CSS Effect
                </button>
            </div>

            <div className="flex gap-4">
                {mode === 'upload' ? (
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/30 flex items-center justify-center cursor-pointer transition-colors bg-[#2a2a2a] overflow-hidden"
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-gray-500">
                                <ImageIcon className="w-5 h-5" />
                                <span className="text-[10px]">Upload</span>
                            </div>
                        )}
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                ) : (
                    <div className="w-24 h-24 flex-shrink-0 rounded-xl border border-white/10 flex items-center justify-center bg-[#2a2a2a]">
                        <Sparkles className="w-8 h-8 text-purple-500/50" />
                    </div>
                )}

                <div className="flex-1 space-y-3">
                    <input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Decoration name" required
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                    <input
                        type="text" value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                    {mode === 'css' && (
                        <input
                            type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                            placeholder="css:pop-art, css:cyberpunk, etc."
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 font-mono"
                        />
                    )}
                    <select
                        value={type} onChange={e => setType(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="regular">Regular</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="nft">NFT</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : decoration ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}
