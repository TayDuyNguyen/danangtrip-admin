import {
  deletableBlogId,
  primaryBlogRow,
  scheduledBlogId,
} from './blog-list.data';
import { tinyPngBuffer } from './blog-create.data';

export { tinyPngBuffer };

export const defaultEditBlogId = primaryBlogRow.id;
export const draftEditBlogId = 203;
export const archivedEditBlogId = 204;
export const scheduledEditBlogId = scheduledBlogId;
export const deleteEditBlogId = deletableBlogId;
export const notFoundBlogId = 99999;

export const mockEditBlog = primaryBlogRow;

export const updatedBlogTitle = 'Ẩm thực Đà Nẵng — bản cập nhật automation';
export const updatedBlogContent = '## Cập nhật\n\nNội dung **mới** sau edit automation.';
export const slugChangeTitle = 'Tiêu đề mới khác slug automation test';

export const longBlogTitle = 'x'.repeat(256);
export const longBlogExcerpt = 'x'.repeat(501);

export const inlineCategoryName = 'Danh mục edit automation';
export const scheduledDate = '2099-06-15';
export const scheduledTime = '10:30';

export const validationMessages = {
  titleRequired: /Tiêu đề bài viết không được để trống|Post title is required/i,
  contentRequired: /Nội dung bài viết không được để trống|Post content is required/i,
  categoriesRequired: /Vui lòng chọn ít nhất một danh mục|Please select at least one category/i,
  titleMax: /Tiêu đề không được vượt quá 255|Title must not exceed 255/i,
  excerptMax: /Tóm tắt không được vượt quá 500|Excerpt must not exceed 500/i,
  scheduleDateRequired: /Vui lòng chọn ngày xuất bản khi lên lịch|Please select a publish date when scheduling/i,
};

export function buildValidApiUpdatePayload() {
  return {
    title: `API Blog Edit ${Date.now()}`,
    content: '<p>API update content</p>',
    excerpt: 'API excerpt updated',
    category_ids: [1],
    status: 'draft' as const,
    featured_image: 'https://picsum.photos/seed/api-blog-edit/800/600',
  };
}
