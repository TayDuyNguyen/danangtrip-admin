import type { RawLocation, RawRating, RawRatingStats } from '@/types';
import type { LocationViewModel, LocationListData, LocationListResponse, RatingViewModel, RatingStatsViewModel, OpeningHours } from './location.dataHelper';
import { toNumberSafe } from '@/utils/safeConverters';
import { formatCurrency } from '@/utils/pricing';
import type { CreateLocationInput } from '@/validations/location.schema';

export type LocationPriceDisplay =
    | { type: 'free' }
    | { type: 'empty' }
    | { type: 'single'; amount: number }
    | { type: 'range'; min: number; max: number };

/**
 * Format large numbers to human readable strings (e.g. 12400 -> 12.4K)
 */
const formatMetric = (value: number | undefined | null): string => {
    const n = toNumberSafe(value, 0);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
};

/**
 * Normalize API price_level (1–4 or string) to i18n key under location:priceLevels
 */
const normalizePriceLevelKey = (level: string | number | undefined | null): string => {
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

/**
 * Resolve how to show location price in list/detail UI (VND amounts, not $ labels).
 */
export const getLocationPriceDisplay = (
    priceMin?: number | null,
    priceMax?: number | null
): LocationPriceDisplay => {
    const min = priceMin != null ? toNumberSafe(priceMin) : null;
    const max = priceMax != null ? toNumberSafe(priceMax) : null;
    const hasMin = min != null;
    const hasMax = max != null;

    if (!hasMin && !hasMax) return { type: 'empty' };
    if (hasMin && hasMax && min === 0 && max === 0) return { type: 'free' };
    if (hasMin && !hasMax && min === 0) return { type: 'free' };
    if (!hasMin && hasMax && max === 0) return { type: 'free' };

    if (hasMin && hasMax) {
        if (min === max) return { type: 'single', amount: min };
        return { type: 'range', min, max };
    }
    if (hasMin) return { type: 'single', amount: min! };
    return { type: 'single', amount: max! };
};

/** Format VND price for table cells; pass `t` for i18n free/empty labels. */
export const formatLocationPriceLabel = (
    priceMin?: number | null,
    priceMax?: number | null,
    t?: (key: string) => string
): string => {
    const display = getLocationPriceDisplay(priceMin, priceMax);
    if (display.type === 'free') return t?.('table.price_free') ?? 'Miễn phí';
    if (display.type === 'empty') return t?.('table.price_not_set') ?? '—';
    if (display.type === 'single') return `${formatCurrency(display.amount)}đ`;
    return `${formatCurrency(display.min)} - ${formatCurrency(display.max)}đ`;
};

function resolveDistrictLabel(raw: RawLocation): string {
    if (typeof raw.district === 'string' && raw.district.trim() !== '') {
        return raw.district;
    }
    return '—';
}

/**
 * Safely parse opening hours from string or object
 */
const parseOpeningHours = (val: unknown): string | string[] | OpeningHours | undefined => {
    if (!val) return undefined;
    if (Array.isArray(val)) {
        if (val.length === 1 && typeof val[0] === 'string') {
            const innerStr = val[0].trim();
            if (innerStr.startsWith('[') && innerStr.endsWith(']')) {
                try {
                    return parseOpeningHours(JSON.parse(innerStr));
                } catch {
                    // Fallback
                }
            }
        }
        const items = val.map((item) => String(item).trim()).filter(Boolean);
        return items.length > 0 ? items : undefined;
    }
    if (typeof val === 'object' && !Array.isArray(val)) return val as OpeningHours;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed === '') return undefined;
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                return parseOpeningHours(JSON.parse(trimmed));
            } catch {
                return trimmed;
            }
        }
        return trimmed;
    }
    return undefined;
};

/**
 * Format raw opening hours to a clean multiline string for form input
 */
const formatOpeningHoursForForm = (val: unknown): string => {
    const parsed = parseOpeningHours(val);
    if (!parsed) return '';
    if (typeof parsed === 'string') return parsed;
    if (Array.isArray(parsed)) {
        return parsed.join('\n');
    }
    if (typeof parsed === 'object') {
        const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
        const lines: string[] = [];
        for (const day of daysOrder) {
            const time = (parsed as Record<string, string>)[day];
            if (time) {
                lines.push(`${day.toUpperCase()}: ${time}`);
            }
        }
        return lines.join('\n');
    }
    return '';
};

/**
 * Map Raw API Location to View Model
 */
export const mapLocationToViewModel = (raw: RawLocation): LocationViewModel => {
    const priceKey = normalizePriceLevelKey(raw.price_level);

    return {
        id: raw.id,
        name: raw.name,
        slug: raw.slug,
        thumbnail: typeof raw.thumbnail === 'string' ? raw.thumbnail : (raw.thumbnail as unknown as { url: string })?.url || '',
        address: raw.address,
        district: resolveDistrictLabel(raw),
        category: raw.category?.name ?? '—',
        description: raw.description || '',
        shortDescription: raw.short_description || '',
        phone: raw.phone,
        email: raw.email,
        website: raw.website,
        openingHours: parseOpeningHours(raw.opening_hours),
        latitude: raw.latitude !== null && raw.latitude !== undefined && raw.latitude !== ''
            ? toNumberSafe(raw.latitude)
            : undefined,
        longitude: raw.longitude !== null && raw.longitude !== undefined && raw.longitude !== ''
            ? toNumberSafe(raw.longitude)
            : undefined,
        priceLevelKey: priceKey,
        priceMin:
            raw.price_min !== null && raw.price_min !== undefined && raw.price_min !== ''
                ? toNumberSafe(raw.price_min)
                : undefined,
        priceMax:
            raw.price_max !== null && raw.price_max !== undefined && raw.price_max !== ''
                ? toNumberSafe(raw.price_max)
                : undefined,
        rating: toNumberSafe(raw.avg_rating ?? raw.rating, 0),
        reviewCount: raw.review_count || 0,
        status: raw.status,
        isFeatured: raw.is_featured,
        viewCountStr: formatMetric(raw.view_count),
        favoriteCountStr: formatMetric(raw.favorite_count),
        images: (raw.images || []).map((img: unknown) => typeof img === 'string' ? img : (img as { url: string }).url || ''),
        amenities: (raw.amenities || []).map((amenity) => amenity.name),
        tags: (raw.tags || []).map((tag) => tag.name),
    };
};

/**
 * Map Raw API Location to Form Input (snake_case)
 */
export const mapLocationToFormInput = (raw: RawLocation): CreateLocationInput & { id: number } => {
    return {
        id: raw.id,
        name: raw.name,
        slug: raw.slug,
        category_id: raw.category_id,
        subcategory_id: raw.subcategory_id,
        description: raw.description || '',
        short_description: raw.short_description || '',
        address: raw.address,
        district: raw.district || '',
        latitude: toNumberSafe(raw.latitude, 0),
        longitude: toNumberSafe(raw.longitude, 0),
        phone: raw.phone || null,
        email: raw.email || null,
        website: raw.website || null,
        opening_hours: formatOpeningHoursForForm(raw.opening_hours),
        price_min:
            raw.price_min !== null && raw.price_min !== undefined && raw.price_min !== ''
                ? toNumberSafe(raw.price_min)
                : null,
        price_max:
            raw.price_max !== null && raw.price_max !== undefined && raw.price_max !== ''
                ? toNumberSafe(raw.price_max)
                : null,
        price_level: raw.price_level ? Number(raw.price_level) : 1,
        thumbnail: raw.thumbnail || '',
        images: raw.images || [],
        video_url: raw.video_url || null,
        status: raw.status as 'active' | 'inactive',
        is_featured: !!raw.is_featured,
        tags: (raw.tags || []).map(t => t.id),
        amenities: (raw.amenities || []).map(a => a.id),
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

/**
 * Map Raw API Rating to View Model
 */
export const mapRatingToViewModel = (raw: RawRating): RatingViewModel => {
    return {
        id: raw.id,
        score: raw.score,
        comment: raw.comment || '',
        images: (raw.images || []).map((img: unknown) => typeof img === 'string' ? img : (img as { url: string }).url || ''),
        status: raw.status,
        userName: raw.user.full_name,
        userAvatar: raw.user.avatar || '',
        createdAt: raw.created_at,
    };
};

/**
 * Map Raw API Rating Stats to Summary View Model
 */
export const mapRatingStats = (raw: RawRatingStats): RatingStatsViewModel => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, ...raw };
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const average = total > 0 
        ? Object.entries(stats).reduce((sum, [score, count]) => sum + Number(score) * count, 0) / total 
        : 0;

    return {
        average: Number(average.toFixed(1)),
        total,
        distribution: {
            1: stats[1] || 0,
            2: stats[2] || 0,
            3: stats[3] || 0,
            4: stats[4] || 0,
            5: stats[5] || 0,
        }
    };
};
