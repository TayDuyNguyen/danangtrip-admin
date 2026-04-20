import * as yup from "yup";
import type { TFunction } from "i18next";

/** Empty number inputs → null for optional numeric fields */
function toOptionalNumber(_value: unknown, originalValue: unknown): number | null {
    if (originalValue === "" || originalValue == null) return null;
    const n = Number(originalValue);
    return Number.isNaN(n) ? null : n;
}

/**
 * Tour Creation Validation Schema
 * (Schema xác thực khi tạo Tour mới)
 */
export const createTourSchema = (t: TFunction) => yup.object({
    name: yup.string()
        .required(t("tour:validation.required", { field: t("tour:form.basic.name") }))
        .min(3, t("tour:validation.min_length", { field: t("tour:form.basic.name"), min: 3 })),

    slug: yup.string()
        .required(t("tour:validation.required", { field: t("tour:form.basic.slug") })),

    tour_category_id: yup.number()
        .required(t("tour:validation.required", { field: t("tour:form.basic.category") }))
        .typeError(t("tour:validation.number", { field: t("tour:form.basic.category") })),

    duration: yup.string()
        .required(t("tour:validation.required", { field: t("tour:form.basic.duration") })),

    short_desc: yup.string()
        .required(t("tour:validation.required", { field: t("tour:form.basic.short_desc") }))
        .max(300, t("tour:validation.max_length", { field: t("tour:form.basic.short_desc"), max: 300 })),

    description: yup.string()
        .required(t("tour:validation.required", { field: t("tour:form.basic.description") })),

    price_adult: yup.number()
        .required(t("tour:validation.required", { field: t("tour:form.pricing.price_adult") }))
        .min(0, t("tour:validation.positive", { field: t("tour:form.pricing.price_adult") }))
        .typeError(t("tour:validation.number", { field: t("tour:form.pricing.price_adult") })),

    price_child: yup
        .number()
        .nullable()
        .transform(toOptionalNumber)
        .test(
            "nonneg",
            t("tour:validation.positive", { field: t("tour:form.pricing.price_child") }),
            (v) => v == null || v >= 0
        ),

    price_infant: yup
        .number()
        .nullable()
        .transform(toOptionalNumber)
        .test(
            "nonneg",
            t("tour:validation.positive", { field: t("tour:form.pricing.price_infant") }),
            (v) => v == null || v >= 0
        ),

    discount_percent: yup.number()
        .min(0, t("tour:validation.positive", { field: t("tour:form.pricing.discount") }))
        .max(100, t("tour:validation.number", { field: t("tour:form.pricing.discount") }))
        .typeError(t("tour:validation.number", { field: t("tour:form.pricing.discount") })),

    inclusions: yup.string().nullable(),
    exclusions: yup.string().nullable(),

    max_people: yup
        .number()
        .nullable()
        .transform(toOptionalNumber)
        .test(
            "positive",
            t("tour:validation.positive", { field: t("tour:form.pricing.max_people") }),
            (v) => v == null || v > 0
        )
        .test(
            "max-gte-min",
            t("tour:validation.max_gte_min"),
            function (v) {
                const { min_people } = this.parent;
                if (v == null || min_people == null) return true;
                return v >= min_people;
            }
        ),

    min_people: yup
        .number()
        .nullable()
        .transform(toOptionalNumber)
        .test(
            "positive",
            t("tour:validation.positive", { field: t("tour:form.pricing.min_people") }),
            (v) => v == null || v > 0
        ),

    available_from: yup.string()
        .required(t("tour:validation.required", { field: t("tour:form.schedule.available_from") })),

    available_to: yup.string()
        .required(t("tour:validation.required", { field: t("tour:form.schedule.available_to") }))
        .test(
            "is-after",
            t("tour:validation.date_after"),
            function (v) {
                const { available_from } = this.parent;
                if (!v || !available_from) return true;
                return new Date(v) >= new Date(available_from);
            }
        ),
    start_time: yup.string().nullable(),
    meeting_point: yup.string().nullable(),

    itinerary: yup.array().of(
        yup.object({
            day: yup.number(),
            title: yup.string().required(t("tour:validation.required", { field: t("tour:form.itinerary.title") })),
            content: yup.string().required(t("tour:validation.required", { field: t("tour:form.itinerary.content") }))
        })
    ),

    thumbnail: yup.string().required(t("tour:validation.required", { field: t("tour:form.media.thumbnail") })),
    images: yup.array().of(yup.string()),
    video_url: yup
        .string()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v))
        .test(
            "url",
            t("tour:validation.url"),
            (v) => v == null || /^https?:\/\/.+/i.test(v)
        ),

    status: yup.string().oneOf(['active', 'inactive', 'sold_out']).default('active'),
    is_featured: yup.boolean().default(false),
    is_hot: yup.boolean().default(false),
    location_ids: yup.array().of(yup.number())
});

export type CreateTourInput = yup.InferType<ReturnType<typeof createTourSchema>>;
