/**
 * Category ViewModel for UI
 */
export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    iconBackground: string;
    description: string | null;
    image: string | null;
    sortOrder: number;
    locationsCount: number;
    status: 'active' | 'inactive';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    subcategories: Subcategory[];
}

/**
 * Subcategory ViewModel for UI
 */
export interface Subcategory {
    id: number;
    categoryId: number;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Filter params for categories
 */
export interface CategoryFilters {
    q?: string;
    status?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface CategoryStats {
    total: number;
    active: number;
    inactive: number;
}
