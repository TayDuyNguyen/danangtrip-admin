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
