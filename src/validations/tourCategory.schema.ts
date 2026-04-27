import * as yup from "yup";
import type { TFunction } from "i18next";

/**
 * Category Validation Schema
 * (Schema xác thực Danh mục)
 */
export const tourCategorySchema = (t: TFunction) => yup.object({
    name: yup.string()
        .required(t("tour:categories.form.name_placeholder"))
        .min(2, t("tour:validation.min_length", { field: t("tour:categories.form.name"), min: 2 })),
    
    slug: yup.string()
        .required(t("tour:categories.form.slug_placeholder")),
    
    icon: yup.string()
        .required(t("tour:categories.form.icon_placeholder")),
    
    description: yup.string()
        .max(500, t("tour:validation.max_length", { field: t("tour:categories.form.description"), max: 500 }))
        .default(''),
    
    sort_order: yup.number()
        .transform((value) => (isNaN(value) ? 0 : value))
        .default(0),
    
    status: yup.string()
        .oneOf(['active', 'inactive'])
        .default('active'),
    
    icon_background: yup.string()
        .default('#E0F2FE')
});

export type TourCategoryInput = yup.InferType<ReturnType<typeof tourCategorySchema>>;
