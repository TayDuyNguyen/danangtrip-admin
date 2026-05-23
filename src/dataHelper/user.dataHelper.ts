export type RawUserRole = 'admin' | 'user';
export type RawUserStatus = 'active' | 'banned';

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
    created_at: string;
    updated_at: string;
}

export interface RawUserListResponse {
    data: RawUserItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'banned';

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
}

export interface UserListResponse {
    data: UserItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface UserListFilters {
    q?: string;
    role?: string;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}
