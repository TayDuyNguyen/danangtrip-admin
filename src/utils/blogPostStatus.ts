import type { BlogPostViewModel } from '@/types';

type BlogStatus = BlogPostViewModel['status'];

export function isBlogPostScheduled(publishedAt: Date | null, status: string): boolean {
    if (!publishedAt || status !== 'published') return false;
    return publishedAt.getTime() > Date.now();
}

export function canPreviewBlogPost(post: Pick<BlogPostViewModel, 'status' | 'publishedAt'>): boolean {
    return post.status === 'published' && !isBlogPostScheduled(post.publishedAt, post.status);
}

export type BlogPostDisplayStatus = BlogStatus | 'scheduled';

export function getBlogPostDisplayStatus(
    post: Pick<BlogPostViewModel, 'status' | 'publishedAt'>
): BlogPostDisplayStatus {
    if (isBlogPostScheduled(post.publishedAt, post.status)) return 'scheduled';
    return post.status;
}
