/** Bookings / ratings fixtures for User Detail mocks */

export interface MockUserBookingRow {
  id: number;
  booking_code: string;
  final_amount: number;
  booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  items?: Array<{ tour?: { name: string } }>;
}

export interface MockUserRatingRow {
  id: number;
  score?: number;
  rating?: number;
  comment: string | null;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  tour?: { id: number; name: string; image_path?: string | null } | null;
  location?: { id: number; name: string; image_path?: string | null } | null;
}

export const mockBookingsForCustomer: MockUserBookingRow[] = [
  {
    id: 501,
    booking_code: 'DN20260501',
    final_amount: 1_200_000,
    booking_status: 'completed',
    created_at: '2026-05-01T08:00:00.000Z',
    items: [{ tour: { name: 'Bà Nà Hills Full Day' } }],
  },
  {
    id: 502,
    booking_code: 'DN20260420',
    final_amount: 850_000,
    booking_status: 'confirmed',
    created_at: '2026-04-20T08:00:00.000Z',
    items: [{ tour: { name: 'Hội An Ancient Town' } }],
  },
  {
    id: 503,
    booking_code: 'DN20260410',
    final_amount: 650_000,
    booking_status: 'pending',
    created_at: '2026-04-10T08:00:00.000Z',
    items: [{ tour: { name: 'Marble Mountains' } }],
  },
  {
    id: 504,
    booking_code: 'DN20260325',
    final_amount: 420_000,
    booking_status: 'completed',
    created_at: '2026-03-25T08:00:00.000Z',
    items: [{ tour: { name: 'Son Tra Peninsula' } }],
  },
  {
    id: 505,
    booking_code: 'DN20260315',
    final_amount: 980_000,
    booking_status: 'cancelled',
    created_at: '2026-03-15T08:00:00.000Z',
    items: [{ tour: { name: 'My Khe Beach Tour' } }],
  },
];

export const mockRatingsForCustomer: MockUserRatingRow[] = [
  {
    id: 601,
    score: 5,
    comment: 'Tour rất tuyệt vời!',
    status: 'approved',
    created_at: '2026-05-02T08:00:00.000Z',
    tour: { id: 11, name: 'Bà Nà Hills Full Day' },
  },
  {
    id: 602,
    score: 4,
    comment: 'Hướng dẫn viên nhiệt tình',
    status: 'approved',
    created_at: '2026-04-21T08:00:00.000Z',
    tour: { id: 12, name: 'Hội An Ancient Town' },
  },
  {
    id: 603,
    score: 5,
    comment: null,
    status: 'pending',
    created_at: '2026-04-11T08:00:00.000Z',
    tour: { id: 13, name: 'Marble Mountains' },
  },
  {
    id: 604,
    score: 4,
    comment: 'Địa điểm rất đẹp',
    status: 'approved',
    created_at: '2026-03-20T08:00:00.000Z',
    tour: null,
    location: { id: 21, name: 'Cầu Rồng Đà Nẵng' },
  },
];
