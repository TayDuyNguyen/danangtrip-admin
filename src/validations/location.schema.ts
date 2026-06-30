import * as yup from "yup";
import type { TFunction } from "i18next";

/** Empty number inputs → null for optional numeric fields */
function toOptionalNumber(_value: unknown, originalValue: unknown): number | null {
    if (originalValue === "" || originalValue == null) return null;
    const n = Number(originalValue);
    return Number.isNaN(n) ? null : n;
}

/**
 * Location Creation Validation Schema
 */
export const createLocationSchema = (t: TFunction) => yup.object({
    name: yup.string()
        .required(t("location:validation.required", { field: t("location:form.basic.name") }))
        .min(3, t("location:validation.min_length", { field: t("location:form.basic.name"), min: 3 })),

    slug: yup.string()
        .required(t("location:validation.required", { field: t("location:form.basic.slug") })),

    category_id: yup.number()
        .transform((_value, originalValue) => {
            if (originalValue === '' || originalValue == null || originalValue === 0) return undefined;
            return Number(originalValue);
        })
        .required(t("location:validation.required", { field: t("location:form.basic.category") }))
        .min(1, t("location:validation.required", { field: t("location:form.basic.category") }))
        .typeError(t("location:validation.number", { field: t("location:form.basic.category") })),

    subcategory_id: yup.number()
        .optional()
        .nullable()
        .transform(toOptionalNumber)
        .typeError(t("location:validation.number", { field: t("location:form.basic.subcategory") })),

    description: yup.string()
        .required(t("location:validation.required", { field: t("location:form.basic.description") })),

    short_description: yup.string()
        .required(t("location:validation.required", { field: t("location:form.basic.short_description") }))
        .max(300, t("location:validation.max_length", { field: t("location:form.basic.short_description"), max: 300 })),

    address: yup.string()
        .required(t("location:validation.required", { field: t("location:form.contact.address") })),

    district: yup.string()
        .required(t("location:validation.required", { field: t("location:form.contact.district") })),

    latitude: yup.number()
        .required(t("location:validation.required", { field: t("location:form.map.latitude") }))
        .typeError(t("location:validation.number", { field: t("location:form.map.latitude") })),

    longitude: yup.number()
        .required(t("location:validation.required", { field: t("location:form.map.longitude") }))
        .typeError(t("location:validation.number", { field: t("location:form.map.longitude") })),

    phone: yup.string().nullable(),
    email: yup.string().email(t("location:validation.email")).nullable(),
    website: yup.string().url(t("location:validation.url")).nullable(),
    opening_hours: yup.string().nullable(),

    price_min: yup
        .number()
        .nullable()
        .transform(toOptionalNumber)
        .min(0, t("location:validation.positive", { field: t("location:form.pricing.price_min") })),

    price_max: yup
        .number()
        .nullable()
        .transform(toOptionalNumber)
        .min(0, t("location:validation.positive", { field: t("location:form.pricing.price_max") }))
        .test(
            "max-gte-min",
            t("location:validation.max_gte_min"),
            function (v) {
                const { price_min } = this.parent;
                if (v == null || price_min == null) return true;
                return v >= price_min;
            }
        ),

    price_level: yup.number()
        .nullable()
        .transform(toOptionalNumber)
        .min(1)
        .max(4),

    thumbnail: yup.string().required(t("location:validation.required", { field: t("location:form.media.thumbnail") })),
    images: yup.array().of(yup.string()),
    video_url: yup
        .string()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v))
        .test(
            "url",
            t("location:validation.url"),
            (v) => v == null || /^https?:\/\/.+/i.test(v)
        ),

    status: yup.string().oneOf(['active', 'inactive']).default('active'),
    is_featured: yup.boolean().default(false),
    tags: yup.array().of(yup.number()).nullable(),
    amenities: yup.array().of(yup.number()).nullable(),
});

export interface CreateLocationInput {
    name: string;
    slug: string;
    category_id: number;
    subcategory_id?: number | null;
    description: string;
    short_description: string;
    address: string;
    district: string;
    latitude: number;
    longitude: number;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    opening_hours?: string | string[] | null;
    price_min?: number | null;
    price_max?: number | null;
    price_level?: number | null;
    thumbnail: string;
    images?: (string | undefined)[];
    video_url?: string | null;
    status: 'active' | 'inactive';
    is_featured: boolean;
    tags: (number | undefined)[] | null;
    amenities: (number | undefined)[] | null;
}
