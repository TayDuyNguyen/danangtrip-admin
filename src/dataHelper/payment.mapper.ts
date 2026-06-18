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
        bookingId: raw.booking?.id || undefined,
        transactionCode: raw.transaction_code,
        bookingCode: raw.booking?.booking_code || "",
        customerName: raw.booking?.customer_name || "N/A",
        customerEmail: raw.booking?.customer_email || "N/A",
        customerAvatar: raw.booking?.customer_avatar || undefined,
        amount: toNumberSafe(raw.amount),
        receivedAmount: toNumberSafe(raw.received_amount),
        shortAmount: toNumberSafe(raw.short_amount),
        excessAmount: toNumberSafe(raw.excess_amount),
        reconciliationStatus: raw.reconciliation_status,
        gateway: raw.payment_method,
        status: raw.reconciliation_status === "partial" ? "partially_paid" : raw.payment_status,
        refundedAt: raw.refunded_at,
        refundReason: raw.refund_reason,
        paidAt: raw.paid_at,
        transactionDate: raw.created_at,
        tourName: raw.booking?.tour_name || "N/A",
        tourThumbnail: raw.booking?.tour_thumbnail || undefined,
        latestRefundRequest: raw.latest_refund_request,
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
