
import React from 'react';
import Link from 'next/link';
import { Hammer } from 'lucide-react';
// Button moved to client component
import { MaintenanceActions } from '@/components/maintenance-actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Under Maintenance | Komida',
    description: 'Komida is currently undergoing scheduled maintenance. We will be back shortly.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">

                {/* Icon Animation */}
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse blur-xl"></div>
                    <div className="relative bg-card p-6 rounded-full border border-border shadow-2xl">
                        <Hammer className="w-16 h-16 text-primary animate-bounce-slow" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
                        We'll be back soon!
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Sorry for the inconvenience but we're performing some maintenance at the moment.
                        We'll be back online shortly!
                    </p>
                </div>

                {/* Status Box */}
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">System Status</span>
                        <span className="flex items-center text-yellow-500 text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
                            Maintenance Mode
                        </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/3 animate-progress-indeterminate"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-left">
                        Estimated completion: Coming Soon
                    </p>
                </div>

                {/* Actions */}
                <MaintenanceActions />

                {/* Footer */}
                <div className="pt-8 text-sm text-muted-foreground">
                    <p>&mdash; The Komida Team &mdash;</p>
                </div>
            </div>
        </div>
    );
}
