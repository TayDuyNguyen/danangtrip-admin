import type {
    RawRatingsReport,
    RawRatingsReportItem,
    RatingsReportViewModel,
    RatingsReportItemViewModel,
    TrendChartDataPoint,
    StarDistributionPoint,
    StatusDistributionPoint,
    TypeDistributionPoint,
    RawBookingsReport,
    RawBookingsReportItem,
    BookingsReportViewModel,
    BookingsReportItemViewModel,
    BookingTrendChartDataPoint,
    BookingStatusDistributionPoint,
    RawRevenueTrendResponse,
    RawTourRevenueDetail,
    RawRevenuePaymentsSummary,
    RawRevenueReportItem,
    RevenueReportViewModel,
    RevenueReportItemViewModel,
    RevenueTrendChartPoint,
    RevenueGatewayBreakdownPoint,
    TopTourRevenuePoint,
    RawLocationReportItem,
    LocationReportViewModel,
    LocationReportItemViewModel,
    RawUsersReport,
    UsersReportViewModel,
    UsersReportMonthViewModel,
} from './report.dataHelper';
import type { RawLocation } from '@/types/location';
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
const formatTime = (isoString: string | null | undefined): string => {
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
const mapReviewableType = (type: string | null | undefined): 'tour' | 'location' => {
    if (!type) return 'location';
    const lower = type.toLowerCase();
    if (lower.includes('tour')) return 'tour';
    return 'location';
};

/**
 * Maps single raw rating item to ViewModel
 */
const mapReportRatingItem = (raw: RawRatingsReportItem): RatingsReportItemViewModel => {
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

type RawRatingAggregateItem = {
    date: string;
    status: RatingsReportItemViewModel['status'];
    is_new: boolean;
    count: number | string;
};

const emptyRatingsReport = (): RatingsReportViewModel => ({
    stats: {
        total: 0,
        totalTrend: 0,
        new: 0,
        viewed: 0,
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
});

const mapAggregateRatingsReport = (rows: RawRatingAggregateItem[]): RatingsReportViewModel => {
    const totalsByDate = new Map<string, { total: number; approved: number }>();
    let newCount = 0;
    let viewedCount = 0;
    const statusDist: Record<RatingsReportItemViewModel['status'], number> = {
        pending: 0,
        approved: 0,
        rejected: 0,
    };

    rows.forEach((row) => {
        const count = toNumberSafe(row.count, 0);
        const dateTotal = totalsByDate.get(row.date) || { total: 0, approved: 0 };

        totalsByDate.set(row.date, {
            total: dateTotal.total + count,
            approved: dateTotal.approved + (row.status === 'approved' ? count : 0),
        });

        if (row.status in statusDist) {
            statusDist[row.status] += count;
        }

        if (row.is_new) {
            newCount += count;
        } else {
            viewedCount += count;
        }
    });

    const total = Object.values(statusDist).reduce((sum, count) => sum + count, 0);
    const totalStatusCount = Object.values(statusDist).reduce((sum, count) => sum + count, 0);
    const trend: TrendChartDataPoint[] = Array.from(totalsByDate.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, value]) => ({
            label: formatDateLabel(date),
            total: value.total,
            approved: value.approved,
        }));

    const statuses: StatusDistributionPoint[] = [
        { status: 'approved' as const, labelKey: 'ratings.status.approved', count: statusDist.approved, percentage: 0, color: '#10B981' },
        { status: 'pending' as const, labelKey: 'ratings.status.pending', count: statusDist.pending, percentage: 0, color: '#F59E0B' },
        { status: 'rejected' as const, labelKey: 'ratings.status.rejected', count: statusDist.rejected, percentage: 0, color: '#EF4444' },
    ].map(item => ({
        ...item,
        percentage: totalStatusCount > 0 ? Math.round((item.count / totalStatusCount) * 100) : 0,
    }));

    const items: RatingsReportItemViewModel[] = [];

    return {
        stats: {
            total,
            totalTrend: 0,
            new: newCount,
            viewed: viewedCount,
            pending: statusDist.pending,
            pendingTrend: 0,
            approved: statusDist.approved,
            approvedTrend: 0,
            average: 0,
            averageTrend: 0,
        },
        charts: {
            trend,
            stars: emptyRatingsReport().charts.stars,
            statuses,
            types: emptyRatingsReport().charts.types,
        },
        table: {
            items,
            pagination: {
                currentPage: 1,
                lastPage: 1,
                perPage: 10,
                total: 0,
            },
        },
    };
};

/**
 * Main mapper transforming raw reports API response into RatingsReportViewModel
 */
export const mapRatingsReport = (raw: RawRatingsReport | RawRatingAggregateItem[] | undefined | null): RatingsReportViewModel => {
    if (!raw) {
        return emptyRatingsReport();
    }

    if (Array.isArray(raw)) {
        return mapAggregateRatingsReport(raw);
    }

    const summary = raw.summary;
    const statsTotal = summary.total_count || 0;
    const statsPending = summary.pending_count || 0;
    const statsApproved = summary.approved_count || 0;
    const statsNew = summary.new_count || 0;
    const statsViewed = summary.viewed_count ?? Math.max(0, statsTotal - statsNew);
    const statsAverage = toNumberSafe(summary.average_score, 0);

    // 1. Stats row trends
    const stats = {
        total: statsTotal,
        totalTrend: summary.trends?.total || 0,
        new: statsNew,
        viewed: statsViewed,
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

/**
 * Maps single raw booking item to ViewModel
 */
const mapReportBookingItem = (raw: RawBookingsReportItem): BookingsReportItemViewModel => {
    return {
        id: raw.id,
        bookingCode: raw.booking_code || '',
        customerName: raw.customer_name || 'Guest',
        tourName: raw.tour_name || '',
        totalAmount: toNumberSafe(raw.total_amount, 0),
        status: raw.booking_status || 'pending',
        paymentStatus: raw.payment_status || 'pending',
        bookedAt: formatDate(raw.booked_at),
        bookedAtTime: formatTime(raw.booked_at),
    };
};

type RawBookingAggregateItem = {
    date: string;
    booking_status: BookingsReportItemViewModel['status'];
    payment_status: string;
    count: number | string;
    total_amount: number | string;
};

const mapAggregateBookingsReport = (rows: RawBookingAggregateItem[]): BookingsReportViewModel => {
    const totalsByDate = new Map<string, { bookings: number; revenue: number }>();
    const statusDist: Record<BookingsReportItemViewModel['status'], number> = {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
    };

    rows.forEach((row) => {
        const count = toNumberSafe(row.count, 0);
        const revenue = toNumberSafe(row.total_amount, 0);
        const dateTotal = totalsByDate.get(row.date) || { bookings: 0, revenue: 0 };

        totalsByDate.set(row.date, {
            bookings: dateTotal.bookings + count,
            revenue: dateTotal.revenue + revenue,
        });

        if (row.booking_status in statusDist) {
            statusDist[row.booking_status] += count;
        }
    });

    const total = Object.values(statusDist).reduce((sum, count) => sum + count, 0);
    const revenue = rows.reduce((sum, row) => sum + toNumberSafe(row.total_amount, 0), 0);
    const totalStatusCount = Object.values(statusDist).reduce((sum, count) => sum + count, 0);

    const trend: BookingTrendChartDataPoint[] = Array.from(totalsByDate.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, value]) => ({
            label: formatDateLabel(date),
            bookings: value.bookings,
            revenue: value.revenue,
        }));

    const statuses: BookingStatusDistributionPoint[] = [
        { status: 'pending' as const, labelKey: 'booking.status.pending', count: statusDist.pending, percentage: 0, color: '#F59E0B' },
        { status: 'confirmed' as const, labelKey: 'booking.status.confirmed', count: statusDist.confirmed, percentage: 0, color: '#3B82F6' },
        { status: 'completed' as const, labelKey: 'booking.status.completed', count: statusDist.completed, percentage: 0, color: '#10B981' },
        { status: 'cancelled' as const, labelKey: 'booking.status.cancelled', count: statusDist.cancelled, percentage: 0, color: '#EF4444' },
    ].map(item => ({
        ...item,
        percentage: totalStatusCount > 0 ? Math.round((item.count / totalStatusCount) * 100) : 0,
    }));

    const items: BookingsReportItemViewModel[] = [];

    return {
        stats: {
            total,
            totalTrend: 0,
            completed: statusDist.completed,
            completedTrend: 0,
            cancelled: statusDist.cancelled,
            cancelledTrend: 0,
            revenue,
            revenueTrend: 0,
        },
        charts: {
            trend,
            statuses,
        },
        table: {
            items,
            pagination: {
                currentPage: 1,
                lastPage: 1,
                perPage: 10,
                total: 0,
            },
        },
    };
};

/**
 * Main mapper transforming raw bookings API response into BookingsReportViewModel
 */
export const mapBookingsReport = (raw: RawBookingsReport | RawBookingAggregateItem[] | undefined | null): BookingsReportViewModel => {
    if (!raw) {
        return {
            stats: {
                total: 0,
                totalTrend: 0,
                completed: 0,
                completedTrend: 0,
                cancelled: 0,
                cancelledTrend: 0,
                revenue: 0,
                revenueTrend: 0,
            },
            charts: {
                trend: [],
                statuses: [
                    { status: 'pending', labelKey: 'booking.status.pending', count: 0, percentage: 0, color: '#F59E0B' },
                    { status: 'confirmed', labelKey: 'booking.status.confirmed', count: 0, percentage: 0, color: '#3B82F6' },
                    { status: 'completed', labelKey: 'booking.status.completed', count: 0, percentage: 0, color: '#10B981' },
                    { status: 'cancelled', labelKey: 'booking.status.cancelled', count: 0, percentage: 0, color: '#EF4444' },
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

    if (Array.isArray(raw)) {
        return mapAggregateBookingsReport(raw);
    }

    const summary = raw.summary;
    const statsTotal = summary.total_count || 0;
    const statsCompleted = summary.completed_count || 0;
    const statsCancelled = summary.cancelled_count || 0;
    const statsRevenue = toNumberSafe(summary.total_revenue, 0);

    const stats = {
        total: statsTotal,
        totalTrend: summary.trends?.total || 0,
        completed: statsCompleted,
        completedTrend: summary.trends?.completed || 0,
        cancelled: statsCancelled,
        cancelledTrend: summary.trends?.cancelled || 0,
        revenue: statsRevenue,
        revenueTrend: summary.trends?.revenue || 0,
    };

    // Trend chart mapping
    const trend: BookingTrendChartDataPoint[] = (summary.trend_chart || []).map(point => ({
        label: formatDateLabel(point.date),
        bookings: point.bookings || 0,
        revenue: toNumberSafe(point.revenue, 0),
    }));

    // Status distribution donut chart mapping
    const statusDist = summary.status_distribution || {};
    const totalStatusCount = Object.values(statusDist).reduce((sum, count) => sum + count, 0);
    const statuses: BookingStatusDistributionPoint[] = [
        { status: 'pending' as const, labelKey: 'booking.status.pending', count: statusDist.pending || 0, percentage: 0, color: '#F59E0B' },
        { status: 'confirmed' as const, labelKey: 'booking.status.confirmed', count: statusDist.confirmed || 0, percentage: 0, color: '#3B82F6' },
        { status: 'completed' as const, labelKey: 'booking.status.completed', count: statusDist.completed || 0, percentage: 0, color: '#10B981' },
        { status: 'cancelled' as const, labelKey: 'booking.status.cancelled', count: statusDist.cancelled || 0, percentage: 0, color: '#EF4444' },
    ].map(item => ({
        ...item,
        percentage: totalStatusCount > 0 ? Math.round((item.count / totalStatusCount) * 100) : 0,
    }));

    // Table mapping
    const bookingsList = raw.bookings_list || { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 };
    const items = (bookingsList.data || []).map(mapReportBookingItem);

    return {
        stats,
        charts: {
            trend,
            statuses,
        },
        table: {
            items,
            pagination: {
                currentPage: bookingsList.current_page || 1,
                lastPage: bookingsList.last_page || 1,
                perPage: bookingsList.per_page || 10,
                total: bookingsList.total || 0,
            },
        },
    };
};

/**
 * Maps single raw payment item to RevenueReportItemViewModel
 */
const mapRevenueReportItem = (raw: RawRevenueReportItem): RevenueReportItemViewModel => {
    return {
        id: raw.id,
        transactionCode: raw.transaction_code || '',
        bookingId: raw.booking?.id || 0,
        bookingCode: raw.booking?.booking_code || '',
        customerName: raw.booking?.user?.full_name || 'Guest',
        customerAvatar: raw.booking?.user?.avatar || '',
        tourName: raw.booking?.tour_name?.trim() || (raw.booking?.booking_code ? `Tour Booking: ${raw.booking.booking_code}` : 'Tour Package'),
        amount: toNumberSafe(raw.amount, 0),
        gateway: raw.payment_gateway,
        status: raw.payment_status,
        date: formatDate(raw.paid_at || raw.created_at),
        time: formatTime(raw.paid_at || raw.created_at),
    };
};

/**
 * Calculate percentage change between current and previous value.
 * Returns 0 if previous is 0 and current is also 0.
 * Returns 100 if previous is 0 but current > 0.
 * Returns -100 if previous > 0 but current is 0.
 */
const calcTrend = (current: number, prev: number): number => {
    if (prev === 0) return current > 0 ? 100.0 : 0.0;
    return Number(((current - prev) / prev * 100).toFixed(1));
};

/**
 * Main mapper transforming raw revenue API responses into RevenueReportViewModel.
 * Accepts an optional previous-period trend response to calculate real % trends.
 */
export const mapRevenueReport = (
    rawTrend: RawRevenueTrendResponse | undefined | null,
    rawDetail: RawTourRevenueDetail[] | undefined | null,
    rawPayments: {
        data: RawRevenueReportItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | undefined | null,
    filters: { from: string; to: string },
    prevRawTrend?: RawRevenueTrendResponse | null,
    rawPaymentsSummary?: RawRevenuePaymentsSummary | null,
): RevenueReportViewModel => {
    const trendStats = rawTrend?.stats || [];
    const prevTrendStats = prevRawTrend?.stats || [];

    // ── Current period aggregates ──
    const totalRevenue = trendStats.reduce((sum, item) => sum + toNumberSafe(item.total_revenue, 0), 0);
    const totalTransactions = trendStats.reduce((sum, item) => sum + toNumberSafe(item.transaction_count, 0), 0);

    // ── Previous period aggregates (for trend %) ──
    const prevTotalRevenue = prevTrendStats.reduce((sum, item) => sum + toNumberSafe(item.total_revenue, 0), 0);
    const prevTotalTransactions = prevTrendStats.reduce((sum, item) => sum + toNumberSafe(item.transaction_count, 0), 0);

    // Compute daily average for current & previous
    const dateFrom = new Date(filters.from);
    const dateTo = new Date(filters.to);
    const daysDiff = Math.max(1, Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24)) + 1);
    const dailyAverage = Number((totalRevenue / daysDiff).toFixed(0));

    const prevDaysDiff = prevTrendStats.length > 0 ? prevTrendStats.length : daysDiff;
    const prevDailyAverage = prevDaysDiff > 0 ? Number((prevTotalRevenue / prevDaysDiff).toFixed(0)) : 0;

    const totalRefunded = toNumberSafe(rawPaymentsSummary?.total_refunded, 0);

    // Previous refunded trend not available without a second summary call
    const prevRefunded = 0;

    // ── Trend percentages ──
    const totalRevenueTrend = calcTrend(totalRevenue, prevTotalRevenue);
    const dailyAverageTrend = calcTrend(dailyAverage, prevDailyAverage);
    const totalTransactionsTrend = calcTrend(totalTransactions, prevTotalTransactions);
    const totalRefundedTrend = prevRefunded === 0 ? 0 : calcTrend(totalRefunded, prevRefunded);

    // 2. Charts -> Trend Chart Point mapping
    const trend: RevenueTrendChartPoint[] = trendStats.map(point => ({
        label: formatDateLabel(point.period),
        revenue: toNumberSafe(point.total_revenue, 0),
        transactions: point.transaction_count || 0,
    }));

    // 3. Charts -> Top tours
    const topTours: TopTourRevenuePoint[] = (rawDetail || []).slice(0, 5).map(item => ({
        tourId: item.tour_id,
        tourName: item.tour_name,
        bookings: toNumberSafe(item.booking_count, 0),
        revenue: toNumberSafe(item.total_revenue, 0),
    }));

    const gatewayPalette: Record<string, { labelKey: string; color: string }> = {
        momo: { labelKey: 'revenue.gateway.momo', color: '#D82D8F' },
        vnpay: { labelKey: 'revenue.gateway.vnpay', color: '#3A5A9F' },
        zalopay: { labelKey: 'revenue.gateway.zalopay', color: '#0084FF' },
        sepay: { labelKey: 'revenue.gateway.sepay', color: '#0d9488' },
    };

    const breakdown = rawPaymentsSummary?.gateway_breakdown ?? [];
    let totalGatewayRevenue = 0;
    const gateways: RevenueGatewayBreakdownPoint[] = breakdown.map((item) => {
        const gateway = item.gateway.toLowerCase();
        const revenue = toNumberSafe(item.revenue, 0);
        totalGatewayRevenue += revenue;
        const meta = gatewayPalette[gateway] ?? { labelKey: `revenue.gateway.${gateway}`, color: '#94a3b8' };

        return {
            gateway,
            labelKey: meta.labelKey,
            revenue,
            count: item.count,
            percentage: 0,
            color: meta.color,
        };
    }).map((item) => ({
        ...item,
        percentage: totalGatewayRevenue > 0 ? Math.round((item.revenue / totalGatewayRevenue) * 100) : 0,
    }));

    // 5. Table paginated list mapping
    const paymentsList = rawPayments || { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 };
    const items = (paymentsList.data || []).map(mapRevenueReportItem);

    return {
        stats: {
            totalRevenue,
            totalRevenueTrend,
            dailyAverage,
            dailyAverageTrend,
            totalTransactions,
            totalTransactionsTrend,
            totalRefunded,
            totalRefundedTrend,
        },
        charts: {
            trend,
            topTours,
            gateways,
        },
        table: {
            items,
            pagination: {
                currentPage: paymentsList.current_page || 1,
                lastPage: paymentsList.last_page || 1,
                perPage: paymentsList.per_page || 10,
                total: paymentsList.total || 0,
            },
        },
    };
};

/**
 * Main mapper transforming raw locations report API responses into LocationReportViewModel.
 * Integrates stats (KPI), distribution stats (charts), and paginated locations (table).
 */
export const mapLocationsReport = (
    rawStats: {
        total: number;
        active: number;
        featured: number;
        total_views: number;
    } | undefined | null,
    rawDistribution: RawLocationReportItem[] | undefined | null,
    rawLocations: {
        data: RawLocation[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | undefined | null
): LocationReportViewModel => {
    // 1. Stats KPI Mapping
    const stats = {
        total: toNumberSafe(rawStats?.total, 0),
        active: toNumberSafe(rawStats?.active, 0),
        featured: toNumberSafe(rawStats?.featured, 0),
        totalViews: toNumberSafe(rawStats?.total_views, 0),
    };

    // 2. Charts -> Category Distribution
    // Aggregate by Category Name from rawDistribution.category?.name
    const categoryMap: Record<string, number> = {};
    const districtMap: Record<string, number> = {};

    if (Array.isArray(rawDistribution)) {
        rawDistribution.forEach(item => {
            const catName = item.category?.name || 'Uncategorized';
            const district = item.district || 'Unknown';
            const count = toNumberSafe(item.count, 0);

            categoryMap[catName] = (categoryMap[catName] || 0) + count;
            districtMap[district] = (districtMap[district] || 0) + count;
        });
    }

    const categories = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
    })).sort((a, b) => b.value - a.value);

    const districts = Object.entries(districtMap).map(([name, value]) => ({
        name,
        value,
    })).sort((a, b) => b.value - a.value);

    // 3. Table lists
    const locList = rawLocations || { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 };
    const items: LocationReportItemViewModel[] = (locList.data || []).map(loc => ({
        id: loc.id,
        name: loc.name,
        categoryName: loc.category?.name || 'Uncategorized',
        district: loc.district || 'Unknown',
        views: toNumberSafe(loc.view_count, 0),
        favorites: toNumberSafe(loc.favorite_count, 0),
        rating: toNumberSafe(loc.avg_rating ?? loc.rating, 0),
        status: loc.status === 'active' ? 'active' : 'inactive',
    }));

    return {
        stats,
        charts: {
            categories,
            districts,
        },
        table: {
            items,
            pagination: {
                currentPage: locList.current_page || 1,
                lastPage: locList.last_page || 1,
                perPage: locList.per_page || 10,
                total: locList.total || 0,
            },
        },
    };
};

/**
 * Main mapper transforming raw users report API response into UsersReportViewModel.
 * Ensures all 12 months are populated and computes cumulative signup totals.
 */
export const mapUsersReport = (raw: RawUsersReport | undefined | null): UsersReportViewModel => {
    const selectedYear = raw?.year ?? new Date().getFullYear();
    
    // 1. Initialize stats for 12 months (1 to 12)
    const statsMap: Record<number, number> = {};
    if (raw?.stats && Array.isArray(raw.stats)) {
        raw.stats.forEach(item => {
            const m = Number(item.month);
            const count = Number(item.count);
            if (!isNaN(m) && m >= 1 && m <= 12) {
                statsMap[m] = count;
            }
        });
    }

    let runningSum = 0;
    const stats: UsersReportMonthViewModel[] = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        const count = statsMap[monthNum] || 0;
        runningSum += count;
        return {
            month: monthNum,
            labelKey: `users_report.month.${monthNum}`,
            count,
            cumulativeCount: runningSum
        };
    });

    const totalUsers = Number(raw?.total_users ?? 0);
    const activeUsers = Number(raw?.active_users ?? 0);
    const activeRate = totalUsers > 0 ? Number(((activeUsers / totalUsers) * 100).toFixed(1)) : 0;

    const rolePalette: Record<string, { labelKey: string; color: string }> = {
        user: { labelKey: 'filter.role_user', color: '#14b8a6' },
        admin: { labelKey: 'filter.role_admin', color: '#6366f1' },
        manager: { labelKey: 'filter.role_manager', color: '#f59e0b' },
        staff: { labelKey: 'filter.role_staff', color: '#64748b' },
    };

    const roleSource = raw?.role_distribution ?? [];
    const totalRoles = roleSource.reduce((sum, role) => sum + role.count, 0);
    const roleDistribution = roleSource.map((item) => {
        const meta = rolePalette[item.role] ?? { labelKey: 'filter.role_user', color: '#94a3b8' };

        return {
            role: item.role,
            labelKey: meta.labelKey,
            count: item.count,
            percentage: totalRoles > 0 ? Math.round((item.count / totalRoles) * 100) : 0,
            color: meta.color,
        };
    });

    return {
        year: selectedYear,
        stats,
        totalNewUsers: runningSum,
        totalUsers,
        activeUsers,
        activeRate,
        roleDistribution,
    };
};


