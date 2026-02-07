
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PopularManga } from '@/types/analytics';
import Image from 'next/image';

interface ComponentProps {
    data: PopularManga[];
    title: string;
}

export function PopularComicsTable({ data, title }: ComponentProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No data available for this period.</p>
                    ) : (data.map((manga, index) => (
                        <div key={manga.slug} className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-8 text-center font-bold text-gray-500">
                                #{index + 1}
                            </div>
                            <div className="relative h-12 w-8 overflow-hidden rounded">
                                <Image
                                    src={manga.image || '/placeholder.png'}
                                    alt={manga.title}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-none truncate text-white">
                                    {manga.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                    {manga.source}
                                </p>
                            </div>
                            <div className="text-sm font-medium text-white">
                                {manga.views.toLocaleString()} <span className="text-xs text-gray-500 font-normal">views</span>
                            </div>
                        </div>
                    )))}
                </div>
            </CardContent>
        </Card>
    );
}
