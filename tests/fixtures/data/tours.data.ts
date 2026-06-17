/** Mock tour list data for Playwright — aligned with tour.mapper RawTour shape */

export interface RawTourRow {
  id: number;
  name: string;
  slug: string;
  tour_category_id: number;
  description: string;
  short_desc: string | null;
  itinerary: Array<{ day: number; title: string; content: string }> | null;
  inclusions: string | null;
  exclusions: string | null;
  price_adult: number;
  price_child: number;
  price_infant: number;
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
  status: 'active' | 'inactive';
  booking_availability: 'open' | 'sold_out';
  is_featured: boolean;
  is_hot: boolean;
  view_count: number;
  booking_count: number;
  schedules_count: number;
  created_at: string;
  updated_at: string;
}

export interface RawTourCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  status: 'active';
  created_at: string;
  updated_at: string;
}

export const mockTourCategories: RawTourCategory[] = [
  {
    id: 1,
    name: 'City Tour',
    slug: 'city-tour',
    description: 'City tours',
    icon: 'map',
    sort_order: 1,
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Mountain',
    slug: 'mountain',
    description: 'Mountain tours',
    icon: 'mountain',
    sort_order: 2,
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

export const searchKeyword = 'Ba Na';

export const mockFeaturedTour: RawTourRow = {
  id: 1,
  name: 'Tour Ba Na Hills 1 ngày',
  slug: 'ba-na-hills',
  tour_category_id: 1,
  description: '<p>Tour khám phá <strong>Bà Nà Hills</strong> tuyệt vời.</p>',
  short_desc: 'Ba Na day trip',
  itinerary: [
    { day: 1, title: 'Khởi hành', content: 'Xe đón tại Đà Nẵng' },
    { day: 2, title: 'Cáp treo', content: 'Trải nghiệm cáp treo dài nhất' },
    { day: 3, title: 'Vui chơi', content: 'Khu vui chơi Fantasy Park' },
  ],
  inclusions: 'Xe, vé cáp treo',
  exclusions: 'Chi phí cá nhân',
  price_adult: 850_000,
  price_child: 650_000,
  price_infant: 0,
  discount_percent: 0,
  duration: '1 ngày',
  start_time: '07:30',
  meeting_point: '123 Trần Phú, Đà Nẵng',
  max_people: 40,
  min_people: 2,
  available_from: '2026-01-01',
  available_to: '2026-12-31',
  thumbnail: 'https://picsum.photos/seed/bana/400/300',
  images: [
    'https://picsum.photos/seed/bana1/200/200',
    'https://picsum.photos/seed/bana2/200/200',
    'https://picsum.photos/seed/bana3/200/200',
    'https://picsum.photos/seed/bana4/200/200',
  ],
  video_url: null,
  status: 'active',
  booking_availability: 'open',
  is_featured: true,
  is_hot: true,
  view_count: 1200,
  booking_count: 85,
  schedules_count: 3,
  created_at: '2025-06-01T08:00:00Z',
  updated_at: '2025-06-10T08:00:00Z',
};

function buildTour(partial: Partial<RawTourRow> & Pick<RawTourRow, 'id' | 'name'>): RawTourRow {
  return {
    slug: partial.slug ?? `tour-${partial.id}`,
    tour_category_id: partial.tour_category_id ?? 1,
    description: partial.description ?? '<p>Mô tả tour</p>',
    short_desc: partial.short_desc ?? null,
    itinerary: partial.itinerary ?? null,
    inclusions: partial.inclusions ?? null,
    exclusions: partial.exclusions ?? null,
    price_adult: partial.price_adult ?? 500_000,
    price_child: partial.price_child ?? 350_000,
    price_infant: partial.price_infant ?? 0,
    discount_percent: partial.discount_percent ?? 0,
    duration: partial.duration ?? '2 ngày 1 đêm',
    start_time: partial.start_time ?? null,
    meeting_point: partial.meeting_point ?? 'Đà Nẵng',
    max_people: partial.max_people ?? 30,
    min_people: partial.min_people ?? 2,
    available_from: partial.available_from ?? null,
    available_to: partial.available_to ?? null,
    thumbnail: partial.thumbnail ?? null,
    images: partial.images ?? null,
    video_url: null,
    status: partial.status ?? 'active',
    booking_availability: partial.booking_availability ?? 'open',
    is_featured: partial.is_featured ?? false,
    is_hot: partial.is_hot ?? false,
    view_count: partial.view_count ?? 100,
    booking_count: partial.booking_count ?? 10,
    schedules_count: partial.schedules_count ?? 1,
    created_at: partial.created_at ?? '2025-05-01T08:00:00Z',
    updated_at: partial.updated_at ?? '2025-05-01T08:00:00Z',
    ...partial,
  };
}

/** 12 tours — enough for pagination (10 + 2) */
export const initialMockTours: RawTourRow[] = [
  mockFeaturedTour,
  buildTour({ id: 2, name: 'Tour Hội An cổ kính', is_featured: false, is_hot: false, status: 'active' }),
  buildTour({ id: 3, name: 'Tour Sơn Trà linh thiện', tour_category_id: 2, status: 'active' }),
  buildTour({ id: 4, name: 'Tour Bán đảo Sơn Trà', status: 'inactive', booking_availability: 'sold_out' }),
  buildTour({ id: 5, name: 'Tour Cù Lao Chàm', is_hot: true, images: [
    'https://picsum.photos/seed/clc1/200/200',
    'https://picsum.photos/seed/clc2/200/200',
    'https://picsum.photos/seed/clc3/200/200',
    'https://picsum.photos/seed/clc4/200/200',
    'https://picsum.photos/seed/clc5/200/200',
    'https://picsum.photos/seed/clc6/200/200',
  ] }),
  buildTour({
    id: 6,
    name: 'Tour Huế 1 ngày',
    tour_category_id: 2,
    price_adult: 1_500_000,
  }),
  buildTour({
    id: 7,
    name: 'Tour Đà Nẵng về đêm',
    is_featured: true,
    duration: '2N1Đ',
    max_people: 30,
    meeting_point: 'Cổng chính khách sạn Mường Thanh Luxury Đà Nẵng, 962 Ngô Quyền, An Hải, quận Sơn Trà',
  }),
  buildTour({ id: 8, name: 'Tour Mỹ Sơn thánh địa', status: 'inactive' }),
  buildTour({ id: 9, name: 'Tour Lăng Bác', booking_availability: 'sold_out' }),
  buildTour({
    id: 10,
    name: 'Tour Tam Kỳ',
    schedules_count: 0,
    thumbnail: null,
    description: '',
    itinerary: [],
    is_featured: false,
    is_hot: false,
    duration: '',
  }),
  buildTour({ id: 11, name: 'Tour Quảng Nam', is_hot: true, is_featured: false }),
  buildTour({ id: 12, name: 'Tour dù lượn', status: 'active', price_adult: 0 }),
];

export function computeMockTourStats(tours: RawTourRow[] = initialMockTours) {
  return {
    total_tours: tours.length,
    active_tours: tours.filter((t) => t.status === 'active').length,
    featured_tours: tours.filter((t) => t.is_featured).length,
    sold_out_tours: tours.filter((t) => t.booking_availability === 'sold_out').length,
  };
}

export const expectedMockTourStats = computeMockTourStats();

export interface RawScheduleRow {
  id: number;
  tour_id: number;
  start_date: string;
  end_date: string;
  max_people: number;
  booked_people: number;
  status: string;
  booking_availability?: string;
  departure_code?: string | null;
  departure_place?: string | null;
  booking_deadline?: string | null;
  price_adult?: number | string | null;
  price_child?: number | string | null;
  price_infant?: number | string | null;
}

export const mockSchedulesForTour1: RawScheduleRow[] = [
  {
    id: 99,
    tour_id: 1,
    start_date: '2026-06-20',
    end_date: '2026-06-20',
    max_people: 15,
    booked_people: 0,
    status: 'available',
    booking_availability: 'open',
  },
  {
    id: 101,
    tour_id: 1,
    start_date: '2026-07-01',
    end_date: '2026-07-01',
    max_people: 30,
    booked_people: 10,
    status: 'available',
    booking_availability: 'open',
  },
  {
    id: 102,
    tour_id: 1,
    start_date: '2026-07-15',
    end_date: '2026-07-15',
    max_people: 25,
    booked_people: 25,
    status: 'full',
    booking_availability: 'sold_out',
  },
  {
    id: 103,
    tour_id: 1,
    start_date: '2026-08-01',
    end_date: '2026-08-01',
    max_people: 20,
    booked_people: 5,
    status: 'cancelled',
    booking_availability: 'sold_out',
  },
  {
    id: 104,
    tour_id: 2,
    start_date: '2026-07-20',
    end_date: '2026-07-20',
    max_people: 18,
    booked_people: 6,
    status: 'available',
    booking_availability: 'open',
  },
];

/** Expected stats when all mock schedules are loaded (no filter). */
export const expectedMockScheduleStats = {
  total_schedules: mockSchedulesForTour1.length,
  available_schedules: mockSchedulesForTour1.filter((s) => s.status === 'available').length,
  full_schedules: mockSchedulesForTour1.filter((s) => s.booking_availability === 'sold_out').length,
  cancelled_schedules: mockSchedulesForTour1.filter((s) => s.status === 'cancelled').length,
};

export const scheduleListSearchKeyword = 'Ba Na';
export const scheduleListFullCapacityText = '25 / 25';
export const scheduleListAvailableCapacityText = '10 / 30';
