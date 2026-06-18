/** Booking list mock fixtures — aligned with booking.mapper / AdminRawBookingItem */

import { mockFeaturedTour } from './tours.data';
import { formatAmountPattern } from './dashboard.data';

export type MockBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type MockPaymentStatus = 'pending' | 'unpaid' | 'paid' | 'success' | 'failed' | 'refunded';

export interface MockBookingListRow {
  id: number;
  booking_code: string;
  booking_status: MockBookingStatus;
  payment_status: MockPaymentStatus;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_avatar?: string;
  tour_name: string;
  tour_thumbnail?: string;
  tour_category?: string;
  booked_at: string;
  departure_date: string;
  cancellation_reason?: string;
  user_id: number;
  tour_schedule_id: number;
}

const baseTour = mockFeaturedTour.name;

export const mockBookingListRows: MockBookingListRow[] = [
  {
    id: 101,
    booking_code: 'BK-2026-0101',
    booking_status: 'pending',
    payment_status: 'unpaid',
    total_amount: 2_450_000,
    customer_name: 'Nguyễn Văn An',
    customer_email: 'an.nguyen@test.com',
    tour_name: baseTour,
    tour_category: 'Trong nước',
    booked_at: '2026-06-12T08:30:00+07:00',
    departure_date: '2026-06-20',
    user_id: 2,
    tour_schedule_id: 10,
  },
  {
    id: 102,
    booking_code: 'BK-2026-0102',
    booking_status: 'pending',
    payment_status: 'pending',
    total_amount: 1_890_000,
    customer_name: 'Trần Thị Bình',
    customer_email: 'binh.tran@test.com',
    tour_name: 'Tour Hội An cổ kính',
    tour_category: 'Văn hóa',
    booked_at: '2026-06-11T14:15:00+07:00',
    departure_date: '2026-06-18',
    user_id: 2,
    tour_schedule_id: 10,
  },
  {
    id: 103,
    booking_code: 'BK-2026-0103',
    booking_status: 'confirmed',
    payment_status: 'success',
    total_amount: 3_200_000,
    customer_name: 'Lê Hoàng Cường',
    customer_email: 'cuong.le@test.com',
    tour_name: 'Tour Sơn Trà - Cổ kính',
    booked_at: '2026-06-10T09:00:00+07:00',
    departure_date: '2026-06-17',
    user_id: 2,
    tour_schedule_id: 20,
  },
  {
    id: 104,
    booking_code: 'BK-2026-0104',
    booking_status: 'cancelled',
    payment_status: 'refunded',
    total_amount: 990_000,
    customer_name: 'Phạm Thu Dung',
    customer_email: 'dung.pham@test.com',
    tour_name: 'Tour Ngũ Hành Sơn',
    booked_at: '2026-06-09T16:45:00+07:00',
    departure_date: '2026-06-16',
    user_id: 3,
    tour_schedule_id: 20,
  },
  {
    id: 105,
    booking_code: 'BK-2026-0105',
    booking_status: 'pending',
    payment_status: 'unpaid',
    total_amount: 1_200_000,
    customer_name: 'Hoàng Minh Đức',
    customer_email: 'duc.hoang@test.com',
    tour_name: 'Tour Bán đảo Sơn Trà',
    booked_at: '2026-06-08T11:00:00+07:00',
    departure_date: '2026-06-15',
    user_id: 4,
    tour_schedule_id: 30,
  },
  {
    id: 106,
    booking_code: 'BK-2026-0106',
    booking_status: 'confirmed',
    payment_status: 'success',
    total_amount: 1_650_000,
    customer_name: 'Võ Thị Em',
    customer_email: 'em.vo@test.com',
    tour_name: 'Tour Cù Lao Chàm',
    booked_at: '2026-06-07T10:30:00+07:00',
    departure_date: '2026-06-14',
    user_id: 5,
    tour_schedule_id: 30,
  },
  {
    id: 107,
    booking_code: 'BK-2026-0107',
    booking_status: 'completed',
    payment_status: 'success',
    total_amount: 2_100_000,
    customer_name: 'Đặng Văn Phúc',
    customer_email: 'phuc.dang@test.com',
    tour_name: 'Tour Huế 1 ngày',
    booked_at: '2026-06-06T08:00:00+07:00',
    departure_date: '2026-06-13',
    user_id: 6,
    tour_schedule_id: 40,
  },
  {
    id: 108,
    booking_code: 'BK-2026-0108',
    booking_status: 'completed',
    payment_status: 'success',
    total_amount: 870_000,
    customer_name: 'Bùi Lan Hương',
    customer_email: 'huong.bui@test.com',
    tour_name: 'Tour Tam Kỳ',
    booked_at: '2026-06-05T15:20:00+07:00',
    departure_date: '2026-06-12',
    user_id: 7,
    tour_schedule_id: 40,
  },
  {
    id: 109,
    booking_code: 'BK-2026-0109',
    booking_status: 'confirmed',
    payment_status: 'pending',
    total_amount: 1_430_000,
    customer_name: 'Ngô Quốc Huy',
    customer_email: 'huy.ngo@test.com',
    tour_name: 'Tour Lăng Cô',
    booked_at: '2026-06-04T13:10:00+07:00',
    departure_date: '2026-06-11',
    user_id: 8,
    tour_schedule_id: 50,
  },
  {
    id: 110,
    booking_code: 'BK-2026-0110',
    booking_status: 'cancelled',
    payment_status: 'failed',
    total_amount: 760_000,
    customer_name: 'Trịnh Thảo My',
    customer_email: 'my.trinh@test.com',
    tour_name: 'Tour Đà Nẵng về đêm',
    booked_at: '2026-06-03T19:00:00+07:00',
    departure_date: '2026-06-10',
    user_id: 9,
    tour_schedule_id: 50,
  },
  {
    id: 111,
    booking_code: 'BK-2026-0111',
    booking_status: 'completed',
    payment_status: 'success',
    total_amount: 1_100_000,
    customer_name: 'Lý Văn Kiệt',
    customer_email: 'kiet.ly@test.com',
    tour_name: baseTour,
    booked_at: '2026-06-02T07:45:00+07:00',
    departure_date: '2026-06-09',
    user_id: 10,
    tour_schedule_id: 60,
  },
  {
    id: 112,
    booking_code: 'BK-2026-0112',
    booking_status: 'pending',
    payment_status: 'unpaid',
    total_amount: 2_050_000,
    customer_name: 'Mai Thanh Tùng',
    customer_email: 'tung.mai@test.com',
    tour_name: 'Tour Bà Nà Hills Sunset',
    booked_at: '2026-06-01T12:00:00+07:00',
    departure_date: '2026-06-08',
    user_id: 11,
    tour_schedule_id: 60,
  },
];

export const mockBookingSearchCode = 'BK-2026-0101';
export const mockBookingSearchCustomer = 'Nguyễn Văn An';
export const mockBookingSearchTour = 'Bà Nà Hills';
export const mockBookingFilterUserId = 2;
export const mockBookingFilterScheduleId = 10;

export function computeBookingStatusCounts(rows: MockBookingListRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc[row.booking_status] += 1;
      return acc;
    },
    { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );
}

export const expectedBookingListStats = computeBookingStatusCounts(mockBookingListRows);

export const expectedBookingListTotal =
  expectedBookingListStats.pending +
  expectedBookingListStats.confirmed +
  expectedBookingListStats.completed +
  expectedBookingListStats.cancelled;

export const primaryBookingRow = mockBookingListRows[0];

export const amountPatternFor = (amount: number) => formatAmountPattern(amount);
