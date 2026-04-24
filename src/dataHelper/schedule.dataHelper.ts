import type { Schedule } from '@/types/schedule';

/**
 * Tour payload nested in schedule list/detail from API.
 */
export interface RawScheduleTour {
    id: number;
    name?: string;
    thumbnail?: string | null;
    category?: { id: number; name: string; slug?: string } | null;
}

/**
 * Raw structure of Schedule from API (Laravel TourSchedule + tour.category).
 */
export interface RawSchedule {
    id: number | string;
    tour_id: number | string;
    start_date: string;
    end_date: string;
    max_people: number | string;
    booked_people: number | string;
    price_adult?: string | number | null;
    price_child?: string | number | null;
    price_infant?: string | number | null;
    status: string;
    tour?: RawScheduleTour | null;
}

/**
 * List response for Schedules
 */
export interface ScheduleListData {
    data: Schedule[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
}

/**
 * Statistics for Schedules (status-counts endpoint).
 */
export interface ScheduleStats {
    total_schedules: number;
    available_schedules: number;
    full_schedules: number;
    cancelled_schedules: number;
}
