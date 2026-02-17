
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface User {
    id: number;
    username: string;
    role: string;
    is_banned: boolean;
}

interface UserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null; // If null, creating new user
}

export function UserDialog({ isOpen, onClose, onSuccess, user }: UserDialogProps) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user',
        is_banned: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username, password: '', role: user.role, is_banned: user.is_banned });
        } else {
            setFormData({ username: '', password: '', role: 'user', is_banned: false });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/users${user ? `/${user.id}` : ''}`;
        const method = user ? 'PUT' : 'POST';

        // Filter out empty password for update
        const payload: any = { ...formData };
        if (user && !payload.password) delete payload.password;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Operation failed');

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-6">{user ? 'Edit User' : 'Add New User'}</h2>

                {error && <div className="bg-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Password {user && <span className="text-gray-500 font-normal">(Leave blank to keep current)</span>}
                        </label>
                        <input
                            type="password"
                            required={!user}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                        <select
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_banned"
                            checked={formData.is_banned}
                            onChange={e => setFormData({ ...formData, is_banned: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
                        />
                        <label htmlFor="is_banned" className="text-sm font-medium text-gray-400">
                            Banned / Suspended
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-white/5 rounded-lg">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {user ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
