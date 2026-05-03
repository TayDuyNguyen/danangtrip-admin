import type { LocationFilters } from '@/dataHelper/location.dataHelper';

const PRICE_LEVEL_TO_API: Record<string, number> = {
    free: 1,
    low: 2,
    medium: 3,
    high: 4,
};

/**
 * Build query params for GET /admin/locations (validated by IndexAdminLocationRequest).
 */
export function toAdminLocationParams(filters: LocationFilters): Record<string, string | number> {
    const p: Record<string, string | number> = {
        page: filters.page,
        per_page: filters.per_page,
    };

    const q = typeof filters.q === 'string' ? filters.q.trim() : '';
    if (q) p.q = q;

    if (filters.category_id !== 'all' && filters.category_id !== '' && filters.category_id != null) {
        p.category_id = Number(filters.category_id);
    }

    if (filters.district !== 'all' && filters.district) {
        p.district = String(filters.district);
    }

    if (filters.price_level !== 'all' && filters.price_level) {
        const pl = PRICE_LEVEL_TO_API[filters.price_level];
        if (pl != null) p.price_level = pl;
    }

    if (filters.status !== 'all' && filters.status) {
        p.status = filters.status;
    }

    return p;
}
