import { toNumberSafe, toArraySafe } from "./dashboard.mapper";
import type {
    RawNotificationItem,
    RawNotificationListResponse,
    NotificationViewModel,
    NotificationStats
} from "@/types";

/**
 * Helper to parse Notification data safely
 */
const parseDataSafe = (data: string | Record<string, unknown> | null): Record<string, unknown> | null => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data) as Record<string, unknown>;
    } catch {
        return null;
    }
};

/**
 * Map raw notification item to UI view model
 */
export const mapNotificationItem = (raw: RawNotificationItem): NotificationViewModel => {
    return {
        id: raw.id,
        userId: raw.user_id,
        type: raw.type || 'system',
        title: raw.title || 'N/A',
        content: raw.content || 'N/A',
        data: parseDataSafe(raw.data),
        isRead: !!raw.is_read,
        readAt: raw.read_at ? new Date(raw.read_at) : null,
        createdAt: new Date(raw.created_at),
        recipientName: raw.user?.full_name || "N/A",
        recipientEmail: raw.user?.email || "N/A",
    };
};

/**
 * Map raw paginated list response to UI models and stats
 */
export const mapNotificationList = (raw: RawNotificationListResponse | unknown): {
    data: NotificationViewModel[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: NotificationStats;
} => {
    const rawCast = raw as RawNotificationListResponse;
    const items = toArraySafe<RawNotificationItem>(rawCast?.data || raw);

    return {
        data: items.map(mapNotificationItem),
        meta: {
            current_page: toNumberSafe(rawCast?.current_page, 1),
            last_page: toNumberSafe(rawCast?.last_page, 1),
            per_page: toNumberSafe(rawCast?.per_page, 10),
            total: toNumberSafe(rawCast?.total, items.length),
        },
        stats: {
            total: toNumberSafe(rawCast?.stats?.total, toNumberSafe(rawCast?.total, items.length)),
            read: toNumberSafe(rawCast?.stats?.read, items.filter((item) => item.is_read).length),
            unread: toNumberSafe(rawCast?.stats?.unread, items.filter((item) => !item.is_read).length),
        },
    };
};
