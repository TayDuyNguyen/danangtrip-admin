
export interface DashboardData {
    total_users?: number;
    total_locations?: number;
    total_ratings?: number;
    total_views?: number;
}

/**
 * Chart data for location categories
 * (Dữ liệu biểu đồ cho phân loại địa điểm)
 */
export interface CategoryData {
    name: string;
    value: number;
    color?: string;
}

/**
 * Recent activity item
 * (Các mục hoạt động gần đây)
 */
export interface RecentActivityItem {
    id: string;
    title: string;
    author: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: string;
}

export interface RecentActivityTableProps {
    activities: RecentActivityItem[];
}
