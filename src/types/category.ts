/**
 * Raw Category Data from API
 */
export interface RawCategory {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    icon_background?: string | null;
    description: string | null;
    image: string | null;
    sort_order: number | null;
    locations_count?: number | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    subcategories?: RawSubcategory[];
}

/**
 * Raw Subcategory Data from API
 */
export interface RawSubcategory {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

/**
 * Input for creating/updating category
 */
export interface CategoryInput {
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    icon_background?: string | null;
    image?: string | null;
    sort_order?: number;
    status: 'active' | 'inactive';
}

/**
 * Input for creating/updating subcategory
 */
export interface SubcategoryInput {
    category_id: number;
    name: string;
    slug: string;
    description?: string | null;
    sort_order?: number;
    status: 'active' | 'inactive';
}
