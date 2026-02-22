
'use client';

import { useState } from 'react';
import { Edit, Trash2, UserPlus, Search, Loader2, CheckCircle, Ban } from 'lucide-react';
import { UserDialog } from './user-dialog';
import { DeleteConfirmModal } from './delete-confirm-modal';
import { useToast } from '@/components/ui/toast';

interface User {
    id: number;
    username: string;
    role: string;
    is_banned: boolean;
    created_at: string;
}

interface UserTableProps {
    users: User[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSearch: (query: string) => void;
    onRefresh: () => void;
}

export function UserTable({ users, loading, page, totalPages, onPageChange, onSearch, onRefresh }: UserTableProps) {
    const [search, setSearch] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [deleting, setDeleting] = useState(false);
    const [banningId, setBanningId] = useState<number | null>(null);
    const { showToast } = useToast();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(search);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        onRefresh();
        setIsDialogOpen(false);
        showToast(selectedUser ? 'User updated successfully!' : 'User created successfully!', 'success');
        setSelectedUser(null);
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/users/${deleteModal.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                onRefresh();
                setDeleteModal({ open: false, id: null });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    const handleBan = async (user: User) => {
        setBanningId(user.id);
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_banned: !user.is_banned }),
                credentials: 'include'
            });
            if (res.ok) onRefresh();
        } catch (error) {
            console.error(error);
        } finally {
            setBanningId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-white/10">
                <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <button
                    onClick={() => { setSelectedUser(null); setIsDialogOpen(true); }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 uppercase text-xs font-semibold text-white">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Created At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">No users found</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">#{user.id}</td>
                                    <td className="px-6 py-4 text-white font-medium">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                                }`}>
                                                {user.role}
                                            </span>
                                            {user.is_banned && (
                                                <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-red-900/50 text-red-200 border border-red-500/50">
                                                    BANNED
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => handleEdit(user)} className="p-2 hover:bg-white/10 rounded-full text-blue-400 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleBan(user)}
                                            disabled={banningId === user.id}
                                            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                                                user.is_banned 
                                                    ? 'text-green-400 hover:bg-green-500/10' 
                                                    : 'text-orange-400 hover:bg-orange-500/10'
                                            }`}
                                            title={user.is_banned ? 'Unban User' : 'Ban User'}
                                        >
                                            {banningId === user.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : user.is_banned ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <Ban className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button onClick={() => setDeleteModal({ open: true, id: user.id })} className="p-2 hover:bg-white/10 rounded-full text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <DeleteConfirmModal
                                            open={deleteModal.open && deleteModal.id === user.id}
                                            onOpenChange={(open) => setDeleteModal({ open, id: open ? user.id : null })}
                                            onConfirm={handleDelete}
                                            title="Delete User?"
                                            description={`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`}
                                            isLoading={deleting}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-10 h-10 rounded-full font-medium transition-colors ${
                                page === p ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20 text-gray-400'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            <UserDialog
                isOpen={isDialogOpen}
                onClose={() => { setIsDialogOpen(false); setSelectedUser(null); }}
                user={selectedUser}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
