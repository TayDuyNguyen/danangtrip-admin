/** Tour create form fixtures — aligned with createTourSchema */

export const tinyPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

export const validCreateTourName = 'Tour Ngũ Hành Sơn - Hội An 1 Ngày';

export const validCreateTour = {
  name: validCreateTourName,
  categoryLabel: 'City Tour',
  duration: '1 ngày',
  shortDesc: 'Tour trọn ngày khám phá Ngũ Hành Sơn và Hội An',
  description: 'Hành trình chi tiết khám phá di sản miền Trung trong một ngày.',
  priceAdultDigits: '850000',
  availableFrom: '2026-01-01',
  availableTo: '2026-12-31',
  meetingPoint: '123 Trần Phú, Đà Nẵng',
  itineraryTitle: 'Đón sân bay - Bán đảo Sơn Trà',
  itineraryContent: 'Đón khách và tham quan bán đảo Sơn Trà buổi sáng.',
};

export const requiredFieldKeys = [
  'name',
  'tour_category_id',
  'duration',
  'short_desc',
  'description',
  'price_adult',
  'available_from',
  'available_to',
] as const;

export const slugSourceName = 'Tour Ngũ Hành Sơn';
export const expectedSlugFromName = 'tour-ngu-hanh-son';

export const longShortDesc = 'x'.repeat(301);

export const invalidVideoUrl = 'not-a-valid-url';

export const invalidDateRange = {
  availableFrom: '2026-12-31',
  availableTo: '2026-01-01',
};

export const invalidPeopleRange = {
  minPeople: '8',
  maxPeople: '3',
};

export const createApiErrorMessage = 'Duplicate tour slug';

export const shortTourName = 'ab';

export const invalidDiscountOver100 = '150';
export const invalidDiscountNegative = '-5';

export const invalidNegativePriceChild = '-100';
export const invalidNegativePriceInfant = '-50';

export const invalidMinPeopleZero = '0';

export const sampleInclusions = 'Xe đưa đón\nHướng dẫn viên\nBữa trưa';
export const sampleExclusions = 'Chi phí cá nhân\nTip';

export function expectedDiscountedPrice(price: number, discountPercent: number): string {
  const value = Math.round(price * (1 - discountPercent / 100));
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function buildValidApiCreatePayload(overrides: Record<string, unknown> = {}) {
  const suffix = Date.now();
  return {
    name: `Auto API Tour ${suffix}`,
    slug: `auto-api-tour-${suffix}`,
    tour_category_id: 1,
    duration: '1 ngày',
    short_desc: 'Tour tạo từ API automation test',
    description: 'Mô tả chi tiết tour được tạo bởi Playwright API test.',
    price_adult: 850000,
    price_child: 0,
    price_infant: 0,
    discount_percent: 0,
    min_people: 1,
    max_people: 10,
    available_from: '2026-01-01',
    available_to: '2026-12-31',
    thumbnail: 'https://picsum.photos/seed/api-create/400/300',
    images: [],
    itinerary: [
      {
        day: 1,
        title: 'Khởi hành',
        content: 'Tham quan các điểm du lịch trong ngày.',
      },
    ],
    inclusions: ['Xe đưa đón', 'Bữa trưa'],
    exclusions: ['Chi phí cá nhân'],
    location_ids: [],
    status: 'active',
    is_featured: false,
    is_hot: false,
    ...overrides,
  };
}
