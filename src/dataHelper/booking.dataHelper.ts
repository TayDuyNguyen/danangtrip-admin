export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'success' | 'failed' | 'refunded' | 'unpaid';

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
    user_id?: number | string;
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

// --- Detail Interfaces (Thêm cho màn hình chi tiết) ---

export interface RawBookingUser {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
}

export interface RawBookingItemTour {
    id: number;
    name: string;
    thumbnail?: string;
    duration: string;
    slug: string;
}

export interface RawBookingItemSchedule {
    id: number;
    start_date: string;
    end_date: string;
    departure_place: string;
    booking_deadline: string;
    status: string;
}

export interface RawBookingDetailItem {
    id: number;
    booking_id: number;
    tour_id: number;
    tour_schedule_id: number;
    item_type: string;
    item_name: string;
    travel_date: string;
    quantity_adult: number;
    quantity_child: number;
    quantity_infant: number;
    unit_price_adult: string | number;
    unit_price_child: string | number;
    unit_price_infant: string | number;
    subtotal: string | number;
    tour?: RawBookingItemTour;
    tour_schedule?: RawBookingItemSchedule;
}

export interface RawBookingDetail {
    id: number;
    booking_code: string;
    user_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address?: string;
    customer_note?: string;
    total_amount: string | number;
    discount_amount: string | number;
    final_amount: string | number;
    deposit_amount: string | number;
    payment_method: string;
    payment_status: PaymentStatus;
    booking_status: BookingStatus;
    cancellation_reason?: string;
    booked_at: string;
    confirmed_at?: string | null;
    cancelled_at?: string | null;
    completed_at?: string | null;
    created_at: string;
    updated_at: string;
    user?: RawBookingUser;
    items: RawBookingDetailItem[];
}

export interface BookingDetailCustomer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
    avatar?: string;
    note?: string;
}

export interface BookingDetailTourInfo {
    id: number;
    name: string;
    thumbnail?: string;
    duration: string;
    slug: string;
    category?: string;
}

export interface BookingDetailScheduleInfo {
    id: number;
    startDate: string;
    endDate: string;
    departurePlace: string;
    bookingDeadline: string;
    status: string;
}

export interface BookingDetailItem {
    id: number;
    bookingId: number;
    tourId: number;
    tourScheduleId: number;
    itemName: string;
    travelDate: string;
    quantityAdult: number;
    quantityChild: number;
    quantityInfant: number;
    unitPriceAdult: number;
    unitPriceChild: number;
    unitPriceInfant: number;
    subtotal: number;
    tour: BookingDetailTourInfo;
    tourSchedule?: BookingDetailScheduleInfo;
}

export interface BookingDetail {
    id: number;
    code: string;
    userId: number;
    customer: BookingDetailCustomer;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    depositAmount: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
    cancellationReason?: string;
    bookedAt: string;
    confirmedAt?: string | null;
    cancelledAt?: string | null;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    items: BookingDetailItem[];
}

