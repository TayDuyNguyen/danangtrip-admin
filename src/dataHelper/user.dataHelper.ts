export type RawUserRole = 'admin' | 'user';
export type RawUserStatus = 'active' | 'banned' | 'pending';

export interface RawUserItem {
    id: number;
    full_name: string;
    email: string;
    username: string;
    avatar: string | null;
    role: RawUserRole;
    status: RawUserStatus;
    orders_count?: number | string;
    reviews_count?: number | string;
    ratings_count?: number | string;
    phone: string | null;
    birthdate: string | null;
    gender: string | null;
    city: string | null;
    last_login_at: string | null;
    email_verified_at: string | null;
    bookings_count?: number | string;
    favorites_count?: number | string;
    total_spend?: number | string;
    created_at: string;
    updated_at: string;
}

export interface UserStats {
    total: number;
    active: number;
    banned: number;
    admin: number;
}

export interface RawUserListResponse {
    data: RawUserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    stats?: UserStats;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'banned' | 'pending';

export interface UserItem {
    id: number;
    fullName: string;
    email: string;
    username: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    ordersCount: number;
    reviewsCount: number;
    joinedDate: string;
    createdAt: string;
    updatedAt: string;
    phone?: string;
    birthdate?: string;
    gender?: string;
    city?: string;
    lastLoginAt?: string;
    isEmailVerified: boolean;
    bookingsCount: number;
    favoritesCount: number;
    totalSpend: number;
}

export interface UserListResponse {
    data: UserItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats?: UserStats;
}

export interface UserListFilters {
    q?: string;
    role?: string;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface UserBookingItem {
    id: number;
    booking_code: string;
    final_amount: number | string;
    booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: string;
    tour_schedule?: {
        tour?: {
            name: string;
        };
    };
}

export interface UserRatingItem {
    id: number;
    rating: number;
    comment: string | null;
    status: 'approved' | 'pending' | 'rejected';
    created_at: string;
    tour?: {
        id: number;
        name: string;
        image_path?: string | null;
    } | null;
    location?: {
        id: number;
        name: string;
        image_path?: string | null;
    } | null;
}

export interface UserBookingListResponse {
    data: UserBookingItem[];
    meta: {
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
}

export interface UserRatingListResponse {
    data: UserRatingItem[];
    meta: {
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
    };
}

