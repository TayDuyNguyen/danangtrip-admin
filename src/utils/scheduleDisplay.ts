import type { Schedule, ScheduleStatus } from '@/types/schedule';

/** Resolved status for badges — treats sold-out by capacity even if API status is still `available`. */
export function resolveScheduleDisplayStatus(schedule: Pick<Schedule, 'status' | 'bookedSlots' | 'totalSlots' | 'bookingAvailability'>): ScheduleStatus {
    if (schedule.status === 'CANCELLED') {
        return 'CANCELLED';
    }
    const max = schedule.totalSlots || 0;
    const booked = schedule.bookedSlots || 0;
    if (
        schedule.status === 'FULL' ||
        schedule.bookingAvailability === 'SOLD_OUT' ||
        (max > 0 && booked >= max)
    ) {
        return 'FULL';
    }
    return 'AVAILABLE';
}

export function scheduleHasPriceOverride(
    price: number | null | undefined
): price is number {
    return price !== null && price !== undefined && String(price).trim() !== '';
}
