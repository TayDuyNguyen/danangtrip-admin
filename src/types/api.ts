/**
 * Validation errors type
 * (Kiểu lỗi validation)
 */
export type ValidationErrors = Record<string, string[]>;

/**
 * API response interface
 * (Interface để lưu trữ phản hồi API)
 */
export interface ApiResponse<T = unknown> {
    code: number;
    /**
     * Message of the response
     * (Tin nhắn phản hồi)
     */
    message: string;
    data?: T;
    errors?: ValidationErrors;
}

/**
 * API error response interface
 * (Interface để lưu trữ phản hồi lỗi API)
 */
export interface ErrorResponse {
    code: number;
    message: string;
    data?: unknown;
    errors?: ValidationErrors;
}

/**
 * Pagination interface
 * (Interface để lưu trữ phân trang)
 */
export interface Paginator<T> {
    current_page: number;
    data: T[];
    first_page_url?: string | null;
    from?: number | null;
    last_page?: number;
    last_page_url?: string | null;
    next_page_url?: string | null;
    path?: string;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number | null;
    total: number;
}

/**
 * Pagination params interface
 * (Interface để lưu trữ tham số phân trang)
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
