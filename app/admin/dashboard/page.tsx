
'use client';

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Shield, Users, BookOpen, LogOut, LayoutDashboard, TrendingUp, Eye, BarChart3, List, MessageSquare } from "lucide-react";
import { UserTable } from "@/components/admin/user-table";
import { MangaTable } from "@/components/admin/manga-table";
import { StatsCard } from "@/components/admin/stats-card";
import { VisitorsChart } from "@/components/admin/visitors-chart";
import { PopularComicsTable } from "@/components/admin/popular-comics-table";
import { TimePeriod, StatsSummary, PopularManga, VisitStat, SystemHealth } from "@/types/analytics";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { SystemHealthWidget } from "@/components/admin/system-health";
import { CommentsTable } from "@/components/admin/comments-table";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";
import { Megaphone } from "lucide-react";

type Tab = 'dashboard' | 'users' | 'manga' | 'comments' | 'announcements';

export default function AdminDashboard() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    // Data States
    const [stats, setStats] = useState<StatsSummary | null>(null);
    const [visitStats, setVisitStats] = useState<VisitStat[]>([]);
    const [popularManga, setPopularManga] = useState<PopularManga[]>([]);
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');

    const [users, setUsers] = useState([]);
    const [manga, setManga] = useState([]);
    const [comments, setComments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                router.push('/');
            } else {
                if (activeTab === 'dashboard') {
                    fetchSummary();
                    fetchAnalytics(timePeriod);
                }
                else fetchData();
            }
        }
    }, [user, isLoading, router, activeTab, page, search]);

    // Re-fetch analytics when time period changes
    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchAnalytics(timePeriod);
        }
    }, [timePeriod]);

    const fetchSummary = async () => {
        try {
            const [summaryRes, healthRes] = await Promise.all([
                fetch('/api/admin/stats/summary', { credentials: 'include' }),
                fetch('/api/admin/system/health', { credentials: 'include' })
            ]);

            if (summaryRes.ok) {
                const data = await summaryRes.json();
                setStats(data);
            }
            if (healthRes.ok) {
                const health = await healthRes.json();
                setSystemHealth(health);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async (period: TimePeriod) => {
        try {
            setError(null);
            const [visitsRes, popularRes] = await Promise.all([
                fetch(`/api/admin/stats/visits?period=${period}`, { credentials: 'include' }),
                fetch(`/api/admin/stats/popular?period=${period}`, { credentials: 'include' })
            ]);

            if (visitsRes.ok) {
                setVisitStats(await visitsRes.json());
            } else {
                throw new Error(`Failed to fetch visits: ${visitsRes.statusText}`);
            }

            if (popularRes.ok) {
                setPopularManga(await popularRes.json());
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to load analytics');
        }
    };


    const fetchData = useCallback(async () => {
        setLoadingData(true);
        try {
            const endpoint = activeTab === 'users' ? '/api/admin/users'
                : activeTab === 'manga' ? '/api/admin/manga'
                    : activeTab === 'comments' ? '/api/admin/comments'
                        : '/api/admin/announcements';
            const query = `?page=${page}&limit=10&search=${encodeURIComponent(search)}`;

            const res = await fetch(`${endpoint}${query}`, {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                if (activeTab === 'users') {
                    setUsers(data.users);
                } else if (activeTab === 'manga') {
                    setManga(data.manga);
                } else if (activeTab === 'comments') {
                    setComments(data.comments);
                } else if (activeTab === 'announcements') {
                    setAnnouncements(data.announcements);
                }
                setTotalPages(data.totalPages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingData(false);
        }
    }, [activeTab, page, search]);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setPage(1);
        setSearch('');
    };

    if (isLoading || !user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-10 text-white">
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold">Admin Panel</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => handleTabChange('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => handleTabChange('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        Manage Users
                    </button>
                    <button
                        onClick={() => handleTabChange('manga')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'manga' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        Manage Komik
                    </button>
                    <button
                        onClick={() => handleTabChange('comments')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'comments' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        Comments
                    </button>
                    <button
                        onClick={() => handleTabChange('announcements')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'announcements' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Megaphone className="w-5 h-5" />
                        Announcements
                    </button>
                </nav>

                <div className="pt-6 border-t border-white/10 space-y-2">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors">
                        Go Home
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white capitalize">{activeTab === 'manga' ? 'Manage Komik' : activeTab}</h1>
                        <p className="text-gray-400 text-sm">Overview and management</p>
                    </div>
                    {activeTab === 'dashboard' && (
                        <div className="flex bg-[#111] p-1 rounded-lg border border-white/10">
                            {(['day', 'week', 'month'] as TimePeriod[]).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimePeriod(period)}
                                    className={`px-4 py-1.5 text-sm rounded-md transition-all capitalize ${timePeriod === period
                                        ? 'bg-primary text-white font-medium shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    )}
                </header>

                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
                                {error}
                            </div>
                        )}
                        {/* System Health & Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatsCard
                                    title="Total Titles"
                                    value={stats?.totalManga.toLocaleString() ?? '-'}
                                    icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
                                />
                                <StatsCard
                                    title="Total Visits"
                                    value={stats?.totalVisits.toLocaleString() ?? '-'}
                                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                                />
                                <StatsCard
                                    title="Visits Today"
                                    value={stats?.todayVisits.toLocaleString() ?? '-'}
                                    icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                                />
                                <StatsCard
                                    title="Total Comic Views"
                                    value={stats?.totalViews.toLocaleString() ?? '-'}
                                    icon={<Eye className="h-4 w-4 text-muted-foreground" />}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <SystemHealthWidget health={systemHealth} loading={!systemHealth} />
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <VisitorsChart data={visitStats} title={`Site Visits (${timePeriod})`} />
                            </div>
                            <div className="lg:col-span-1">
                                <PopularComicsTable data={popularManga} title={`Top 10 Comics (${timePeriod})`} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <UserTable
                        users={users}
                        loading={loadingData}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onSearch={setSearch}
                        onRefresh={fetchData}
                    />
                )}

                {activeTab === 'manga' && (
                    <MangaTable
                        manga={manga}
                        loading={loadingData}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onSearch={setSearch}
                        onRefresh={fetchData}
                    />
                )}

                {activeTab === 'comments' && (
                    <CommentsTable
                        comments={comments}
                        loading={loadingData}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        onRefresh={fetchData}
                    />
                )}

                {activeTab === 'announcements' && (
                    <AnnouncementsManager
                        announcements={announcements}
                        loading={loadingData}
                        onRefresh={fetchData}
                    />
                )}
            </main>
        </div>
    );
}

