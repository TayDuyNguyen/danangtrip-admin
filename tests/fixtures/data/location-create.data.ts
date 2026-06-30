/** Location create form fixtures — aligned with createLocationSchema */

export const tinyPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

export const validCreateLocationName = 'Suối Hoa Đà Nắm';

export const validCreateLocation = {
  name: validCreateLocationName,
  slug: 'suoi-hoa-da-nam',
  categoryLabel: 'Tham quan',
  district: 'Sơn Trà',
  shortDescription: 'Khu du lịch sinh thái mát mẻ tại Sơn Trà.',
  description: 'Mô tả chi tiết về suối Hoa với không gian xanh và hồ bơi tự nhiên.',
  address: '123 Đường Hoàng Sa, Sơn Trà, Đà Nẵng',
  phone: '0905123456',
  priceMinDigits: '50000',
  priceMaxDigits: '150000',
};

export const requiredFieldKeys = [
  'name',
  'slug',
  'category_id',
  'short_description',
  'description',
  'address',
  'district',
  'thumbnail',
] as const;

export const slugSourceName = 'Bán đảo Sơn Trà';
export const expectedSlugFromName = 'ban-dao-son-tra';

export const shortLocationName = 'ab';
export const longShortDescription = 'x'.repeat(301);
export const invalidEmail = 'not-an-email';
export const invalidWebsite = 'ftp://bad-site';
export const invalidVideoUrl = 'not-a-valid-url';

export const invalidPriceRange = {
  priceMinDigits: '200000',
  priceMaxDigits: '50000',
};

export const createApiErrorMessage = 'Duplicate location slug';

export const mockLocationTags = [
  { id: 1, name: 'Gia đình' },
  { id: 2, name: 'Check-in' },
];

export const mockLocationAmenities = [
  { id: 1, name: 'Bãi đỗ xe', icon: 'car' },
  { id: 2, name: 'Wifi miễn phí', icon: 'wifi' },
];

export function buildValidApiCreatePayload(overrides: Record<string, unknown> = {}) {
  const suffix = Date.now();
  return {
    name: `Auto API Location ${suffix}`,
    slug: `auto-api-location-${suffix}`,
    category_id: 1,
    description: 'Mô tả chi tiết địa điểm tạo từ API test.',
    short_description: 'Mô tả ngắn API test.',
    address: '1 Trần Phú, Hải Châu, Đà Nẵng',
    district: 'Hải Châu',
    latitude: 16.0544,
    longitude: 108.2022,
    price_level: 2,
    price_min: 40000,
    price_max: 120000,
    thumbnail: 'https://picsum.photos/seed/api-location/400/300',
    images: [],
    status: 'active',
    is_featured: false,
    tags: [],
    amenities: [],
    ...overrides,
  };
}
