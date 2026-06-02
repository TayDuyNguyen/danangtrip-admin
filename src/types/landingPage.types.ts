export type LandingPageType = 'destination' | 'tour_line' | 'promotion';
export type LandingPageStatus = 'draft' | 'published';

export interface LandingPage {
    id: number;
    slug: string;
    title: string;
    page_type: LandingPageType;
    intro: string | null;
    hero_image: string | null;
    seo_title: string | null;
    seo_description: string | null;
    og_image: string | null;
    filters: Record<string, unknown> | null;
    content_blocks: unknown[] | null;
    status: LandingPageStatus;
    created_at: string;
    updated_at: string;
}

export interface LandingPageFilters {
    search?: string;
    page_type?: LandingPageType | '';
    status?: LandingPageStatus | '';
    per_page?: number;
    page?: number;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
}

export interface CreateLandingPageInput {
    slug: string;
    title: string;
    page_type: LandingPageType;
    intro?: string | null;
    hero_image?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    og_image?: string | null;
    filters?: Record<string, unknown> | null;
    content_blocks?: unknown[] | null;
    status: LandingPageStatus;
}

export type UpdateLandingPageInput = Partial<CreateLandingPageInput>;
