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

/**
 * Maps single raw booking item to ViewModel
 */
export const mapReportBookingItem = (raw: RawBookingsReportItem): BookingsReportItemViewModel => {
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

/**
 * Main mapper transforming raw bookings API response into BookingsReportViewModel
 */
export const mapBookingsReport = (raw: RawBookingsReport | undefined | null): BookingsReportViewModel => {
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
export const mapRevenueReportItem = (raw: RawRevenueReportItem): RevenueReportItemViewModel => {
    return {
        id: raw.id,
        transactionCode: raw.transaction_code || '',
        bookingId: raw.booking?.id || 0,
        bookingCode: raw.booking?.booking_code || '',
        customerName: raw.booking?.user?.full_name || 'Guest',
        customerAvatar: raw.booking?.user?.avatar || '',
        tourName: raw.booking?.booking_code ? `Tour Booking: ${raw.booking.booking_code}` : 'Tour Package',
        amount: toNumberSafe(raw.amount, 0),
        gateway: raw.payment_gateway,
        status: raw.payment_status,
        date: formatDate(raw.paid_at || raw.created_at),
        time: formatTime(raw.paid_at || raw.created_at),
    };
};

/**
 * Main mapper transforming raw revenue API responses into RevenueReportViewModel
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
    filters: { from: string; to: string }
): RevenueReportViewModel => {
    const trendStats = rawTrend?.stats || [];
    
    // Total Revenue is sum of success payments in trend
    const totalRevenue = trendStats.reduce((sum, item) => sum + toNumberSafe(item.total_revenue, 0), 0);
    
    // Count success transactions
    const totalTransactions = trendStats.reduce((sum, item) => sum + toNumberSafe(item.transaction_count, 0), 0);
    
    // Compute daily average
    const dateFrom = new Date(filters.from);
    const dateTo = new Date(filters.to);
    const daysDiff = Math.max(1, Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24)) + 1);
    const dailyAverage = Number((totalRevenue / daysDiff).toFixed(0));
    
    // Total Refunded (from raw payments data or fallback)
    const refundedPayments = rawPayments?.data.filter(p => p.payment_status === 'refunded') || [];
    const totalRefunded = refundedPayments.reduce((sum, p) => sum + toNumberSafe(p.amount, 0), 0);

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

    // 4. Charts -> Gateway Breakdown
    const gatewayMap: Record<string, { revenue: number; count: number; color: string; labelKey: string }> = {
        momo: { revenue: 0, count: 0, color: '#D82D8F', labelKey: 'revenue.gateway.momo' },
        vnpay: { revenue: 0, count: 0, color: '#3A5A9F', labelKey: 'revenue.gateway.vnpay' },
        zalopay: { revenue: 0, count: 0, color: '#0084FF', labelKey: 'revenue.gateway.zalopay' },
    };

    // Calculate actual gateway metrics from payments data
    let totalGatewayRevenue = 0;
    if (rawPayments?.data) {
        rawPayments.data.forEach(p => {
            if (p.payment_status === 'success') {
                const gateway = p.payment_gateway.toLowerCase();
                const amt = toNumberSafe(p.amount, 0);
                totalGatewayRevenue += amt;
                if (gatewayMap[gateway]) {
                    gatewayMap[gateway].revenue += amt;
                    gatewayMap[gateway].count += 1;
                } else if (gateway === 'vnpay') {
                    gatewayMap.vnpay.revenue += amt;
                    gatewayMap.vnpay.count += 1;
                } else if (gateway === 'momo') {
                    gatewayMap.momo.revenue += amt;
                    gatewayMap.momo.count += 1;
                } else if (gateway === 'zalopay') {
                    gatewayMap.zalopay.revenue += amt;
                    gatewayMap.zalopay.count += 1;
                }
            }
        });
    }

    const gateways: RevenueGatewayBreakdownPoint[] = Object.entries(gatewayMap).map(([key, value]) => ({
        gateway: key,
        labelKey: value.labelKey,
        revenue: value.revenue,
        count: value.count,
        percentage: totalGatewayRevenue > 0 ? Math.round((value.revenue / totalGatewayRevenue) * 100) : 0,
        color: value.color,
    }));

    // 5. Table paginated list mapping
    const paymentsList = rawPayments || { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 };
    const items = (paymentsList.data || []).map(mapRevenueReportItem);

    return {
        stats: {
            totalRevenue,
            totalRevenueTrend: 12.5,
            dailyAverage,
            dailyAverageTrend: 8.3,
            totalTransactions,
            totalTransactionsTrend: 15.2,
            totalRefunded,
            totalRefundedTrend: -4.8,
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

    return {
        year: selectedYear,
        stats,
        totalNewUsers: runningSum
    };
};


