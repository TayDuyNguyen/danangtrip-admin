/** Location detail fixtures — default mock row id 101 */

import type { RawRating } from '@/types/location';
import { mockLocationListRows } from './locations.data';

export const defaultDetailLocationId = 101;
export const deleteDetailLocationId = 105;
export const emptyReviewsLocationId = 103;
export const notFoundDetailLocationId = 9999;

export const mockDetailLocation = mockLocationListRows.find((r) => r.id === defaultDetailLocationId)!;

export const mockLocationRatingStats: Record<string, number> = {
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 4,
  '5': 5,
};

export const mockLocationRatings: RawRating[] = [
  {
    id: 9001,
    score: 5,
    comment: 'View đẹp, không gian trong lành, rất đáng ghé thăm.',
    images: [],
    status: 'approved',
    user: { id: 10, full_name: 'Nguyễn Văn An', avatar: null },
    created_at: '2025-06-05T08:00:00Z',
  },
  {
    id: 9002,
    score: 4,
    comment: 'Đường lên hơi khó nhưng cảnh quan tuyệt vời.',
    images: [],
    status: 'approved',
    user: { id: 11, full_name: 'Trần Thị Bình', avatar: null },
    created_at: '2025-06-08T10:30:00Z',
  },
];

export const expectedViewCountLabel = '48.2K';
export const expectedFavoriteCountLabel = '3.2K';
