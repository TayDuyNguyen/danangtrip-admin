import type {
    AdminRawPaymentItem,
    AdminRawPaymentListResponse,
    PaymentItem,
    AdminPaymentListResponse,
} from "./payment.dataHelper";
import { toNumberSafe, toArraySafe } from "./dashboard.mapper";

/**
 * Mappers: Raw Backend Data -> UI View Models
 */

export const mapPaymentItem = (raw: AdminRawPaymentItem): PaymentItem => {
    return {
        id: raw.id,
        transactionCode: raw.transaction_code,
        bookingCode: raw.booking?.booking_code || "",
        customerName: raw.booking?.customer_name || "N/A",
        customerEmail: raw.booking?.customer_email || "N/A",
        customerAvatar: raw.booking?.customer_avatar || undefined,
        amount: toNumberSafe(raw.amount),
        gateway: raw.payment_method,
        status: raw.payment_status,
        refundedAt: raw.refunded_at,
        refundReason: raw.refund_reason,
        transactionDate: raw.created_at,
        tourName: raw.booking?.tour_name || "N/A",
        tourThumbnail: raw.booking?.tour_thumbnail || undefined,
    };
};

export const mapPaymentList = (raw: AdminRawPaymentListResponse | unknown): AdminPaymentListResponse => {
    const rawCast = raw as AdminRawPaymentListResponse;
    const items = toArraySafe<AdminRawPaymentItem>(rawCast?.data || raw);

    return {
        data: items.map(mapPaymentItem),
        meta: {
            current_page: toNumberSafe(rawCast?.current_page, 1),
            last_page: toNumberSafe(rawCast?.last_page, 1),
            per_page: toNumberSafe(rawCast?.per_page, 10),
            total: toNumberSafe(rawCast?.total, items.length),
        },
    };
};
