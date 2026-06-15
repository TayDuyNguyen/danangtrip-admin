/** Dashboard mock fixtures — aligned with dashboard.mapper */

import { initialMockTours } from './tours.data';

export const mockDashboardStats = {
  total_revenue: 12_500_000,
  revenue_trend: 12,
  total_bookings: 320,
  booking_trend: -3,
  total_users: 1840,
  user_trend: 8,
  total_tours_sold: 156,
  tours_sold_trend: 5,
  pending_ratings: 4,
  new_contacts: 7,
};

export const mockBookingStatusCounts = {
  pending: 10,
  confirmed: 20,
  completed: 30,
  cancelled: 5,
};

/** Sum status counts — orders stat card uses this when status API loaded */
export const mockOrdersFromStatusTotal =
  mockBookingStatusCounts.pending +
  mockBookingStatusCounts.confirmed +
  mockBookingStatusCounts.completed +
  mockBookingStatusCounts.cancelled;

export const mockRevenueSeries = [
  { date: '2026-06-10', revenue: 2_100_000 },
  { date: '2026-06-11', revenue: 3_400_000 },
  { date: '2026-06-12', revenue: 1_800_000 },
];

export const mockBookingTrendSeries = [
  { date: '2026-06-10', count: 4 },
  { date: '2026-06-11', count: 7 },
  { date: '2026-06-12', count: 5 },
];

export const mockUserGrowthSeries = [
  { month: '2026-01', count: 12 },
  { month: '2026-02', count: 18 },
  { month: '2026-03', count: 9 },
  { month: '2026-04', count: 22 },
  { month: '2026-05', count: 15 },
  { month: '2026-06', count: 11 },
];

export const mockTopTours = [
  {
    id: 1,
    name: 'Tour Bà Nà Hills 1 Ngày',
    booking_count: 42,
    total_revenue: 35_700_000,
    avg_rating: 4.8,
    thumbnail_url: 'https://picsum.photos/seed/tour1/120/90',
  },
  {
    id: 2,
    name: 'Tour Hội An cổ kính',
    booking_count: 31,
    total_revenue: 24_800_000,
    avg_rating: 4.6,
    thumbnail_url: 'https://picsum.photos/seed/tour2/120/90',
  },
];

export const mockSearchTrends = {
  days: 7,
  keywords: [{ query: 'bà nà hills', count: 128 }],
  clicked_queries: [{ query: 'hội an tour', count: 64 }],
  zero_result_keywords: [{ query: 'tour huế 1 ngày', count: 9 }],
  trending_searches: [
    { name: 'Tour Bà Nà Hills 1 Ngày', slug: 'tour-ba-na', count: 18, type: 'tour' },
    { name: 'Bãi biển Mỹ Khê', slug: 'my-khe', count: 12, type: 'location' },
  ],
};

export const mockBookingRows = [
  {
    id: 101,
    booking_code: 'BK-2026-0101',
    customer_name: 'Nguyễn Văn An',
    tour_name: 'Tour Bà Nà Hills 1 Ngày',
    total_amount: 2_450_000,
    booking_status: 'pending',
    booked_at: '2026-06-12T08:30:00+07:00',
  },
  {
    id: 102,
    booking_code: 'BK-2026-0102',
    customer_name: 'Trần Thị Bình',
    tour_name: 'Tour Hội An cổ kính',
    total_amount: 1_890_000,
    booking_status: 'confirmed',
    booked_at: '2026-06-11T14:15:00+07:00',
  },
  {
    id: 103,
    booking_code: 'BK-2026-0103',
    customer_name: 'Lê Hoàng Cường',
    tour_name: 'Tour Sơn Trà - Cổ kính',
    total_amount: 3_200_000,
    booking_status: 'completed',
    booked_at: '2026-06-10T09:00:00+07:00',
  },
  {
    id: 104,
    booking_code: 'BK-2026-0104',
    customer_name: 'Phạm Thu Dung',
    tour_name: 'Tour Ngũ Hành Sơn',
    total_amount: 990_000,
    booking_status: 'cancelled',
    booked_at: '2026-06-09T16:45:00+07:00',
  },
  {
    id: 105,
    booking_code: 'BK-2026-0105',
    customer_name: 'Hoàng Minh Đức',
    tour_name: 'Tour Bán đảo Sơn Trà',
    total_amount: 1_200_000,
    booking_status: 'pending',
    booked_at: '2026-06-08T11:00:00+07:00',
  },
  {
    id: 106,
    booking_code: 'BK-2026-0106',
    customer_name: 'Võ Thị Em',
    tour_name: 'Tour Cù Lao Chàm',
    total_amount: 1_650_000,
    booking_status: 'confirmed',
    booked_at: '2026-06-07T10:30:00+07:00',
  },
  {
    id: 107,
    booking_code: 'BK-2026-0107',
    customer_name: 'Đặng Văn Phúc',
    tour_name: 'Tour Huế 1 ngày',
    total_amount: 2_100_000,
    booking_status: 'completed',
    booked_at: '2026-06-06T08:00:00+07:00',
  },
  {
    id: 108,
    booking_code: 'BK-2026-0108',
    customer_name: 'Bùi Lan Hương',
    tour_name: 'Tour Tam Kỳ',
    total_amount: 870_000,
    booking_status: 'pending',
    booked_at: '2026-06-05T15:20:00+07:00',
  },
  {
    id: 109,
    booking_code: 'BK-2026-0109',
    customer_name: 'Ngô Quốc Huy',
    tour_name: 'Tour Lăng Cô',
    total_amount: 1_430_000,
    booking_status: 'confirmed',
    booked_at: '2026-06-04T13:10:00+07:00',
  },
];

export const mockBookingRowsEmptyNames = [
  {
    id: 301,
    booking_code: 'BK-2026-0301',
    customer_name: '',
    tour_name: '',
    total_amount: 500_000,
    booking_status: 'pending',
    booked_at: '2026-06-12T10:00:00+07:00',
  },
];

export const mockBookingStatusCountsZero = {
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
};

export const mockSearchTrendsEmpty = {
  days: 7,
  keywords: [],
  clicked_queries: [],
  zero_result_keywords: [],
  trending_searches: [],
};

export const mockDashboardStatsLegacyEnvelope = {
  data: {
    total_revenue: mockDashboardStats.total_revenue,
    revenue_trend: mockDashboardStats.revenue_trend,
    total_bookings: mockDashboardStats.total_bookings,
    booking_trend: mockDashboardStats.booking_trend,
    total_users: mockDashboardStats.total_users,
    user_trend: mockDashboardStats.user_trend,
    total_tours_sold: mockDashboardStats.total_tours_sold,
    tours_sold_trend: mockDashboardStats.tours_sold_trend,
    pending_ratings: mockDashboardStats.pending_ratings,
    new_contacts: mockDashboardStats.new_contacts,
  },
};

export const mockGlobalSearchTourHit = {
  ...structuredClone(initialMockTours[0]),
  id: 99,
  name: 'Tour Bà Nà Hills',
  slug: 'ba-na-hills',
  duration: '1 ngày',
};

export const mockRevenueSeriesTotal = mockRevenueSeries.reduce((sum, row) => sum + row.revenue, 0);
export const mockBookingTrendTotal = mockBookingTrendSeries.reduce((sum, row) => sum + row.count, 0);
export const mockUserGrowthTotal = mockUserGrowthSeries.reduce((sum, row) => sum + row.count, 0);

export const mockBookingRowsPage2 = [
  {
    id: 201,
    booking_code: 'BK-2026-0201',
    customer_name: 'Trịnh Thảo My',
    tour_name: 'Tour Đà Nẵng về đêm',
    total_amount: 760_000,
    booking_status: 'completed',
    booked_at: '2026-06-03T19:00:00+07:00',
  },
];

export const mockNotificationCounts = {
  total_unread: 9,
  categories: {
    contacts: { count: 3, label: 'Contacts' },
    bookings: { count: 4, label: 'Bookings' },
    ratings: { count: 2, label: 'Ratings' },
  },
};

export const adminDisplayName = 'Nguyen Duy Tay';

/** vi-VN formatted integers for assert */
export const formatViInt = (n: number) =>
  n.toLocaleString('vi-VN', { maximumFractionDigits: 0 });

/** en-US formatted integers — UI may render en-US despite vi localStorage */
export const formatEnInt = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 0 });

/** Match amount in either vi-VN or en-US grouping */
export const formatAmountPattern = (n: number) => {
  const vi = formatViInt(n).replace(/\./g, '\\.');
  const en = formatEnInt(n).replace(/,/g, ',');
  return new RegExp(`${vi}|${en}`);
};
