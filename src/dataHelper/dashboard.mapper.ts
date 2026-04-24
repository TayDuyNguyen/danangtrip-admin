import type { 
    RawDashboardStats, 
    DashboardStats, 
    RawRevenueStatRow,
    RevenueDataPoint,
    RawBookingTrend,
    BookingTrendDataPoint,
    RawUserGrowth,
    UserGrowthDataPoint,
    RawTopTour,
    TopTour,
    RawBookingsResponse,
    BookingsResponse,
    Booking,
    RawBookingItem,
    RawBookingStatusCounts,
    BookingStatusCounts
} from "./dashboard.dataHelper";
/**
 * Universal helpers for safe data conversion
 */
export const toNumberSafe = (val: unknown, fallback = 0): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
};

export const toArraySafe = <T>(input: unknown): T[] => {
    if (Array.isArray(input)) return input as T[];
    if (input && typeof input === 'object') {
        const obj = input as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as T[];
        if (Array.isArray(obj.items)) return obj.items as T[];
        if (Array.isArray(obj.stats)) return obj.stats as T[];
    }
    return [];
};

export const toDateLabelSafe = (val: unknown): string => {
    return String(val || '');
};

/**
 * Mappers: Raw Backend Data -> UI View Models
 */

const hasStatsTotalsShape = (x: Record<string, unknown>): boolean =>
    ['total_revenue', 'total_bookings', 'total_users', 'total_tours'].some((k) => typeof x[k] !== 'undefined');

/**
 * GET /admin/dashboard/stats — backend có thể trả phẳng hoặc envelope:
 * `{ code, message, data: { total_revenue, total_bookings, ... } }`
 */
export function extractDashboardStatsPayload(raw: unknown): RawDashboardStats | undefined {
    if (raw == null || typeof raw !== 'object') return undefined;
    const o = raw as Record<string, unknown>;
    if (hasStatsTotalsShape(o)) return o as RawDashboardStats;
    const nested = o.data;
    if (nested && typeof nested === 'object' && hasStatsTotalsShape(nested as Record<string, unknown>)) {
        return nested as RawDashboardStats;
    }
    return undefined;
}

export const mapStats = (raw: unknown): DashboardStats => {
    const src = extractDashboardStatsPayload(raw) ?? {};
    return {
        total_revenue: toNumberSafe(src.total_revenue),
        total_revenue_trend: src.revenue_trend ?? null,
        total_bookings: toNumberSafe(src.total_bookings),
        total_bookings_trend: src.booking_trend ?? null,
        total_users: toNumberSafe(src.total_users),
        total_users_trend: src.user_trend ?? null,
        total_tours_sold: toNumberSafe(src.total_tours),
        total_tours_sold_trend: null,
        pending_ratings: src.pending_ratings,
        new_contacts: src.new_contacts,
        booking_status: {
            completed_count: toNumberSafe(src.booking_status?.completed),
            confirmed_count: toNumberSafe(src.booking_status?.confirmed),
            pending_count: toNumberSafe(src.booking_status?.pending),
            cancelled_count: toNumberSafe(src.booking_status?.cancelled),
        },
    };
};

function extractRevenueStats(raw: unknown): RawRevenueStatRow[] {
    if (Array.isArray(raw)) return raw as RawRevenueStatRow[];
    if (!raw || typeof raw !== 'object') return [];
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.stats)) return o.stats as RawRevenueStatRow[];
    const nested = o.data;
    if (nested && typeof nested === 'object') {
        const d = nested as Record<string, unknown>;
        if (Array.isArray(d.stats)) return d.stats as RawRevenueStatRow[];
    }
    return [];
}

export const mapRevenue = (raw: unknown): RevenueDataPoint[] => {
    const stats = extractRevenueStats(raw);
    return stats.map((s) => ({
        date: String(s.date ?? s.period ?? ''),
        revenue: toNumberSafe(s.revenue ?? s.total_revenue),
    }));
};

export interface RawBookingTrendResponseData {
    stats: RawBookingTrend[];
}

export const mapBookingTrend = (raw: RawBookingTrendResponseData | unknown): BookingTrendDataPoint[] => {
    const rawCast = raw as RawBookingTrendResponseData;
    const stats = toArraySafe<RawBookingTrend>(rawCast?.stats || raw);
    return stats.map(item => ({
        date: String(item.date || ''),
        count: toNumberSafe(item.count)
    }));
};

export interface RawUserGrowthResponseData {
    stats: RawUserGrowth[];
}

/** Chuẩn hoá key tháng: "2026-04" (luôn 2 chữ số tháng) */
const toYearMonthKey = (year: number, month: number) =>
    `${year}-${String(month).padStart(2, '0')}`;

/** Lấy mảng stats từ nhiều dạng envelope API (stats root, hoặc data.stats, hoặc { code, data }) */
function extractUserGrowthStats(raw: unknown): RawUserGrowth[] {
    if (Array.isArray(raw)) return raw as RawUserGrowth[];
    if (!raw || typeof raw !== 'object') return [];
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.stats)) return o.stats as RawUserGrowth[];
    const nested = o.data;
    if (nested && typeof nested === 'object') {
        const d = nested as Record<string, unknown>;
        if (Array.isArray(d.stats)) return d.stats as RawUserGrowth[];
    }
    return [];
}

/** month: "YYYY-MM" (backend) hoặc 1–12 (legacy, gắn với requestedYear) */
function parseUserGrowthMonth(
    month: string | number,
    fallbackYear: number
): { year: number; month: number } | null {
    const s = String(month).trim();
    const ym = /^(\d{4})-(\d{1,2})$/.exec(s);
    if (ym) {
        const year = parseInt(ym[1], 10);
        const mo = parseInt(ym[2], 10);
        if (!Number.isNaN(year) && mo >= 1 && mo <= 12) return { year, month: mo };
        return null;
    }
    const n = parseInt(s, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 12) return { year: fallbackYear, month: n };
    return null;
}

/**
 * @param raw — RawUserGrowthResponse, hoặc envelope { data: { stats } }, hoặc mảng điểm
 * @param requestedYear — dùng khi backend chỉ trả số tháng 1–12 (legacy)
 */
export const mapUserGrowth = (raw: unknown, requestedYear?: number): UserGrowthDataPoint[] => {
    const fallbackYear = requestedYear ?? new Date().getFullYear();
    const stats = extractUserGrowthStats(raw);

    const resultMap: Record<string, number> = {};
    for (const s of stats) {
        const parsed = parseUserGrowthMonth(s.month, fallbackYear);
        if (!parsed) continue;
        const key = toYearMonthKey(parsed.year, parsed.month);
        resultMap[key] = toNumberSafe(s.count);
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthsIter: { month: number; year: number }[] = [];

    for (let i = 11; i >= 0; i--) {
        let month = currentMonth - i;
        let year = currentYear;
        if (month <= 0) {
            month += 12;
            year -= 1;
        }
        monthsIter.push({ month, year });
    }

    const results: UserGrowthDataPoint[] = [];
    for (const { month, year } of monthsIter) {
        const key = toYearMonthKey(year, month);
        const name = `${month}/${year}`;
        const val = resultMap[key] ?? 0;
        results.push({
            month: name,
            new_users: val,
            total_users: val,
        });
    }
    return results;
};

export const mapTopTours = (raw: unknown): TopTour[] => {
    const data = toArraySafe<RawTopTour>(raw);
    return data.map((item, idx) => ({
        id: item.id?.toString() || `top-${idx}`,
        rank: idx + 1,
        title: item.name || '',
        sales_count: toNumberSafe(item.booking_count),
        revenue: toNumberSafe(item.total_revenue),
        status: 'active'
    }));
};

export const mapBookings = (raw: RawBookingsResponse | unknown): BookingsResponse => {
    const rawCast = raw as RawBookingsResponse;
    const items = toArraySafe<RawBookingItem>(rawCast?.data || raw);
    
    const mappedData: Booking[] = items.map(item => ({
        id: String(item.booking_code || ''),
        customer: { name: item.customer_name ?? '' },
        tour_title: item.tour_name ?? '',
        booked_at: String(item.booked_at || ''),
        status: (item.booking_status as Booking['status']) || 'pending',
        total_amount: toNumberSafe(item.total_amount)
    }));

    return {
        data: mappedData,
        meta: {
            current_page: toNumberSafe(rawCast?.current_page, 1),
            last_page: toNumberSafe(rawCast?.last_page, 1),
            per_page: toNumberSafe(rawCast?.per_page, 8),
            total: toNumberSafe(rawCast?.total, mappedData.length)
        }
    };
};

export const mapBookingStatusCounts = (raw: RawBookingStatusCounts | unknown): BookingStatusCounts => {
    let data: RawBookingStatusCounts | undefined;
    if (raw && typeof raw === 'object') {
        const o = raw as Record<string, unknown>;
        const looksLikeCounts =
            typeof o.pending !== 'undefined' ||
            typeof o.confirmed !== 'undefined' ||
            typeof o.completed !== 'undefined' ||
            typeof o.cancelled !== 'undefined';
        if (looksLikeCounts) {
            data = o as unknown as RawBookingStatusCounts;
        } else if (o.data && typeof o.data === 'object') {
            data = o.data as RawBookingStatusCounts;
        }
    }

    return {
        pending: toNumberSafe(data?.pending),
        confirmed: toNumberSafe(data?.confirmed),
        completed: toNumberSafe(data?.completed),
        cancelled: toNumberSafe(data?.cancelled),
    };
};