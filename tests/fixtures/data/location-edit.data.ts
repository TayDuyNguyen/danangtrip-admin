/** Location edit fixtures — aligned with mock row id 101 */

import { mockLocationCategories, mockLocationListRows } from './locations.data';

export const defaultEditLocationId = 101;
export const deleteLocationId = 104;
export const notFoundLocationId = 9999;

export const mockEditLocation = mockLocationListRows.find((r) => r.id === defaultEditLocationId)!;

export const updatedLocationName = 'Bán đảo Sơn Trà (đã cập nhật)';
export const updatedDescription = 'Mô tả chi tiết đã chỉnh sửa qua automation test.';

export const legacyOpeningHoursArray = ['07:00 - 21:00 hàng ngày', 'Cuối tuần: 08:00 - 22:00'];
export const expectedOpeningHoursFormText = legacyOpeningHoursArray.join('\n');

export const invalidEditEmail = 'bad-email';

export const mockEditCategoryLabel =
  mockLocationCategories.find((c) => c.id === mockEditLocation.category_id)?.name ?? 'Tham quan';

export function buildValidApiUpdatePayload(overrides: Record<string, unknown> = {}) {
  return {
    name: mockEditLocation.name,
    slug: mockEditLocation.slug,
    category_id: mockEditLocation.category_id,
    description: mockEditLocation.description,
    short_description: mockEditLocation.short_description ?? '',
    address: mockEditLocation.address,
    district: mockEditLocation.district ?? 'Sơn Trà',
    latitude: Number(mockEditLocation.latitude ?? 16.0544),
    longitude: Number(mockEditLocation.longitude ?? 108.2022),
    price_level: mockEditLocation.price_level ?? 1,
    price_min: mockEditLocation.price_min ?? null,
    price_max: mockEditLocation.price_max ?? null,
    thumbnail: mockEditLocation.thumbnail ?? '',
    images: mockEditLocation.images ?? [],
    status: mockEditLocation.status,
    is_featured: mockEditLocation.is_featured,
    tags: [],
    amenities: [],
    ...overrides,
  };
}
