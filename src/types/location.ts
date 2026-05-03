/**
 * Raw Location Data from API
 */
export interface RawLocation {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    district_id: number | string;
    address: string;
    description: string;
    price_level: 'free' | 'low' | 'medium' | 'high';
    thumbnail: string | null;
    images: string[] | null;
    status: 'active' | 'inactive';
    is_featured: boolean;
    view_count: number;
    favorite_count: number;
    rating: number;
    review_count: number;
    created_at: string;
    updated_at: string;
    // Relationships if joined
    category?: {
        id: number;
        name: string;
    };
    district?: {
        id: number | string;
        name: string;
    };
}

export type LocationStatus = 'active' | 'inactive';
