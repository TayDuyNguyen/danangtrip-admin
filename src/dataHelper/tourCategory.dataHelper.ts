import { toNumberSafe } from '@/utils/safeConverters';

/**
 * List Params for Categories
 */
export interface CategoryListParams {
    status?: 'active' | 'inactive' | 'sold_out';
    search?: string;
    per_page?: number;
    page?: number;
    with_stats?: boolean;
}

/**
 * Raw category from API
 */
export interface RawTourCategory {
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    description?: unknown;
    icon?: unknown;
    sort_order?: unknown;
    status?: unknown;
    tour_count?: unknown;
    tours_count?: unknown;
    icon_background?: unknown;
    created_at?: unknown;
    updated_at?: unknown;
}

/**
 * Category Statistics
 */
export interface CategoryStats {
    total: number;
    active: number;
    inactive: number;
}

/**
 * API Response Shapes
 */
export interface CategoryListResponse {
    data: RawTourCategory[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats?: CategoryStats;
}

/**
 * Category ViewModel for UI
 */
export interface TourCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    sort_order: number;
    status: 'active' | 'inactive' | 'sold_out';
    tour_count: number;
    icon_background: string;
    created_at: string;
    updated_at: string;
}

/**
 * Mapper for tour categories (Rule §15)
 */
export const tourCategoryMapper = {
    toViewModel: (raw: RawTourCategory | null | undefined): TourCategory => {
        const data = raw || {};
        return {
            id: toNumberSafe(data.id),
            name: String(data.name || ''),
            slug: String(data.slug || ''),
            description: String(data.description || ''),
            icon: String(data.icon || 'Map'),
            sort_order: toNumberSafe(data.sort_order),
            status: (data.status === 'active' || data.status === 'inactive' || data.status === 'sold_out') 
                ? (data.status as 'active' | 'inactive' | 'sold_out') 
                : 'inactive',
            tour_count: toNumberSafe(data.tour_count ?? data.tours_count),
            icon_background: String(data.icon_background || '#E0F2FE'),
            created_at: String(data.created_at || ''),
            updated_at: String(data.updated_at || ''),
        };
    },
    
    toViewModelList: (rawList: RawTourCategory[]): TourCategory[] => {
        return (rawList || []).map((raw) => tourCategoryMapper.toViewModel(raw));
    },

    /**
     * Normalize the dual-shape response from API
     */
    normalizeListResponse: (response: Record<string, unknown> | null | undefined) => {
        // Handle case where response is wrapped in { categories: { data }, stats }
        const categories = response?.categories as Record<string, unknown> | undefined;
        const rawData = (categories?.data || response?.data || []) as RawTourCategory[];
        
        // Robust stats mapping using actual backend field names
        const rawStats = (response?.stats || {}) as Record<string, unknown>;
        const stats: CategoryStats = {
            // Map 'total_tours' to 'total' as it's used in the first card "Số lượng Tour"
            total: toNumberSafe(rawStats.total_tours || rawStats.total_categories),
            active: toNumberSafe(rawStats.active_categories),
            inactive: toNumberSafe(rawStats.inactive_categories),
        };

        const meta = (categories?.meta || response?.meta || {
            total: toNumberSafe(categories?.total || response?.total),
            per_page: toNumberSafe(categories?.per_page || response?.per_page),
            current_page: toNumberSafe(categories?.current_page || response?.current_page),
            last_page: toNumberSafe(categories?.last_page || response?.last_page),
        }) as CategoryListResponse['meta'];

        return {
            items: tourCategoryMapper.toViewModelList(rawData),
            stats,
            meta
        };
    }
};

/**
 * Helper to get icon component name based on category name or slug
 */
export const getCategoryIcon = (slug: string): string => {
    const iconMap: Record<string, string> = {
        'beach': 'Waves',
        'culture': 'Landmark',
        'food': 'Utensils',
        'adventure': 'Mountain',
        'luxury': 'Gem',
        'family': 'Users',
    };
    return iconMap[slug] || 'Map';
};
