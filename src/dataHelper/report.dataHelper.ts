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
