import type { RawLocation } from '@/types/location';

export interface MockLocationCategory {
  id: number;
  name: string;
}

export const mockLocationCategories: MockLocationCategory[] = [
  { id: 1, name: 'Tham quan' },
  { id: 2, name: 'Ẩm thực' },
  { id: 3, name: 'Vui chơi giải trí' },
];

export const mockLocationDistricts = ['Sơn Trà', 'Ngũ Hành Sơn', 'Hải Châu', 'Thanh Khê', 'Liên Chiểu'];

const categoryById = (id: number) => mockLocationCategories.find((c) => c.id === id)!;

function defaultPricesForLevel(level: number): { price_min: number; price_max: number } {
  switch (level) {
    case 1:
      return { price_min: 0, price_max: 0 };
    case 2:
      return { price_min: 40_000, price_max: 120_000 };
    case 3:
      return { price_min: 200_000, price_max: 500_000 };
    case 4:
      return { price_min: 650_000, price_max: 1_200_000 };
    default:
      return { price_min: 50_000, price_max: 150_000 };
  }
}

function buildLocation(
  partial: Pick<RawLocation, 'id' | 'name' | 'slug' | 'category_id' | 'district' | 'status'> &
    Partial<
      Pick<
        RawLocation,
        | 'is_featured'
        | 'price_level'
        | 'price_min'
        | 'price_max'
        | 'view_count'
        | 'favorite_count'
        | 'review_count'
        | 'avg_rating'
        | 'address'
        | 'short_description'
        | 'thumbnail'
      >
    >
): RawLocation {
  const category = categoryById(partial.category_id);
  const priceLevel = partial.price_level ?? 2;
  const defaultPrices = defaultPricesForLevel(priceLevel);
  return {
    id: partial.id,
    name: partial.name,
    slug: partial.slug,
    category_id: partial.category_id,
    address: partial.address ?? `${partial.name}, Đà Nẵng`,
    description: `Mô tả chi tiết cho ${partial.name}.`,
    short_description: partial.short_description ?? `Mô tả ngắn ${partial.name}`,
    price_level: priceLevel,
    price_min: partial.price_min ?? defaultPrices.price_min,
    price_max: partial.price_max ?? defaultPrices.price_max,
    thumbnail: partial.thumbnail ?? 'https://picsum.photos/seed/location/120/120',
    images: [],
    status: partial.status,
    is_featured: partial.is_featured ?? false,
    view_count: partial.view_count ?? 1200,
    favorite_count: partial.favorite_count ?? 45,
    avg_rating: partial.avg_rating ?? 4.5,
    review_count: partial.review_count ?? 28,
    district: partial.district,
    category: { id: category.id, name: category.name },
    latitude: 16.0544,
    longitude: 108.2022,
    phone: partial.phone ?? '02363778899',
    email: partial.email ?? 'info@example.com',
    tags: partial.tags ?? [],
    amenities: partial.amenities ?? [],
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-10T00:00:00Z',
  };
}

export const mockLocationListRows: RawLocation[] = [
  buildLocation({
    id: 101,
    name: 'Bán đảo Sơn Trà',
    slug: 'ban-dao-son-tra',
    category_id: 1,
    district: 'Sơn Trà',
    status: 'active',
    is_featured: true,
    price_level: 1,
    view_count: 48200,
    favorite_count: 3200,
    avg_rating: 4.8,
    review_count: 512,
  }),
  buildLocation({
    id: 102,
    name: 'Cầu Rồng',
    slug: 'cau-rong',
    category_id: 1,
    district: 'Hải Châu',
    status: 'active',
    is_featured: true,
    price_level: 1,
    view_count: 92000,
    avg_rating: 4.7,
  }),
  buildLocation({
    id: 103,
    name: 'Bãi biển Mỹ Khê',
    slug: 'bai-bien-my-khe',
    category_id: 1,
    district: 'Sơn Trà',
    status: 'active',
    price_level: 1,
  }),
  buildLocation({
    id: 104,
    name: 'Ngũ Hành Sơn',
    slug: 'ngu-hanh-son',
    category_id: 1,
    district: 'Ngũ Hành Sơn',
    status: 'active',
    price_level: 2,
  }),
  buildLocation({
    id: 105,
    name: 'Chùa Linh Ứng Bãi Bụt',
    slug: 'chua-linh-ung-bai-but',
    category_id: 1,
    district: 'Sơn Trà',
    status: 'active',
    price_level: 1,
  }),
  buildLocation({
    id: 106,
    name: 'Chợ Hàn',
    slug: 'cho-han',
    category_id: 2,
    district: 'Hải Châu',
    status: 'active',
    price_level: 2,
  }),
  buildLocation({
    id: 107,
    name: 'Mỳ Quảng Bà Mua',
    slug: 'my-quang-ba-mua',
    category_id: 2,
    district: 'Thanh Khê',
    status: 'active',
    price_level: 2,
  }),
  buildLocation({
    id: 108,
    name: 'Asia Park',
    slug: 'asia-park',
    category_id: 3,
    district: 'Hải Châu',
    status: 'active',
    price_level: 3,
    is_featured: true,
  }),
  buildLocation({
    id: 109,
    name: 'Helio Night Market',
    slug: 'helio-night-market',
    category_id: 2,
    district: 'Hải Châu',
    status: 'inactive',
    price_level: 2,
  }),
  buildLocation({
    id: 110,
    name: 'Sun World Ba Na Hills',
    slug: 'sun-world-ba-na',
    category_id: 3,
    district: 'Ngũ Hành Sơn',
    status: 'active',
    price_level: 4,
    is_featured: true,
  }),
  buildLocation({
    id: 111,
    name: 'Bảo tàng Điêu khắc Chăm',
    slug: 'bao-tang-dieu-khac-cham',
    category_id: 1,
    district: 'Hải Châu',
    status: 'active',
    price_level: 2,
  }),
  buildLocation({
    id: 112,
    name: 'Công viên APEC',
    slug: 'cong-vien-apec',
    category_id: 1,
    district: 'Sơn Trà',
    status: 'inactive',
    price_level: 1,
  }),
  buildLocation({
    id: 113,
    name: 'Hồ Hòa Trung',
    slug: 'ho-hoa-trung',
    category_id: 3,
    district: 'Liên Chiểu',
    status: 'active',
    price_level: 3,
  }),
  buildLocation({
    id: 114,
    name: 'Làng bích họa Tam Thanh',
    slug: 'lang-bich-hoa-tam-thanh',
    category_id: 1,
    district: 'Thanh Khê',
    status: 'active',
    price_level: 1,
  }),
  buildLocation({
    id: 115,
    name: 'Đèo Hải Vân',
    slug: 'deo-hai-van',
    category_id: 1,
    district: 'Liên Chiểu',
    status: 'active',
    price_level: 2,
  }),
];

export const primaryLocationRow = mockLocationListRows[0]!;
export const mockLocationSearchKeyword = 'Bán đảo Sơn Trà';
export const deletableLocationId = 115;
export const featuredToggleLocationId = 103;
export const bulkActionLocationIds = [112, 113];

export function computeLocationStats(rows: RawLocation[] = mockLocationListRows) {
  const active = rows.filter((r) => r.status === 'active').length;
  const featured = rows.filter((r) => r.is_featured).length;
  const total_views = rows.reduce((sum, r) => sum + (r.view_count ?? 0), 0);
  return {
    total: rows.length,
    active,
    featured,
    total_views,
  };
}

export const expectedLocationStats = computeLocationStats();

export function formatViewsForStats(totalViews: number): string {
  if (totalViews >= 1000) return `${(totalViews / 1000).toFixed(1)}K`;
  return String(totalViews);
}
