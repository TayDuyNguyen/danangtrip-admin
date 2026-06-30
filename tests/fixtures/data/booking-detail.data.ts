/** Booking detail mock fixtures — aligned with mapBookingDetail / RawBookingDetail */

import { mockFeaturedTour } from './tours.data';
import { mockBookingListRows } from './bookings.data';

export interface MockBookingDetailItem {
  id: number;
  booking_id: number;
  tour_id: number;
  tour_schedule_id: number;
  item_type: string;
  item_name: string;
  travel_date: string;
  quantity_adult: number;
  quantity_child: number;
  quantity_infant: number;
  unit_price_adult: number;
  unit_price_child: number;
  unit_price_infant: number;
  subtotal: number;
  tour?: {
    id: number;
    name: string;
    thumbnail?: string;
    duration: string;
    slug: string;
    category?: string;
  };
  tour_schedule?: {
    id: number;
    start_date: string;
    end_date: string;
    departure_place: string;
    booking_deadline: string;
    status: string;
  };
}

export interface MockBookingDetailRecord {
  id: number;
  booking_code: string;
  user_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string | null;
  customer_note?: string | null;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  deposit_amount: number;
  payment_method: string;
  payment_status: string;
  booking_status: string;
  cancellation_reason?: string | null;
  booked_at: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  items: MockBookingDetailItem[];
}

const baseTourItem = (
  id: number,
  bookingId: number,
  overrides: Partial<MockBookingDetailItem> = {}
): MockBookingDetailItem => ({
  id,
  booking_id: bookingId,
  tour_id: 1,
  tour_schedule_id: 10,
  item_type: 'tour',
  item_name: mockFeaturedTour.name,
  travel_date: '2026-06-20',
  quantity_adult: 2,
  quantity_child: 1,
  quantity_infant: 0,
  unit_price_adult: 1_200_000,
  unit_price_child: 800_000,
  unit_price_infant: 0,
  subtotal: 3_200_000,
  tour: {
    id: 1,
    name: mockFeaturedTour.name,
    thumbnail: 'https://picsum.photos/seed/bk-tour/320/240',
    duration: '1 ngày',
    slug: 'tour-ba-na',
    category: 'Trong nước',
  },
  tour_schedule: {
    id: 10,
    start_date: '2026-06-20',
    end_date: '2026-06-20',
    departure_place: 'Đà Nẵng',
    booking_deadline: '2026-06-18',
    status: 'available',
  },
  ...overrides,
});

function fromListRow(
  row: (typeof mockBookingListRows)[number],
  extra: Partial<MockBookingDetailRecord> = {}
): MockBookingDetailRecord {
  const discount = 50_000;
  const total = row.total_amount;
  const finalAmount = total - discount;
  return {
    id: row.id,
    booking_code: row.booking_code,
    user_id: row.user_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: '0901234567',
    customer_address: '123 Nguyễn Văn Linh, Đà Nẵng',
    customer_note: 'Khách đến sớm 15 phút',
    total_amount: total,
    discount_amount: discount,
    final_amount: finalAmount,
    deposit_amount: 500_000,
    payment_method: 'sepay',
    payment_status: row.payment_status,
    booking_status: row.booking_status,
    cancellation_reason: row.cancellation_reason ?? null,
    booked_at: row.booked_at,
    confirmed_at: row.booking_status !== 'pending' ? '2026-06-11T10:00:00+07:00' : null,
    cancelled_at: row.booking_status === 'cancelled' ? '2026-06-10T11:00:00+07:00' : null,
    completed_at: row.booking_status === 'completed' ? '2026-06-15T18:00:00+07:00' : null,
    created_at: row.booked_at,
    updated_at: row.booked_at,
    items: [
      baseTourItem(row.id * 10, row.id, {
        item_name: row.tour_name,
        travel_date: row.departure_date,
        tour: {
          id: 1,
          name: row.tour_name,
          thumbnail: row.tour_thumbnail ?? 'https://picsum.photos/seed/bk-tour/320/240',
          duration: '1 ngày',
          slug: 'tour-item',
          category: row.tour_category,
        },
        tour_schedule: {
          id: row.tour_schedule_id,
          start_date: row.departure_date,
          end_date: row.departure_date,
          departure_place: 'Đà Nẵng',
          booking_deadline: '2026-06-18',
          status: 'available',
        },
      }),
    ],
    ...extra,
  };
}

export const mockBookingDetailPending = fromListRow(mockBookingListRows[0], {
  booking_status: 'pending',
  payment_status: 'unpaid',
  confirmed_at: null,
  cancelled_at: null,
  completed_at: null,
});

export const mockBookingDetailConfirmed = fromListRow(
  mockBookingListRows.find((r) => r.id === 103)!,
  {
    booking_status: 'confirmed',
    payment_status: 'success',
    confirmed_at: '2026-06-10T09:30:00+07:00',
    cancelled_at: null,
    completed_at: null,
  }
);

export const mockBookingDetailCancelled = fromListRow(
  mockBookingListRows.find((r) => r.id === 104)!,
  {
    booking_status: 'cancelled',
    payment_status: 'refunded',
    cancellation_reason: 'Khách hủy vì lịch trình thay đổi',
    cancelled_at: '2026-06-09T17:00:00+07:00',
    completed_at: null,
  }
);

export const mockBookingDetailCompleted = fromListRow(
  mockBookingListRows.find((r) => r.id === 107)!,
  {
    booking_status: 'completed',
    payment_status: 'success',
    confirmed_at: '2026-06-06T09:00:00+07:00',
    completed_at: '2026-06-13T20:00:00+07:00',
  }
);

export const mockBookingDetailEdgeMinimal = fromListRow(
  mockBookingListRows.find((r) => r.id === 112)!,
  {
    customer_address: null,
    customer_note: null,
    discount_amount: 0,
    items: [
      baseTourItem(1120, 112, {
        quantity_child: 0,
        quantity_infant: 0,
        tour: {
          id: 2,
          name: 'Tour Bà Nà Hills Sunset',
          duration: '',
          slug: 'ba-na-sunset',
        },
        tour_schedule: {
          id: 60,
          start_date: '2026-06-08',
          end_date: '2026-06-08',
          departure_place: '',
          booking_deadline: '2026-06-07',
          status: 'available',
        },
      }),
    ],
  }
);

export const mockBookingDetailMultiPassenger = fromListRow(
  mockBookingListRows.find((r) => r.id === 108)!,
  {
    items: [
      baseTourItem(1081, 108, { quantity_adult: 2, quantity_child: 1, quantity_infant: 0 }),
      baseTourItem(1082, 108, {
        id: 1082,
        item_name: 'Tour Tam Kỳ phụ',
        quantity_adult: 1,
        quantity_child: 0,
        quantity_infant: 1,
        tour: {
          id: 3,
          name: 'Tour Tam Kỳ phụ',
          thumbnail: undefined,
          duration: 'Nửa ngày',
          slug: 'tam-ky',
          category: 'Văn hóa',
        },
      }),
    ],
  }
);

export const initialMockBookingDetails: Record<number, MockBookingDetailRecord> = {
  101: structuredClone(mockBookingDetailPending),
  103: structuredClone(mockBookingDetailConfirmed),
  104: structuredClone(mockBookingDetailCancelled),
  107: structuredClone(mockBookingDetailCompleted),
  108: structuredClone(mockBookingDetailMultiPassenger),
  112: structuredClone(mockBookingDetailEdgeMinimal),
};

export const primaryBookingDetailId = 101;
export const confirmedBookingDetailId = 103;
export const cancelledBookingDetailId = 104;
export const completedBookingDetailId = 107;
export const edgeBookingDetailId = 112;
export const multiPassengerDetailId = 108;
export const invalidBookingDetailId = 999999;

export function buildDetailStore() {
  return structuredClone(initialMockBookingDetails);
}
