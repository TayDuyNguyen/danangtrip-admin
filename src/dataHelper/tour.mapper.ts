import { splitLines } from "@/utils/text";
import { toNumberSafe } from "@/utils/safeConverters";
import type { TourItem } from "./tour.dataHelper";

/** Raw API shape for tour resources (responses and admin payloads). */
export interface RawTour {
    id: number;
    name: string;
    slug: string;
    tour_category_id: number;
    description: string;
    short_desc: string | null;
    itinerary: unknown | null; // Often JSON string or array
    /** Response may be string; create/update body may be string[] */
    inclusions: string | string[] | null;
    exclusions: string | string[] | null;
    price_adult: number | string;
    price_child: number | string;
    price_infant: number | string;
    discount_percent: number;
    duration: string;
    start_time: string | null;
    meeting_point: string | null;
    max_people: number | string;
    min_people: number | string;
    available_from: string | null;
    available_to: string | null;
    thumbnail: string | { url?: string | null } | null;
    images: string[] | Array<{ url?: string | null }> | string | null;
    video_url: string | null;
    location_ids?: number[] | null;
    /** API: active | inactive; legacy sold_out normalized in mapFromRaw */
    status: string;
    booking_availability?: string | null;
    is_featured: boolean | number;
    is_hot: boolean | number;
    view_count: number;
    booking_count: number;
    /** Eloquent withCount('schedules') in list responses */
    schedules_count?: number;
    created_by?: number | string | null;
    created_at: string;
    updated_at: string;
    category?: RawTourCategory;
    category_name?: string | null;
}

export interface RawTourCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    status: string;
}

/** Normalized tour model for UI lists and forms. */
export interface TourViewModel extends Omit<TourItem, 'id'> {
    id: number;
    categoryName?: string;
}

function inclusionsToFormField(raw: string | string[] | null | undefined): string | null {
    if (raw == null) return null;
    if (Array.isArray(raw)) return raw.join("\n");
    return raw;
}

function optionalNumericPayload(v: unknown): number | string {
    if (v == null || v === "") return "";
    return toNumberSafe(v);
}

function normalizeTourVisibility(raw: RawTour): {
    status: 'active' | 'inactive';
    booking_availability: 'open' | 'sold_out';
} {
    const legacySoldOutStatus = raw.status === 'sold_out';
    let status: 'active' | 'inactive' =
        raw.status === 'inactive' ? 'inactive' : 'active';
    if (legacySoldOutStatus) {
        status = 'active';
    }
    let booking_availability: 'open' | 'sold_out' =
        raw.booking_availability === 'sold_out' ? 'sold_out' : 'open';
    if (legacySoldOutStatus) {
        booking_availability = 'sold_out';
    }
    return { status, booking_availability };
}

function parseMaybeJson<T>(value: unknown): T | null {
    if (typeof value !== 'string') return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

function normalizeImageUrl(value: unknown): string {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return '';
        
        // If it's already a full URL or base64, return as is
        if (trimmed.startsWith('http') || trimmed.startsWith('data:')) {
            return trimmed;
        }

        // If it starts with /uploads or similar relative path, prefix with API host
        // We use the global import.meta.env or a safe fallback
        const apiUrl = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8000/api/v1';
        const apiHost = apiUrl.split('/api/v1')[0] || apiUrl.split('/v1')[0] || 'http://localhost:8000';
        
        return `${apiHost}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    }
    
    if (value && typeof value === 'object') {
        const candidate = (value as { url?: unknown }).url;
        return typeof candidate === 'string' ? normalizeImageUrl(candidate) : '';
    }
    return '';
}

function normalizeImageArray(value: unknown): string[] {
    const parsed = parseMaybeJson<unknown>(value);
    const source = parsed ?? value;
    if (!Array.isArray(source)) return [];
    return source
        .map((item) => normalizeImageUrl(item))
        .filter(Boolean);
}

function normalizeItineraryItems(
    value: unknown,
): Array<{ day: number; title: string; content: string }> {
    const parsed = parseMaybeJson<unknown>(value);
    const source = parsed ?? value;
    if (!Array.isArray(source)) return [];

    return source
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item, index) => ({
            day: toNumberSafe(item.day, index + 1) || index + 1,
            title: typeof item.title === 'string' ? item.title : '',
            content: typeof item.content === 'string' ? item.content : '',
        }));
}

export const tourMapper = {
    /** API → UI */
    mapFromRaw(raw: RawTour): TourViewModel {
        const { status, booking_availability } = normalizeTourVisibility(raw);
        return {
            id: toNumberSafe(raw.id),
            name: raw.name || '',
            slug: raw.slug || '',
            tour_category_id: toNumberSafe(raw.tour_category_id),
            description: raw.description || '',
            short_desc: raw.short_desc || '',
            itinerary: normalizeItineraryItems(raw.itinerary),
            inclusions: inclusionsToFormField(raw.inclusions) || '',
            exclusions: inclusionsToFormField(raw.exclusions) || '',
            price_adult: toNumberSafe(raw.price_adult),
            price_child: raw.price_child !== null ? toNumberSafe(raw.price_child) : null,
            price_infant: raw.price_infant !== null ? toNumberSafe(raw.price_infant) : null,
            discount_percent: toNumberSafe(raw.discount_percent),
            duration: raw.duration || '',
            start_time: raw.start_time || '',
            meeting_point: raw.meeting_point || '',
            max_people: raw.max_people !== null ? toNumberSafe(raw.max_people) : null,
            min_people: raw.min_people !== null ? toNumberSafe(raw.min_people) : null,
            available_from: raw.available_from || '',
            available_to: raw.available_to || '',
            thumbnail: normalizeImageUrl(raw.thumbnail),
            images: normalizeImageArray(raw.images),
            video_url: raw.video_url || null,
            status,
            booking_availability,
            is_featured: !!raw.is_featured,
            is_hot: !!raw.is_hot,
            view_count: toNumberSafe(raw.view_count),
            booking_count: toNumberSafe(raw.booking_count),
            scheduleCount: toNumberSafe(raw.schedules_count),
            created_by:
                raw.created_by !== undefined && raw.created_by !== null
                    ? toNumberSafe(raw.created_by)
                    : null,
            created_at: raw.created_at || '',
            updated_at: raw.updated_at || '',
            categoryName: raw.category?.name || raw.category_name || '',
            location_ids: Array.isArray(raw.location_ids) ? raw.location_ids.map(id => toNumberSafe(id)) : [],
        };
    },

    /** Form / UI → API request body */
    mapToRaw(form: Partial<TourViewModel>): Partial<RawTour> {
        const result: Partial<RawTour> = {};

        // Helper to map field only if it exists in the form object
        const ifExists = (key: keyof TourViewModel, mapper: (v: unknown) => unknown) => {
            if (key in form) {
                (result as Record<string, unknown>)[key] = mapper(form[key]);
            }
        };

        // Strings / Simple types
        const pass = (v: unknown) => v;
        const bool = (v: unknown) => !!v;
        const num = (v: unknown) => toNumberSafe(v);

        ifExists('name', pass);
        ifExists('slug', pass);
        ifExists('tour_category_id', num);
        ifExists('description', pass);
        ifExists('short_desc', pass);
        ifExists('itinerary', pass);
        ifExists('inclusions', (v) => splitLines(v as string));
        ifExists('exclusions', (v) => splitLines(v as string));
        ifExists('price_adult', num);
        ifExists('price_child', optionalNumericPayload);
        ifExists('price_infant', optionalNumericPayload);
        ifExists('discount_percent', num);
        ifExists('duration', pass);
        ifExists('start_time', pass);
        ifExists('meeting_point', pass);
        ifExists('max_people', optionalNumericPayload);
        ifExists('min_people', optionalNumericPayload);
        ifExists('available_from', pass);
        ifExists('available_to', pass);
        ifExists('thumbnail', pass);
        ifExists('images', pass);
        ifExists('video_url', pass);
        ifExists('status', pass);
        ifExists('is_featured', bool);
        ifExists('is_hot', bool);
        
        // Special mapping for location_ids to avoid sending [] if not touched
        if ('location_ids' in form) {
            result.location_ids = Array.isArray(form.location_ids) ? form.location_ids : [];
        }

        return result;
    }
};
