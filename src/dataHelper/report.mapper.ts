import type {
    RawRatingsReport,
    RawRatingsReportItem,
    RatingsReportViewModel,
    RatingsReportItemViewModel,
    TrendChartDataPoint,
    StarDistributionPoint,
    StatusDistributionPoint,
    TypeDistributionPoint,
} from './report.dataHelper';
import { toNumberSafe } from '@/utils/safeConverters';

/**
 * Format ISO Date string to "DD/MM/YYYY"
 */
export const formatDate = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return '';
    }
};

/**
 * Format ISO Date string to "HH:mm"
 */
export const formatTime = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch {
        return '';
    }
};

/**
 * Format API date string like "2026-05-22" to chart label like "22/05"
 */
export const formatDateLabel = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
        return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
};

/**
 * Maps morph class or type string to clean UI type
 */
export const mapReviewableType = (type: string | null | undefined): 'tour' | 'location' => {
    if (!type) return 'location';
    const lower = type.toLowerCase();
    if (lower.includes('tour')) return 'tour';
    return 'location';
};

/**
 * Maps single raw rating item to ViewModel
 */
export const mapReportRatingItem = (raw: RawRatingsReportItem): RatingsReportItemViewModel => {
    return {
        id: raw.id,
        score: raw.score,
        comment: raw.comment || '',
        images: (raw.images || []).map((img: unknown) => typeof img === 'string' ? img : (img as { url: string }).url || ''),
        status: raw.status,
        reviewableType: mapReviewableType(raw.reviewable_type),
        reviewableId: raw.reviewable_id,
        reviewableName: raw.reviewable_name || '',
        userName: raw.user?.full_name || 'Anonymous',
        userAvatar: raw.user?.avatar || '',
        createdAt: formatDate(raw.created_at),
        createdAtTime: formatTime(raw.created_at),
    };
};

/**
 * Main mapper transforming raw reports API response into RatingsReportViewModel
 */
export const mapRatingsReport = (raw: RawRatingsReport | undefined | null): RatingsReportViewModel => {
    if (!raw) {
        return {
            stats: {
                total: 0,
                totalTrend: 0,
                pending: 0,
                pendingTrend: 0,
                approved: 0,
                approvedTrend: 0,
                average: 0,
                averageTrend: 0,
            },
            charts: {
                trend: [],
                stars: [
                    { stars: 5, count: 0, percentage: 0 },
                    { stars: 4, count: 0, percentage: 0 },
                    { stars: 3, count: 0, percentage: 0 },
                    { stars: 2, count: 0, percentage: 0 },
                    { stars: 1, count: 0, percentage: 0 },
                ],
                statuses: [
                    { status: 'approved', labelKey: 'ratings.status.approved', count: 0, percentage: 0, color: '#10B981' },
                    { status: 'pending', labelKey: 'ratings.status.pending', count: 0, percentage: 0, color: '#F59E0B' },
                    { status: 'rejected', labelKey: 'ratings.status.rejected', count: 0, percentage: 0, color: '#EF4444' },
                ],
                types: [
                    { type: 'location', labelKey: 'ratings.type.location', count: 0, average: 0 },
                    { type: 'tour', labelKey: 'ratings.type.tour', count: 0, average: 0 },
                ],
            },
            table: {
                items: [],
                pagination: {
                    currentPage: 1,
                    lastPage: 1,
                    perPage: 10,
                    total: 0,
                },
            },
        };
    }

    const summary = raw.summary;
    const statsTotal = summary.total_count || 0;
    const statsPending = summary.pending_count || 0;
    const statsApproved = summary.approved_count || 0;
    const statsAverage = toNumberSafe(summary.average_score, 0);

    // 1. Stats row trends
    const stats = {
        total: statsTotal,
        totalTrend: summary.trends?.total || 0,
        pending: statsPending,
        pendingTrend: summary.trends?.pending || 0,
        approved: statsApproved,
        approvedTrend: summary.trends?.approved || 0,
        average: Number(statsAverage.toFixed(1)),
        averageTrend: summary.trends?.average || 0,
    };

    // 2. Charts -> Trend Line Chart
    const trend: TrendChartDataPoint[] = (summary.trend_chart || []).map(point => ({
        label: formatDateLabel(point.date),
        total: point.total,
        approved: point.approved,
    }));

    // 3. Charts -> Star distribution (5 down to 1)
    const starDist = summary.star_distribution || {};
    const totalStarCount = Object.values(starDist).reduce((sum, count) => sum + count, 0);
    const stars: StarDistributionPoint[] = [5, 4, 3, 2, 1].map(num => {
        const count = starDist[num] || 0;
        return {
            stars: num,
            count,
            percentage: totalStarCount > 0 ? Math.round((count / totalStarCount) * 100) : 0,
        };
    });

    // 4. Charts -> Status distribution Donut
    const statusDist = summary.status_distribution || {};
    const totalStatusCount = Object.values(statusDist).reduce((sum, count) => sum + count, 0);
    const statuses: StatusDistributionPoint[] = [
        { status: 'approved' as const, labelKey: 'ratings.status.approved', count: statusDist.approved || 0, percentage: 0, color: '#10B981' },
        { status: 'pending' as const, labelKey: 'ratings.status.pending', count: statusDist.pending || 0, percentage: 0, color: '#F59E0B' },
        { status: 'rejected' as const, labelKey: 'ratings.status.rejected', count: statusDist.rejected || 0, percentage: 0, color: '#EF4444' },
    ].map(item => ({
        ...item,
        percentage: totalStatusCount > 0 ? Math.round((item.count / totalStatusCount) * 100) : 0,
    }));

    // 5. Charts -> Type breakdown Grouped Bar
    const typeDist = summary.type_distribution || {};
    const types: TypeDistributionPoint[] = [
        {
            type: 'location' as const,
            labelKey: 'ratings.type.location',
            count: typeDist.location?.count || 0,
            average: Number(toNumberSafe(typeDist.location?.average, 0).toFixed(1)),
        },
        {
            type: 'tour' as const,
            labelKey: 'ratings.type.tour',
            count: typeDist.tour?.count || 0,
            average: Number(toNumberSafe(typeDist.tour?.average, 0).toFixed(1)),
        },
    ];

    // 6. Table paginated list
    const ratingsList = raw.ratings_list || { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 };
    const items = (ratingsList.data || []).map(mapReportRatingItem);

    return {
        stats,
        charts: {
            trend,
            stars,
            statuses,
            types,
        },
        table: {
            items,
            pagination: {
                currentPage: ratingsList.current_page || 1,
                lastPage: ratingsList.last_page || 1,
                perPage: ratingsList.per_page || 10,
                total: ratingsList.total || 0,
            },
        },
    };
};
