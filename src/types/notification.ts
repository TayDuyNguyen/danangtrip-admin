export interface RawNotificationUser {
    id: number;
    full_name: string;
    email: string;
}

export interface RawNotificationItem {
    id: number;
    user_id: number;
    type: string;
    title: string;
    content: string;
    data: string | Record<string, unknown> | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    user?: RawNotificationUser;
}

export interface NotificationStats {
    total: number;
    read: number;
    unread: number;
}

export interface RawNotificationListResponse {
    current_page: number;
    data: RawNotificationItem[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
    stats?: NotificationStats;
}

export interface NotificationViewModel {
    id: number;
    userId: number;
    type: "booking" | "rating" | "system" | "promotion" | string;
    title: string;
    content: string;
    data: Record<string, unknown> | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    recipientName: string;
    recipientEmail: string;
    recipientAvatar?: string;
}

export interface NotificationListFilters {
    q?: string;
    type?: string;
    is_read?: string;
    user_id?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}
