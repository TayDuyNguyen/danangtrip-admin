export type PaymentStatus = 'pending' | 'partially_paid' | 'success' | 'failed' | 'refunded';
export type PaymentGateway = 'momo' | 'vnpay' | 'zalopay' | 'sepay' | 'bank_transfer' | 'payos';

export interface AdminRefundRequest {
    id: number;
    refund_code: string;
    booking_code?: string;
    reason_type: 'cancellation' | 'overpayment' | 'admin_adjustment' | 'legacy_refund';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
    requested_amount: number;
    approved_amount: number;
    refund_percent: number;
    bank_code?: string | null;
    account_no?: string | null;
    masked_account_no?: string | null;
    account_name?: string | null;
    reason?: string | null;
}

export interface AdminRawPaymentItem {
    id: number;
    transaction_code: string;
    amount: number | string;
    received_amount?: number | string;
    short_amount?: number | string;
    excess_amount?: number | string;
    reconciliation_status?: 'partial' | 'matched' | 'excess' | 'superseded' | null;
    payment_method: PaymentGateway;
    payment_status: PaymentStatus;
    refunded_at?: string | null;
    refund_reason?: string | null;
    paid_at?: string | null;
    created_at: string;
    updated_at: string;
    latest_refund_request?: AdminRefundRequest | null;
    booking?: {
        id: number;
        booking_code: string;
        total_amount: number | string;
        customer_name?: string;
        customer_email?: string;
        customer_avatar?: string;
        tour_name?: string;
        tour_thumbnail?: string;
    } | null;
}

export interface AdminRawPaymentListResponse {
    data: AdminRawPaymentItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PaymentItem {
    id: number;
    bookingId?: number;
    transactionCode: string;
    bookingCode: string;
    customerName: string;
    customerEmail: string;
    customerAvatar?: string;
    amount: number;
    receivedAmount: number;
    shortAmount: number;
    excessAmount: number;
    reconciliationStatus?: 'partial' | 'matched' | 'excess' | 'superseded' | null;
    gateway: PaymentGateway;
    status: PaymentStatus;
    refundedAt?: string | null;
    refundReason?: string | null;
    paidAt?: string | null;
    transactionDate: string;
    tourName: string;
    tourThumbnail?: string;
    latestRefundRequest?: AdminRefundRequest | null;
}

export interface AdminPaymentListResponse {
    data: PaymentItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface PaymentListFilters {
    search?: string;
    payment_status?: string;
    payment_gateway?: string;
    refund_status?: string;
    date_from?: string;
    date_to?: string;
}
