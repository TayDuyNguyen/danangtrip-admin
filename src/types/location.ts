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
    opening_hours?: string | string[] | Record<string, string>;
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
    tags?: { id: number; name: string }[];
    amenities?: { id: number; name: string }[];
}

/**
 * Raw Rating Data from API
 */
export interface RawRating {
    id: number;
    score: number;
    comment: string | null;
    images: string[] | null;
    status: 'pending' | 'approved' | 'rejected';
    user: {
        id: number;
        full_name: string;
        avatar: string | null;
    };
    created_at: string;
}

/**
 * Raw Rating Stats from API
 * Example: { "1": 2, "2": 0, "3": 5, "4": 10, "5": 20 }
 */
export type RawRatingStats = Record<string | number, number>;

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
    opening_hours?: string | string[] | null;
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
