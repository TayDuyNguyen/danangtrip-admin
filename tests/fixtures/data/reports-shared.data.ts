import type {
  RawBookingsReport,
  RawBookingsReportItem,
  RawRatingsReport,
  RawRevenuePaymentsSummary,
  RawRevenueReportItem,
  RawRevenueTrendResponse,
  RawTourRevenueDetail,
  RawUsersReport,
} from '@/dataHelper/report.dataHelper';

export const reportFilterFrom = '2026-05-01';
export const reportFilterTo = '2026-05-31';
export const reportUrlRecoveryFrom = '2026-04-01';
export const reportUrlRecoveryTo = '2026-04-30';

export const primaryRevenuePayment: RawRevenueReportItem = {
  id: 20834,
  transaction_code: 'TX20834',
  amount: 1_300_000,
  payment_gateway: 'momo',
  payment_status: 'success',
  paid_at: '2026-05-15T10:30:00Z',
  created_at: '2026-05-15T10:30:00Z',
  booking: {
    id: 10452,
    booking_code: 'DNT10452',
    tour_name: 'Tour Bà Nà Hills 1 Ngày',
    user: {
      id: 1,
      full_name: 'Nguyễn Hoàng Anh',
      avatar: null,
    },
  },
};

function buildRevenuePayment(id: number, offset: number): RawRevenueReportItem {
  const gateways = ['momo', 'vnpay', 'zalopay'] as const;
  const gateway = gateways[offset % gateways.length];
  return {
    id,
    transaction_code: `TX${id}`,
    amount: 1_200_000 + offset * 50_000,
    payment_gateway: gateway,
    payment_status: offset % 5 === 3 ? 'refunded' : 'success',
    paid_at: `2026-05-${String((offset % 28) + 1).padStart(2, '0')}T09:00:00Z`,
    created_at: `2026-05-${String((offset % 28) + 1).padStart(2, '0')}T09:00:00Z`,
    booking: {
      id: 10452 + offset,
      booking_code: `DNT${10452 + offset}`,
      tour_name: offset === 0 ? 'Tour Bà Nà Hills 1 Ngày' : `Tour mẫu ${offset}`,
      user: {
        id: 1 + offset,
        full_name: offset === 0 ? 'Nguyễn Hoàng Anh' : `Khách hàng ${offset}`,
        avatar: null,
      },
    },
  };
}

export const mockRevenuePaymentsList: RawRevenueReportItem[] = Array.from({ length: 25 }, (_, i) =>
  buildRevenuePayment(20834 + i, i)
);

export const mockRevenuePaymentsSummary: RawRevenuePaymentsSummary = (() => {
  const gatewayMap = new Map<string, { revenue: number; count: number }>();

  mockRevenuePaymentsList.forEach((payment) => {
    if (payment.payment_status !== 'success') {
      return;
    }
    const gateway = payment.payment_gateway.toLowerCase();
    const current = gatewayMap.get(gateway) ?? { revenue: 0, count: 0 };
    gatewayMap.set(gateway, {
      revenue: current.revenue + Number(payment.amount),
      count: current.count + 1,
    });
  });

  const totalRefunded = mockRevenuePaymentsList
    .filter((payment) => payment.payment_status === 'refunded')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return {
    gateway_breakdown: Array.from(gatewayMap.entries()).map(([gateway, value]) => ({
      gateway,
      revenue: value.revenue,
      count: value.count,
    })),
    total_refunded: totalRefunded,
  };
})();

export const mockRevenueTrend: RawRevenueTrendResponse = {
  period: 'day',
  from: reportFilterFrom,
  to: reportFilterTo,
  stats: [
    { period: '2026-05-01', total_revenue: 5_000_000, transaction_count: 4 },
    { period: '2026-05-02', total_revenue: 6_200_000, transaction_count: 5 },
    { period: '2026-05-03', total_revenue: 4_800_000, transaction_count: 3 },
  ],
};

export const mockRevenueTourDetails: RawTourRevenueDetail[] = [
  {
    tour_id: 1,
    tour_name: 'Tour Bà Nà Hills 1 Ngày',
    booking_count: 45,
    total_revenue: 65_000_000,
  },
  {
    tour_id: 2,
    tour_name: 'Tour Ngũ Hành Sơn & Hội An',
    booking_count: 38,
    total_revenue: 48_000_000,
  },
  {
    tour_id: 3,
    tour_name: 'Tour Cù Lao Chàm',
    booking_count: 28,
    total_revenue: 35_000_000,
  },
  {
    tour_id: 4,
    tour_name: 'Tour Cố Đô Huế',
    booking_count: 19,
    total_revenue: 22_000_000,
  },
  {
    tour_id: 5,
    tour_name: 'Tour Mỹ Sơn',
    booking_count: 12,
    total_revenue: 14_000_000,
  },
];

function buildBookingItem(id: number, offset: number): RawBookingsReportItem {
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
  const status = statuses[offset % statuses.length];
  return {
    id,
    booking_code: `DNT${id}`,
    customer_name: offset === 0 ? 'Trần Minh Tâm' : `Khách ${offset}`,
    tour_name: 'Tour Bà Nà Hills 1 Ngày',
    total_amount: 2_500_000,
    booking_status: status,
    payment_status: status === 'completed' ? 'paid' : 'pending',
    booked_at: '2026-05-10T08:00:00Z',
  };
}

export const mockBookingsReport: RawBookingsReport = {
  summary: {
    total_count: 146,
    completed_count: 85,
    cancelled_count: 11,
    total_revenue: 182_500_000,
    trends: { total: 14.8, completed: 18.3, cancelled: -5.4, revenue: 24.6 },
    status_distribution: { pending: 18, confirmed: 32, completed: 85, cancelled: 11 },
    trend_chart: [
      { date: '2026-05-01', bookings: 5, revenue: 6_000_000 },
      { date: '2026-05-02', bookings: 7, revenue: 8_500_000 },
    ],
  },
  bookings_list: {
    data: Array.from({ length: 10 }, (_, i) => buildBookingItem(10452 + i, i)),
    current_page: 1,
    last_page: 3,
    per_page: 10,
    total: 25,
  },
};

export const mockUsersReport: RawUsersReport = {
  year: 2026,
  total_users: 864,
  active_users: 760,
  role_distribution: [
    { role: 'user', count: 820 },
    { role: 'admin', count: 12 },
    { role: 'manager', count: 8 },
    { role: 'staff', count: 24 },
  ],
  stats: [
    { month: 1, count: 12 },
    { month: 2, count: 18 },
    { month: 3, count: 22 },
    { month: 4, count: 15 },
    { month: 5, count: 20 },
    { month: 6, count: 8 },
    { month: 7, count: 0 },
    { month: 8, count: 0 },
    { month: 9, count: 0 },
    { month: 10, count: 0 },
    { month: 11, count: 0 },
    { month: 12, count: 0 },
  ],
};

export const mockRatingsReport: RawRatingsReport = {
  summary: {
    total_count: 120,
    pending_count: 12,
    approved_count: 95,
    rejected_count: 13,
    new_count: 8,
    viewed_count: 90,
    average_score: 4.5,
    trends: { total: 5.2, pending: -2.1, approved: 8.4, average: 0.3 },
    star_distribution: { '5': 60, '4': 36, '3': 12, '2': 6, '1': 6 },
    trend_chart: [{ date: '2026-05-01', total: 4, approved: 3 }],
  },
  ratings_list: {
    data: [
      {
        id: 1,
        score: 5,
        comment: 'Tour rất tuyệt vời!',
        images: [],
        status: 'approved',
        reviewable_type: 'tour',
        reviewable_id: 1,
        reviewable_name: 'Tour Bà Nà Hills',
        user: { id: 1, full_name: 'Lê Văn Cường', avatar: null },
        created_at: '2026-05-12T10:00:00Z',
      },
    ],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 1,
  },
};

export const mockLocationsDistribution = [
  { district: 'Sơn Trà', count: 24 },
  { district: 'Hải Châu', count: 18 },
  { district: 'Ngũ Hành Sơn', count: 15 },
];
