/**
 * Filters for Báo cáo Đánh giá (Ratings Report)
 */
export interface RatingsReportFilters {
    from?: string;
    to?: string;
    status?: 'all' | 'pending' | 'approved' | 'rejected';
    type?: 'all' | 'location' | 'tour';
    page?: number;
    per_page?: number;
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
