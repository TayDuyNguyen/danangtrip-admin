import type { RawLocation } from '@/types';

/**
 * View Model for Location List UI
 */
export interface LocationViewModel {
    id: number;
    name: string;
    thumbnail: string | null;
    address: string;
    district: string;
    category: string;
    priceLevelLabel: string;
    priceLevelValue: string;
    rating: number;
    reviewCount: number;
    status: 'active' | 'inactive';
    isFeatured: boolean;
    viewCountStr: string;
    favoriteCountStr: string;
}

/**
 * Filters for Location List
 */
export interface LocationFilters {
    q: string;
    category_id: string | number;
    district_id: string | number;
    price_level: string;
    status: string;
    page: number;
    per_page: number;
}

/**
 * Statistics for Location Module
 */
export interface LocationStats {
    total: number;
    active: number;
    featured: number;
    views: string; // Formatted string like "48.2K"
}

/**
 * API Response for Paginated Locations
 */
export interface LocationListResponse {
    data: RawLocation[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
}

/**
 * UI State for Location List
 */
export interface LocationListData {
    items: LocationViewModel[];
    pagination: {
        total: number;
        currentPage: number;
        perPage: number;
        lastPage: number;
    };
    stats: LocationStats;
}
