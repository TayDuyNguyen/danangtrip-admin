export interface RawRatingImage {
    id: number;
    rating_id: number;
    image_url: string;
    sort_order?: number;
}

export interface RawRating {
    id: number;
    user_id: number;
    location_id: number | null;
    tour_id: number | null;
    booking_id: number | null;
    score: number;
    comment: string | null;
    image_count: number;
    status: 'pending' | 'approved' | 'rejected';
    rejected_reason: string | null;
    approved_by: number | null;
    approved_at: string | null;
    helpful_count: number;
    is_new: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        full_name: string;
        avatar: string | null;
    } | null;
    location?: {
        id: number;
        name: string;
        slug: string;
        thumbnail: string | null;
    } | null;
    tour?: {
        id: number;
        name: string;
        slug: string;
        thumbnail?: string | null;
    } | null;
    images?: RawRatingImage[];
    approver?: {
        id: number;
        full_name: string;
        avatar: string | null;
    } | null;
}

export interface RatingsListFilters {
    status?: 'all' | 'pending' | 'approved' | 'rejected';
    is_new?: boolean;
    location_id?: number | string;
    tour_id?: number | string;
    date_from?: string;
    date_to?: string;
    search?: string;
    type?: 'all' | 'location' | 'tour';
    page?: number;
    per_page?: number;
    score?: number;
}

export interface RatingViewModel {
    id: number;
    score: number;
    comment: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected';
    rejectedReason: string;
    helpfulCount: number;
    createdAt: string;
    targetType: 'location' | 'tour';
    targetId: number;
    targetName: string;
    targetSlug: string;
    targetThumbnail: string;
    userName: string;
    userAvatar: string;
    isNew: boolean;
}

export interface PaginatedRatings {
    items: RatingViewModel[];
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
}
