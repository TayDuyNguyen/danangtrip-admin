import { toNumberSafe } from "@/utils/safeConverters";
import type { RawCategory, RawSubcategory } from "@/types/category";
import type { Category, CategoryStats, Subcategory } from "./category.dataHelper";

/**
 * Mapper for Category and Subcategory
 */
export const categoryMapper = {
    /**
     * Map RawCategory to Category ViewModel
     */
    mapCategory(raw: RawCategory): Category {
        return {
            id: toNumberSafe(raw.id),
            name: raw.name || '',
            slug: raw.slug || '',
            icon: raw.icon || null,
            iconBackground: raw.icon_background || '#E0F2FE',
            description: raw.description || null,
            image: raw.image || null,
            sortOrder: toNumberSafe(raw.sort_order),
            locationsCount: toNumberSafe(raw.locations_count),
            status: raw.status === 'active' ? 'active' : 'inactive',
            isActive: raw.status === 'active',
            createdAt: new Date(raw.created_at),
            updatedAt: new Date(raw.updated_at),
            subcategories: (raw.subcategories || []).map(this.mapSubcategory),
        };
    },

    /**
     * Map RawSubcategory to Subcategory ViewModel
     */
    mapSubcategory(raw: RawSubcategory): Subcategory {
        return {
            id: toNumberSafe(raw.id),
            categoryId: toNumberSafe(raw.category_id),
            name: raw.name || '',
            slug: raw.slug || '',
            description: raw.description || null,
            sortOrder: toNumberSafe(raw.sort_order),
            isActive: raw.status === 'active',
            createdAt: new Date(raw.created_at),
            updatedAt: new Date(raw.updated_at),
        };
    },

    normalizeListResponse(payload: Record<string, unknown> | null | undefined) {
        const categories = payload?.categories as Record<string, unknown> | undefined;
        const rawItems = (categories?.data || payload?.data || []) as RawCategory[];
        const rawStats = (payload?.stats || {}) as Record<string, unknown>;
        const stats: CategoryStats = {
            total: toNumberSafe(rawStats.total_categories),
            active: toNumberSafe(rawStats.active_categories),
            inactive: toNumberSafe(rawStats.inactive_categories),
        };

        return {
            items: rawItems.map((item) => this.mapCategory(item)),
            stats,
            meta: {
                total: toNumberSafe(categories?.total || payload?.total),
                per_page: toNumberSafe(categories?.per_page || payload?.per_page),
                current_page: toNumberSafe(categories?.current_page || payload?.current_page),
                last_page: toNumberSafe(categories?.last_page || payload?.last_page),
            },
        };
    },
};
