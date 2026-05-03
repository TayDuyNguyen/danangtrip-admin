/**
 * Raw Location Data from API
 */
export interface RawLocation {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    district_id?: number | string;
    address: string;
    description: string;
    /** API stores 1–4; legacy strings may appear in older payloads */
    price_level?: number | string;
    thumbnail: string | null;
    images: string[] | null;
    status: 'active' | 'inactive';
    is_featured: boolean;
    view_count: number;
    favorite_count: number;
    avg_rating?: number;
    rating?: number;
    review_count: number;
    created_at: string;
    updated_at: string;
    /** Plain string on Location model JSON */
    district?: string;
    category?: {
        id: number;
        name: string;
    };
}

export type LocationStatus = 'active' | 'inactive';
