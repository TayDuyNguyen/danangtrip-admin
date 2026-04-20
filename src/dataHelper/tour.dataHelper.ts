export interface TourItem {
    id: number;
    name: string;
    slug: string;
    tour_category_id: number;
    description: string;
    short_desc: string | null;
    itinerary: Array<{ day: number; title: string; content: string }> | null;
    inclusions: string | null;
    exclusions: string | null;
    price_adult: string; // backend returns string
    price_child: string;
    price_infant: string;
    discount_percent: number;
    duration: string;
    start_time: string | null;
    meeting_point: string | null;
    max_people: number;
    min_people: number;
    available_from: string | null;
    available_to: string | null;
    thumbnail: string | null;
    images: string[] | null;
    video_url: string | null;
    location_ids: number[] | null;
    status: 'active' | 'inactive' | 'sold_out';
    is_featured: boolean;
    is_hot: boolean;
    view_count: number;
    booking_count: number;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    // UI helpful fields
    rating?: number;
    reviewCount?: number;
    scheduleCount?: number;
}

export interface TourCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    sort_order: number;
    status: 'active' | 'inactive' | 'sold_out';
    created_at: string;
    updated_at: string;
}

export interface TourFilters {
    q: string;
    tour_category_id: string | number;
    status: string;
    type: string;
    sort: string;
    order: 'asc' | 'desc';
}

export interface TourStats {
    total_tours: number;
    active_tours: number;
    featured_tours: number;
    sold_out_tours: number;
}

export interface TourListData {
    data: TourItem[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
}

