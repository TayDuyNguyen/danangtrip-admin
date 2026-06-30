import type { RawRating, RawRatingImage, RatingViewModel, PaginatedRatings } from './rating.dataHelper';
import { toNumberSafe } from '@/utils/safeConverters';
import type { Paginator } from '@/types';
import { formatAdminTableTemporal } from '@/utils';

/**
 * Map raw rating object from API to clean RatingViewModel for the UI
 */
const mapRatingItem = (raw: RawRating): RatingViewModel => {
    const isTour = !!raw.tour_id || !!raw.tour;
    const targetType = isTour ? 'tour' : 'location';
    const targetId = raw.tour_id || raw.location_id || 0;
    
    const targetName = isTour 
        ? raw.tour?.name || '' 
        : raw.location?.name || '';
        
    const targetSlug = isTour 
        ? raw.tour?.slug || '' 
        : raw.location?.slug || '';
        
    const targetThumbnail = isTour 
        ? raw.tour?.thumbnail || '' 
        : raw.location?.thumbnail || '';

    // Normalize images: can be string URLs or objects containing image_url
    const images = (raw.images || []).flatMap((img: RawRatingImage | string) => {
        if (typeof img === 'string') return img;
        return img?.image_url ? [img.image_url] : [];
    });

    const imageCount = toNumberSafe(raw.image_count, images.length);

    return {
        id: raw.id,
        score: toNumberSafe(raw.score, 0),
        comment: raw.comment || '',
        images,
        imageCount,
        status: raw.status,
        rejectedReason: raw.rejected_reason || '',
        helpfulCount: toNumberSafe(raw.helpful_count, 0),
        createdAt: formatAdminTableTemporal(raw.created_at),
        targetType,
        targetId,
        targetName,
        targetSlug,
        targetThumbnail,
        userName: raw.user?.full_name || 'Anonymous',
        userAvatar: raw.user?.avatar || '',
        isNew: raw.is_new === true,
    };
};

/**
 * Map paginated API response containing RawRatings to PaginatedRatings
 */
export const mapRatingsList = (raw: Paginator<RawRating> | null | undefined): PaginatedRatings => {
    if (!raw) {
        return {
            items: [],
            currentPage: 1,
            lastPage: 1,
            perPage: 10,
            total: 0,
        };
    }

    const data = Array.isArray(raw.data) ? raw.data : [];
    const items = data.map(mapRatingItem);

    return {
        items,
        currentPage: toNumberSafe(raw.current_page, 1),
        lastPage: toNumberSafe(raw.last_page, 1),
        perPage: toNumberSafe(raw.per_page, 10),
        total: toNumberSafe(raw.total, 0),
    };
};
