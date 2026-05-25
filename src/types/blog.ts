export interface RawBlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface BlogCategoryViewModel {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    status: 'active' | 'inactive';
}

export interface RawBlogPostAuthor {
    id: number;
    full_name: string;
    avatar: string | null;
}

export interface BlogPostAuthorViewModel {
    id: number;
    fullName: string;
    avatar: string | null;
}

export interface RawBlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    featured_image: string | null;
    author_id: number;
    view_count: number;
    status: 'draft' | 'published' | 'archived';
    published_at: string | null;
    created_at: string;
    updated_at: string;
    author?: RawBlogPostAuthor | null;
    categories?: RawBlogCategory[];
}

export interface BlogPostViewModel {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string | null;
    authorId: number;
    viewCount: number;
    status: 'draft' | 'published' | 'archived';
    publishedAt: Date | null;
    createdAt: Date;
    author: BlogPostAuthorViewModel | null;
    categories: BlogCategoryViewModel[];
}

export interface BlogStats {
    total: number;
    published: number;
    draft: number;
    archived: number;
}

export interface RawBlogPostListResponse {
    current_page: number;
    data: RawBlogPost[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
    stats?: BlogStats;
}

export interface BlogListFilters {
    search?: string;
    category_id?: string | number;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface CreateBlogPostPayload {
    title: string;
    content: string;
    excerpt?: string | null;
    featured_image?: string | null;
    category_ids: number[];
    status?: 'draft' | 'published' | 'archived';
    published_at?: string | null;
}

export interface CreateBlogCategoryPayload {
    name: string;
    slug?: string;
    description?: string | null;
}
