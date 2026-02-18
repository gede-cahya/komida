'use client';

import { Button } from '@/components/ui/button';
import { RefreshCcw, Twitter } from 'lucide-react';

export function MaintenanceActions() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="gap-2">
                <a href="https://twitter.com/komida" target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4" />
                    Check Updates
                </a>
            </Button>
            <Button onClick={() => window.location.reload()} className="gap-2">
                <RefreshCcw className="w-4 h-4" />
                Try Again
            </Button>
        </div>
    );
}
