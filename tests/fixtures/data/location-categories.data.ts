/** Mock location category rows for Playwright — aligned with category.dataHelper */

export interface MockLocationCategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  status: 'active' | 'inactive';
  locations_count: number;
  icon_background: string;
  created_at: string;
  updated_at: string;
}

export const mockLocationCategorySearchKeyword = 'Biển';

export const primaryLocationCategoryRow: MockLocationCategoryRow = {
  id: 1,
  name: 'Ẩm thực',
  slug: 'am-thuc',
  description: 'Quán ăn, nhà hàng và ẩm thực địa phương',
  icon: 'Utensils',
  sort_order: 1,
  status: 'active',
  locations_count: 15,
  icon_background: '#FFEDD5',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
};

export const secondaryLocationCategoryRow: MockLocationCategoryRow = {
  id: 2,
  name: 'Lưu trú',
  slug: 'luu-tru',
  description: 'Khách sạn, homestay và resort',
  icon: 'Hotel',
  sort_order: 2,
  status: 'active',
  locations_count: 20,
  icon_background: '#E0E7FF',
  created_at: '2025-01-02T00:00:00Z',
  updated_at: '2025-06-02T00:00:00Z',
};

export const searchableLocationCategoryRow: MockLocationCategoryRow = {
  id: 3,
  name: 'Bãi biển',
  slug: 'bai-bien',
  description: 'Bãi biển và điểm ngắm biển tại Đà Nẵng',
  icon: 'Waves',
  sort_order: 3,
  status: 'active',
  locations_count: 8,
  icon_background: '#CFFAFE',
  created_at: '2025-01-03T00:00:00Z',
  updated_at: '2025-06-03T00:00:00Z',
};

export const deletableLocationCategoryRow: MockLocationCategoryRow = {
  id: 4,
  name: 'Văn hóa',
  slug: 'van-hoa',
  description: 'Làng nghề và di sản văn hóa',
  icon: 'Landmark',
  sort_order: 4,
  status: 'inactive',
  locations_count: 0,
  icon_background: '#FEF9C3',
  created_at: '2025-01-04T00:00:00Z',
  updated_at: '2025-06-04T00:00:00Z',
};

export const blockedDeleteLocationCategoryRow: MockLocationCategoryRow = {
  id: 5,
  name: 'Di tích',
  slug: 'di-tich',
  description: 'Di tích lịch sử và danh lam thắng cảnh',
  icon: 'Building2',
  sort_order: 5,
  status: 'active',
  locations_count: 25,
  icon_background: '#DCFCE7',
  created_at: '2025-01-05T00:00:00Z',
  updated_at: '2025-06-05T00:00:00Z',
};

export const mockLocationCategoryListRows: MockLocationCategoryRow[] = [
  primaryLocationCategoryRow,
  secondaryLocationCategoryRow,
  searchableLocationCategoryRow,
  deletableLocationCategoryRow,
  blockedDeleteLocationCategoryRow,
];

export const expectedLocationCategoryStats = {
  total: 5,
  active: 4,
  inactive: 1,
};
