/** Mock blog category rows for Playwright — aligned with mapBlogCategory */

export interface MockBlogCategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

export const mockBlogCategorySearchKeyword = 'Ẩm';

export const primaryBlogCategoryRow: MockBlogCategoryRow = {
  id: 1,
  name: 'Kinh nghiệm du lịch',
  slug: 'kinh-nghiem-du-lich',
  description: 'Chia sẻ kinh nghiệm và mẹo du lịch Đà Nẵng',
  sort_order: 1,
  posts_count: 5,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-06-01T00:00:00Z',
};

export const searchableBlogCategoryRow: MockBlogCategoryRow = {
  id: 2,
  name: 'Ẩm thực Đà Nẵng',
  slug: 'am-thuc-da-nang',
  description: 'Khám phá ẩm thực địa phương',
  sort_order: 2,
  posts_count: 4,
  created_at: '2025-01-02T00:00:00Z',
  updated_at: '2025-06-02T00:00:00Z',
};

export const secondaryBlogCategoryRow: MockBlogCategoryRow = {
  id: 3,
  name: 'Tin tức sự kiện',
  slug: 'tin-tuc-su-kien',
  description: 'Tin tức và sự kiện du lịch',
  sort_order: 3,
  posts_count: 2,
  created_at: '2025-01-03T00:00:00Z',
  updated_at: '2025-06-03T00:00:00Z',
};

export const deletableBlogCategoryRow: MockBlogCategoryRow = {
  id: 4,
  name: 'Văn hóa',
  slug: 'van-hoa',
  description: 'Di sản văn hóa và làng nghề',
  sort_order: 4,
  posts_count: 0,
  created_at: '2025-01-04T00:00:00Z',
  updated_at: '2025-06-04T00:00:00Z',
};

export const blockedDeleteBlogCategoryRow: MockBlogCategoryRow = {
  id: 5,
  name: 'Sự kiện nổi bật',
  slug: 'su-kien-noi-bat',
  description: 'Các sự kiện lớn tại Đà Nẵng',
  sort_order: 5,
  posts_count: 12,
  created_at: '2025-01-05T00:00:00Z',
  updated_at: '2025-06-05T00:00:00Z',
};

export const mockBlogCategoryListRows: MockBlogCategoryRow[] = [
  primaryBlogCategoryRow,
  searchableBlogCategoryRow,
  secondaryBlogCategoryRow,
  deletableBlogCategoryRow,
  blockedDeleteBlogCategoryRow,
];

export const expectedBlogCategoryStats = {
  totalCategories: 5,
  totalPosts: 23,
};
