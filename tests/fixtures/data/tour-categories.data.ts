/** Mock tour category rows for Playwright — aligned with tourCategory.dataHelper */

export interface MockTourCategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  status: 'active' | 'inactive';
  tour_count: number;
  icon_background: string;
  created_at: string;
  updated_at: string;
}

export const mockCategorySearchKeyword = 'Biển';

export const primaryCategoryRow: MockTourCategoryRow = {
  id: 1,
  name: 'Tour Trong Ngày',
  slug: 'tour-trong-ngay',
  description: 'Các tour khởi hành và về trong ngày',
  icon: 'Map',
  sort_order: 1,
  status: 'active',
  tour_count: 12,
  icon_background: '#E0F2FE',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
};

export const secondaryCategoryRow: MockTourCategoryRow = {
  id: 2,
  name: 'Tour Dài Ngày',
  slug: 'tour-dai-ngay',
  description: 'Tour nhiều ngày đi khắp miền Trung',
  icon: 'Mountain',
  sort_order: 2,
  status: 'active',
  tour_count: 8,
  icon_background: '#DCFCE7',
  created_at: '2025-01-02T00:00:00Z',
  updated_at: '2025-06-02T00:00:00Z',
};

export const searchableCategoryRow: MockTourCategoryRow = {
  id: 3,
  name: 'Tour Biển Đảo',
  slug: 'tour-bien-dao',
  description: 'Khám phá biển đảo Đà Nẵng',
  icon: 'Waves',
  sort_order: 3,
  status: 'active',
  tour_count: 5,
  icon_background: '#CFFAFE',
  created_at: '2025-01-03T00:00:00Z',
  updated_at: '2025-06-03T00:00:00Z',
};

export const deletableCategoryRow: MockTourCategoryRow = {
  id: 4,
  name: 'Tour Văn Hóa',
  slug: 'tour-van-hoa',
  description: 'Di sản văn hóa và làng nghề',
  icon: 'Landmark',
  sort_order: 4,
  status: 'inactive',
  tour_count: 0,
  icon_background: '#FEF9C3',
  created_at: '2025-01-04T00:00:00Z',
  updated_at: '2025-06-04T00:00:00Z',
};

export const blockedDeleteCategoryRow: MockTourCategoryRow = {
  id: 5,
  name: 'Tour Du Thuyền',
  slug: 'tour-du-thuyen',
  description: 'Trải nghiệm du thuyền sông Hàn',
  icon: 'Ship',
  sort_order: 5,
  status: 'active',
  tour_count: 25,
  icon_background: '#E0E7FF',
  created_at: '2025-01-05T00:00:00Z',
  updated_at: '2025-06-05T00:00:00Z',
};

export const mockTourCategoryListRows: MockTourCategoryRow[] = [
  primaryCategoryRow,
  secondaryCategoryRow,
  searchableCategoryRow,
  deletableCategoryRow,
  blockedDeleteCategoryRow,
];

export const expectedCategoryStats = {
  totalTours: 50,
  activeCategories: 4,
  inactiveCategories: 1,
};
