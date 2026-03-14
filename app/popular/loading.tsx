import { PopularPageSkeleton } from '@/components/skeletons';

export default function Loading() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-24">
                <PopularPageSkeleton />
            </div>
        </main>
    );
}
