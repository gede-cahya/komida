
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PopularManga } from '@/types/analytics';
import Image from 'next/image';

interface ComponentProps {
    data: PopularManga[];
    title: string;
}

export function PopularComicsTable({ data, title }: ComponentProps) {
    // Ensure we only show top 10
    const top10 = data.slice(0, 10);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {top10.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                    ) : (
                        top10.map((manga, index) => (
                            <div key={manga.slug || index} className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-6 text-center font-bold text-gray-500 text-sm">
                                    #{index + 1}
                                </div>
                                <div className="relative h-10 w-8 overflow-hidden rounded">
                                    <Image
                                        src={manga.image ? `/api/image/proxy?url=${encodeURIComponent(manga.image)}&source=${manga.source || 'kiryuu'}` : '/placeholder.png'}
                                        alt={manga.title}
                                        fill
                                        className="object-cover"
                                        sizes="32px"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate text-white">
                                        {manga.title}
                                    </p>
                                </div>
                                <div className="text-sm font-medium text-white whitespace-nowrap">
                                    {manga.views.toLocaleString()} views
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
