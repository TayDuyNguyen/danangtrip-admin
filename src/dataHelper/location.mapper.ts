import type { RawLocation } from '@/types';
import type { 
    LocationViewModel, 
    LocationListData, 
    LocationListResponse 
} from './location.dataHelper';
import { toNumberSafe } from '@/utils/safeConverters';

/**
 * Format large numbers to human readable strings (e.g. 12400 -> 12.4K)
 */
export const formatMetric = (value: number | undefined | null): string => {
    const n = toNumberSafe(value, 0);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
};

/**
 * Map Price Level to UI Label
 */
const mapPriceLevel = (level: string | undefined): { label: string; value: string } => {
    switch (level) {
        case 'free': return { label: 'Miễn phí', value: 'free' };
        case 'low': return { label: '$', value: 'low' };
        case 'medium': return { label: '$$', value: 'medium' };
        case 'high': return { label: '$$$', value: 'high' };
        default: return { label: 'N/A', value: 'unknown' };
    }
};

/**
 * Map Raw API Location to View Model
 */
export const mapLocationToViewModel = (raw: RawLocation): LocationViewModel => {
    const priceInfo = mapPriceLevel(raw.price_level);
    
    return {
        id: raw.id,
        name: raw.name,
        thumbnail: raw.thumbnail,
        address: raw.address,
        district: raw.district?.name || 'N/A',
        category: raw.category?.name || 'N/A',
        priceLevelLabel: priceInfo.label,
        priceLevelValue: priceInfo.value,
        rating: raw.rating || 0,
        reviewCount: raw.review_count || 0,
        status: raw.status,
        isFeatured: raw.is_featured,
        viewCountStr: formatMetric(raw.view_count),
        favoriteCountStr: formatMetric(raw.favorite_count),
    };
};

/**
 * Map API Paginated Response to UI Data
 */
export const mapLocationListData = (
    response: LocationListResponse, 
    statsSummary?: { total: number; active: number; featured: number; total_views: number }
): LocationListData => {
    return {
        items: response.data.map(mapLocationToViewModel),
        pagination: {
            total: response.total,
            currentPage: response.current_page,
            perPage: response.per_page,
            lastPage: response.last_page,
        },
        stats: {
            total: statsSummary?.total ?? response.total,
            active: statsSummary?.active ?? 0,
            featured: statsSummary?.featured ?? 0,
            views: formatMetric(statsSummary?.total_views ?? 0),
        }
    };
};
