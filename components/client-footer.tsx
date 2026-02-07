
'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';

export function ClientFooter() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return null;
    }

    return <Footer />;
}
