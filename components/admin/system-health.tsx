import { Activity, Database, Server, Clock } from "lucide-react";
import { SystemHealth } from "@/types/analytics";

interface SystemHealthProps {
    health: SystemHealth | null;
    loading?: boolean;
}

export function SystemHealthWidget({ health, loading }: SystemHealthProps) {
    if (loading) {
        return (
            <div className="bg-gray-900/50 rounded-xl border border-white/10 p-6 animate-pulse">
                <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 w-full bg-white/5 rounded"></div>
                    <div className="h-4 w-full bg-white/5 rounded"></div>
                    <div className="h-4 w-full bg-white/5 rounded"></div>
                </div>
            </div>
        );
    }

    if (!health) return null;

    const isHealthy = health.status === 'online';

    return (
        <div className="bg-gray-900/50 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className={`w-5 h-5 ${isHealthy ? 'text-green-400' : 'text-red-400'}`} />
                    <h3 className="font-semibold text-white">System Health</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${isHealthy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {health.status.toUpperCase()}
                </span>
            </div>

            <div className="space-y-4">
                {/* Database */}
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Database</span>
                    </div>
                    <div className="text-right">
                        <div className={`text-sm font-medium ${health.database.status === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                            {health.database.status}
                        </div>
                        {health.database.latency && (
                            <div className="text-xs text-gray-500">{health.database.latency} latency</div>
                        )}
                    </div>
                </div>

                {/* Scrapers */}
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <Server className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Scrapers</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-blue-400">
                            {health.scrapers.status}
                        </div>
                        <div className="text-xs text-gray-500">{health.scrapers.message}</div>
                    </div>
                </div>

                {/* Uptime */}
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">Uptime</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-white">
                            {formatUptime(health.uptime)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (parts.length === 0) return '< 1m';

    return parts.join(' ');
}
