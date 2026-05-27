import { toNumberSafe, toArraySafe } from "./dashboard.mapper";
import type {
    RawBlogCategory,
    BlogCategoryViewModel,
    RawBlogPostAuthor,
    BlogPostAuthorViewModel,
    RawBlogPost,
    BlogPostViewModel,
    RawBlogPostListResponse,
    BlogStats
} from "@/types";

export const mapBlogCategory = (raw: RawBlogCategory): BlogCategoryViewModel => {
    return {
        id: raw.id,
        name: raw.name || "N/A",
        slug: raw.slug || "",
        description: raw.description,
        image: raw.image,
        status: raw.status || 'inactive',
    };
};

export const mapBlogPostAuthor = (raw: RawBlogPostAuthor | null | undefined): BlogPostAuthorViewModel | null => {
    if (!raw) return null;
    return {
        id: raw.id,
        fullName: raw.full_name || "N/A",
        avatar: raw.avatar,
    };
};

export const mapBlogPost = (raw: RawBlogPost): BlogPostViewModel => {
    return {
        id: raw.id,
        title: raw.title || "N/A",
        slug: raw.slug || "",
        excerpt: raw.excerpt || "",
        content: raw.content || "",
        featuredImage: raw.featured_image,
        authorId: raw.author_id,
        viewCount: toNumberSafe(raw.view_count, 0),
        status: raw.status || 'draft',
        publishedAt: raw.published_at ? new Date(raw.published_at) : null,
        createdAt: new Date(raw.created_at),
        updatedAt: new Date(raw.updated_at),
        author: mapBlogPostAuthor(raw.author),
        categories: toArraySafe<RawBlogCategory>(raw.categories).map(mapBlogCategory),
    };
};

export const mapBlogPostList = (raw: RawBlogPostListResponse | unknown): {
    data: BlogPostViewModel[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: BlogStats;
} => {
    const rawCast = raw as RawBlogPostListResponse;
    const items = toArraySafe<RawBlogPost>(rawCast?.data || raw);

    return {
        data: items.map(mapBlogPost),
        meta: {
            current_page: toNumberSafe(rawCast?.current_page, 1),
            last_page: toNumberSafe(rawCast?.last_page, 1),
            per_page: toNumberSafe(rawCast?.per_page, 10),
            total: toNumberSafe(rawCast?.total, items.length),
        },
        stats: {
            total: toNumberSafe(rawCast?.stats?.total, toNumberSafe(rawCast?.total, items.length)),
            published: toNumberSafe(rawCast?.stats?.published, items.filter(x => x.status === 'published').length),
            draft: toNumberSafe(rawCast?.stats?.draft, items.filter(x => x.status === 'draft').length),
            archived: toNumberSafe(rawCast?.stats?.archived, items.filter(x => x.status === 'archived').length),
        }
    };
};
