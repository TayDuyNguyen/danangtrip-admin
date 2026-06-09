/**
 * Filters for Báo cáo Đánh giá (Ratings Report)
 */
export interface RatingsReportFilters {
    from?: string;
    to?: string;
    status?: 'all' | 'pending' | 'approved' | 'rejected';
    is_new?: boolean;
    type?: 'all' | 'location' | 'tour';
    user_id?: string | number;
    page?: number;
    per_page?: number;
    score?: number;
    search?: string;
    location_id?: number;
    tour_id?: number;
}

/**
 * Raw Rating Item from reports API
 */
export interface RawRatingsReportItem {
    id: number;
    score: number;
    comment: string | null;
    images: string[] | null;
    status: 'pending' | 'approved' | 'rejected';
    reviewable_type: string;
    reviewable_id: number;
    reviewable_name: string;
    user: {
        id: number;
        full_name: string;
        avatar: string | null;
    };
    created_at: string;
}

/**
 * Raw summary metrics & charts data
 */
export interface RawRatingsReportSummary {
    total_count: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    new_count?: number;
    viewed_count?: number;
    average_score: number | string;
    trends?: {
        total?: number;
        approved?: number;
        pending?: number;
        average?: number;
    };
    star_distribution?: Record<string | number, number>;
    status_distribution?: Record<string, number>;
    type_distribution?: {
        location?: { count: number; average: number | string };
        tour?: { count: number; average: number | string };
    };
    trend_chart?: {
        date: string;
        total: number;
        approved: number;
    }[];
}

/**
 * Combined raw response for Ratings Report
 */
export interface RawRatingsReport {
    summary: RawRatingsReportSummary;
    ratings_list: {
        data: RawRatingsReportItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

/**
 * UI View Model for individual rating items
 */
export interface RatingsReportItemViewModel {
    id: number;
    score: number;
    comment: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected';
    reviewableType: 'location' | 'tour';
    reviewableId: number;
    reviewableName: string;
    userName: string;
    userAvatar: string;
    createdAt: string; // Formatted date: "DD/MM/YYYY"
    createdAtTime: string; // Formatted time: "HH:mm"
}

/**
 * UI View Model for trend chart points
 */
export interface TrendChartDataPoint {
    label: string; // Formatted date label, e.g. "22/05"
    total: number;
    approved: number;
}

/**
 * UI View Model for star distribution horizontal bar row
 */
export interface StarDistributionPoint {
    stars: number;
    count: number;
    percentage: number;
}

/**
 * UI View Model for status distribution donut chart segment
 */
export interface StatusDistributionPoint {
    status: 'pending' | 'approved' | 'rejected';
    labelKey: string; // Key for internationalization in frontend
    count: number;
    percentage: number;
    color: string;
}

/**
 * UI View Model for rating type breakdown grouped bar chart
 */
export interface TypeDistributionPoint {
    type: 'location' | 'tour';
    labelKey: string;
    count: number;
    average: number;
}

/**
 * Complete UI View Model for Ratings Report
 */
export interface RatingsReportViewModel {
    stats: {
        total: number;
        totalTrend: number; // e.g. +8.3
        new: number;
        viewed: number;
        pending: number;
        pendingTrend: number;
        approved: number;
        approvedTrend: number;
        average: number;
        averageTrend: number;
    };
    charts: {
        trend: TrendChartDataPoint[];
        stars: StarDistributionPoint[];
        statuses: StatusDistributionPoint[];
        types: TypeDistributionPoint[];
    };
    table: {
        items: RatingsReportItemViewModel[];
        pagination: {
            currentPage: number;
            lastPage: number;
            perPage: number;
            total: number;
        };
    };
}

/**
 * Filters for Báo cáo Đơn hàng (Bookings Report)
 */
export interface BookingsReportFilters {
    from?: string;
    to?: string;
    status?: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_status?: 'all' | 'pending' | 'paid' | 'refunded';
    page?: number;
    per_page?: number;
}

/**
 * Raw Booking Item from reports API
 */
export interface RawBookingsReportItem {
    id: number;
    booking_code: string;
    customer_name: string;
    tour_name: string;
    total_amount: number | string;
    booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    booked_at: string;
}

/**
 * Raw summary metrics & charts data for Bookings
 */
export interface RawBookingsReportSummary {
    total_count: number;
    completed_count: number;
    cancelled_count: number;
    total_revenue: number | string;
    trends?: {
        total?: number;
        completed?: number;
        cancelled?: number;
        revenue?: number;
    };
    status_distribution?: Record<string, number>;
    trend_chart?: {
        date: string; // "YYYY-MM-DD"
        bookings: number;
        revenue: number | string;
    }[];
}

/**
 * Combined raw response for Bookings Report
 */
export interface RawBookingsReport {
    summary: RawBookingsReportSummary;
    bookings_list: {
        data: RawBookingsReportItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

/**
 * UI View Model for individual booking report item
 */
export interface BookingsReportItemViewModel {
    id: number;
    bookingCode: string;
    customerName: string;
    tourName: string;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    bookedAt: string; // DD/MM/YYYY
    bookedAtTime: string; // HH:mm
}

/**
 * UI View Model for booking trend data point
 */
export interface BookingTrendChartDataPoint {
    label: string; // DD/MM
    bookings: number;
    revenue: number;
}

/**
 * UI View Model for booking status distribution
 */
export interface BookingStatusDistributionPoint {
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    labelKey: string;
    count: number;
    percentage: number;
    color: string;
}

/**
 * Complete UI View Model for Bookings Report
 */
export interface BookingsReportViewModel {
    stats: {
        total: number;
        totalTrend: number;
        completed: number;
        completedTrend: number;
        cancelled: number;
        cancelledTrend: number;
        revenue: number;
        revenueTrend: number;
    };
    charts: {
        trend: BookingTrendChartDataPoint[];
        statuses: BookingStatusDistributionPoint[];
    };
    table: {
        items: BookingsReportItemViewModel[];
        pagination: {
            currentPage: number;
            lastPage: number;
            perPage: number;
            total: number;
        };
    };
}

/**
 * Filters for Báo cáo Doanh thu (Revenue Report)
 */
export interface RevenueReportFilters {
    from?: string;
    to?: string;
    payment_gateway?: 'all' | 'momo' | 'vnpay' | 'zalopay' | string;
    page?: number;
    per_page?: number;
}

/**
 * Raw Revenue Trend statistics point from /admin/dashboard/revenue
 */
export interface RawRevenueTrendPoint {
    period: string; // date like "2026-05-22" or hour like "12:00"
    total_revenue: number | string;
    transaction_count: number;
}

/**
 * Raw Revenue Trend response
 */
export interface RawRevenueTrendResponse {
    period: string; // 'day' | 'week' | 'month' | 'year'
    from: string;
    to: string;
    stats: RawRevenueTrendPoint[];
}

/**
 * Raw tour revenue detail from /admin/reports/revenue-detail
 */
export interface RawTourRevenueDetail {
    tour_id: number;
    tour_name: string;
    booking_count: number;
    total_revenue: number | string;
}

/**
 * Raw individual payment item from /admin/payments
 */
export interface RawRevenueReportItem {
    id: number;
    transaction_code: string | null;
    amount: number | string;
    payment_gateway: string;
    payment_status: string;
    paid_at: string | null;
    created_at: string;
    booking?: {
        id: number;
        booking_code: string;
        user?: {
            id: number;
            full_name: string;
            avatar: string | null;
        };
    };
}

/**
 * UI View Model for trend chart points in Revenue report
 */
export interface RevenueTrendChartPoint {
    label: string; // "DD/MM" or "HH:mm"
    revenue: number;
    transactions: number;
}

/**
 * UI View Model for top tour revenue point
 */
export interface TopTourRevenuePoint {
    tourId: number;
    tourName: string;
    bookings: number;
    revenue: number;
}

/**
 * UI View Model for payment gateway revenue breakdown
 */
export interface RevenueGatewayBreakdownPoint {
    gateway: string; // "momo" | "vnpay" | "zalopay"
    labelKey: string; // "revenue.gateway.momo" etc.
    revenue: number;
    count: number;
    percentage: number;
    color: string;
}

/**
 * UI View Model for individual revenue table item
 */
export interface RevenueReportItemViewModel {
    id: number;
    transactionCode: string;
    bookingId: number;
    bookingCode: string;
    customerName: string;
    customerAvatar: string;
    tourName: string;
    amount: number;
    gateway: string;
    status: string;
    date: string; // DD/MM/YYYY
    time: string; // HH:mm
}

/**
 * Complete UI View Model for Revenue Report
 */
export interface RevenueReportViewModel {
    stats: {
        totalRevenue: number;
        totalRevenueTrend: number;
        dailyAverage: number;
        dailyAverageTrend: number;
        totalTransactions: number;
        totalTransactionsTrend: number;
        totalRefunded: number;
        totalRefundedTrend: number;
    };
    charts: {
        trend: RevenueTrendChartPoint[];
        topTours: TopTourRevenuePoint[];
        gateways: RevenueGatewayBreakdownPoint[];
    };
    table: {
        items: RevenueReportItemViewModel[];
        pagination: {
            currentPage: number;
            lastPage: number;
            perPage: number;
            total: number;
        };
    };
}

/**
 * Filters for Báo cáo Địa điểm (Locations Report)
 */
export interface LocationReportFilters {
    from?: string;
    to?: string;
    category_id?: string | number;
    district?: string;
    status?: 'all' | 'active' | 'inactive';
    page?: number;
    per_page?: number;
}

/**
 * Raw Location Report item from /admin/reports/locations
 */
export interface RawLocationReportItem {
    category_id: number | null;
    district: string | null;
    count: number;
    category: {
        id: number;
        name: string;
    } | null;
}

/**
 * UI View Model for individual location report list item
 */
export interface LocationReportItemViewModel {
    id: number;
    name: string;
    categoryName: string;
    district: string;
    views: number;
    favorites: number;
    rating: number;
    status: 'active' | 'inactive';
}

/**
 * Complete UI View Model for Locations Report
 */
export interface LocationReportViewModel {
    stats: {
        total: number;
        active: number;
        featured: number;
        totalViews: number;
    };
    charts: {
        categories: { name: string; value: number }[];
        districts: { name: string; value: number }[];
    };
    table: {
        items: LocationReportItemViewModel[];
        pagination: {
            currentPage: number;
            lastPage: number;
            perPage: number;
            total: number;
        };
    };
}

/**
 * Filters for Báo cáo Người dùng (Users Report)
 */
export interface UsersReportFilters {
    year?: number;
}

/**
 * Filters for Xuất Người dùng (Users Export)
 */
export interface UsersExportFilters {
    role?: 'all' | 'admin' | 'user';
    status?: 'all' | 'active' | 'banned';
}

/**
 * Raw monthly user count returned from API GET /admin/reports/users
 */
export interface RawUsersReportMonthStat {
    month: number;
    count: number;
}

/**
 * Raw Users Report payload from backend
 */
export interface RawUsersReport {
    year: number;
    stats: RawUsersReportMonthStat[];
}

/**
 * UI View Model for a month's stats in Users Report
 */
export interface UsersReportMonthViewModel {
    month: number;          // 1-12
    labelKey: string;       // e.g. "users_report.month.1"
    count: number;          // monthly new user signup count
    cumulativeCount: number;// running total of new users
}

/**
 * Complete UI View Model for Users Report
 */
export interface UsersReportViewModel {
    year: number;
    stats: UsersReportMonthViewModel[];
    totalNewUsers: number;
}

