import type { 
    AdminRawBookingItem, 
    AdminRawBookingListResponse, 
    AdminRawBookingStatusCounts,
    BookingItem,
    AdminBookingListResponse,
    AdminBookingStatusCounts,
    RawBookingDetail,
    BookingDetail,
    RawBookingDetailItem,
    BookingDetailItem
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

export const mapBookingDetailItem = (raw: RawBookingDetailItem): BookingDetailItem => {
    return {
        id: raw.id,
        bookingId: raw.booking_id,
        tourId: raw.tour_id,
        tourScheduleId: raw.tour_schedule_id,
        itemName: raw.item_name,
        travelDate: raw.travel_date,
        quantityAdult: toNumberSafe(raw.quantity_adult),
        quantityChild: toNumberSafe(raw.quantity_child),
        quantityInfant: toNumberSafe(raw.quantity_infant),
        unitPriceAdult: toNumberSafe(raw.unit_price_adult),
        unitPriceChild: toNumberSafe(raw.unit_price_child),
        unitPriceInfant: toNumberSafe(raw.unit_price_infant),
        subtotal: toNumberSafe(raw.subtotal),
        tour: {
            id: raw.tour?.id || raw.tour_id,
            name: raw.tour?.name || raw.item_name,
            thumbnail: raw.tour?.thumbnail,
            duration: raw.tour?.duration || "",
            slug: raw.tour?.slug || "",
        },
        tourSchedule: raw.tour_schedule ? {
            id: raw.tour_schedule.id,
            startDate: raw.tour_schedule.start_date,
            endDate: raw.tour_schedule.end_date,
            departurePlace: raw.tour_schedule.departure_place,
            bookingDeadline: raw.tour_schedule.booking_deadline,
            status: raw.tour_schedule.status,
        } : undefined
    };
};

export const mapBookingDetail = (raw: RawBookingDetail | unknown): BookingDetail => {
    const data = (raw as { data?: RawBookingDetail })?.data || (raw as RawBookingDetail);
    
    return {
        id: data.id,
        code: data.booking_code,
        userId: data.user_id,
        customer: {
            id: data.user?.id || data.user_id,
            name: data.customer_name,
            email: data.customer_email,
            phone: data.customer_phone,
            address: data.customer_address,
            avatar: data.user?.avatar,
            note: data.customer_note,
        },
        totalAmount: toNumberSafe(data.total_amount),
        discountAmount: toNumberSafe(data.discount_amount),
        finalAmount: toNumberSafe(data.final_amount),
        depositAmount: toNumberSafe(data.deposit_amount),
        paymentMethod: data.payment_method,
        paymentStatus: data.payment_status,
        bookingStatus: data.booking_status,
        cancellationReason: data.cancellation_reason,
        bookedAt: data.booked_at,
        confirmedAt: data.confirmed_at,
        cancelledAt: data.cancelled_at,
        completedAt: data.completed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: toArraySafe<RawBookingDetailItem>(data.items).map(mapBookingDetailItem),
    };
};

