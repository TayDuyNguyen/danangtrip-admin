import { splitLines } from "@/utils/text";
import { toNumberSafe, toArraySafe } from "@/utils/safeConverters";
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
    thumbnail: string | null;
    images: string[] | null;
    video_url: string | null;
    location_ids?: number[] | null;
    status: 'active' | 'inactive' | 'sold_out';
    is_featured: boolean | number;
    is_hot: boolean | number;
    view_count: number;
    booking_count: number;
    created_by?: number | string | null;
    created_at: string;
    updated_at: string;
    category?: RawTourCategory;
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

export const tourMapper = {
    /** API → UI */
    mapFromRaw(raw: RawTour): TourViewModel {
        return {
            id: toNumberSafe(raw.id),
            name: raw.name || '',
            slug: raw.slug || '',
            tour_category_id: toNumberSafe(raw.tour_category_id),
            description: raw.description || '',
            short_desc: raw.short_desc,
            itinerary: Array.isArray(raw.itinerary) ? raw.itinerary : [],
            inclusions: inclusionsToFormField(raw.inclusions),
            exclusions: inclusionsToFormField(raw.exclusions),
            price_adult: String(raw.price_adult || '0'),
            price_child: String(raw.price_child || '0'),
            price_infant: String(raw.price_infant || '0'),
            discount_percent: toNumberSafe(raw.discount_percent),
            duration: raw.duration || '',
            start_time: raw.start_time,
            meeting_point: raw.meeting_point,
            max_people: toNumberSafe(raw.max_people),
            min_people: toNumberSafe(raw.min_people),
            available_from: raw.available_from,
            available_to: raw.available_to,
            thumbnail: raw.thumbnail,
            images: toArraySafe<string>(raw.images),
            video_url: raw.video_url,
            status: raw.status || 'inactive',
            is_featured: Boolean(raw.is_featured),
            is_hot: Boolean(raw.is_hot),
            view_count: toNumberSafe(raw.view_count),
            booking_count: toNumberSafe(raw.booking_count),
            created_by:
                raw.created_by !== undefined && raw.created_by !== null
                    ? toNumberSafe(raw.created_by)
                    : null,
            created_at: raw.created_at || '',
            updated_at: raw.updated_at || '',
            categoryName: raw.category?.name,
            location_ids: Array.isArray(raw.location_ids) ? raw.location_ids : [],
        };
    },

    /** Form / UI → API request body */
    mapToRaw(form: Partial<TourViewModel>): Partial<RawTour> {
        return {
            name: form.name,
            slug: form.slug,
            tour_category_id: toNumberSafe(form.tour_category_id),
            description: form.description,
            short_desc: form.short_desc,
            itinerary: form.itinerary,
            inclusions: splitLines(form.inclusions),
            exclusions: splitLines(form.exclusions),
            price_adult: toNumberSafe(form.price_adult),
            price_child: optionalNumericPayload(form.price_child) as number | string,
            price_infant: optionalNumericPayload(form.price_infant) as number | string,
            discount_percent: toNumberSafe(form.discount_percent),
            duration: form.duration,
            start_time: form.start_time,
            meeting_point: form.meeting_point,
            max_people: optionalNumericPayload(form.max_people) as number | string,
            min_people: optionalNumericPayload(form.min_people) as number | string,
            available_from: form.available_from,
            available_to: form.available_to,
            thumbnail: form.thumbnail,
            images: form.images,
            video_url: form.video_url,
            status: form.status,
            is_featured: !!form.is_featured,
            is_hot: !!form.is_hot,
            location_ids: Array.isArray(form.location_ids) && form.location_ids.length > 0
                ? form.location_ids
                : []
        };
    }
};
