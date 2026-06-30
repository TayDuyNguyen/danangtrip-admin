import type { RawBlogCategory, RawBlogPost, BlogStats } from '@/types/blog';

export const mockBlogCategories: RawBlogCategory[] = [
  {
    id: 1,
    name: 'Kinh nghiệm',
    slug: 'kinh-nghiem',
    description: 'Kinh nghiệm du lịch',
    sort_order: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    posts_count: 5,
  },
  {
    id: 2,
    name: 'Ẩm thực',
    slug: 'am-thuc',
    description: 'Ẩm thực Đà Nẵng',
    sort_order: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    posts_count: 4,
  },
  {
    id: 3,
    name: 'Du lịch',
    slug: 'du-lich',
    description: 'Điểm đến du lịch',
    sort_order: 3,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    posts_count: 6,
  },
];

const defaultAuthor = {
  id: 1,
  full_name: 'Admin DaNangTrip',
  avatar: null as string | null,
};

function cat(id: number) {
  const c = mockBlogCategories.find((x) => x.id === id)!;
  return { id: c.id, name: c.name, slug: c.slug, description: c.description, sort_order: c.sort_order, created_at: c.created_at, updated_at: c.updated_at };
}

function buildPost(
  partial: Pick<RawBlogPost, 'id' | 'title' | 'slug' | 'status'> &
    Partial<
      Pick<
        RawBlogPost,
        'excerpt' | 'view_count' | 'featured_image' | 'published_at' | 'created_at' | 'categories' | 'author'
      >
    >
): RawBlogPost {
  return {
    id: partial.id,
    title: partial.title,
    slug: partial.slug,
    excerpt: partial.excerpt ?? `Tóm tắt cho ${partial.title}`,
    content: `<p>Nội dung chi tiết ${partial.title}</p>`,
    featured_image: partial.featured_image ?? 'https://picsum.photos/seed/blog/120/90',
    author_id: defaultAuthor.id,
    view_count: partial.view_count ?? 1200,
    status: partial.status,
    published_at: partial.published_at ?? (partial.status === 'published' ? '2025-06-01T08:00:00Z' : null),
    created_at: partial.created_at ?? '2025-05-20T10:00:00Z',
    updated_at: '2025-06-10T12:00:00Z',
    author: partial.author ?? defaultAuthor,
    categories: partial.categories ?? [cat(1)],
  };
}

export const mockBlogSearchKeyword = 'Ẩm thực Đà Nẵng';

export const primaryBlogRow = buildPost({
  id: 201,
  title: 'Ẩm thực Đà Nẵng: 10 quán must-try',
  slug: 'am-thuc-da-nang-10-quan',
  status: 'published',
  view_count: 8420,
  categories: [cat(2)],
  excerpt: 'Khám phá ẩm thực đường phố Đà Nẵng',
  created_at: '2025-06-15T10:00:00Z',
});

export const deletableBlogId = 215;
export const bulkDraftBlogIds = [212, 213];
export const statusChangeBlogId = 203;
export const scheduledBlogId = 216;
export const bulkArchiveBlogId = 201;

export const mockBlogListRows: RawBlogPost[] = [
  primaryBlogRow,
  buildPost({
    id: 202,
    title: 'Bí quyết đi Bà Nà Hills một ngày',
    slug: 'bi-quyet-ba-na-hills',
    status: 'published',
    view_count: 5200,
    categories: [cat(1), cat(3)],
    created_at: '2025-06-01T08:00:00Z',
  }),
  buildPost({
    id: 203,
    title: 'Lịch trình 3 ngày 2 đêm tại Đà Nẵng',
    slug: 'lich-trinh-3-ngay-2-dem',
    status: 'draft',
    view_count: 890,
    categories: [cat(1)],
  }),
  buildPost({
    id: 204,
    title: 'Top homestay view biển Sơn Trà',
    slug: 'homestay-son-tra',
    status: 'archived',
    view_count: 3100,
    categories: [cat(3)],
  }),
  buildPost({
    id: 205,
    title: 'Cẩm nang check-in Cầu Rồng',
    slug: 'cam-nang-cau-rong',
    status: 'published',
    view_count: 6700,
    categories: [cat(1)],
  }),
  buildPost({
    id: 206,
    title: 'Mì Quảng ngon nhất quận Hải Châu',
    slug: 'mi-quang-hai-chau',
    status: 'published',
    view_count: 4100,
    categories: [cat(2)],
  }),
  buildPost({
    id: 207,
    title: 'Kinh nghiệm thuê xe máy Đà Nẵng',
    slug: 'thue-xe-may-da-nang',
    status: 'published',
    view_count: 2900,
    categories: [cat(1)],
  }),
  buildPost({
    id: 208,
    title: 'Bãi biển Mỹ Khê — mùa nào đẹp nhất?',
    slug: 'bai-bien-my-khe',
    status: 'published',
    view_count: 7800,
    categories: [cat(3)],
  }),
  buildPost({
    id: 209,
    title: 'Hải sản tươi sống chợ Cồn',
    slug: 'hai-san-cho-con',
    status: 'published',
    view_count: 3600,
    categories: [cat(2)],
  }),
  buildPost({
    id: 210,
    title: 'Ngũ Hành Sơn — hướng dẫn leo núi',
    slug: 'ngu-hanh-son-leo-nui',
    status: 'published',
    view_count: 4500,
    categories: [cat(3)],
  }),
  buildPost({
    id: 211,
    title: 'Bánh tráng cuốn thịt heo — địa chỉ uy tín',
    slug: 'banh-trang-cuon',
    status: 'published',
    view_count: 2200,
    categories: [cat(2), cat(1)],
  }),
  buildPost({
    id: 212,
    title: 'Draft bulk publish A',
    slug: 'draft-bulk-a',
    status: 'draft',
    view_count: 100,
    categories: [cat(1)],
  }),
  buildPost({
    id: 213,
    title: 'Draft bulk publish B',
    slug: 'draft-bulk-b',
    status: 'draft',
    view_count: 150,
    categories: [cat(1)],
  }),
  buildPost({
    id: 214,
    title: 'Sunset trên cầu Thuận Phước',
    slug: 'sunset-cau-thuan-phuoc',
    status: 'published',
    view_count: 1900,
    categories: [cat(3)],
  }),
  buildPost({
    id: deletableBlogId,
    title: 'Bài viết test xóa automation',
    slug: 'bai-viet-test-xoa',
    status: 'draft',
    view_count: 50,
    categories: [cat(2)],
  }),
  buildPost({
    id: scheduledBlogId,
    title: 'Bài viết lên lịch automation',
    slug: 'bai-viet-len-lich',
    status: 'published',
    view_count: 300,
    categories: [cat(1)],
    published_at: '2099-12-31T08:00:00Z',
    created_at: '2025-06-10T08:00:00Z',
  }),
];

export function computeBlogStats(rows: RawBlogPost[]): BlogStats {
  return {
    total: rows.length,
    published: rows.filter((r) => r.status === 'published').length,
    draft: rows.filter((r) => r.status === 'draft').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  };
}

export const expectedBlogStats = computeBlogStats(mockBlogListRows);
