
'use client';

import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Announcement {
    id: number;
    content: string;
    type: 'info' | 'warning' | 'success' | 'destructive';
    is_active: boolean;
    image_url?: string;
    admin?: {
        username: string;
        display_name?: string;
        avatar_url?: string;
    };
}

export function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        async function fetchAnnouncement() {
            try {
                const res = await fetch('/api/announcements/active');
                if (res.ok) {
                    const data = await res.json();
                    if (data.announcement) {
                        setAnnouncement(data.announcement);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch announcement:", error);
            }
        }

        fetchAnnouncement();
    }, []);

    if (!announcement || !isVisible) return null;

    const styles = {
        info: "bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-500",
        warning: "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 text-yellow-500",
        success: "bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20 text-green-500",
        destructive: "bg-gradient-to-r from-red-500/10 to-red-500/5 border-red-500/20 text-red-500",
    };

    const icons = {
        info: <Info className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        success: <CheckCircle className="w-5 h-5" />,
        destructive: <AlertOctagon className="w-5 h-5" />,
    };

    return (
        <div className={cn(
            "relative w-full overflow-hidden border-y md:border md:rounded-xl transition-all shadow-lg animate-in slide-in-from-top-2",
            styles[announcement.type] || styles.info
        )}>
            <div className="p-4 flex flex-col md:flex-row gap-4">
                {/* Admin Profile */}
                <div className="flex items-center gap-3 md:w-48 shrink-0">
                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-sm">
                        <AvatarImage src={announcement.admin?.avatar_url} />
                        <AvatarFallback className="bg-primary/20 text-primary uppercase text-xs font-bold">
                            {announcement.admin?.username?.slice(0, 2) || 'AD'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">
                            {announcement.admin?.display_name || announcement.admin?.username || 'Admin'}
                        </span>
                        <span className="text-xs opacity-70 flex items-center gap-1 uppercase tracking-wider font-semibold">
                            {icons[announcement.type]}
                            {announcement.type}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <p className="text-sm md:text-base font-medium leading-relaxed text-foreground/90">
                        {announcement.content}
                    </p>

                    {/* Attached Image */}
                    {announcement.image_url && (
                        <div className="mt-3 relative rounded-lg overflow-hidden border border-white/10 shadow-md max-w-md">
                            <img
                                src={announcement.image_url}
                                alt="Announcement attachment"
                                className="w-full h-auto object-cover max-h-[300px]"
                            />
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4 opacity-60" />
                </button>
            </div>
        </div>
    );
}
