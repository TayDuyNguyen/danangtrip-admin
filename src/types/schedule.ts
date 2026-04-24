/**
 * Enum-like const for Schedule Status (UI). API uses lowercase.
 */
export const ScheduleStatus = {
    AVAILABLE: 'AVAILABLE',
    FULL: 'FULL',
    CANCELLED: 'CANCELLED',
} as const;

export type ScheduleStatus = (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

/**
 * Schedule row for admin list.
 */
export interface Schedule {
    id: number | string;
    tourId: number | string;
    tourName: string;
    tourImage: string;
    categoryName: string;
    startDate: string;
    endDate: string;
    totalSlots: number;
    bookedSlots: number;
    /** null = display “theo giá tour” */
    priceAdult: number | null;
    priceChild: number | null;
    priceInfant: number | null;
    status: ScheduleStatus;
}

/**
 * Filters for schedule list API.
 */
export interface ScheduleFilters {
    q?: string;
    tour_id?: string | number;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

/**
 * Values for the schedule creation/edit form.
 */
export interface ScheduleFormValues {
    startDate: string;
    endDate: string;
    totalSlots: number;
    priceAdult: number | null;
    priceChild: number | null;
    priceInfant: number | null;
    status: string;
}
