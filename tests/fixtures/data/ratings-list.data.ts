import type { RawRating } from '@/dataHelper/rating.dataHelper';

function buildRating(
  partial: Pick<RawRating, 'id' | 'score' | 'status' | 'is_new'> &
    Partial<
      Pick<
        RawRating,
        | 'comment'
        | 'rejected_reason'
        | 'created_at'
        | 'tour_id'
        | 'location_id'
        | 'user'
        | 'tour'
        | 'location'
      >
    >
): RawRating {
  const now = '2026-06-15T10:00:00Z';
  const isTour = partial.tour_id != null || partial.tour != null;
  return {
    id: partial.id,
    user_id: partial.user?.id ?? partial.id,
    location_id: isTour ? null : partial.location_id ?? partial.location?.id ?? partial.id,
    tour_id: isTour ? partial.tour_id ?? partial.tour?.id ?? partial.id : null,
    booking_id: 100 + partial.id,
    score: partial.score,
    comment: partial.comment ?? `Nhận xét mẫu #${partial.id}`,
    image_count: 0,
    status: partial.status,
    rejected_reason: partial.rejected_reason ?? null,
    approved_by: null,
    approved_at: null,
    helpful_count: 0,
    is_new: partial.is_new,
    created_at: partial.created_at ?? now,
    updated_at: now,
    user: partial.user ?? {
      id: partial.id,
      full_name: `Khách hàng ${partial.id}`,
      avatar: null,
    },
    tour: isTour
      ? partial.tour ?? {
          id: partial.tour_id ?? partial.id,
          name: `Tour Đà Nẵng ${partial.id}`,
          slug: `tour-dn-${partial.id}`,
          thumbnail: null,
        }
      : null,
    location: !isTour
      ? partial.location ?? {
          id: partial.location_id ?? partial.id,
          name: `Địa điểm ${partial.id}`,
          slug: `location-${partial.id}`,
          thumbnail: null,
        }
      : null,
    images: [],
    approver: null,
  };
}

export const mockRatingSearchKeyword = 'biển đẹp';

export const mockRatingListRows: RawRating[] = [
  buildRating({
    id: 1,
    score: 5,
    status: 'approved',
    is_new: true,
    tour_id: 101,
    tour: { id: 101, name: 'Tour Bà Nà Hills 1 ngày', slug: 'ba-na-1-ngay', thumbnail: null },
    user: { id: 11, full_name: 'Nguyễn Văn An', avatar: null },
    comment: 'Tour tuyệt vời, biển đẹp và hướng dẫn viên nhiệt tình.',
    created_at: '2026-06-20T08:00:00Z',
  }),
  buildRating({
    id: 2,
    score: 4,
    status: 'approved',
    is_new: false,
    location_id: 201,
    location: { id: 201, name: 'Cầu Rồng Đà Nẵng', slug: 'cau-rong', thumbnail: null },
    user: { id: 12, full_name: 'Trần Thị Bình', avatar: null },
    comment: 'Địa điểm đông nhưng view đẹp.',
    created_at: '2026-06-19T08:00:00Z',
  }),
  buildRating({
    id: 3,
    score: 3,
    status: 'pending',
    is_new: true,
    tour_id: 102,
    tour: { id: 102, name: 'Tour Sơn Trà sunset', slug: 'son-tra-sunset', thumbnail: null },
    user: { id: 13, full_name: 'Lê Minh Cường', avatar: null },
    created_at: '2026-06-18T08:00:00Z',
  }),
  buildRating({
    id: 4,
    score: 2,
    status: 'rejected',
    is_new: false,
    location_id: 202,
    location: { id: 202, name: 'Ngũ Hành Sơn', slug: 'ngu-hanh-son', thumbnail: null },
    user: { id: 14, full_name: 'Phạm Thu Dung', avatar: null },
    rejected_reason: 'Nội dung spam quảng cáo',
    created_at: '2026-06-17T08:00:00Z',
  }),
  buildRating({
    id: 5,
    score: 5,
    status: 'approved',
    is_new: false,
    tour_id: 103,
    tour: { id: 103, name: 'Tour Hội An cổ điển', slug: 'hoi-an-co-dien', thumbnail: null },
    user: { id: 15, full_name: 'Hoàng Văn Em', avatar: null },
    created_at: '2026-06-16T08:00:00Z',
  }),
  buildRating({
    id: 6,
    score: 1,
    status: 'approved',
    is_new: true,
    location_id: 203,
    location: { id: 203, name: 'Bãi biển Mỹ Khê', slug: 'my-khe', thumbnail: null },
    user: { id: 16, full_name: 'Võ Thị Phương', avatar: null },
    created_at: '2026-06-15T08:00:00Z',
  }),
  buildRating({
    id: 7,
    score: 4,
    status: 'approved',
    is_new: false,
    tour_id: 104,
    tour: { id: 104, name: 'Tour ẩm thực Đà Nẵng', slug: 'am-thuc-dn', thumbnail: null },
    created_at: '2026-06-14T08:00:00Z',
  }),
  buildRating({
    id: 8,
    score: 3,
    status: 'pending',
    is_new: true,
    location_id: 204,
    location: { id: 204, name: 'Chợ Hàn', slug: 'cho-han', thumbnail: null },
    created_at: '2026-06-13T08:00:00Z',
  }),
  buildRating({
    id: 9,
    score: 5,
    status: 'approved',
    is_new: false,
    tour_id: 105,
    tour: { id: 105, name: 'Tour Cù Lao Chàm', slug: 'cu-lao-cham', thumbnail: null },
    created_at: '2026-06-12T08:00:00Z',
  }),
  buildRating({
    id: 10,
    score: 4,
    status: 'approved',
    is_new: false,
    location_id: 205,
    location: { id: 205, name: 'Bảo tàng Chăm', slug: 'bao-tang-cham', thumbnail: null },
    created_at: '2026-06-11T08:00:00Z',
  }),
  buildRating({
    id: 11,
    score: 3,
    status: 'approved',
    is_new: true,
    tour_id: 106,
    tour: { id: 106, name: 'Tour xóa thử nghiệm', slug: 'tour-delete-test', thumbnail: null },
    user: { id: 21, full_name: 'Nguyễn Xóa Thử', avatar: null },
    created_at: '2026-06-21T09:00:00Z',
  }),
  buildRating({
    id: 12,
    score: 2,
    status: 'approved',
    is_new: false,
    location_id: 206,
    location: { id: 206, name: 'Cầu Thuận Phước', slug: 'cau-thuan-phuoc', thumbnail: null },
    created_at: '2026-06-09T08:00:00Z',
  }),
];

export const primaryRatingRow = mockRatingListRows.find((r) => r.id === 1)!;
export const viewedRatingRow = mockRatingListRows.find((r) => r.id === 2)!;
export const hiddenRatingRow = mockRatingListRows.find((r) => r.id === 4)!;
export const deletableRatingRow = mockRatingListRows.find((r) => r.id === 11)!;
export const newRatingRow = mockRatingListRows.find((r) => r.id === 3)!;

export const expectedRatingStats = {
  total: 12,
  new: 5,
  viewed: 7,
  rejected: 1,
};
