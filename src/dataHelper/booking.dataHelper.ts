export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface AdminRawBookingItem {
    id: number;
    booking_code: string;
    booking_status: BookingStatus;
    payment_status: PaymentStatus;
    total_amount: number | string;
    customer_name: string;
    customer_email: string;
    customer_avatar?: string;
    tour_name: string;
    tour_thumbnail?: string;
    tour_category?: string;
    booked_at: string;
    departure_date: string;
    cancellation_reason?: string;
}

export interface AdminRawBookingListResponse {
    data: AdminRawBookingItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface AdminRawBookingStatusCounts {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}

export interface BookingItem {
    id: number;
    code: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    amount: number;
    customer: {
        name: string;
        email: string;
        avatar?: string;
    };
    tour: {
        name: string;
        thumbnail?: string;
        category?: string;
    };
    bookedAt: string;
    departureDate: string;
    cancellationReason?: string;
}

export interface BookingListFilters {
    search?: string;
    status?: BookingStatus | 'all';
    payment_status?: PaymentStatus | 'all';
    date_from?: string;
    date_to?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface AdminBookingListResponse {
    data: BookingItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface AdminBookingStatusCounts {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}
