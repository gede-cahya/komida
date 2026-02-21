'use client';

import { Shield, Sparkles } from 'lucide-react';

interface TierInfo {
    tier: number;
    name: string;
    color: string;
    gradient: string;
    minXP: number;
    icon: string;
}

export function TierBadge({ tierInfo, size = 'md' }: { tierInfo: TierInfo | null, size?: 'sm' | 'md' | 'lg' }) {
    if (!tierInfo) return null;

    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-[10px] gap-1',
        md: 'px-2 py-1 text-xs gap-1.5',
        lg: 'px-3 py-1.5 text-sm gap-2'
    };

    const iconSizes = {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm'
    };

    return (
        <div
            className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border border-white/20 shadow-lg ${sizeClasses[size]}`}
            style={{
                background: `linear-gradient(to right, ${tierInfo.color}40, ${tierInfo.color}10)`,
                color: tierInfo.color,
                borderColor: `${tierInfo.color}50`
            }}
            title={`Tier ${tierInfo.tier} - ${tierInfo.name}`}
        >
            <span className={iconSizes[size]}>{tierInfo.icon}</span>
            <span>{tierInfo.name}</span>
            {tierInfo.tier >= 5 && (
                <Sparkles className="w-3 h-3 ml-0.5 animate-pulse" />
            )}
        </div>
    );
}

// Pre-defined defaults in case backend is slow
export const DEFAULT_TIER: TierInfo = {
    tier: 1,
    name: 'Newbie',
    color: '#9CA3AF',
    gradient: 'from-gray-400 to-gray-500',
    minXP: 0,
    icon: '🌱'
};
