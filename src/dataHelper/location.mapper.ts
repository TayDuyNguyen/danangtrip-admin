import type { RawLocation } from '@/types';
import type { LocationViewModel, LocationListData, LocationListResponse } from './location.dataHelper';
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
 * Normalize API price_level (1–4 or string) to i18n key under location:priceLevels
 */
export const normalizePriceLevelKey = (level: string | number | undefined | null): string => {
    if (level === null || level === undefined || level === '') return 'unknown';
    const n = typeof level === 'number' ? level : Number(level);
    if (n === 1) return 'free';
    if (n === 2) return 'low';
    if (n === 3) return 'medium';
    if (n === 4) return 'high';
    const s = String(level);
    if (['free', 'low', 'medium', 'high'].includes(s)) return s;
    return 'unknown';
};

function resolveDistrictLabel(raw: RawLocation): string {
    if (typeof raw.district === 'string' && raw.district.trim() !== '') {
        return raw.district;
    }
    return '—';
}

/**
 * Map Raw API Location to View Model
 */
export const mapLocationToViewModel = (raw: RawLocation): LocationViewModel => {
    const priceKey = normalizePriceLevelKey(raw.price_level);

    return {
        id: raw.id,
        name: raw.name,
        thumbnail: raw.thumbnail,
        address: raw.address,
        district: resolveDistrictLabel(raw),
        category: raw.category?.name ?? '—',
        priceLevelKey: priceKey,
        rating: toNumberSafe(raw.avg_rating ?? raw.rating, 0),
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
        },
    };
};
