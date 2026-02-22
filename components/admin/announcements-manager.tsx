'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Info, AlertTriangle, CheckCircle, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteConfirmModal } from './delete-confirm-modal';

interface Announcement {
    id: number;
    content: string;
    type: "info" | "warning" | "success" | "destructive";
    is_active: boolean;
    created_at: string;
}

interface AnnouncementsManagerProps {
    announcements: Announcement[];
    loading: boolean;
    onRefresh: () => void;
}

export function AnnouncementsManager({ announcements, loading, onRefresh }: AnnouncementsManagerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<{ content: string; type: 'info' | 'warning' | 'success' | 'destructive' }>({ content: '', type: 'info' });
    const [saving, setSaving] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [deleting, setDeleting] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'destructive': return <X className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
            case 'success': return 'bg-green-500/10 border-green-500/30 text-green-500';
            case 'destructive': return 'bg-red-500/10 border-red-500/30 text-red-500';
            default: return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingId ? `/api/admin/announcements/${editingId}` : '/api/admin/announcements';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsEditing(false);
                setEditingId(null);
                setFormData({ content: '', type: 'info' });
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to save announcement:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setFormData({ content: announcement.content, type: announcement.type });
        setIsEditing(true);
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/announcements/${deleteModal.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                onRefresh();
                setDeleteModal({ open: false, id: null });
            }
        } catch (error) {
            console.error("Failed to delete announcement:", error);
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/announcements/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus }),
            });

            if (res.ok) onRefresh();
        } catch (error) {
            console.error("Failed to toggle announcement:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Create/Edit Form */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {isEditing ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        {(['info', 'warning', 'success', 'destructive'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                    formData.type === type
                                        ? getTypeStyles(type)
                                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                                }`}
                            >
                                {getTypeIcon(type)}
                                <span className="capitalize">{type}</span>
                            </button>
                        ))}
                    </div>
                    <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Enter announcement content..."
                        className="min-h-[100px] bg-black/50 border-white/10 text-white"
                        required
                    />
                    <div className="flex gap-2">
                        {isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setIsEditing(false); setEditingId(null); setFormData({ content: '', type: 'info' }); }}
                                className="border-white/10 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-primary/80"
                        >
                            {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-card rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : announcements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No announcements found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            announcements.map((announcement) => (
                                <TableRow key={announcement.id}>
                                    <TableCell>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getTypeStyles(announcement.type)}`}>
                                            {getTypeIcon(announcement.type)}
                                            <span className="capitalize text-xs">{announcement.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[400px]">
                                        <div className="line-clamp-2 text-sm">{announcement.content}</div>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                                announcement.is_active
                                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                                            }`}
                                        >
                                            {announcement.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(announcement.created_at), 'MMM d, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(announcement)}
                                                className="hover:bg-white/10"
                                            >
                                                <Edit className="w-4 h-4 text-blue-400" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => setDeleteModal({ open: true, id: announcement.id })}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <DeleteConfirmModal
                                                open={deleteModal.open && deleteModal.id === announcement.id}
                                                onOpenChange={(open) => setDeleteModal({ open, id: open ? announcement.id : null })}
                                                onConfirm={handleDelete}
                                                title="Delete Announcement?"
                                                description={`Are you sure you want to delete this announcement? This action cannot be undone.`}
                                                isLoading={deleting}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
