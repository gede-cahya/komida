
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CheckCircle, XCircle, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { format } from 'date-fns';

export interface Announcement {
    id: number;
    content: string;
    type: 'info' | 'warning' | 'success' | 'destructive';
    is_active: boolean;
    created_at: string;
}

interface AnnouncementsManagerProps {
    announcements: Announcement[];
    loading: boolean;
    onRefresh: () => void;
}

export function AnnouncementsManager({ announcements, loading, onRefresh }: AnnouncementsManagerProps) {
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState<'info' | 'warning' | 'success' | 'destructive'>('info');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContent.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent, type: newType, image_url: newImageUrl }),
            });

            if (res.ok) {
                setNewContent('');
                setNewImageUrl('');
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to create announcement:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/announcements/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus }),
            });

            if (res.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };

    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (deleteConfirm === id) {
            try {
                const res = await fetch(`/api/admin/announcements/${id}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    onRefresh();
                    setDeleteConfirm(null);
                }
            } catch (error) {
                console.error("Failed to delete announcement:", error);
            }
        } else {
            setDeleteConfirm(id);
            // Auto-reset after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'destructive': return <AlertOctagon className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Create New */}
            <div className="bg-card p-4 rounded-lg border shadow-sm space-y-4">
                <h3 className="font-semibold text-lg">Create Announcement</h3>
                <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Announcement content..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            required
                        />
                        <Input
                            placeholder="Image URL (optional)..."
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                        />
                        {newImageUrl && (
                            <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                                <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                            </div>
                        )}
                    </div>
                    <div className="w-[150px]">
                        <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="destructive">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={isCreating}>
                        {isCreating ? 'Posting...' : 'Post'}
                    </Button>
                </form>
            </div>

            {/* List */}
            <div className="bg-card rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Type</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                                        <div className="flex items-center justify-center">
                                            {getTypeIcon(announcement.type)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{announcement.content}</TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${announcement.is_active
                                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                }`}
                                        >
                                            {announcement.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(announcement.id)}
                                        >
                                            {deleteConfirm === announcement.id ? (
                                                <span className="text-xs font-bold">Confirm</span>
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
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
