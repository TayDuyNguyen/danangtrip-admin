/**
 * Raw Location Data from API
 */
export interface RawLocation {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    subcategory_id?: number;
    district_id?: number | string;
    address: string;
    description: string;
    short_description?: string;
    /** API stores 1–4; legacy strings may appear in older payloads */
    price_level?: number | string;
    price_min?: number | string;
    price_max?: number | string;
    phone?: string;
    email?: string;
    website?: string;
    opening_hours?: string;
    latitude?: number | string;
    longitude?: number | string;
    thumbnail: string | null;
    images: string[] | null;
    video_url?: string;
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

export interface CreateLocationInput {
    name: string;
    slug: string;
    category_id: number;
    subcategory_id?: number;
    description: string;
    short_description: string;
    address: string;
    district: string;
    latitude: number;
    longitude: number;
    phone?: string;
    email?: string;
    website?: string;
    opening_hours?: string;
    price_min?: number;
    price_max?: number;
    price_level?: number;
    thumbnail: string;
    images?: string[];
    video_url?: string | null;
    status: 'active' | 'inactive';
    is_featured: boolean;
}

export type LocationStatus = 'active' | 'inactive';
