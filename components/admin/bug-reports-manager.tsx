'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteConfirmModal } from './delete-confirm-modal';

export interface BugReport {
    id: number;
    title: string;
    description: string;
    steps: string;
    page_url: string;
    email: string;
    status: 'pending' | 'resolved';
    created_at: string;
}

interface BugReportsManagerProps {
    reports: BugReport[];
    loading: boolean;
    onRefresh: () => void;
}

export function BugReportsManager({ reports, loading, onRefresh }: BugReportsManagerProps) {
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [deleting, setDeleting] = useState(false);

    const filteredReports = reports.filter(report => {
        if (filter === 'all') return true;
        return report.status === filter;
    });

    const handleStatusChange = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
        try {
            const res = await fetch(`/api/admin/bug-reports/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/bug-reports/${deleteModal.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                onRefresh();
                setDeleteModal({ open: false, id: null });
            }
        } catch (error) {
            console.error("Failed to delete report:", error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    {(['all', 'pending', 'resolved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Resolved'}
                        </button>
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">
                    {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* List */}
            <div className="bg-card rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : filteredReports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No bug reports found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium max-w-[200px]">
                                        <div className="truncate">{report.title}</div>
                                        {report.email && (
                                            <div className="text-xs text-muted-foreground truncate">
                                                {report.email}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[300px]">
                                        <div className="text-sm text-muted-foreground">
                                            <div className="line-clamp-2">{report.description}</div>
                                            {report.steps && (
                                                <details className="mt-2">
                                                    <summary className="text-xs cursor-pointer text-primary hover:underline">
                                                        View steps
                                                    </summary>
                                                    <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                                                        {report.steps}
                                                    </pre>
                                                </details>
                                            )}
                                            {report.page_url && (
                                                <a
                                                    href={report.page_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    {report.page_url}
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => handleStatusChange(report.id, report.status)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                                report.status === 'resolved'
                                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                            }`}
                                        >
                                            {report.status === 'resolved' ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    Resolved
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-3 h-3" />
                                                    Pending
                                                </>
                                            )}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => setDeleteModal({ open: true, id: report.id })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <DeleteConfirmModal
                                            open={deleteModal.open && deleteModal.id === report.id}
                                            onOpenChange={(open) => setDeleteModal({ open, id: open ? report.id : null })}
                                            onConfirm={handleDelete}
                                            title="Delete Bug Report?"
                                            description={`Are you sure you want to delete "${report.title}"? This action cannot be undone.`}
                                            isLoading={deleting}
                                        />
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
