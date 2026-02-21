import { Activity, User } from "lucide-react";
import { TierBadge } from "@/components/tier-badge";

interface ActiveUser {
    id: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    xp: number;
    xp_gained: number;
    actions_count: number;
}

interface TopActiveUsersProps {
    users: ActiveUser[];
    loading: boolean;
}

export function TopActiveUsers({ users, loading }: TopActiveUsersProps) {
    return (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Top 10 Active Users</h3>
                    <p className="text-xs text-gray-400">Most XP gained today</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white/5" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-24 h-4 bg-white/5 rounded" />
                                    <div className="w-16 h-3 bg-white/5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 opacity-50 space-y-3 py-10">
                        <Activity className="w-12 h-12" />
                        <p>No activity recorded today</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map((user, index) => (
                            <div key={user.id} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 text-center font-bold font-mono text-sm ${index < 3 ? 'text-amber-400' : 'text-gray-500'}`}>
                                        #{index + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--muted)] border border-white/5 flex items-center justify-center flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                                            {user.display_name || user.username}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            @{user.username}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm font-bold text-emerald-400">
                                        +{user.xp_gained} <span className="text-[10px] text-emerald-500/50">XP</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        {user.actions_count} actions
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
