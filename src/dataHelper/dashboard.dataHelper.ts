// ─────────────────────────────────────────────────────────────────────────────
// Raw API Response Types - Matching ACTUAL backend output
// ─────────────────────────────────────────────────────────────────────────────

export interface RawDashboardStats {
    total_revenue?: number;
    total_bookings?: number;
    total_users?: number;
    total_tours?: number; // Maybe this is total_tours_sold?
    booking_status?: {
        completed?: number;
        confirmed?: number;
        pending?: number;
        cancelled?: number;
    };
    revenue_trend?: number;
    booking_trend?: number;
    user_trend?: number;
    pending_ratings?: number;
    new_contacts?: number;
}

/** Một điểm doanh thu theo kỳ — backend có thể dùng date/revenue hoặc period/total_revenue */
export interface RawRevenueStatRow {
    date?: string;
    period?: string;
    revenue?: number | string;
    total_revenue?: number | string;
    transaction_count?: number;
}

export interface RawRevenueResponse {
    period: string;
    from: string | null;
    to: string | null;
    stats: RawRevenueStatRow[];
}

export interface RawBookingTrend {
    date: string;
    count: number;
}

export interface RawBookingTrendResponse {
    days: string | number;
    stats: RawBookingTrend[];
}

export interface RawUserGrowth {
    month: string | number;
    count: number;
}

export interface RawUserGrowthResponse {
    year: string | number;
    stats: RawUserGrowth[];
}

export interface RawTopTour {
    id: string | number;
    name: string;
    slug?: string;
    booking_count: number;
    total_revenue: string | number;
}

export interface RawBookingItem {
    id?: string | number;
    booking_code: string;
    booking_status: string;
    total_amount: string | number;
    customer_name?: string;
    tour_name?: string;
    booked_at?: string;
}

export interface RawBookingsResponse {
    data: RawBookingItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface RawBookingStatusCounts {
    pending?: number;
    confirmed?: number;
    completed?: number;
    cancelled?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI View Models - Used by components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/dashboard/stats
 * Row 1 & 2: Stats cards + Order status breakdown
 */
export interface DashboardStats {
    total_revenue: number;
    total_revenue_trend: number | null;
    total_bookings: number;
    total_bookings_trend: number | null;
    total_users: number;
    total_users_trend: number | null;
    total_tours_sold: number;
    total_tours_sold_trend: number | null;
    pending_ratings?: number;
    new_contacts?: number;
    // Chart 4: Order status breakdown
    booking_status: {
        completed_count: number;
        confirmed_count: number;
        pending_count: number;
        cancelled_count: number;
    };
}

/**
 * GET /admin/dashboard/revenue?period=day|week|month|year&from=&to=
 * Chart 1: Line chart data
 */
export interface RevenueDataPoint {
    date: string;
    revenue: number;
}

export interface RevenueParams {
    period: 'day' | 'week' | 'month' | 'year';
    from: string; // ISO date
    to: string;   // ISO date
}

/**
 * GET /admin/dashboard/booking-trend?days=7|30|90
 * Chart 2: Stacked bar chart data
 */
export interface BookingTrendDataPoint {
    date: string;
    count: number; // Simple bar chart data
}

export interface BookingTrendParams {
    days: 7 | 30 | 90;
}

/**
 * GET /admin/dashboard/user-growth?year=2026
 * Chart 3: Area chart data
 */
export interface UserGrowthDataPoint {
    month: string;
    new_users: number;
    total_users: number;
}

export interface UserGrowthParams {
    year: number;
}

/**
 * GET /admin/dashboard/top-tours?limit=5&from=&to=
 * Row 5: Top 5 tours table
 */
export interface TopTour {
    id: string;
    rank?: number;
    title: string;
    thumbnail?: string;
    image?: string;
    category?: string;
    sales_count: number;
    revenue: number;
    rating?: number;
    trend?: number;
    status?: 'active' | 'inactive' | 'full';
}

export interface TopToursParams {
    limit: number;
    from?: string;
    to?: string;
}

/**
 * GET /admin/bookings?page=1&per_page=8&sort=booked_at&order=desc&status=
 * Row 5: Recent orders table
 */
export interface Booking {
    id: string;
    customer: {
        name: string;
        avatar?: string;
    };
    tour_title: string;
    booked_at: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    total_amount: number;
}

export interface BookingsResponse {
    data: Booking[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface BookingsParams {
    page: number;
    per_page: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    booking_status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/** GET /admin/bookings/export */
export interface BookingsExportParams {
    from_date: string;
    to_date: string;
}

export interface BookingStatusCounts {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}

export interface BookingStatusCountsParams {
    from_date?: string;
    to_date?: string;
    search?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Aggregated Type (for backward compatibility during migration)
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardData {
    stats: DashboardStats;
    dailyRevenueData: RevenueDataPoint[];
    bookingTrendData: BookingTrendDataPoint[];
    userGrowthData: UserGrowthDataPoint[];
    orderStatusData: Array<{ name: string; value: number; color: string }>;
    topTours: TopTour[];
    recentOrders: Array<{
        id: string;
        customer: { name: string; avatar: string };
        tourTitle: string;
        amount: string;
        status: 'paid' | 'pending' | 'cancelled' | 'processing';
        date: string;
    }>;
    recentReviews: Array<{
        id: string;
        customer: { name: string; avatar: string };
        rating: number;
        comment: string;
        tourTitle: string;
        date: string;
    }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardChartsProps {
    dailyRevenueData: RevenueDataPoint[];
    bookingTrendData: BookingTrendDataPoint[];
    userGrowthData: UserGrowthDataPoint[];
    orderStatusData: Array<{ name: string; value: number; color: string }>;
    onRevenueRefresh?: () => void;
    isRevenueFetching?: boolean;
    isRevenueLoading?: boolean;
    isRevenueError?: boolean;
    onTrendRefresh?: () => void;
    isTrendFetching?: boolean;
    isTrendLoading?: boolean;
    isTrendError?: boolean;
    onGrowthRefresh?: () => void;
    isGrowthFetching?: boolean;
    isGrowthLoading?: boolean;
    isGrowthError?: boolean;
    onStatusRefresh?: () => void;
    isStatusFetching?: boolean;
    isStatusLoading?: boolean;
    isStatusError?: boolean;
}

export interface StatsCardsProps {
    stats?: DashboardStats;
    bookingStatus?: BookingStatusCounts;
    ordersFromStatusTotal?: number;
    isLoading?: boolean;
    bookingStatusLoading?: boolean;
    isRefreshing?: boolean;
    isError?: boolean;
    bookingStatusError?: boolean;
}
