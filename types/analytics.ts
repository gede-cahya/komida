
export type TimePeriod = 'day' | 'week' | 'month';

export interface StatsSummary {
    totalManga: number;
    totalViews: number;
    totalVisits: number;
    todayVisits: number;
}

export interface PopularManga {
    slug: string;
    title: string;
    image: string;
    source: string;
    views: number;
}

export interface VisitStat {
    date: string;
    visits: number;
}
