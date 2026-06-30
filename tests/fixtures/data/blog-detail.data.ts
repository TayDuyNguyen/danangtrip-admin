import { primaryBlogRow, scheduledBlogId, deletableBlogId } from './blog-list.data';

export const defaultDetailBlogId = primaryBlogRow.id;
export const draftDetailBlogId = 203;
export const archivedDetailBlogId = 204;
export const scheduledDetailBlogId = scheduledBlogId;
export const deleteDetailBlogId = deletableBlogId;
export const notFoundDetailBlogId = 99999;

export const mockDetailBlog = primaryBlogRow;

export const expectedDetailSlug = primaryBlogRow.slug;
export const expectedDetailExcerpt = primaryBlogRow.excerpt ?? '';
export const expectedDetailContentSnippet = 'Nội dung chi tiết';
