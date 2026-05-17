import type { 
    AdminRawBookingItem, 
    AdminRawBookingListResponse, 
    AdminRawBookingStatusCounts,
    BookingItem,
    AdminBookingListResponse,
    AdminBookingStatusCounts
} from "./booking.dataHelper";
import { toNumberSafe, toArraySafe } from "./dashboard.mapper";

/**
 * Mappers: Raw Backend Data -> UI View Models
 */

export const mapBookingItem = (raw: AdminRawBookingItem): BookingItem => {
    return {
        id: raw.id,
        code: raw.booking_code,
        status: raw.booking_status,
        paymentStatus: raw.payment_status,
        amount: toNumberSafe(raw.total_amount),
        customer: {
            name: raw.customer_name,
            email: raw.customer_email,
            avatar: raw.customer_avatar,
        },
        tour: {
            name: raw.tour_name,
            thumbnail: raw.tour_thumbnail,
            category: raw.tour_category,
        },
        bookedAt: raw.booked_at,
        departureDate: raw.departure_date,
        cancellationReason: raw.cancellation_reason,
    };
};

export const mapBookingList = (raw: AdminRawBookingListResponse | unknown): AdminBookingListResponse => {
    const rawCast = raw as AdminRawBookingListResponse;
    const items = toArraySafe<AdminRawBookingItem>(rawCast?.data || raw);
    
    return {
        data: items.map(mapBookingItem),
        meta: {
            current_page: toNumberSafe(rawCast?.current_page, 1),
            last_page: toNumberSafe(rawCast?.last_page, 1),
            per_page: toNumberSafe(rawCast?.per_page, 10),
            total: toNumberSafe(rawCast?.total, items.length)
        }
    };
};

export const mapBookingStatusCounts = (raw: AdminRawBookingStatusCounts | unknown): AdminBookingStatusCounts => {
    const data = (raw as { data?: AdminRawBookingStatusCounts })?.data || (raw as AdminRawBookingStatusCounts);
    
    return {
        pending: toNumberSafe(data?.pending),
        confirmed: toNumberSafe(data?.confirmed),
        completed: toNumberSafe(data?.completed),
        cancelled: toNumberSafe(data?.cancelled),
    };
};
