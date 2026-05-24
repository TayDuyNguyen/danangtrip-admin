import { toNumberSafe, toArraySafe } from "./dashboard.mapper";
import type { RawUserItem, RawUserListResponse, UserItem, UserListResponse, UserStatus } from "./user.dataHelper";

/**
 * Mappers: Raw Backend User Data -> UI View Models
 */

export const mapUserItem = (raw: RawUserItem): UserItem => {
    return {
        id: raw.id,
        fullName: raw.full_name || "N/A",
        email: raw.email || "N/A",
        username: raw.username ? (raw.username.startsWith("@") ? raw.username : `@${raw.username}`) : "@user",
        avatar: raw.avatar || undefined,
        role: (raw.role as string) === "admin" ? "admin" : "user",
        status: (['active', 'banned', 'pending'].includes(raw.status) ? raw.status : 'active') as UserStatus,
        ordersCount: toNumberSafe(raw.orders_count, 0),
        reviewsCount: toNumberSafe(raw.reviews_count, 0),
        joinedDate: raw.created_at ? new Date(raw.created_at).toLocaleDateString("vi-VN") : "N/A",
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        phone: raw.phone || undefined,
        birthdate: raw.birthdate || undefined,
        gender: raw.gender || undefined,
        city: raw.city || undefined,
        lastLoginAt: raw.last_login_at || undefined,
        isEmailVerified: !!raw.email_verified_at,
        bookingsCount: toNumberSafe(raw.bookings_count, 0),
        favoritesCount: toNumberSafe(raw.favorites_count, 0),
        totalSpend: toNumberSafe(raw.total_spend, 0),
    };
};

export const mapUserList = (raw: RawUserListResponse | unknown): UserListResponse => {
    const rawCast = raw as RawUserListResponse;
    const items = toArraySafe<RawUserItem>(rawCast?.data || raw);

    return {
        data: items.map(mapUserItem),
        meta: {
            current_page: toNumberSafe(rawCast?.current_page, 1),
            last_page: toNumberSafe(rawCast?.last_page, 1),
            per_page: toNumberSafe(rawCast?.per_page, 10),
            total: toNumberSafe(rawCast?.total, items.length),
        },
    };
};
