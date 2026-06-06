// ============================================================
// Promotion Types
// (Kiểu dữ liệu cho Khuyến mãi / Mã giảm giá)
// ============================================================

export type DiscountType = 'percent' | 'fixed';
export type PromotionStatus = 'active' | 'inactive' | 'expired';

export interface Promotion {
    id: number;
    code: string;
    name: string;
    description: string | null;
    discount_type: DiscountType;
    discount_value: string; // decimal string from API
    max_discount_amount: string | null;
    min_order_amount: string;
    usage_limit: number | null;
    usage_per_user: number;
    used_count: number;
    starts_at: string | null; // ISO datetime
    ends_at: string | null;
    status: PromotionStatus;
    created_at: string;
    updated_at: string;
}

export interface PromotionFormInput {
    code: string;
    name: string;
    description?: string;
    discount_type: DiscountType;
    discount_value: number;
    max_discount_amount?: number | null;
    min_order_amount?: number;
    usage_limit?: number | null;
    usage_per_user?: number;
    starts_at?: string | null;
    ends_at?: string | null;
    status?: PromotionStatus;
}

export interface PromotionFilters {
    search?: string;
    status?: PromotionStatus | '';
    valid_now?: boolean;
    per_page?: number;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    page?: number;
}

export interface PromotionListResponse {
    data: Promotion[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
