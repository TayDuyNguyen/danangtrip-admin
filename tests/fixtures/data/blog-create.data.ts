/** Blog create form fixtures — aligned with createBlogPostSchema */

export const tinyPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

export const validCreateBlogTitle = 'Ăn gì ở Đà Nẵng: Top 10 món ngon automation';

export const validCreateBlog = {
  title: validCreateBlogTitle,
  excerpt: 'Khám phá ẩm thực đường phố Đà Nẵng qua top 10 món must-try.',
  content: '## Giới thiệu\n\nNội dung **markdown** test automation.\n\n### Món 1\nMì Quảng.',
  categoryName: 'Ẩm thực',
};

export const slugSourceTitle = 'Bánh tráng cuốn thịt heo';
export const expectedSlugFromTitle = 'banh-trang-cuon-thit-heo';

export const longBlogTitle = 'x'.repeat(256);
export const longBlogExcerpt = 'x'.repeat(501);

export const inlineCategoryName = 'Danh mục test automation';

export const scheduledDate = '2099-12-31';
export const scheduledTime = '09:00';

export const validationMessages = {
  titleRequired: /Tiêu đề bài viết không được để trống|Post title is required/i,
  contentRequired: /Nội dung bài viết không được để trống|Post content is required/i,
  categoriesRequired: /Vui lòng chọn ít nhất một danh mục|Please select at least one category/i,
  titleMax: /Tiêu đề không được vượt quá 255|Title must not exceed 255/i,
  excerptMax: /Tóm tắt không được vượt quá 500|Excerpt must not exceed 500/i,
  scheduleDateRequired: /Vui lòng chọn ngày xuất bản khi lên lịch|Please select a publish date when scheduling/i,
};

export function buildValidApiCreatePayload() {
  return {
    title: `API Blog ${Date.now()}`,
    content: '<p>API create content</p>',
    excerpt: 'API excerpt',
    category_ids: [1],
    status: 'draft' as const,
    featured_image: 'https://picsum.photos/seed/api-blog/800/600',
  };
}
