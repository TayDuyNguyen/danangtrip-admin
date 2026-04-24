import type { Schedule, ScheduleStatus } from '@/types/schedule';
import type { RawSchedule } from './schedule.dataHelper';
import { toNumberSafe } from '@/utils/safeConverters';

function toYmd(value: string): string {
    return String(value).split('T')[0] ?? String(value);
}

function normalizeStatus(raw: string): ScheduleStatus {
    const u = (raw || '').toLowerCase();
    if (u === 'available') {
        return 'AVAILABLE';
    }
    if (u === 'full') {
        return 'FULL';
    }
    if (u === 'cancelled') {
        return 'CANCELLED';
    }
    return 'AVAILABLE';
}

/**
 * Mapper for Schedule module — aligns with Laravel TourSchedule JSON shape.
 */
export const scheduleMapper = {
    mapFromRaw: (raw: RawSchedule): Schedule => {
        const checkOverride = (val: string | number | null | undefined) =>
            val !== null && val !== undefined && String(val).trim() !== '';

        return {
            id: raw.id,
            tourId: raw.tour_id,
            tourName: raw.tour?.name?.trim() ?? '',
            tourImage: raw.tour?.thumbnail?.trim() ?? '',
            categoryName: raw.tour?.category?.name?.trim() ?? '',
            startDate: toYmd(raw.start_date),
            endDate: toYmd(raw.end_date),
            totalSlots: toNumberSafe(raw.max_people, 0),
            bookedSlots: toNumberSafe(raw.booked_people, 0),
            priceAdult: checkOverride(raw.price_adult)
                ? toNumberSafe(raw.price_adult, 0)
                : null,
            priceChild: checkOverride(raw.price_child)
                ? toNumberSafe(raw.price_child, 0)
                : null,
            priceInfant: checkOverride(raw.price_infant)
                ? toNumberSafe(raw.price_infant, 0)
                : null,
            status: normalizeStatus(raw.status),
        };
    },

    /**
     * Map UI partial to API body for create/update (field names match Laravel requests).
     */
    mapToRaw: (data: Partial<Schedule>): Record<string, unknown> => {
        const out: Record<string, unknown> = {};
        if (data.startDate !== undefined) {
            out.start_date = data.startDate;
        }
        if (data.endDate !== undefined) {
            out.end_date = data.endDate;
        }
        if (data.totalSlots !== undefined) {
            out.max_people = data.totalSlots;
        }
        if (data.priceAdult !== undefined) {
            out.price_adult = data.priceAdult;
        }
        if (data.priceChild !== undefined) {
            out.price_child = data.priceChild;
        }
        if (data.priceInfant !== undefined) {
            out.price_infant = data.priceInfant;
        }
        if (data.status !== undefined) {
            out.status = String(data.status).toLowerCase();
        }
        return out;
    },
};
